import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategorySpending } from '../types';

interface CategorySpendingChartProps {
  data: CategorySpending[];
  title?: string;
  height?: number;
}

// Modern color palette for chart segments
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
  '#14B8A6', '#FBBF24', '#A855F7', '#06B6D4', '#F59E0B'
];

const CategorySpendingChart: React.FC<CategorySpendingChartProps> = ({
  data,
  title = 'Spending by Category',
  height = 300
}) => {
  // Format data for Recharts
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.total,
    percentage: item.percentage,
    count: item.count,
    fill: COLORS[index % COLORS.length]
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-gray-300 p-4 rounded-xl shadow-2xl">
          <p className="font-bold text-black mb-2 text-lg">{data.name}</p>
          <div className="space-y-2 text-base">
            <p className="text-black">
              Amount: <span className="font-bold text-blue-600">${data.value.toFixed(2)}</span>
            </p>
            <p className="text-black">
              Percentage: <span className="font-bold text-green-600">{data.percentage}%</span>
            </p>
            <p className="text-black">
              Transactions: <span className="font-bold text-purple-600">{data.count}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm bg-white border-2 border-gray-300 px-3 py-2 rounded-lg shadow-md">
            <div
              className="w-4 h-4 rounded-full shadow-sm border-2 border-white"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-black font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div 
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
        style={{ height }}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-black font-bold text-lg">No data available</p>
            <p className="text-gray-700 text-base mt-1">Add some transactions to see your spending breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
      style={{ height }}
    >
      <h3 className="text-2xl font-bold text-black mb-6">{title}</h3>
      
      <ResponsiveContainer width="100%" height="70%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            stroke="white"
            strokeWidth={3}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary statistics */}
      <div className="mt-6 pt-6 border-t-2 border-gray-300">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-100 border-2 border-blue-300 rounded-xl">
            <p className="text-sm text-black font-semibold mb-1">Total Amount</p>
            <p className="text-lg font-bold text-blue-700">
              ${data.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-green-100 border-2 border-green-300 rounded-xl">
            <p className="text-sm text-black font-semibold mb-1">Categories</p>
            <p className="text-lg font-bold text-green-700">{data.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySpendingChart;
