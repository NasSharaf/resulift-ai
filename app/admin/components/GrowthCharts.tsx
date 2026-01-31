'use client';

import SimpleLineChart from './SimpleLineChart';

interface GrowthChartsProps {
  signupData: Array<{ date: string; count: number }>;
  activeUsersData: Array<{ date: string; count: number }>;
}

export default function GrowthCharts({ signupData, activeUsersData }: GrowthChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <SimpleLineChart
        data={signupData}
        title="Student Signups Over Time"
        color="#3b82f6"
      />
      <SimpleLineChart
        data={activeUsersData}
        title="Daily Active Users"
        color="#8b5cf6"
      />
    </div>
  );
}
