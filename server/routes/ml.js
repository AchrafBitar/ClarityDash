const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Simple Linear Regression Implementation
 * Calculates the line of best fit for expense prediction
 */
class SimpleLinearRegression {
  constructor() {
    this.slope = 0;
    this.intercept = 0;
  }

  fit(x, y) {
    const n = x.length;
    if (n !== y.length || n < 2) {
      throw new Error('Invalid data for linear regression');
    }

    // Calculate means
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;

    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += (x[i] - xMean) * (x[i] - xMean);
    }

    this.slope = denominator !== 0 ? numerator / denominator : 0;
    this.intercept = yMean - this.slope * xMean;
  }

  predict(x) {
    return this.slope * x + this.intercept;
  }

  getR2(x, y) {
    const n = x.length;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    
    let ssRes = 0;
    let ssTot = 0;
    
    for (let i = 0; i < n; i++) {
      const yPred = this.predict(x[i]);
      ssRes += Math.pow(y[i] - yPred, 2);
      ssTot += Math.pow(y[i] - yMean, 2);
    }
    
    return ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
  }
}

/**
 * @route   GET /api/ml/predict-expenses
 * @desc    Predict next month's expenses using linear regression
 * @access  Private
 */
router.get('/predict-expenses', auth, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthsToAnalyze = Math.min(parseInt(months), 12); // Max 12 months

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - monthsToAnalyze);

    // Get monthly expense data
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalExpenses: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    if (monthlyData.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient data for prediction. Need at least 2 months of expense data.'
      });
    }

    // Prepare data for regression
    const x = []; // Month indices (0, 1, 2, ...)
    const y = []; // Monthly expenses

    monthlyData.forEach((item, index) => {
      x.push(index);
      y.push(item.totalExpenses);
    });

    // Perform linear regression
    const regression = new SimpleLinearRegression();
    regression.fit(x, y);

    // Predict next month
    const nextMonthIndex = x.length;
    const predictedExpense = Math.max(0, regression.predict(nextMonthIndex));
    
    // Calculate confidence metrics
    const r2 = regression.getR2(x, y);
    const confidence = Math.min(100, Math.max(0, r2 * 100));

    // Calculate trend
    const trend = regression.slope > 0 ? 'increasing' : regression.slope < 0 ? 'decreasing' : 'stable';
    const trendStrength = Math.abs(regression.slope);

    // Get recent average for comparison
    const recentMonths = monthlyData.slice(-3);
    const recentAverage = recentMonths.reduce((sum, item) => sum + item.totalExpenses, 0) / recentMonths.length;

    res.json({
      success: true,
      data: {
        prediction: Math.round(predictedExpense * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        trend: {
          direction: trend,
          strength: Math.round(trendStrength * 100) / 100
        },
        comparison: {
          recentAverage: Math.round(recentAverage * 100) / 100,
          difference: Math.round((predictedExpense - recentAverage) * 100) / 100
        },
        analysis: {
          monthsAnalyzed: monthlyData.length,
          dataPoints: monthlyData.map(item => ({
            month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
            expenses: item.totalExpenses,
            transactions: item.transactionCount
          }))
        }
      }
    });

  } catch (error) {
    console.error('Predict expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating expense prediction'
    });
  }
});

/**
 * @route   GET /api/ml/spending-insights
 * @desc    Get AI-powered insights about spending patterns
 * @access  Private
 */
router.get('/spending-insights', auth, async (req, res) => {
  try {
    const { months = 3 } = req.query;
    const monthsToAnalyze = Math.min(parseInt(months), 6);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - monthsToAnalyze);

    // Get spending data by category
    const categoryData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Get monthly spending trends
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Generate insights
    const insights = [];

    // Top spending category insight
    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      const totalSpending = categoryData.reduce((sum, cat) => sum + cat.total, 0);
      const percentage = ((topCategory.total / totalSpending) * 100).toFixed(1);
      
      insights.push({
        type: 'top_category',
        title: 'Highest Spending Category',
        message: `${topCategory._id} accounts for ${percentage}% of your total spending`,
        value: topCategory.total,
        percentage: parseFloat(percentage)
      });
    }

    // Spending trend insight
    if (monthlyTrends.length >= 2) {
      const recent = monthlyTrends.slice(-2);
      const change = ((recent[1].total - recent[0].total) / recent[0].total * 100).toFixed(1);
      
      if (Math.abs(change) > 10) {
        insights.push({
          type: 'trend',
          title: 'Spending Trend',
          message: `Your spending has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)}% compared to last month`,
          value: parseFloat(change),
          direction: change > 0 ? 'up' : 'down'
        });
      }
    }

    // High-frequency spending insight
    const highFreqCategories = categoryData.filter(cat => cat.count > 5);
    if (highFreqCategories.length > 0) {
      const topFreq = highFreqCategories[0];
      insights.push({
        type: 'frequency',
        title: 'Frequent Spending',
        message: `You make frequent purchases in ${topFreq._id} (${topFreq.count} transactions)`,
        value: topFreq.count,
        category: topFreq._id
      });
    }

    // Budget recommendation
    const avgMonthlySpending = monthlyTrends.reduce((sum, month) => sum + month.total, 0) / monthlyTrends.length;
    if (avgMonthlySpending > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Budget Recommendation',
        message: `Consider setting a monthly budget of $${Math.round(avgMonthlySpending * 0.9)} to save 10%`,
        value: Math.round(avgMonthlySpending * 0.9),
        currentAverage: Math.round(avgMonthlySpending)
      });
    }

    res.json({
      success: true,
      data: {
        insights,
        summary: {
          totalCategories: categoryData.length,
          totalSpending: categoryData.reduce((sum, cat) => sum + cat.total, 0),
          averageMonthlySpending: monthlyTrends.reduce((sum, month) => sum + month.total, 0) / monthlyTrends.length,
          analysisPeriod: `${monthsToAnalyze} months`
        }
      }
    });

  } catch (error) {
    console.error('Get spending insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating spending insights'
    });
  }
});

module.exports = router;
