import HeroMetrics from './components/HeroMetrics';
import GrowthCharts from './components/GrowthCharts';
import ImpactSection from './components/ImpactSection';
import DepartmentUsage from './components/DepartmentUsage';
import SuccessStories from './components/SuccessStories';
import StudentRoster from './components/StudentRoster';

 // TODO: Replace mock data with real database queries                                                                                                       
  // Currently using mock data from @/app/lib/mockData/umichDearborn                                                                                          
  // See ADMIN_DASHBOARD_SPEC.md for schema changes needed 

async function getAdminData() {
  // In production, this would be a server-side fetch
  // For now, we'll import the mock data directly
  const { umichDearbornDashboardData } = await import('@/app/lib/mockData/umichDearborn');
  return umichDearbornDashboardData;
}

export default async function AdminDashboard() {
  const data = await getAdminData();

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resulift Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">{data.institution}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Period</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(data.dateRange.start).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}{' '}
                -{' '}
                {new Date(data.dateRange.end).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 ">
        {/* Section 1: Hero Metrics */}
        <HeroMetrics
          totalStudents={data.metrics.totalStudents}
          totalStudentsChange={data.metrics.totalStudentsChange}
          resumesGenerated={data.metrics.resumesGenerated}
          resumesGeneratedLast7Days={data.metrics.resumesGeneratedLast7Days}
          avgAtsImprovement={data.metrics.avgAtsImprovement}
          avgScoreBefore={data.metrics.avgAtsScoreBefore}
          avgScoreAfter={data.metrics.avgAtsScoreAfter}
        />

        {/* Section 2: Growth Charts */}
        <GrowthCharts
          signupData={data.timeSeries.signups}
          activeUsersData={data.timeSeries.activeUsers}
        />

        {/* Section 3: Impact Metrics */}
        <ImpactSection
          atsDistribution={data.atsDistribution}
          avgScoreBefore={data.metrics.avgAtsScoreBefore}
          avgScoreAfter={data.metrics.avgAtsScoreAfter}
          funnel={data.funnel}
        />

        {/* Section 4: Department & Job Targets */}
        <DepartmentUsage
          departments={data.departments}
          jobTitles={data.jobTitles}
        />

        {/* Section 5: Success Stories */}
        <SuccessStories stories={data.successStories} />

        {/* Section 6: Student Roster */}
        <StudentRoster students={data.students} maxDisplay={10} />

        {/* Footer */}
        <div className="bg-white rounded-lg border border-gray-200 mt-12 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
            <p className="text-sm text-gray-500">
              Resulift Admin Dashboard v0.1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
