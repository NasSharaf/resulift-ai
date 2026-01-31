// @ts-nocheck
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistogramProps {
  data: Array<{ range: string; count: number; percentage: number }>;
  title: string;
  color?: string;
  height?: number;
}

export default function Histogram({
  data,
  title,
  color = '#10b981',
  height = 300
}: HistogramProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12 } as any}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 12 } as any}
            stroke="#9ca3af"
            label={{ value: 'Students', angle: -90, position: 'insideLeft', style: { fontSize: 12 } } as any}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '14px'
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} students (${props.payload.percentage.toFixed(1)}%)`,
              'Count'
            ]}
          />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
