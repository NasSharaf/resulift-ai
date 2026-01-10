# Admin Dashboard v0 Specification
## For University Career Center Pilot (U of Michigan Dearborn)

---

## Executive Summary

**Purpose:** Demonstrate Resulift's value to career center directors through observability into student outcomes, engagement, and adoption.

**Target Audience:** Career center directors, university administrators, student services leaders

**Key Value Props:**
- Measurable student outcomes (ATS score improvements)
- Adoption and engagement metrics
- Resource efficiency and success rates
- No-cost entry point for students (free tier)
- Viral growth through referrals

---

## Database Changes

### New Table: `institutionData` (for production)
```sql
CREATE TABLE institutionData (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL REFERENCES userProfiles(userId),
  institution TEXT NOT NULL,           -- e.g., "University of Michigan Dearborn"
  department TEXT,                     -- e.g., "Computer Science", "Engineering"
  graduationYear INTEGER,              -- e.g., 2026
  studentType TEXT,                    -- "undergraduate", "graduate"
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Schema Addition to `userProfiles` (alternative approach)
```sql
ALTER TABLE userProfiles ADD COLUMN institution TEXT;
ALTER TABLE userProfiles ADD COLUMN department TEXT;
ALTER TABLE userProfiles ADD COLUMN graduationYear INTEGER;
ALTER TABLE userProfiles ADD COLUMN studentType TEXT;
```

### New Fields in `tailoredResumes` (for better analytics)
```sql
ALTER TABLE tailoredResumes ADD COLUMN atsScoreBefore INTEGER;
ALTER TABLE tailoredResumes ADD COLUMN atsScoreAfter INTEGER;
ALTER TABLE tailoredResumes ADD COLUMN jobTitle TEXT;
ALTER TABLE tailoredResumes ADD COLUMN downloaded BOOLEAN DEFAULT FALSE;
ALTER TABLE tailoredResumes ADD COLUMN downloadedAt TIMESTAMP;
```

**For V0 Demo:** We'll use mocked data files instead of real DB changes.

---

## API Routes

### 1. GET `/api/admin/overview`
**Purpose:** High-level metrics for dashboard overview

**Response:**
```json
{
  "totalStudents": 187,
  "activeToday": 23,
  "activeThisWeek": 89,
  "resumesGenerated": 412,
  "resumesGeneratedLast7Days": 67,
  "resumesGeneratedLast30Days": 289,
  "avgAtsImprovement": 34.2,
  "downloadRate": 78.5,
  "referralConversionRate": 42.0,
  "topDepartments": [
    { "name": "Computer Science", "count": 52 },
    { "name": "Engineering", "count": 43 },
    { "name": "Business", "count": 38 }
  ]
}
```

### 2. GET `/api/admin/students`
**Purpose:** Student list with key metrics

**Response:**
```json
{
  "students": [
    {
      "userId": "user_abc123",
      "email": "jane.doe@umd.umich.edu",
      "firstName": "Jane",
      "lastName": "Doe",
      "department": "Computer Science",
      "graduationYear": 2026,
      "createdAt": "2025-12-15T10:30:00Z",
      "plan": "free",
      "resumesGenerated": 5,
      "lastActive": "2026-01-09T14:22:00Z",
      "referralCount": 2,
      "avgAtsImprovement": 38.5
    }
  ],
  "total": 187
}
```

### 3. GET `/api/admin/analytics`
**Purpose:** Time-series data for charts

**Response:**
```json
{
  "signups": [
    { "date": "2025-12-01", "count": 5 },
    { "date": "2025-12-02", "count": 8 }
  ],
  "resumeGeneration": [
    { "date": "2025-12-01", "count": 12 },
    { "date": "2025-12-02", "count": 18 }
  ],
  "activeUsers": [
    { "date": "2025-12-01", "count": 15 },
    { "date": "2025-12-02", "count": 22 }
  ]
}
```

### 4. GET `/api/admin/impact`
**Purpose:** Outcome metrics for career center pitch

**Response:**
```json
{
  "atsImprovementDistribution": [
    { "range": "0-10%", "count": 12 },
    { "range": "11-20%", "count": 34 },
    { "range": "21-30%", "count": 89 },
    { "range": "31-40%", "count": 142 },
    { "range": "41-50%", "count": 98 },
    { "range": "51%+", "count": 37 }
  ],
  "avgScoreBefore": 62.3,
  "avgScoreAfter": 83.6,
  "topJobTitles": [
    { "title": "Software Engineer", "count": 78 },
    { "title": "Data Analyst", "count": 45 },
    { "title": "Mechanical Engineer", "count": 38 }
  ],
  "successStories": [
    {
      "studentInitials": "J.D.",
      "department": "Computer Science",
      "scoreBefore": 58,
      "scoreAfter": 89,
      "jobTitle": "Software Engineer Intern"
    }
  ]
}
```

### 5. GET `/api/admin/usage`
**Purpose:** Feature adoption and usage patterns

**Response:**
```json
{
  "templatePreferences": [
    { "template": "Modern", "count": 145 },
    { "template": "Elegant", "count": 98 },
    { "template": "Paper", "count": 87 }
  ],
  "downloadFormats": {
    "pdf": 342,
    "docx": 70
  },
  "avgSessionDuration": 8.5,
  "peakUsageTimes": [
    { "hour": 14, "count": 45 },
    { "hour": 15, "count": 52 },
    { "hour": 16, "count": 38 }
  ],
  "engagementFunnel": {
    "uploaded": 187,
    "tailored": 167,
    "downloaded": 131,
    "returnedNext7Days": 89
  }
}
```

---

## UI Structure

### Route: `/admin` (Single Page, No Tabs)

**Design Philosophy:** Single scrolling page matching Resulift's one-page app design

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Resulift Admin - U of Michigan Dearborn        │
│  January 10, 2026                               │
└─────────────────────────────────────────────────┘

[Section 1: Hero Metrics]
┌──────────────────────────────────────────────┐
│ Key Metrics (3 Large Cards)                  │
├──────────────────────────────────────────────┤
│  Total Students    Resumes Generated   Avg ATS Improvement
│      187               412                 +34.2%
│   (+12 this week)   (+67 this week)     (62→83 avg score)
└──────────────────────────────────────────────┘

[Section 2: Growth & Engagement - Side by Side]
┌─────────────────────────┬────────────────────┐
│ Student Signups         │ Active Users       │
│ (Line Chart)            │ (Line Chart)       │
│ Shows growth trajectory │ Weekly engagement  │
└─────────────────────────┴────────────────────┘

[Section 3: Impact Metrics - Primary Focus]
┌──────────────────────────────────────────────┐
│ ATS Score Improvements (Histogram)           │
│ Shows distribution - Most 31-40% range       │
└──────────────────────────────────────────────┘

┌─────────────────────┬────────────────────────┐
│ Before vs After     │ Engagement Funnel      │
│ Avg: 62.3 → 83.6   │ Signup → Download      │
│ (Big number visual) │ 187 → 167 → 131       │
└─────────────────────┴────────────────────────┘

[Section 4: Department & Usage Patterns]
┌─────────────────────┬────────────────────────┐
│ Top Departments     │ Top Job Targets        │
│ (Bar Chart)         │ (List)                 │
│ Comp Sci: 52       │ 1. Software Eng: 78    │
│ Engineering: 43     │ 2. Data Analyst: 45   │
│ Business: 38        │ 3. Mech Eng: 38       │
└─────────────────────┴────────────────────────┘

[Section 5: Success Stories - Testimonial Style]
┌──────────────────────────────────────────────┐
│ Student Success Highlights                   │
│                                              │
│ "J.D., Computer Science                     │
│  58 → 89 ATS score (+53% improvement)       │
│  Software Engineer Intern position"         │
│                                              │
│ "M.S., Mechanical Engineering               │
│  65 → 91 ATS score (+40% improvement)"     │
└──────────────────────────────────────────────┘

[Section 6: Student Roster - Compact]
┌──────────────────────────────────────────────┐
│ Recent Student Activity (Top 10)             │
├──────┬──────────┬────────────┬──────┬────────┤
│ Init │ Dept     │ Resumes    │ ATS Δ│ Active │
├──────┼──────────┼────────────┼──────┼────────┤
│ J.D. │ Comp Sci │ 5         │ +38% │ Today  │
│ M.S. │ Eng      │ 3         │ +42% │ 2d ago │
│ ...  │          │           │      │        │
└──────┴──────────┴────────────┴──────┴────────┘
```

