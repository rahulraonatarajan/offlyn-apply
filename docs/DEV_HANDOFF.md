# HANDOFF TO DEV AGENT

## Task
Implement Kanban-style job application dashboard with drag-and-drop, edit/delete functionality, and fix detection issues.

## Key Changes from Original Plan
1. **Kanban board layout** - columns for each status, NOT grid view
2. **Drag-and-drop between columns** - use HTML5 Drag API to move tiles between statuses
3. **Edit/Delete on tiles** - each application card has edit and delete buttons
4. **Remove "detected" tracking** - only show applications with status='submitted' or higher
5. **Fix false detection** - popup appears on non-job pages, need better heuristics
6. **Record on submit only** - only save applications when user clicks "Apply" button
7. **No emojis** - clean, professional UI with no emoji characters anywhere

## Context
- User wants to see all job applications in a Kanban dashboard with drag-and-drop
- Extension already collects data in `dailySummary_YYYY-MM-DD` keys
- Current system tracks "detected" status for non-job pages - FILTER THESE OUT
- **Problem: Popup triggers on non-job websites** - detection logic needs fixing
- **Problem: Records applications on page load** - should only record on form submit
- Need to aggregate historical data, add drag-and-drop, edit/delete functionality, and add charts

## Data Structure
See `apps/extension-firefox/src/shared/types.ts`:
- `JobApplication`: { jobTitle, company, url, atsHint, timestamp, status }
- `DailySummary`: { date, applications: JobApplication[], lastSentAt }
- Storage keys: `dailySummary_2026-02-14`, `dailySummary_2026-02-15`, etc.
- Status values: 'detected' (ignore), 'submitted', 'interviewing', 'rejected', 'accepted', 'withdrawn'

## Implementation Order

### Phase 1: Data Layer (Priority: HIGH)
**File: `apps/extension-firefox/src/shared/storage.ts`**

1. **Add `getAllApplications()`**
   - Scan all `dailySummary_*` keys in browser.storage.local
   - Aggregate all JobApplication entries across all dates
   - **FILTER OUT applications where status === 'detected'**
   - Return deduplicated array (by URL or ID)
   - Add error handling for corrupted storage

2. **Add `updateApplicationStatus(url: string, updates: Partial<JobApplication>)`**
   - Find application across all daily summaries
   - Update fields (status, notes, etc.)
   - Save back to storage in correct daily summary
   - Return success/failure

3. **Add `deleteApplication(url: string)`**
   - Find application across all daily summaries
   - Remove from the daily summary
   - Save updated summary back to storage
   - Return success/failure

4. **Add `getApplicationStats()`**
   - Calculate total applications count (excluding detected)
   - Calculate count per status (submitted, interviewing, rejected, accepted, withdrawn)
   - Calculate response rate
   - Return structured stats object

5. **Add `getApplicationTrends()`**
   - Group applications by date (excluding detected)
   - Calculate daily application counts
   - Return time-series data for charts

### Phase 2: Dashboard Source Files (Priority: HIGH)
**File: `apps/extension-firefox/src/dashboard/dashboard.ts` (CREATE NEW)**

6. **Import dependencies**
```typescript
import { 
  getAllApplications, 
  updateApplicationStatus, 
  deleteApplication,
  getApplicationStats,
  getApplicationTrends 
} from '../shared/storage';
import type { JobApplication } from '../shared/types';
```

7. **Implement Kanban board rendering with drag-and-drop**
   - Create columns: Submitted, Interviewing, Rejected, Accepted, Withdrawn
   - Render application cards in appropriate columns
   - Each card shows: company, position, date, ATS hint, URL link
   - Each card has: Edit button, Delete button
   - **Make cards draggable** - add `draggable="true"` attribute
   - **Implement drag handlers**:
     - `dragstart` - store application URL in dataTransfer
     - `dragover` - allow drop, highlight drop zone
     - `drop` - get application URL, update status to column status, refresh board
     - `dragend` - clean up highlighting
   - NO EMOJI CHARACTERS in any UI text

8. **Implement edit modal**
   - Modal with form fields: status dropdown, notes textarea, company, position, URL
   - Save button calls `updateApplicationStatus()`
   - Cancel button closes modal
   - Refresh board after successful update

9. **Implement delete confirmation**
   - Confirmation dialog: "Are you sure you want to delete this application?"
   - Delete button calls `deleteApplication()`
   - Refresh board after successful deletion

10. **Implement Chart.js integration**
    - Line chart: Applications over time (x-axis: date, y-axis: count)
    - Doughnut chart: Status breakdown (submitted, interviewing, rejected, accepted, withdrawn)
    - Use responsive Chart.js options

11. **Implement filter/search**
    - Search by company name or position
    - No status filter needed (columns handle that)

**File: `apps/extension-firefox/public/dashboard/dashboard.html` (CREATE NEW)**

