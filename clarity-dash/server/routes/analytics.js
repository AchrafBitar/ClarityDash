const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/analytics/summary
 * @desc    Get financial summary for a given period
 * @access  Private
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Get total income
    const incomeResult = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'income',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total expenses
    const expenseResult = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get transaction count
    const transactionCount = await Transaction.countDocuments({
      user: req.user._id,
      ...dateFilter
    });

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const netSavings = totalIncome - totalExpenses;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netSavings,
        transactionCount,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching summary'
    });
  }
});

/**
 * @route   GET /api/analytics/spending-by-category
 * @desc    Get spending breakdown by category
 * @access  Private
 */
router.get('/spending-by-category', auth, async (req, res) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: type,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          count: 1,
          percentage: 1
        }
      }
    ]);

    // Calculate percentages
    const totalAmount = result.reduce((sum, item) => sum + item.total, 0);
    const dataWithPercentages = result.map(item => ({
      ...item,
      percentage: totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(2) : 0
    }));

    res.json({
      success: true,
      data: {
        categories: dataWithPercentages,
        totalAmount,
        type
      }
    });

  } catch (error) {
    console.error('Get spending by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching spending by category'
    });
  }
});

/**
 * @route   GET /api/analytics/savings-projection
 * @desc    Get historical savings data and projected savings
 * @access  Private
 */
router.get('/savings-projection', auth, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthsToAnalyze = Math.min(parseInt(months), 12); // Max 12 months

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - monthsToAnalyze);

    // Get monthly data
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Process monthly data
    const processedData = monthlyData.map(item => {
      const savings = item.income - item.expenses;
      const date = new Date(item._id.year, item._id.month - 1, 1);
      return {
        date: date.toISOString().split('T')[0],
        income: item.income,
        expenses: item.expenses,
        savings: savings
      };
    });

    // Calculate projection using simple linear regression
    let projection = null;
    if (processedData.length >= 2) {
      const savingsValues = processedData.map(d => d.savings);
      const n = savingsValues.length;
      
      // Calculate average savings
      const avgSavings = savingsValues.reduce((sum, val) => sum + val, 0) / n;
      
      // Simple trend calculation (average of last 3 months if available)
      const recentSavings = savingsValues.slice(-3);
      const recentAvg = recentSavings.reduce((sum, val) => sum + val, 0) / recentSavings.length;
      
      // Project next month (use recent average as trend indicator)
      projection = recentAvg;
    }

    res.json({
      success: true,
      data: {
        historical: processedData,
        projection: projection,
        analysisPeriod: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          months: monthsToAnalyze
        }
      }
    });

  } catch (error) {
    console.error('Get savings projection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching savings projection'
    });
  }
});

/**
 * @route   GET /api/analytics/monthly-trends
 * @desc    Get monthly income and expense trends
 * @access  Private
 */
router.get('/monthly-trends', auth, async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const monthsToAnalyze = Math.min(parseInt(months), 24); // Max 24 months

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - monthsToAnalyze);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const trends = result.map(item => {
      const date = new Date(item._id.year, item._id.month - 1, 1);
      return {
        date: date.toISOString().split('T')[0],
        income: item.income,
        expenses: item.expenses,
        savings: item.income - item.expenses,
        transactionCount: item.transactionCount
      };
    });

    res.json({
      success: true,
      data: {
        trends,
        analysisPeriod: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          months: monthsToAnalyze
        }
      }
    });

  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching monthly trends'
    });
  }
});

module.exports = router;
