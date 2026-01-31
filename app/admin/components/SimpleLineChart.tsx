// @ts-nocheck
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimpleLineChartProps {
  data: Array<{ date: string; count: number }>;
  title: string;
  color?: string;
  height?: number;
}

export default function SimpleLineChart({
  data,
  title,
  color = '#3b82f6',
  height = 250
}: SimpleLineChartProps) {
  // Format data for display (show every 5th date to avoid crowding)
  const formattedData = data.map((item, index) => ({
    ...item,
    displayDate: index % 5 === 0 ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12 } as any}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 12 } as any}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '14px'
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return new Date(payload[0].payload.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                });
              }
              return label;
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2}
            dot={false}
            name="Count"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
