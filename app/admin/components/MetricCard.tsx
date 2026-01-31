'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
}

export default function MetricCard({ title, value, subtitle, trend, icon }: MetricCardProps) {
  const trendColor = trend && trend.value > 0 ? 'text-green-600' : 'text-red-600';
  const trendSymbol = trend && trend.value > 0 ? '+' : '';

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm font-medium ${trendColor}`}>
              {trendSymbol}{trend.value} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400 ml-4">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
