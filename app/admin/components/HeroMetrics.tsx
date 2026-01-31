'use client';

import MetricCard from './MetricCard';

interface HeroMetricsProps {
  totalStudents: number;
  totalStudentsChange: number;
  resumesGenerated: number;
  resumesGeneratedLast7Days: number;
  avgAtsImprovement: number;
  avgScoreBefore: number;
  avgScoreAfter: number;
}

export default function HeroMetrics({
  totalStudents,
  totalStudentsChange,
  resumesGenerated,
  resumesGeneratedLast7Days,
  avgAtsImprovement,
  avgScoreBefore,
  avgScoreAfter,
}: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <MetricCard
        title="Total Students"
        value={totalStudents}
        trend={{
          value: totalStudentsChange,
          label: 'this week'
        }}
      />
      <MetricCard
        title="Resumes Generated"
        value={resumesGenerated}
        subtitle={`${resumesGeneratedLast7Days} in the last 7 days`}
      />
      <MetricCard
        title="Avg ATS Improvement"
        value={`+${avgAtsImprovement}%`}
        subtitle={`${avgScoreBefore.toFixed(1)} → ${avgScoreAfter.toFixed(1)} avg score`}
      />
    </div>
  );
}
