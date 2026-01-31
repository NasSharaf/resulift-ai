/**
 * Mock data for U of Michigan Dearborn pilot demo
 * Period: December 1, 2025 - January 10, 2026 (6 weeks)
 * Total students: 187
 * Institution: University of Michigan Dearborn
 */

// Helper to generate dates
const generateDates = (startDate: string, days: number) => {
  const dates = [];
  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Time-series data for charts
const dates = generateDates('2025-12-01', 41); // Dec 1 - Jan 10

// Daily signups (growth curve: 5/day ramping to 15/day)
export const signupTimeSeries = dates.map((date, index) => {
  const weekNumber = Math.floor(index / 7);
  let baseCount = 5 + weekNumber * 1.5; // Gradual increase

  // Add variation (lower on weekends)
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    baseCount *= 0.3; // Much lower on weekends
  }

  // Add some randomness
  const count = Math.round(baseCount + (Math.random() - 0.5) * 2);

  return {
    date,
    count: Math.max(0, count),
  };
});

// Cumulative signups for reference
let cumulativeSignups = 0;
export const cumulativeSignupTimeSeries = signupTimeSeries.map(({ date, count }) => {
  cumulativeSignups += count;
  return { date, cumulative: cumulativeSignups };
});

// Daily active users (48% weekly active rate)
export const activeUsersTimeSeries = dates.map((date, index) => {
  const totalUsers = cumulativeSignupTimeSeries[index].cumulative;
  const weeklyActiveRate = 0.48;
  const dailyActiveRate = weeklyActiveRate / 5; // Spread across weekdays

  const dayOfWeek = new Date(date).getDay();
  let count: number;

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    count = Math.round(totalUsers * dailyActiveRate * 0.4); // Lower on weekends
  } else {
    count = Math.round(totalUsers * dailyActiveRate);
  }

  // Peak on Tue-Thu
  if (dayOfWeek >= 2 && dayOfWeek <= 4) {
    count = Math.round(count * 1.3);
  }

  return {
    date,
    count: Math.max(0, count),
  };
});

// Resumes generated over time (2.2 per student average)
export const resumeGenerationTimeSeries = dates.map((date, index) => {
  const activeUsers = activeUsersTimeSeries[index].count;
  // Assume 60% of active users generate a resume on that day
  const count = Math.round(activeUsers * 0.6 * (1 + Math.random() * 0.4));

  return {
    date,
    count: Math.max(0, count),
  };
});

// Department breakdown
export const departmentBreakdown = [
  { name: 'Computer Science', count: 52, percentage: 28 },
  { name: 'Engineering', count: 43, percentage: 23 },
  { name: 'Business', count: 38, percentage: 20 },
  { name: 'Nursing', count: 24, percentage: 13 },
  { name: 'Liberal Arts', count: 30, percentage: 16 },
];

// Top job titles
export const topJobTitles = [
  { title: 'Software Engineer Intern', count: 45 },
  { title: 'Software Engineer', count: 33 },
  { title: 'Data Analyst', count: 45 },
  { title: 'Mechanical Engineer', count: 38 },
  { title: 'Financial Analyst', count: 32 },
  { title: 'Registered Nurse', count: 24 },
  { title: 'Business Analyst', count: 28 },
  { title: 'Marketing Coordinator', count: 22 },
  { title: 'Project Engineer', count: 19 },
  { title: 'UX Designer', count: 16 },
];

// ATS score improvement distribution
export const atsImprovementDistribution = [
  { range: '0-10%', count: 12, percentage: 2.9 },
  { range: '11-20%', count: 34, percentage: 8.3 },
  { range: '21-30%', count: 89, percentage: 21.6 },
  { range: '31-40%', count: 142, percentage: 34.5 },
  { range: '41-50%', count: 98, percentage: 23.8 },
  { range: '51%+', count: 37, percentage: 9.0 },
];

// Success stories (anonymized with initials)
export const successStories = [
  {
    initials: 'J.D.',
    department: 'Computer Science',
    graduationYear: 2026,
    scoreBefore: 58,
    scoreAfter: 89,
    improvement: 53,
    jobTitle: 'Software Engineer Intern',
    company: 'Fortune 500 Tech Company',
  },
  {
    initials: 'M.S.',
    department: 'Mechanical Engineering',
    graduationYear: 2026,
    scoreBefore: 65,
    scoreAfter: 91,
    improvement: 40,
    jobTitle: 'Project Engineer',
    company: 'Automotive Manufacturer',
  },
  {
    initials: 'A.K.',
    department: 'Business Administration',
    graduationYear: 2025,
    scoreBefore: 71,
    scoreAfter: 93,
    improvement: 31,
    jobTitle: 'Financial Analyst',
    company: 'Investment Firm',
  },
  {
    initials: 'R.P.',
    department: 'Data Science',
    graduationYear: 2027,
    scoreBefore: 55,
    scoreAfter: 87,
    improvement: 58,
    jobTitle: 'Data Analyst Intern',
    company: 'Healthcare Analytics',
  },
];

// Template preferences
export const templatePreferences = [
  { template: 'Modern', count: 145, percentage: 35.2 },
  { template: 'Elegant', count: 98, percentage: 23.8 },
  { template: 'Paper', count: 87, percentage: 21.1 },
  { template: 'OnePagePlus', count: 45, percentage: 10.9 },
  { template: 'Flat', count: 25, percentage: 6.1 },
  { template: 'Even', count: 12, percentage: 2.9 },
];

