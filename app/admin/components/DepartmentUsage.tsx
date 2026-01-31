'use client';

import SimpleBarChart from './SimpleBarChart';

interface DepartmentUsageProps {
  departments: Array<{ name: string; count: number; percentage: number }>;
  jobTitles: Array<{ title: string; count: number }>;
}

export default function DepartmentUsage({ departments, jobTitles }: DepartmentUsageProps) {
  // Top 5 job titles
  const topJobTitles = jobTitles.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <SimpleBarChart
        data={departments}
        title="Students by Department"
        color="#8b5cf6"
      />

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Job Targets</h3>
        <div className="space-y-3">
          {topJobTitles.map((job, index) => (
            <div key={job.title} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">{job.title}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{job.count} students</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Showing top 5 of {jobTitles.length} total job titles
          </p>
        </div>
      </div>
    </div>
  );
}