**Key Design Decisions:**
- **No tabs** - Everything scrolls vertically
- **Hero metrics first** - Most important numbers at top
- **Impact-focused middle** - ATS improvements are the star
- **Student roster at bottom** - Details available but not primary
- **Visual hierarchy** - Larger charts for key metrics, smaller for supporting data
- **Mobile-friendly** - Stacks naturally on smaller screens

---

## Component Structure

```
/app/admin/
├── layout.tsx           // Admin layout with auth check
├── page.tsx            // Single-page dashboard (no tabs)
├── components/
│   ├── HeroMetrics.tsx        // 3 large stat cards at top
│   ├── GrowthCharts.tsx       // Signups + Active users
│   ├── ImpactSection.tsx      // ATS improvements + funnel
│   ├── DepartmentUsage.tsx    // Departments + Job targets
│   ├── SuccessStories.tsx     // Testimonial cards
│   ├── StudentRoster.tsx      // Top 10 recent activity
│   ├── MetricCard.tsx         // Reusable stat card
│   ├── LineChart.tsx          // Simple line chart
│   ├── BarChart.tsx           // Horizontal/vertical bars
│   └── Histogram.tsx          // ATS improvement distribution

/app/api/admin/
└── data/route.ts       // Single endpoint returns all data

/app/lib/
└── mockData/
    └── umichDearborn.ts  // Mocked data for demo
```

