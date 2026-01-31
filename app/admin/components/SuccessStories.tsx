'use client';

interface SuccessStory {
  initials: string;
  department: string;
  graduationYear: number;
  scoreBefore: number;
  scoreAfter: number;
  improvement: number;
  jobTitle: string;
  company?: string;
}

interface SuccessStoriesProps {
  stories: SuccessStory[];
}

export default function SuccessStories({ stories }: SuccessStoriesProps) {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Success Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story, index) => (
            <div
              key={index}
              className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">{story.initials}</p>
                  <p className="text-sm text-gray-600">
                    {story.department} &apos;{story.graduationYear.toString().slice(-2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">+{story.improvement}%</p>
                  <p className="text-xs text-gray-500">improvement</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Before</p>
                  <p className="text-lg font-semibold text-red-600">{story.scoreBefore}</p>
                </div>
                <div className="text-gray-400">→</div>
                <div>
                  <p className="text-xs text-gray-500">After</p>
                  <p className="text-lg font-semibold text-green-600">{story.scoreAfter}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-200">
                <p className="text-sm font-medium text-gray-900">{story.jobTitle}</p>
                {story.company && (
                  <p className="text-xs text-gray-600 mt-1">{story.company}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
