# Job Application Tracker - Feature Specification

## Executive Summary

**Purpose:** Provide users with a simple, spreadsheet-like interface to track job applications automatically created during resume generation.

**Key Value Props:**
- Automatic application tracking when generating tailored resumes
- Log ATS scores (before/after) we already collect
- Simple Excel-like table interface with inline editing
- Export to CSV/XLSX
- Track application status (applied, interviewing, offer, rejected)
- Historical record of all applications

---

## Current State Analysis

### What We Already Have
From `jobs` table (db/schema.ts:31):
- ✅ Job description text
- ✅ Created date
- ✅ User ID

From `tailoredResumes` table (db/schema.ts:38):
- ✅ Link between resume and job
- ✅ Created date
- ❌ No ATS scores (proposed in admin spec but not implemented)
- ❌ No job title
- ❌ No download tracking

### What's Missing
- Company name (can extract with regex)
- Position/job title (can extract with regex)
- Application status
- Application date (vs. resume generation date)
- ATS scores (already collected, just need to log)
- Notes/comments

---

## Database Schema Changes

### New `applications` table ⭐ SELECTED
```sql
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES userProfiles(userId),
  jobId TEXT NOT NULL REFERENCES jobs(id),
  tailoredResumeId TEXT NOT NULL REFERENCES tailoredResumes(id),

  -- Core fields (extracted from job description or manual)
  companyName TEXT,
  jobTitle TEXT,

  -- Application tracking
  applicationStatus TEXT NOT NULL DEFAULT 'generated',
    -- 'generated', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'
  appliedAt TIMESTAMP,

  -- ATS scores (copied from tailoredResumes)
  atsScoreBefore INTEGER,
  atsScoreAfter INTEGER,

  -- User editable
  notes TEXT,

  -- Timestamps
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

-- Index for efficient queries
CREATE INDEX idx_applications_userId ON applications(userId);
CREATE INDEX idx_applications_status ON applications(userId, applicationStatus);
CREATE INDEX idx_applications_createdAt ON applications(userId, createdAt);
```

### Update `tailoredResumes` table
```sql
ALTER TABLE tailoredResumes ADD COLUMN atsScoreBefore INTEGER;
ALTER TABLE tailoredResumes ADD COLUMN atsScoreAfter INTEGER;
```

**Note:** ATS scores are already being collected during resume generation. We'll store them in `tailoredResumes` and copy to `applications` for easy access.

---

## Data Extraction Logic

### Code-First Extraction (Primary Method)
```typescript
// app/utils/extractJobDetails.ts
interface ExtractedJobDetails {
  companyName: string | null;
  jobTitle: string | null;
}

function extractJobDetails(description: string): ExtractedJobDetails {
  let companyName = null;
  let jobTitle = null;

  // Extract company name using common patterns
  const companyPatterns = [
    /(?:at|@|with)\s+([A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s+is|\s+seeks|\s+hiring|,|\.|$)/i,
    /^([A-Z][A-Za-z0-9\s&.,'-]+?)\s+(?:is|seeks|hiring|invites)/i,
    /Company:\s*([A-Za-z0-9\s&.,'-]+)/i,
    /Employer:\s*([A-Za-z0-9\s&.,'-]+)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      companyName = match[1].trim();
      break;
    }
  }

  // Extract job title using common patterns
  const titlePatterns = [
    /(?:Position|Role|Title|Job):\s*([A-Za-z\s/-]+)/i,
    /(?:hiring|seeking|looking for)\s+(?:a|an)?\s*([A-Z][A-Za-z\s/-]+?)(?:\s+at|\s+to|\s+with|,|\.|$)/i,
    /^([A-Z][A-Za-z\s/-]+?)\s+(?:Position|Role|Opening)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      jobTitle = match[1].trim();
      break;
    }
  }

  return { companyName, jobTitle };
}
```

### When to Extract
1. **When job description is uploaded** (during resume tailoring)
   - Extract company name and job title using regex patterns
   - Store in `applications` table
   - User can edit inline in the table later

2. **All fields are editable** - extraction is just a convenience

