import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import CategorySpendingChart from '../components/CategorySpendingChart';
import SavingsProjectionChart from '../components/SavingsProjectionChart';
import AddTransactionModal from '../components/AddTransactionModal';
import type { FinancialSummary, SpendingByCategory, SavingsProjection, ExpensePrediction, CreateTransactionData } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [spendingData, setSpendingData] = useState<SpendingByCategory | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsProjection | null>(null);
  const [prediction, setPrediction] = useState<ExpensePrediction | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [summaryRes, spendingRes, savingsRes, predictionRes, categoriesRes] = await Promise.all([
          apiService.getFinancialSummary(),
          apiService.getSpendingByCategory('expense'),
          apiService.getSavingsProjection(6),
          apiService.getExpensePrediction(6),
          apiService.getCategories()
        ]);

        if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
        if (spendingRes.success && spendingRes.data) setSpendingData(spendingRes.data);
        if (savingsRes.success && savingsRes.data) setSavingsData(savingsRes.data);
        if (predictionRes.success && predictionRes.data) setPrediction(predictionRes.data);
        if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data.categories);

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAddTransaction = async (data: CreateTransactionData) => {
    try {
      const response = await apiService.createTransaction(data);
      if (response.success && response.data) {
        // Refresh dashboard data
        const [summaryRes, spendingRes, savingsRes, predictionRes, categoriesRes] = await Promise.all([
          apiService.getFinancialSummary(),
          apiService.getSpendingByCategory('expense'),
          apiService.getSavingsProjection(6),
          apiService.getExpensePrediction(6),
          apiService.getCategories()
        ]);

        if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
        if (spendingRes.success && spendingRes.data) setSpendingData(spendingRes.data);
        if (savingsRes.success && savingsRes.data) setSavingsData(savingsRes.data);
        if (predictionRes.success && predictionRes.data) setPrediction(predictionRes.data);
        if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data.categories);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full p-6">
        <div className="h-full w-full">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
            
            {/* Summary cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
            
            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6">
      <div className="h-full w-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-600 text-lg">
            Here's your financial overview for this period
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Income</p>
                <p className="text-3xl font-bold text-green-600">
                  ${summary?.totalIncome.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-slate-500 mt-1">This period</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">
                  ${summary?.totalExpenses.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-slate-500 mt-1">This period</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Net Savings</p>
                <p className={`text-3xl font-bold ${(summary?.netSavings || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${summary?.netSavings.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-slate-500 mt-1">This period</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - 16:9 Optimized */}
        <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-6">
          {/* Charts Section - Takes up most of the space */}
          <div className="col-span-12 row-span-4 grid grid-cols-2 gap-6">
            <CategorySpendingChart 
              data={spendingData?.categories || []} 
              title="Spending by Category"
              height={400}
            />
            <SavingsProjectionChart 
              data={savingsData || { historical: [], projection: null, analysisPeriod: { startDate: '', endDate: '', months: 0 } }}
              title="Savings Projection"
              height={400}
            />
          </div>

          {/* ML Prediction Section - Bottom row */}
          {prediction && (
            <div className="col-span-12 row-span-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">AI Expense Prediction</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600 font-medium">Live Prediction</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-6 h-full">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex flex-col justify-center">
                  <p className="text-sm text-slate-600 mb-1">Next Month</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${prediction.prediction.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex flex-col justify-center">
                  <p className="text-sm text-slate-600 mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-green-600">
                    {prediction.confidence.toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl flex flex-col justify-center">
                  <p className="text-sm text-slate-600 mb-1">Trend</p>
                  <p className="text-lg font-bold capitalize">
                    <span className={`${
                      prediction.trend.direction === 'increasing' ? 'text-red-600' : 
                      prediction.trend.direction === 'decreasing' ? 'text-green-600' : 'text-slate-600'
                    }`}>
                      {prediction.trend.direction}
                    </span>
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex flex-col justify-center">
                  <p className="text-sm text-slate-600 mb-1">vs Average</p>
                  <p className={`text-lg font-bold ${
                    prediction.comparison.difference > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {prediction.comparison.difference > 0 ? '+' : ''}${prediction.comparison.difference.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Section - Bottom row when no prediction */}
          {!prediction && (
            <div className="col-span-12 row-span-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-4 h-full">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">Add Transaction</span>
                </button>
                
                <Link
                  to="/transactions"
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white px-6 py-4 rounded-xl hover:from-slate-700 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-medium">View Transactions</span>
                </Link>
                
                <button className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="font-medium">Export Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTransaction}
        categories={categories}
      />
    </div>
  );
};

export default Dashboard;
