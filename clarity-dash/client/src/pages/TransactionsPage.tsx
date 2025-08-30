import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import AddTransactionModal from '../components/AddTransactionModal';
import CSVUploadModal from '../components/CSVUploadModal';
import type { Transaction, CreateTransactionData, CSVMapping } from '../types';

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTransactions();
      if (response.success && response.data) {
        // Handle both possible response structures
        const transactionData = response.data.data || response.data.transactions || [];
        setTransactions(Array.isArray(transactionData) ? transactionData : []);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Please try again.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories || []);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const handleAddTransaction = async (data: CreateTransactionData) => {
    try {
      const response = await apiService.createTransaction(data);
      if (response.success && response.data) {
        const newTransaction = response.data.transaction;
        setTransactions(prev => [newTransaction, ...prev]);
        // Refresh categories in case a new one was added
        fetchCategories();
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  };

  const handleCSVUpload = async (file: File, mapping: CSVMapping) => {
    try {
      const response = await apiService.uploadCSV(file, mapping);
      if (response.success && response.data) {
        // Refresh transactions and categories
        await fetchTransactions();
        await fetchCategories();
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upload CSV');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await apiService.deleteTransaction(id);
      if (response.success) {
        setTransactions(prev => prev.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full p-6">
        <div className="h-full w-full">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
            
            {/* Content skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Transactions
              </h1>
              <p className="text-slate-600 text-lg">
                Manage your financial transactions
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Transaction
              </button>
              <button
                onClick={() => setShowCSVModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Import CSV
              </button>
              <Link
                to="/"
                className="bg-gradient-to-r from-slate-600 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-slate-700 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
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

        {/* Main Content Grid - 16:9 Optimized */}
        <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-6">
          {/* Transactions List - Takes up most of the space */}
          <div className="col-span-12 row-span-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Transactions ({transactions?.length || 0})
              </h2>
            </div>
            {!transactions || transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No transactions found</h3>
                <p className="text-slate-500 mb-6">
                  Start by adding your first transaction to see your financial data here.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add First Transaction
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/50 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          {transaction.description}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {transaction.category}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {transaction.type === 'income' ? (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                          )}
                          {transaction.type}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Delete transaction"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats - Bottom section */}
          <div className="col-span-12 row-span-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Transaction Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
              <div className="text-center p-6 border border-slate-200/50 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Total Transactions</h4>
                <p className="text-2xl font-bold text-blue-600">{transactions?.length || 0}</p>
              </div>
              <div className="text-center p-6 border border-slate-200/50 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Total Income</h4>
                <p className="text-2xl font-bold text-green-600">
                  ${transactions
                    ?.filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="text-center p-6 border border-slate-200/50 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Total Expenses</h4>
                <p className="text-2xl font-bold text-red-600">
                  ${transactions
                    ?.filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="text-center p-6 border border-slate-200/50 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Categories</h4>
                <p className="text-2xl font-bold text-purple-600">{categories?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTransaction}
        categories={categories}
      />

      <CSVUploadModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onUpload={handleCSVUpload}
      />
    </div>
  );
};

export default TransactionsPage;
