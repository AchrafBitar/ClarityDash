import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SavingsProjection } from '../types';

interface SavingsProjectionChartProps {
  data: SavingsProjection;
  title?: string;
  height?: number;
}

const SavingsProjectionChart: React.FC<SavingsProjectionChartProps> = ({
  data,
  title = 'Savings Projection',
  height = 400
}) => {
  // Format data for Recharts
  const chartData = data.historical.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    savings: item.savings,
    income: item.income,
    expenses: item.expenses
  }));

  // Add projection data point if available
  if (data.projection !== null) {
    const lastDate = new Date(data.historical[data.historical.length - 1]?.date || new Date());
    const nextMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
    chartData.push({
      date: nextMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      savings: data.projection,
      income: 0, // Projection doesn't include income/expense breakdown
      expenses: 0
    });
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-300 p-4 rounded-xl shadow-2xl">
          <p className="font-bold text-black mb-3 text-lg">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-black font-semibold text-base">{entry.name}</span>
                </div>
                <span className="font-bold text-blue-600 text-lg">${entry.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data.historical || data.historical.length === 0) {
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
            <p className="text-gray-700 text-base mt-1">Add some transactions to see your savings projection</p>
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
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            stroke="#000000"
            fontSize={14}
            fontWeight="bold"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#000000', fontWeight: 'bold' }}
          />
          <YAxis 
            stroke="#000000"
            fontSize={14}
            fontWeight="bold"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#000000', fontWeight: 'bold' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          />
          
          {/* Historical savings line */}
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#059669"
            strokeWidth={4}
            dot={{ fill: '#059669', strokeWidth: 3, r: 6 }}
            activeDot={{ r: 8, stroke: '#059669', strokeWidth: 3 }}
            name="Savings"
          />
          
          {/* Projection line (dashed) */}
          {data.projection !== null && (
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#059669"
              strokeWidth={4}
              strokeDasharray="8 8"
              dot={{ fill: '#059669', strokeWidth: 3, r: 6 }}
              activeDot={{ r: 8, stroke: '#059669', strokeWidth: 3 }}
              name="Projected Savings"
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary statistics */}
      <div className="mt-6 pt-6 border-t-2 border-gray-300">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-100 border-2 border-blue-300 rounded-xl">
            <p className="text-sm text-black font-semibold mb-1">Average Savings</p>
            <p className="text-lg font-bold text-blue-700">
              ${(data.historical.reduce((sum, item) => sum + item.savings, 0) / data.historical.length).toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-green-100 border-2 border-green-300 rounded-xl">
            <p className="text-sm text-black font-semibold mb-1">Total Savings</p>
            <p className="text-lg font-bold text-green-700">
              ${data.historical.reduce((sum, item) => sum + item.savings, 0).toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-100 border-2 border-purple-300 rounded-xl">
            <p className="text-sm text-black font-semibold mb-1">Projection</p>
            <p className="text-lg font-bold text-purple-700">
              {data.projection !== null ? `$${data.projection.toFixed(2)}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsProjectionChart;
