import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SavingsProjection } from '../types';

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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">${entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data.historical || data.historical.length === 0) {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        style={{ height }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      style={{ height }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Historical savings line */}
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Savings"
          />
          
          {/* Projection line (dashed) */}
          {data.projection !== null && (
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#10B981"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Projected Savings"
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary statistics */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Average Savings</p>
            <p className="font-semibold text-gray-800">
              ${(data.historical.reduce((sum, item) => sum + item.savings, 0) / data.historical.length).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Savings</p>
            <p className="font-semibold text-gray-800">
              ${data.historical.reduce((sum, item) => sum + item.savings, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Projection</p>
            <p className="font-semibold text-gray-800">
              {data.projection !== null ? `$${data.projection.toFixed(2)}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsProjectionChart;