### Optional: LLM Fallback (Phase 2)
- If regex extraction fails or returns empty
- Use GPT-4o-mini as fallback
- Only call LLM if regex returns null
- Keep this as a future enhancement to minimize costs

---

## API Routes

### 1. GET `/api/applications`
**Purpose:** List all applications for logged-in user

**Query Params:**
- `sortBy` (optional): `createdAt`, `companyName`, `applicationStatus`
- `sortOrder` (optional): `asc`, `desc` (default: `desc` by `createdAt`)

**Response:**
```json
{
  "applications": [
    {
      "id": "app_123",
      "companyName": "Google",
      "jobTitle": "Software Engineer",
      "applicationStatus": "interviewing",
      "appliedAt": "2026-01-15T10:00:00Z",
      "atsScoreBefore": 65,
      "atsScoreAfter": 89,
      "atsImprovement": 37,
      "notes": "Phone screen scheduled",
      "tailoredResumeId": "tr_456",
      "createdAt": "2026-01-14T15:30:00Z"
    }
  ]
}
```

### 2. POST `/api/applications`
**Purpose:** Create application (automatically called during resume generation)

**Body:**
```json
{
  "jobId": "job_123",
  "tailoredResumeId": "tr_456",
  "companyName": "Google",       // extracted or null
  "jobTitle": "Software Engineer", // extracted or null
  "atsScoreBefore": 65,
  "atsScoreAfter": 89
}
```

**Response:**
```json
{
  "id": "app_123",
  "companyName": "Google",
  "jobTitle": "Software Engineer",
  "applicationStatus": "generated",
  "atsScoreBefore": 65,
  "atsScoreAfter": 89,
  "createdAt": "2026-01-14T15:30:00Z"
}
```

### 3. PATCH `/api/applications/[id]`
**Purpose:** Update application (inline editing from table)

**Body:** (partial update - any field can be updated)
```json
{
  "companyName": "Google Inc.",
  "jobTitle": "Senior Software Engineer",
  "applicationStatus": "interviewing",
  "appliedAt": "2026-01-15T10:00:00Z",
  "notes": "Phone screen scheduled for Jan 25"
}
```

### 4. DELETE `/api/applications/[id]`
**Purpose:** Delete application

**Response:**
```json
{
  "success": true
}
```

### 5. GET `/api/applications/export`
**Purpose:** Export applications to CSV/XLSX

**Query Params:**
- `format`: `csv` or `xlsx`

**Response:** File download with headers:
- Company
- Position
- Status
- Applied Date
- ATS Before
- ATS After
- Improvement %
- Notes
- Created Date

---

## UI Components & Pages

### 1. Navbar Integration
**Location:** app/Navbar.jsx

Add "My Applications" button next to existing buttons:
```jsx
<SignedIn>
  <a href="/applications" className="...">
    My Applications
  </a>
  {isAdmin && <a href="/admin">Admin</a>}
  <button onClick={...}>Upgrade</button>
  ...
</SignedIn>
```

**Requirements:**
- Visible to all authenticated (non-anonymous) users
- Same styling as other navbar buttons
- Active state when on `/applications` route

### 2. Applications Table Page
**Route:** `/applications`

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  My Applications                    [Export CSV ▼] [Delete All] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Company ↕ │ Position ↕ │ Status ↕ │ Applied │ ATS Δ │ ... │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ [editable] │ [editable] │ [select] │ [date]  │ +37%  │ [...] │ │
│  │ Google     │ SWE        │ Applied  │ 1/15/26 │ +37%  │ ... │ │
│  │ Meta       │ PM         │ Reject   │ 1/12/26 │ +42%  │ ... │ │
│  │ Amazon     │ Data Eng   │ Offer    │ 1/08/26 │ +28%  │ ... │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Inline editing:** Click any cell to edit (Excel-like behavior)
- **Sortable columns:** Click header to sort
- **Status dropdown:** Inline select with color badges
  - Generated (gray)
  - Applied (blue)
  - Interviewing (yellow)
  - Offer (green)
  - Rejected (red)
  - Withdrawn (gray)
