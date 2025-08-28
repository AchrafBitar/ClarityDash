const mongoose = require('mongoose');

/**
 * Transaction Schema - Represents a financial transaction in the ClarityDash application
 * Links to a user and contains transaction details
 */
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  description: {
    type: String,
    required: [true, 'Transaction description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(value) {
        // Ensure amount is a valid number with up to 2 decimal places
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: 'Amount must be a valid number with up to 2 decimal places'
    }
  },
  type: {
    type: String,
    enum: {
      values: ['income', 'expense'],
      message: 'Transaction type must be either "income" or "expense"'
    },
    required: [true, 'Transaction type is required']
  },
  category: {
    type: String,
    required: [true, 'Transaction category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'Uncategorized'
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now,
    validate: {
      validator: function(value) {
        // Ensure date is not in the future
        return value <= new Date();
      },
      message: 'Transaction date cannot be in the future'
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

/**
 * Index for efficient querying
 * Compound index on user and date for fast filtering
 */
transactionSchema.index({ user: 1, date: -1 });

/**
 * Index for category-based queries
 */
transactionSchema.index({ user: 1, category: 1 });

/**
 * Virtual for formatted amount (positive for income, negative for expense)
 */
transactionSchema.virtual('formattedAmount').get(function() {
  return this.type === 'income' ? this.amount : -this.amount;
});

/**
 * Ensure virtual fields are serialized
 */
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

/**
 * Static method to get categories for a user
 * @param {ObjectId} userId - The user's ID
 * @returns {Promise<Array>} - Array of unique categories
 */
transactionSchema.statics.getUserCategories = async function(userId) {
  return await this.distinct('category', { user: userId });
};

/**
 * Static method to get transactions within a date range
 * @param {ObjectId} userId - The user's ID
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 * @returns {Promise<Array>} - Array of transactions
 */
transactionSchema.statics.getTransactionsByDateRange = async function(userId, startDate, endDate) {
  return await this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

module.exports = mongoose.model('Transaction', transactionSchema);