12. **Create dashboard HTML**
    - Use existing `dist/dashboard/dashboard.html` as reference
    - Kanban layout: flex container with status columns
    - Each column: header with status name + count badge
    - **Each column has data-status attribute** for drop handling
    - Card template: 
      - Add `draggable="true"` attribute
      - Add `data-url` attribute with application URL
      - company (h3), position (p), date (small), buttons (edit, delete)
    - Include Chart.js CDN: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>`
    - Include canvas elements for charts
    - Modal structure for edit form
    - **Remove ALL emoji characters** from HTML
    - Add CSS for drag states (`.dragging`, `.drag-over`)

### Phase 3: Fix Detection & Submission (Priority: CRITICAL)
**File: `apps/extension-firefox/src/content.ts`**

13. **Fix job page detection in `isJobApplicationPage()` function**
    
    **Current Problems:**
    - Triggers on ANY form with >= 3 fields (catches login forms, contact forms, etc.)
    - Triggers on ANY page with >= 4 form fields total
    - Too broad - causes false positives on non-job sites
    
    **Required Changes:**
    - **Increase field count thresholds**: 
      - Forms: require >= 6 fields (up from 3)
      - Page-level: require >= 8 fields (up from 4)
    - **Add stricter URL requirements**:
      - ONLY trigger if URL contains job-related keywords OR known ATS domain
      - Job keywords: `/jobs/`, `/careers/`, `/apply`, `/application`, `/positions/`
    - **Add content validation**:
      - Require at least ONE of: resume/CV upload field, job title in page, "apply" button
    - **Add exclusion patterns** (blacklist common false positives):
      - URLs containing: `/login`, `/signin`, `/signup`, `/contact`, `/checkout`, `/cart`
      - Domains: `google.com`, `facebook.com`, `twitter.com`, `reddit.com`, etc.
    
    **Example improved logic:**
    ```typescript
    // Must pass URL check first
    if (!hasJobKeywordInURL && !isKnownATSPlatform) {
      return false;
    }
    
    // Then check fields + content
    if (formFieldCount >= 6 || pageFieldCount >= 8) {
      // Also require job-specific content
      if (hasResumeUpload || hasJobTitle || hasApplyButton) {
        return true;
      }
    }
    ```

14. **Only save applications on form submission**
    
    **Current Problem:**
    - PAGE_DETECTED event (line ~302 in content.ts) might be saving to storage
    - Applications saved even when user just visits the page
    
    **Required Changes:**
    - **Remove PAGE_DETECTED storage save** (if it exists in background.ts)
    - **Only save on SUBMIT_ATTEMPT event** (around line 1200 in content.ts)
    - Verify background script `background.ts`:
      - On PAGE_DETECTED: Only update popup state (lastJob), do NOT save to dailySummary
      - On SUBMIT_ATTEMPT: Save to storage with status='submitted'
    - Default status should always be 'submitted' (never 'detected')
    
    **Files to check:**
    - `src/content.ts` - ensure SUBMIT_ATTEMPT event is sent on form submission
    - `src/background.ts` - ensure PAGE_DETECTED doesn't call `addJobApplication()`

### Phase 4: Build Integration (Priority: MEDIUM)
**File: `apps/extension-firefox/esbuild.config.mjs`**

15. **Update pathMap**
```javascript
const pathMap = {
  'src/background.ts': 'dist/background.js',
  'src/content.ts': 'dist/content.js',
  'src/popup/popup.ts': 'dist/popup/popup.js',
  'src/onboarding/onboarding.ts': 'dist/onboarding/onboarding.js',
  'src/dashboard/dashboard.ts': 'dist/dashboard/dashboard.js', // ADD THIS
};
```

16. **Test build**
   - Run `npm run build`
   - Verify `dist/dashboard/dashboard.js` exists
   - Check for TypeScript errors

### Phase 5: Popup Integration (Priority: MEDIUM)
**File: `apps/extension-firefox/public/popup/popup.html`**

17. **Add "View Dashboard" button**
   - Add button in actions section
   - Style: `<button class="btn btn-profile" id="dashboard-btn">View Dashboard</button>`

**File: `apps/extension-firefox/src/popup/popup.ts`**

18. **Wire up dashboard button**
```typescript
document.getElementById('dashboard-btn')?.addEventListener('click', () => {
  browser.tabs.create({ url: browser.runtime.getURL('dashboard/dashboard.html') });
  window.close();
});
```

19. **Update stats display (optional)**
   - Remove "detected" count from popup stats
   - Only show submitted applications

### Phase 6: Testing & Polish (Priority: LOW)
20. Test with 0 applications (empty state)
21. Test with 10+ applications across multiple statuses
22. **Test drag-and-drop** - drag tiles between columns, verify status updates
23. Test edit functionality (change status, update notes)
24. Test delete functionality (confirmation dialog works)
25. Test charts render correctly
26. Test search/filter
27. **Test detection fixes** - verify popup does NOT appear on:
    - Google search pages
    - Reddit
    - Login/signup pages
    - Contact forms
    - E-commerce checkout pages
28. **Test detection still works** - verify popup DOES appear on:
    - Greenhouse.io applications
    - Lever.co applications
    - Company career pages with "apply" forms
29. **Test submission tracking** - verify applications only saved after:
    - Clicking "Apply" or "Submit Application" button
    - NOT just visiting the page or filling fields
29. Verify NO emojis appear anywhere
30. Performance check (< 100ms data load)

## Key Requirements
- **Kanban board layout** - primary view, not grid
- **Drag-and-drop functionality** - use HTML5 Drag API (no external library)
- **Edit/delete on each tile** - buttons visible on hover or always visible
- **Filter out "detected" status** - only show submitted and beyond
- **Fix detection logic** - popup should NOT appear on non-job websites
- **Record on submit only** - applications saved when user clicks Apply button
- **No emojis** - absolutely no emoji characters in UI
- **Chart.js via CDN** - https://cdn.jsdelivr.net/npm/chart.js@4.4.0
- **Purple gradient theme** - #667eea → #764ba2 (match popup)
- **Lightweight and fast** - < 100ms data aggregation
- **Responsive design**

## Reference Image
User provided screenshot showing desired Kanban layout:
- `/Users/nishanthreddy/.cursor/projects/Users-nishanthreddy-Documents-SideQuests-axesimplify/assets/image-5b3d25cf-a05c-4bc3-aec4-45aa7beb28fb.png`
- Shows columns with status labels, tiles with company/position/date
- Status badges on each tile
- Clean, professional design

## Kanban Column Statuses
1. **Submitted** - default status when application is saved (after clicking Apply button)
2. **Interviewing** - user got interview
3. **Rejected** - application rejected
4. **Accepted** - offer received
5. **Withdrawn** - user withdrew application

## HTML5 Drag-and-Drop Implementation Guide
```typescript
// On each card
card.setAttribute('draggable', 'true');
card.addEventListener('dragstart', (e) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', applicationUrl);
  card.classList.add('dragging');
});
card.addEventListener('dragend', () => card.classList.remove('dragging'));