- **ATS Improvement:** Show as "+X%" with color coding
- **Auto-save:** Save changes on blur or Enter key
- **Row actions:** Hover to show delete icon
- **Empty state:** Show helpful message when no applications

**Columns:**
1. Company (editable text)
2. Position (editable text)
3. Status (dropdown)
4. Applied Date (date picker)
5. ATS Before (read-only, from resume gen)
6. ATS After (read-only, from resume gen)
7. ATS Δ (calculated, read-only, color-coded)
8. Notes (expandable text, click to show modal or expand)
9. Actions (delete icon on hover)

### 3. Export Dropdown
**Options:**
- Export as CSV
- Export as XLSX

**Behavior:**
- Downloads file with all applications
- Filename: `my-applications-YYYY-MM-DD.csv`
- Includes all columns

### 4. Integration with Resume Generation
**After resume is generated:**

No UI changes needed - application is automatically created in background.

**Technical Flow:**
1. User generates tailored resume
2. Backend extracts company/title from job description (regex)
3. Backend creates application entry with:
   - Extracted company name
   - Extracted job title
   - ATS scores (before/after)
   - Status = "generated"
4. User sees new entry in `/applications` table next time they visit

---

## User Experience Flow

### Scenario 1: User tailors resume for job (Automatic)
1. User uploads job description
2. System generates tailored resume
3. **Background:** System extracts company name and job title using regex
4. **Background:** System creates application entry automatically
5. User downloads resume
6. Later, user visits `/applications` and sees the entry
7. User edits status from "Generated" to "Applied" (inline edit)
8. User adds notes (inline edit)

### Scenario 2: User updates application
1. User goes to `/applications`
2. Clicks on status dropdown in row
3. Selects "Interviewing"
4. Clicks on notes field
5. Adds "Phone screen on Tuesday"
6. Changes auto-save on blur

### Scenario 3: User exports applications
1. User goes to `/applications`
2. Clicks "Export CSV" dropdown
3. Selects format (CSV or XLSX)
4. File downloads with all data

### Scenario 4: User deletes application
1. User hovers over row
2. Delete icon appears
3. User clicks delete
4. Confirmation prompt
5. Row removed

---

## Technical Implementation Notes

### Data Flow
```
Resume Generation
  ↓
Extract Company/Title (Regex)
  ↓
Log ATS Scores (Already Collected)
  ↓
Create Application Record (Automatic)
  ↓
User Visits /applications
  ↓
Inline Edit Status/Notes
  ↓
Auto-save on Change
```

### Extraction Strategy (Code-First)
- Use regex patterns to extract company name and job title
- No LLM calls for extraction in MVP
- If regex fails, fields are left empty (user can fill manually)
- Fast and cost-effective

### Status Workflow
```
generated → applied → interviewing → offer/rejected/withdrawn
```

### Inline Editing Implementation
- Use `contentEditable` or controlled inputs
- Auto-save on blur event
- Debounce updates (300ms)
- Show loading indicator during save
- Optimistic updates (update UI immediately, rollback on error)

### Export Implementation
- Generate CSV in browser using Papa Parse or similar
- For XLSX, use `xlsx` library
- Stream large datasets if needed
- Include all visible columns

### Error Handling
- If extraction fails → leave fields empty
- If save fails → show error toast, revert optimistic update
- If network fails → queue updates, retry when back online
- Validate edits client-side before saving

---

## Time Estimate

### Backend (6-8 hours)
- Database schema: `applications` table + migrations: **1-2 hours**
- Update `tailoredResumes` schema: **0.5 hours**
- API routes (GET, POST, PATCH, DELETE): **2-3 hours**
- Regex extraction utility: **1 hour**
- Integration with resume generation flow: **1 hour**
- Export API endpoint (CSV/XLSX): **1-1.5 hours**

### Frontend (6-8 hours)
- Navbar integration: **0.5 hours**
- Applications table page with inline editing: **4-5 hours**
- Export dropdown + download logic: **1 hour**
- Status badges and styling: **0.5-1 hour**