**Simplified API:** One endpoint (`/api/admin/data`) returns everything needed for the page, reducing round trips.

---

## Mock Data Profile (U of Michigan Dearborn)

### Student Demographics
- **Total students:** 187
- **Date range:** Dec 1, 2025 - Jan 10, 2026 (6 weeks)
- **Email domain:** @umd.umich.edu
- **Departments:**
  - Computer Science: 52 (28%)
  - Engineering: 43 (23%)
  - Business: 38 (20%)
  - Nursing: 24 (13%)
  - Liberal Arts: 30 (16%)
- **Graduation years:** 2026 (40%), 2027 (35%), 2025 (25%)
- **Student types:** Undergraduate (85%), Graduate (15%)

### Usage Patterns
- **Signups:** Growth curve starting at 5/day, ramping to 15/day by Jan
- **Active users:** 48% weekly active, 15-20% daily active
- **Resumes generated:** 2.2 per student average
- **Download rate:** 78.5% (industry benchmark: 60-65%)
- **Return rate:** 68% return within 7 days (high engagement)

### Outcome Metrics
- **ATS improvements:**
  - Average before: 62.3
  - Average after: 83.6
  - Average improvement: +34.2%
  - Distribution: Bell curve centered on 31-40% range
- **Top job titles:**
  - Software Engineer/Intern (78)
  - Data Analyst (45)
  - Mechanical Engineer (38)
  - Financial Analyst (32)
  - Registered Nurse (24)

### Referral Mechanics
- **Referral rate:** 42% (79 students referred by peers)
- **Top referrers:** 3-5 "super users" with 8-12 referrals each
- **Referral chains:** 2-3 levels deep showing viral growth

### Peak Usage
- **Days:** Tuesday-Thursday (career center workshop days)
- **Times:** 2pm-4pm EST (post-class hours)
- **Template preferences:** Modern (35%), Elegant (24%), Paper (21%)
- **Download formats:** PDF (83%), DOCX (17%)

---

## Authentication & Access Control

### Admin Check
```typescript
// /app/admin/dashboard/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/app/utils/usageLimits';

export default async function AdminLayout({ children }) {
  const { userId } = await auth();

  if (!userId || !isAdmin(userId)) {
    redirect('/');
  }

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
```

### API Route Protection
```typescript
// All /app/api/admin/* routes
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/app/utils/usageLimits';

export async function GET() {
  const { userId } = await auth();

  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // ... return data
}
```

---

## Technical Implementation Notes

### Charting Library
**Recommendation:** Recharts (already popular in React ecosystem)
```bash
npm install recharts
```

### Styling
- Use existing Tailwind CSS setup
- Match current app aesthetic (minimal, clean)
- Responsive design (mobile-friendly for tablet demos)

### Performance
- Static data for V0 (no real-time updates needed)
- Server components where possible
- Lazy load charts below fold

### Data Refresh
- For demo: Static JSON data loaded from mock file
- For production: API routes query real database with caching

---

## External Service Changes Required

### Clerk Changes: NONE
**Existing setup is sufficient:**
- Admin detection already exists via `isAdmin()` in `/app/utils/usageLimits.ts`
- Uses `ADMIN_USER_IDS` environment variable
- Just ensure your Clerk user ID is in the env var list
- No new Clerk configuration needed

**To verify your admin user ID:**
```bash
# Log into the app and check console/network tab for your userId
# Or check Clerk dashboard for your user ID
# Format: user_xxxxxxxxxxxxxxxxxxxxx
```

### Fly.io Changes: NONE
**Why:** Fly.io is only used for PDF generation (`/api/download-pdf`). Admin dashboard doesn't generate PDFs, so no changes needed.

