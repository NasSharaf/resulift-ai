// @ts-nocheck
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimpleBarChartProps {
  data: Array<{ name: string; count: number }>;
  title: string;
  color?: string;
  height?: number;
}

export default function SimpleBarChart({
  data,
  title,
  color = '#8b5cf6',
  height = 300
}: SimpleBarChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 12 } as any} stroke="#9ca3af" />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12 } as any}
            stroke="#9ca3af"
            width={150}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '14px'
            }}
          />
          <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
