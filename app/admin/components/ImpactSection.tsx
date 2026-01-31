'use client';

import Histogram from './Histogram';

interface ImpactSectionProps {
  atsDistribution: Array<{ range: string; count: number; percentage: number }>;
  avgScoreBefore: number;
  avgScoreAfter: number;
  funnel: {
    signedUp: number;
    uploadedResume: number;
    generatedTailored: number;
    downloaded: number;
    returnedNext7Days: number;
  };
}

export default function ImpactSection({
  atsDistribution,
  avgScoreBefore,
  avgScoreAfter,
  funnel
}: ImpactSectionProps) {
  const improvement = ((avgScoreAfter - avgScoreBefore) / avgScoreBefore * 100).toFixed(1);

  return (
    <div className="mb-8">
      <div className="mb-6">
        <Histogram
          data={atsDistribution}
          title="ATS Score Improvements Distribution"
          color="#10b981"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before/After Scores */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Before vs After ATS Scores</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Before</p>
              <p className="text-4xl font-bold text-red-600">{avgScoreBefore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Average After</p>
              <p className="text-4xl font-bold text-green-600">{avgScoreAfter.toFixed(1)}</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Net Improvement</p>
              <p className="text-3xl font-bold text-blue-600">
                +{improvement}% ({(avgScoreAfter - avgScoreBefore).toFixed(1)} points)
              </p>
            </div>
          </div>
        </div>

        {/* Engagement Funnel */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Funnel</h3>
          <div className="space-y-3">
            <FunnelStep
              label="Signed Up"
              count={funnel.signedUp}
              percentage={100}
              color="bg-blue-500"
            />
            <FunnelStep
              label="Uploaded Resume"
              count={funnel.uploadedResume}
              percentage={(funnel.uploadedResume / funnel.signedUp) * 100}
              color="bg-blue-400"
            />
            <FunnelStep
              label="Generated Tailored Resume"
              count={funnel.generatedTailored}
              percentage={(funnel.generatedTailored / funnel.signedUp) * 100}
              color="bg-blue-400"
            />
            <FunnelStep
              label="Downloaded"
              count={funnel.downloaded}
              percentage={(funnel.downloaded / funnel.signedUp) * 100}
              color="bg-green-500"
            />
            <FunnelStep
              label="Returned Next 7 Days"
              count={funnel.returnedNext7Days}
              percentage={(funnel.returnedNext7Days / funnel.signedUp) * 100}
              color="bg-green-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelStep({
  label,
  count,
  percentage,
  color
}: {
  label: string;
  count: number;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