### Testing & Polish (2-3 hours)
- Manual testing of all flows: **1.5 hours**
- Edge cases (regex failures, empty fields): **1 hour**
- Mobile responsive: **0.5 hour**

### **Total Estimate: 14-19 hours (2 days of focused work)**

---

## Phased Rollout

### Phase 1 (MVP - 14-19 hours) ✅ THIS SPEC
**Must-haves:**
- ✅ `applications` table
- ✅ Basic CRUD API routes (GET, POST, PATCH, DELETE)
- ✅ Regex extraction for company/title
- ✅ Applications table page with inline editing
- ✅ Status tracking (dropdown in table)
- ✅ Automatic creation during resume generation
- ✅ Export to CSV/XLSX
- ✅ Navbar integration

**Not included in MVP:**
- Search/filtering
- Bulk operations
- Analytics/charts
- LLM fallback extraction

### Phase 2 (Enhancements - 6-10 hours)
- Search by company or position
- Filter by status
- Bulk delete/status update
- LLM fallback for extraction (if regex fails)
- Sort persistence (remember user preference)
- Column visibility toggle
- Pagination (if many applications)

### Phase 3 (Advanced Features - 10-15 hours)
- Analytics dashboard (conversion rates, avg time to offer)
- Timeline view
- Email reminders for follow-ups
- Interview prep notes section
- Attach documents (cover letters, etc.)
- Integration with calendar for interview scheduling

---

## Design Decisions (Based on Feedback)

### ✅ Automatic Creation
Applications are **automatically created** when user generates a tailored resume. No opt-in needed.

### ✅ Regex-First Extraction
Use **regex patterns** to extract company name and job title. No LLM calls in MVP to minimize costs.

### ✅ Excel-Like Table
Simple **inline editing** table interface. No detail views or modals. All editing happens in the table.

### ✅ Export Functionality
CSV and XLSX export built into MVP.

### ✅ Available to All Authenticated Users
"My Applications" button in navbar for all non-anonymous users (like "Manage Billing").

### ✅ Log Existing ATS Scores
ATS scores before/after are already collected during resume generation. Just need to store and display them.

### ⏭️ LLM Fallback (Phase 2)
If regex extraction proves insufficient, can add LLM fallback in Phase 2.

---

## Success Metrics

- % of users who track applications after generating resume
- Avg applications tracked per user
- Engagement with status updates
- Feature adoption rate
- Retention improvement (users return to update status)

---

## Dependencies

### Required before implementation:
- None - can implement independently

### Recommended to implement together:
- Update `tailoredResumes` schema to include ATS scores (also needed for admin dashboard)
- Consider doing all schema updates in one migration

### Libraries needed:
- **CSV export:** `papaparse` (already common) or built-in browser API
- **XLSX export:** `xlsx` or `exceljs`
- **Date picker:** `react-datepicker` or native HTML5 date input
- **Inline editing:** Custom implementation or `react-contenteditable`

---

## Security & Privacy Considerations

- All data is user-specific (filtered by `userId`)
- Applications table has proper foreign key constraints
- API routes must verify user authentication
- Soft delete option (mark as deleted vs. hard delete)

---

## Migration Path

### For existing users with jobs/tailoredResumes:
1. Run migration to create `applications` table
2. Backfill script to create applications for existing `tailoredResumes`:
   ```sql
   INSERT INTO applications (id, userId, jobId, tailoredResumeId, status, createdAt, updatedAt)
   SELECT
     'app_' || tr.id,
     tr.userId,
     tr.jobId,
     tr.id,
     'generated',
     tr.createdAt,
     tr.createdAt
   FROM tailoredResumes tr
   WHERE NOT EXISTS (
     SELECT 1 FROM applications a WHERE a.tailoredResumeId = tr.id
   );
   ```
3. Run regex extraction on existing job descriptions to populate company/title
4. Users can edit any missing or incorrect information inline

### Future-Proofing
- Application entries are optional (don't block resume generation if creation fails)
- Schema allows for null company/title (user can fill later)
- Can add more fields in future without breaking existing data
