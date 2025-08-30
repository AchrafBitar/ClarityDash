const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');
const { z } = require('zod');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

/**
 * Validation schemas using Zod
 */
const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description cannot exceed 200 characters'),
  amount: z.number().positive('Amount must be positive').min(0.01, 'Amount must be at least 0.01'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be either "income" or "expense"' })
  }),
  category: z.string().min(1, 'Category is required').max(50, 'Category cannot exceed 50 characters'),
  date: z.string().datetime().optional().transform((val) => val ? new Date(val) : new Date())
});

const csvMappingSchema = z.object({
  dateColumn: z.string().min(1, 'Date column mapping is required'),
  descriptionColumn: z.string().min(1, 'Description column mapping is required'),
  amountColumn: z.string().min(1, 'Amount column mapping is required'),
  typeColumn: z.string().optional(),
  categoryColumn: z.string().optional(),
  defaultType: z.enum(['income', 'expense']).optional().default('expense'),
  defaultCategory: z.string().optional().default('Uncategorized')
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    // Validate input data
    const validatedData = transactionSchema.parse(req.body);
    
    // Create new transaction
    const transaction = new Transaction({
      ...validatedData,
      user: req.user._id
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction }
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction'
    });
  }
});

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for authenticated user with optional filtering
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      type, 
      category,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { user: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (type) query.type = type;
    if (category) query.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a specific transaction
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting transaction'
    });
  }
});

/**
 * @route   POST /api/transactions/upload-csv
 * @desc    Upload CSV file and create multiple transactions
 * @access  Private
 */
router.post('/upload-csv', auth, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    // Validate mapping configuration
    const mapping = csvMappingSchema.parse(req.body);

    // Parse CSV content
    const csvContent = req.file.buffer.toString();
    const { data: csvData, errors } = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim()
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV parsing errors',
        errors: errors.slice(0, 5) // Limit error display
      });
    }

    if (csvData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty or has no valid data'
      });
    }

    // Process CSV data and create transactions
    const transactions = [];
    const processingErrors = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 2; // +2 because of header row and 0-based index

      try {
        // Extract data from CSV row
        const date = new Date(row[mapping.dateColumn]);
        const description = row[mapping.descriptionColumn];
        const amount = parseFloat(row[mapping.amountColumn]);
        
        // Determine type and category
        let type = mapping.defaultType;
        if (mapping.typeColumn && row[mapping.typeColumn]) {
          const typeValue = row[mapping.typeColumn].toLowerCase();
          if (['income', 'expense'].includes(typeValue)) {
            type = typeValue;
          }
        }

        let category = mapping.defaultCategory;
        if (mapping.categoryColumn && row[mapping.categoryColumn]) {
          category = row[mapping.categoryColumn];
        }

        // Validate extracted data
        if (!description || isNaN(amount) || amount <= 0) {
          processingErrors.push(`Row ${rowNumber}: Invalid description or amount`);
          continue;
        }

        if (isNaN(date.getTime())) {
          processingErrors.push(`Row ${rowNumber}: Invalid date format`);
          continue;
        }

        // Create transaction object
        const transaction = new Transaction({
          user: req.user._id,
          description,
          amount,
          type,
          category,
          date
        });

        transactions.push(transaction);

      } catch (error) {
        processingErrors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    // Save transactions to database
    if (transactions.length > 0) {
      await Transaction.insertMany(transactions);
    }

    res.json({
      success: true,
      message: `Successfully imported ${transactions.length} transactions`,
      data: {
        imported: transactions.length,
        errors: processingErrors.slice(0, 10), // Limit error display
        totalErrors: processingErrors.length
      }
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid mapping configuration',
        errors: error.errors
      });
    }

    console.error('CSV upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing CSV file'
    });
  }
});

/**
 * @route   GET /api/transactions/categories
 * @desc    Get all categories for the authenticated user
 * @access  Private
 */
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Transaction.getUserCategories(req.user._id);
    
    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

module.exports = router;