// Generate student roster with realistic data
const firstNames = [
  'James', 'Maria', 'Ahmed', 'Sophia', 'Michael', 'Priya', 'David', 'Emily',
  'Carlos', 'Aisha', 'Ryan', 'Jessica', 'Kevin', 'Rachel', 'Brandon',
  'Olivia', 'Daniel', 'Lauren', 'Joshua', 'Fatima', 'Andrew', 'Hannah',
  'Matthew', 'Zara', 'Justin', 'Megan', 'Chris', 'Nina', 'Alex', 'Sarah',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson',
  'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
  'Perez', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
];

const departments = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Business Administration',
  'Finance',
  'Nursing',
  'Liberal Arts',
  'Data Science',
  'Marketing',
  'Civil Engineering',
];

// Generate 187 students
export const studentRoster = Array.from({ length: 187 }, (_, index) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const department = departments[Math.floor(Math.random() * departments.length)];

  // Signup dates distributed over the 6 weeks
  const signupDayIndex = Math.floor((index / 187) * dates.length);
  const signupDate = dates[signupDayIndex];

  // Number of resumes generated (weighted toward 2-3)
  const resumesGenerated = Math.random() < 0.1 ? 0 :
                          Math.random() < 0.3 ? 1 :
                          Math.random() < 0.7 ? Math.floor(Math.random() * 3) + 2 :
                          Math.floor(Math.random() * 5) + 4;

  // ATS improvement (weighted toward 31-40% range)
  const atsImprovement = Math.round(
    30 + (Math.random() * 20) + (Math.random() - 0.5) * 15
  );

  // Last active (more recent for higher engagement users)
  const daysSinceActive = resumesGenerated > 3 ?
                         Math.floor(Math.random() * 3) :
                         Math.floor(Math.random() * 14);

  const lastActiveDate = new Date();
  lastActiveDate.setDate(lastActiveDate.getDate() - daysSinceActive);

  // Graduation year (mostly 2026)
  const graduationYear = Math.random() < 0.4 ? 2026 :
                        Math.random() < 0.75 ? 2027 : 2025;

  // Plan (mostly free, some pro)
  const plan = Math.random() < 0.92 ? 'free' : 'pro';

  // Referral count (most have 0, some super users have many)
  const referralCount = Math.random() < 0.85 ? 0 :
                       Math.random() < 0.95 ? Math.floor(Math.random() * 3) + 1 :
                       Math.floor(Math.random() * 10) + 3;

  return {
    userId: `user_umich_${index.toString().padStart(3, '0')}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@umd.umich.edu`,
    firstName,
    lastName,
    initials: `${firstName[0]}.${lastName[0]}.`,
    department,
    graduationYear,
    createdAt: signupDate,
    plan,
    resumesGenerated,
    lastActive: lastActiveDate.toISOString().split('T')[0],
    referralCount,
    avgAtsImprovement: resumesGenerated > 0 ? atsImprovement : 0,
  };
}).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

// Overall metrics
export const overallMetrics = {
  totalStudents: 187,
  totalStudentsChange: 12, // vs last week
  activeToday: 23,
  activeThisWeek: 89,
  activeThisWeekChange: 15, // vs last week
  resumesGenerated: 412,
  resumesGeneratedLast7Days: 67,
  resumesGeneratedLast30Days: 289,
  avgAtsImprovement: 34.2,
  avgAtsScoreBefore: 62.3,
  avgAtsScoreAfter: 83.6,
  downloadRate: 78.5, // % of generated resumes that were downloaded
  referralConversionRate: 42.0, // % of students who came via referral
  returnRate: 68.0, // % who returned within 7 days
};

// Engagement funnel
export const engagementFunnel = {
  signedUp: 187,
  uploadedResume: 187, // 100% - all signed up users uploaded
  generatedTailored: 167, // 89.3%
  downloaded: 131, // 78.5% of generated
  returnedNext7Days: 89, // 68% of downloaders
};

// Download formats
export const downloadFormats = {
  pdf: 342,
  docx: 70,
  pdfPercentage: 83.0,
  docxPercentage: 17.0,
};

// Peak usage times (hours in 24h format)
export const peakUsageTimes = [
  { hour: 9, count: 18, label: '9 AM' },
  { hour: 10, count: 25, label: '10 AM' },
  { hour: 11, count: 32, label: '11 AM' },
  { hour: 12, count: 28, label: '12 PM' },
  { hour: 13, count: 35, label: '1 PM' },
  { hour: 14, count: 45, label: '2 PM' },
  { hour: 15, count: 52, label: '3 PM' },
  { hour: 16, count: 38, label: '4 PM' },
  { hour: 17, count: 29, label: '5 PM' },
  { hour: 18, count: 22, label: '6 PM' },
  { hour: 19, count: 15, label: '7 PM' },
  { hour: 20, count: 12, label: '8 PM' },
  { hour: 21, count: 8, label: '9 PM' },
];

// Aggregate all data into single export for API
export const umichDearbornDashboardData = {
  institution: 'University of Michigan Dearborn',
  dateRange: {
    start: '2025-12-01',
    end: '2026-01-10',
    totalDays: 41,
  },
  metrics: overallMetrics,
  timeSeries: {
    signups: signupTimeSeries,
    activeUsers: activeUsersTimeSeries,
    resumeGeneration: resumeGenerationTimeSeries,
  },
  departments: departmentBreakdown,
  jobTitles: topJobTitles,
  atsDistribution: atsImprovementDistribution,
  successStories,
  students: studentRoster,
  templates: templatePreferences,
  funnel: engagementFunnel,
  downloads: downloadFormats,
  peakUsage: peakUsageTimes,
};