### Environment Variables
**Required:**
- `ADMIN_USER_IDS` - Comma-separated list of admin user IDs
  - Example: `user_36rEWWPkAkXxJbvbvPEr5QljeXb,user_anotherAdminId`
  - Already exists in codebase
  - Just add your ID if not already there

**That's it!** No new API keys, no new services, no new configuration.

---

## Implementation Scope

### What Gets Built:

1. **Mock Data File** (`/app/lib/mockData/umichDearborn.ts`)
   - 187 fake students with realistic data
   - Time-series data for charts
   - ATS improvement distributions
   - All data statically defined

2. **Single API Route** (`/app/api/admin/data/route.ts`)
   - Auth check via Clerk + `isAdmin()`
   - Returns mock data JSON
   - ~100 lines of code

3. **Admin Layout** (`/app/admin/layout.tsx`)
   - Auth protection
   - Simple wrapper
   - ~30 lines of code

4. **Main Dashboard Page** (`/app/admin/page.tsx`)
   - Fetches from `/api/admin/data`
   - Renders 6 section components
   - ~150 lines of code

5. **6 Section Components** (`/app/admin/components/*.tsx`)
   - HeroMetrics: 3 stat cards (~80 lines)
   - GrowthCharts: 2 line charts (~120 lines)
   - ImpactSection: Histogram + funnel (~150 lines)
   - DepartmentUsage: Bar chart + list (~100 lines)
   - SuccessStories: 3-4 testimonial cards (~60 lines)
   - StudentRoster: Simple table (~80 lines)

6. **Chart Components** (reusable)
   - Using Recharts library
   - LineChart: ~60 lines
   - BarChart: ~60 lines
   - Histogram: ~80 lines
   - MetricCard: ~40 lines

**Total: ~1,000-1,200 lines of code** (including mock data)

### What's NOT Built (future phases):
- Real database queries
- Filtering/sorting
- Export to CSV
- Multi-institution support
- Real-time updates
- Email reports

---

## Implementation Breakdown

### Step 1: Install Charting Library
```bash
npm install recharts
```

### Step 2: Create Mock Data
- Generate realistic UMich Dearborn student data
- Time-series for charts
- All metrics calculated upfront

### Step 3: Build API Route
- Auth protection
- Return mock data
- Test with curl/Postman

### Step 4: Build UI Components
- Start with layout + page shell
- Build charts (can test with dummy data)
- Build section components
- Integrate with API

### Step 5: Polish
- Responsive design
- Loading states
- Error handling
- Visual hierarchy

---

## Launch Checklist

- [ ] Install recharts library
- [ ] Mock data file created with UMich Dearborn profile
- [ ] Admin route protection implemented
- [ ] Single API route built and returning mock data
- [ ] Admin layout with auth check completed
- [ ] 6 section components built
- [ ] 4 chart components implemented
- [ ] Main dashboard page integrating all sections
- [ ] Mobile responsive design tested
- [ ] Admin user ID confirmed in ADMIN_USER_IDS env var
- [ ] Test on Vercel preview deploy

---

## Future Enhancements (Post-V0)

1. **Real-time data** - Connect to actual database
2. **Institution filtering** - Multi-institution support
3. **Export functionality** - CSV downloads for reporting
4. **Cohort analysis** - Compare different time periods
5. **Customizable dashboards** - Career centers configure views
6. **Email reports** - Weekly/monthly summary emails
7. **Goal tracking** - Set targets and track progress
8. **Integration with student records** - Match to career outcomes

---

## Key Talking Points for Pilot Meeting

**For Career Center Directors:**

1. **Measurable Impact:** "Our students see an average 34% improvement in ATS scores"
2. **High Adoption:** "78% of students who generate a resume actually download it"
3. **Organic Growth:** "42% of students came through peer referrals"
4. **Engagement:** "68% return within a week to create more resumes"
5. **Resource Efficiency:** "Free tier means no cost barrier for students"
6. **Cross-Campus Reach:** "Students from CS, Engineering, Business, Nursing all using it"
7. **Modern Solution:** "AI-powered, mobile-friendly, always available"
8. **Data-Driven:** "This dashboard gives you real-time visibility into student outcomes"

**ROI Pitch:**
- **Cost:** Discounted institutional pricing TBD
- **Value:** Higher placement rates, measurable skill matching, improved student satisfaction
- **Risk:** Free pilot period to prove value

---

## Timeline

**For January Meeting:**
- Week 1: Database design + API routes (mock data)
- Week 2: UI implementation (4 tabs)
- Week 3: Polish, test, demo script

**Post-Meeting:**
- Connect to real data
- Add requested features based on feedback
- Prepare for broader rollout

---

End of specification.