// On each column
column.addEventListener('dragover', (e) => {
  e.preventDefault(); // Allow drop
  column.classList.add('drag-over');
});
column.addEventListener('dragleave', () => column.classList.remove('drag-over'));
column.addEventListener('drop', async (e) => {
  e.preventDefault();
  const url = e.dataTransfer.getData('text/plain');
  const newStatus = column.dataset.status;
  await updateApplicationStatus(url, { status: newStatus });
  refreshBoard();
  column.classList.remove('drag-over');
});
```

## Testing Checklist
After implementation, verify:
- [ ] Build completes: `npm run build`
- [ ] Dashboard opens from popup "View Dashboard" button
- [ ] Kanban columns render with correct applications
- [ ] **Drag-and-drop works** - can drag tiles between columns
- [ ] **Status updates when dropped** - application status changes correctly
- [ ] **Visual feedback during drag** - card shows dragging state, columns highlight
- [ ] Edit modal opens and saves changes
- [ ] Delete confirmation works and removes application
- [ ] Charts render with real data
- [ ] Search works
- [ ] CSV export works
- [ ] Empty state shows when no data
- [ ] NO emojis anywhere in UI
- [ ] **Popup does NOT appear on non-job websites** (test on Google, Reddit, etc.)
- [ ] **Applications only saved after clicking Apply button** (not on page load)

## Allowed Files (DEV may ONLY modify these)
```
apps/extension-firefox/src/shared/storage.ts (MODIFY - add aggregation + update/delete functions)
apps/extension-firefox/src/content.ts (MODIFY - fix detection logic, record on submit only)
apps/extension-firefox/src/popup/popup.ts (MODIFY - add dashboard button)
apps/extension-firefox/public/popup/popup.html (MODIFY - add dashboard button)
apps/extension-firefox/esbuild.config.mjs (MODIFY - add dashboard to build)
apps/extension-firefox/src/dashboard/dashboard.ts (CREATE NEW - kanban with drag-and-drop)
apps/extension-firefox/public/dashboard/dashboard.html (CREATE NEW - kanban layout)
```

**Reference files (READ ONLY):**
```
apps/extension-firefox/src/shared/types.ts
apps/extension-firefox/dist/dashboard/dashboard.html (existing partial impl)
apps/extension-firefox/dist/dashboard.js (existing partial impl)
```

**DO NOT MODIFY:**
- Background script, content script, onboarding files
- Manifest.json (no changes needed)
- Any UI components outside dashboard/popup

## Questions?
Refer to `docs/ISSUE_BRIEF.md` for full context and acceptance criteria.
