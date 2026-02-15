# Issue Brief

## Status
🟢 **READY FOR TESTING** - Kanban Dashboard + Detection Fixes (All Phases Complete)

## Current State Summary
- [x] Feature request identified: Job application dashboard with charts and visualizations
- [x] Existing codebase analyzed: Found partial dashboard implementation (not integrated)
- [x] Data structure understood: JobApplication, DailySummary types in storage
- [x] Data source identified: `getTodayApplications()` provides today's data
- [ ] Historical data storage strategy needs design

## Problem Description
**Job Application Dashboard Feature - Kanban Style + Detection Fixes**

Build a lightweight, Kanban-style dashboard that:
1. **Kanban board layout** - columns for different statuses, tiles/cards for applications
2. **Drag-and-drop tiles** - drag tiles between columns to change status
3. **Interactive tiles** - update and delete options directly on each tile
4. **Only track submitted applications** - remove "detected" status tracking entirely
5. **Shows progress metrics** - total applications, response rates (no detected count)
6. **Includes charts/visualizations** - creative charts showing overall progress trends
7. **Clean design** - no emojis, professional look
8. **Accessible from popup** - easy navigation to dashboard view

**Detection & Submission Fixes:**
1. **Fix false positives** - popup appears on non-job websites, need better detection
2. **Record only on submit** - only save application when user clicks "Apply" button, not on page detection
3. **Better job page detection** - improve heuristics to identify actual job application pages

## Reproduction Steps
**N/A - New Feature Implementation**

User workflow (expected):
1. Click extension popup
2. Click "View Dashboard" button (new)
3. See full-page Kanban dashboard with:
   - Columns: Submitted, Interviewing, Rejected, Accepted, Withdrawn
   - Draggable tiles/cards in each column
   - Each tile shows: company, position, date, ATS hint
   - Each tile has: Edit and Delete buttons (visible on hover or always)
   - Summary cards at top (total, by status, response rate)
   - Charts showing trends over time
   - Filter/search functionality
   - NO emojis anywhere

## Affected Files
**Existing (to modify):**
- `apps/extension-firefox/src/shared/storage.ts` - Add functions for historical data aggregation
- `apps/extension-firefox/src/content.ts` - Fix job page detection, only save on submit
- `apps/extension-firefox/public/popup/popup.html` - Add "View Dashboard" button
- `apps/extension-firefox/src/popup/popup.ts` - Add event listener for dashboard navigation
- `apps/extension-firefox/esbuild.config.mjs` - Add dashboard.ts to build config

**New (to create):**
- `apps/extension-firefox/src/dashboard/dashboard.ts` - Main dashboard logic with drag-and-drop + charts
- `apps/extension-firefox/public/dashboard/dashboard.html` - Dashboard UI (enhance existing)

**Existing (reference only, may need update):**
- `apps/extension-firefox/dist/dashboard/dashboard.html` - Existing partial implementation
- `apps/extension-firefox/dist/dashboard.js` - Existing but not integrated with real data

## Hypotheses / Root Cause
**Current State Analysis:**
- Existing dashboard HTML/JS found in `dist/` has grid/kanban toggle - can adapt kanban view
- Dashboard uses different storage schema (`allApplications`) vs actual extension (`dailySummary_*`)
- No historical data aggregation mechanism exists yet
- Daily summaries stored as separate keys: `dailySummary_YYYY-MM-DD`
- Current system tracks "detected" status - NEED TO REMOVE THIS
- **Problem: Popup appears on non-job pages** - detection logic too broad in content.ts
- **Problem: Records on page load** - should only record when user submits form
- Only save applications when user clicks submit (status: 'submitted' initially)
- Need to aggregate all historical daily summaries into unified view
- Charts require lightweight library (Chart.js via CDN recommended)
- Drag-and-drop requires native HTML5 Drag API or lightweight library
- Reference image shows desired kanban layout with status badges

## Plan
**Implementation Strategy (PLANNER → DEV → TEST):**

### Phase 1: Data Layer (Storage)
1. Add `getAllApplications()` function to aggregate all `dailySummary_*` keys
   - Filter OUT any applications with status='detected' (ignore non-job pages)
2. Add `updateApplicationStatus()` to change status of existing application
3. Add `deleteApplication()` to remove application from storage
4. Add `getApplicationStats()` for summary metrics (total, by status, response rate)
5. Add `getApplicationTrends()` for time-series data (applications per day/week)

### Phase 2: Dashboard UI Source Files
6. Create `src/dashboard/dashboard.ts` with TypeScript logic
   - Implement Kanban board rendering (status columns)
   - **Implement HTML5 drag-and-drop** - tiles draggable between columns
   - Add edit modal for updating application status/notes
   - Add delete confirmation dialog
   - NO EMOJIS in any UI text
7. Create `public/dashboard/dashboard.html` based on existing kanban template
   - Use kanban column layout (not grid by default)
   - Each tile has edit/delete buttons
   - Tiles have `draggable="true"` attribute
   - Columns have drop zones
   - Remove all emoji characters
8. Integrate Chart.js library (lightweight, CDN-based)
9. Build charts: Applications over time, Status breakdown chart

### Phase 3: Build Integration
10. Update `esbuild.config.mjs` to include dashboard entry point
11. Verify build outputs `dist/dashboard/dashboard.js` correctly

### Phase 4: Detection & Submission Fixes (CRITICAL)
12. Fix job page detection in `src/content.ts`
    - Improve heuristics to only detect actual job application pages
    - Check for job-specific keywords in URL and page content
    - Reduce false positives on non-job pages
13. Only save application on form submission
    - Remove PAGE_DETECTED event recording
    - Only save to storage on SUBMIT_ATTEMPT event
    - Ensure status is 'submitted' by default (no 'detected' status)

### Phase 5: Popup Integration
14. Add "View Dashboard" button to popup UI
15. Wire up navigation to open dashboard in new tab
16. Update popup stats to exclude "detected" applications

### Phase 6: Testing & Polish
17. Test data aggregation with multiple days of data
18. Test drag-and-drop between Kanban columns
19. Test edit functionality (change status, add notes)
20. Test delete functionality with confirmation
21. Test charts render correctly with various data sizes
22. Test job page detection (should NOT trigger on non-job pages)
23. Test submission recording (only saves after clicking Apply button)
24. Verify NO emojis appear anywhere in dashboard
25. Performance check: lightweight, fast loading

## Acceptance Criteria (UPDATED SPEC)
**MUST PASS:**
- [x] Kanban board layout with status columns (✅ IMPLEMENTED - 5 columns)
- [x] Interactive tiles with edit/delete buttons on each card (✅ IMPLEMENTED)
- [x] Only track submitted applications - no 'detected' status in dashboard (✅ IMPLEMENTED - filtered out)
- [x] Edit modal for updating status and notes (✅ IMPLEMENTED)
- [x] Delete functionality with confirmation dialog (✅ IMPLEMENTED)
- [x] Dashboard accessible via "View Dashboard" button in popup (✅ IMPLEMENTED - no emoji)
- [x] Summary cards show: Total, Submitted, Interviewing, Accepted, Rejected, Response rate (✅ IMPLEMENTED)
- [x] At least 2 charts with 5-status support (✅ Line chart + Doughnut chart)
- [x] NO emojis anywhere in dashboard (✅ VERIFIED - all removed)
- [x] Charts use Chart.js loaded via CDN (✅ Chart.js 4.4.1)
- [x] No build errors, TypeScript compiles successfully (✅ VERIFIED)
- [ ] Data aggregation and edit/delete perform well (needs runtime testing)

**SHOULD PASS:**
- [x] Clean, professional design without emojis (✅ IMPLEMENTED)
- [x] Search functionality (company, position, notes) (✅ IMPLEMENTED)
- [x] CSV export includes all fields including notes (✅ IMPLEMENTED)
- [x] Click on card opens job URL in new tab (✅ IMPLEMENTED)
- [x] Empty state when no applications exist (✅ IMPLEMENTED)
- [x] Responsive design for mobile/tablet (✅ IMPLEMENTED)
- [x] Smooth animations on hover (✅ CSS transitions)

## Progress Log

### 2026-02-15 (LATE) - Drag-and-Drop + Detection & Submission Fixes ✅

**1. HTML5 Drag-and-Drop on Kanban Board**
- Cards now have `draggable="true"` and `cursor: grab`
- Columns act as drop zones with `data-status` attribute
- Visual feedback: `.dragging` (opacity+rotate) on card, `.drag-over` (blue dashed outline) on column
- Drop automatically updates application status in storage and re-renders board
- Click-to-open-URL still works (suppressed during drag)
- Files: `dashboard.ts`, `dashboard.html`

**2. Only Record Applications on Submit (background.ts)**
- Changed `addJobApplication()` call to ONLY fire on `SUBMIT_ATTEMPT` events
- `PAGE_DETECTED` events still update popup state (job bar) but do NOT save to daily summary
- All new applications saved with status `'submitted'` (no more `'detected'` entries)
- File: `apps/extension-firefox/src/background.ts`

**3. Improved Job Page Detection (dom.ts)**
- Replaced permissive single-signal detection with a **scoring system (need >= 3 points)**
- Tier 1: Known ATS hostnames (instant match, zero false positives)
- Tier 2 scoring:
  - +2: Strong URL pattern (`/jobs/role-name`, `/apply`, `/application`)
  - +1: Weak URL pattern (`/careers/`, `/recruitment/`)
  - +2: Form with 4+ fields (excluding search, password, hidden)
  - +1: 6+ loose fields on page (SPA fallback)
  - +1: Apply/submit button present
  - +1: Job-specific page content ("upload resume", "apply for this position")
- Removed overly broad patterns: `/careers`, `/jobs`, `posting`, generic class selectors
- Excludes search and password fields from form field count to avoid login/search form matches
- File: `apps/extension-firefox/src/shared/dom.ts`

**Files Modified:**
- `apps/extension-firefox/src/dashboard/dashboard.ts` (drag-and-drop logic)
- `apps/extension-firefox/public/dashboard/dashboard.html` (drag CSS + cursor styles)
- `apps/extension-firefox/src/background.ts` (submit-only recording)
- `apps/extension-firefox/src/shared/dom.ts` (scoring-based detection)

**Verification:**
- Build successful
- No linter errors

---

### 2026-02-15 (EVENING) - SPEC UPDATED: Kanban Dashboard with Edit/Delete ✅

**Major Changes Based on Updated Spec:**
1. **Kanban Board Layout** - Switched from grid to column-based Kanban view
   - 5 columns: Submitted, Interviewing, Rejected, Accepted, Withdrawn
   - Each column shows count badge
   - Responsive grid layout

2. **Removed "Detected" Status Tracking**
   - Updated `JobApplication` type to exclude 'detected' from dashboard display
   - `getAllApplications()` now filters out detected applications
   - Popup stats updated to show Total and Interviewing (instead of Submitted/Detected)
   - Only tracked/submitted applications appear in dashboard

3. **Interactive Tiles with Edit/Delete**
   - Each card has Edit and Delete buttons
   - Edit modal allows status changes and note additions
   - Delete with confirmation dialog
   - Implemented `updateApplicationStatus()` and `deleteApplication()` in storage layer

4. **New Status Options**
   - Extended status enum: submitted, interviewing, rejected, accepted, withdrawn
   - Status distribution chart updated for 5 statuses
   - Stats cards updated for new status types

5. **No Emojis - Professional Design**
   - Removed ALL emojis from dashboard HTML and UI
   - Removed emoji from "View Dashboard" button in popup
   - Clean, professional appearance throughout

6. **Enhanced Data Types**
   - Added `notes` field to JobApplication for tracking
   - Added `id` field for unique identification
   - Updated ApplicationStats interface for new statuses
   - Updated DailyTrend interface for time-series with 5 statuses

**Files Modified:**
- `apps/extension-firefox/src/shared/types.ts` - Extended JobApplication type
- `apps/extension-firefox/src/shared/storage.ts` - Added update/delete functions, updated stats/trends
- `apps/extension-firefox/public/dashboard/dashboard.html` - Complete Kanban redesign, no emojis
- `apps/extension-firefox/src/dashboard/dashboard.ts` - Complete rewrite for Kanban with edit/delete
- `apps/extension-firefox/public/popup/popup.html` - Updated stats display, removed emoji
- `apps/extension-firefox/src/popup/popup.ts` - Updated stats calculation

**Features Implemented:**
- Kanban board with 5 status columns
- Edit modal for updating status and notes
- Delete functionality with confirmation
- Search across company, position, and notes
- CSV export includes notes field
- Charts updated for 5 statuses
- Professional design without emojis

**Verification:**
- ✅ Build successful (npm run build)
- ✅ No linter errors
- ✅ All 6 files updated successfully
- ⏳ Pending: Runtime testing with browser

---

### 2026-02-15 (AFTERNOON) - Phases 1-4: Core Implementation Complete

#### Phase 1: Data Layer ✅
**Changes:**
- Added `getAllApplications()` to aggregate all historical dailySummary_* keys
- Added `getApplicationStats()` with ApplicationStats interface (total, submitted, detected, responseRate, uniqueCompanies, dateRange)
- Added `getApplicationTrends()` with DailyTrend interface for time-series chart data
- All functions handle errors gracefully and return empty/zero values on failure

**Files Modified:**
- `apps/extension-firefox/src/shared/storage.ts` (+120 lines)

#### Phase 2: Dashboard UI Source Files ✅
**Changes:**
- Created full-featured dashboard HTML with purple gradient theme matching popup
- Integrated Chart.js 4.4.1 via CDN (lightweight, ~60KB)
- Implemented TypeScript logic with chart rendering, filtering, search, and CSV export
- Added responsive design for mobile/tablet screens
- Included empty state and loading state UX

**Files Created:**
- `apps/extension-firefox/public/dashboard/dashboard.html` (400+ lines)
- `apps/extension-firefox/src/dashboard/dashboard.ts` (400+ lines)

**Features Implemented:**
- Summary stat cards (total, submitted, detected, submission rate)
- Applications over time line chart (Chart.js)
- Status breakdown doughnut chart (Chart.js)
- Application cards grid with search and status filter
- CSV export functionality
- Click card to open job URL in new tab

#### Phase 3: Build Integration ✅
**Changes:**
- Updated esbuild config to include dashboard entry point
- Verified build outputs dashboard.html and dashboard.js to dist/

**Files Modified:**
- `apps/extension-firefox/esbuild.config.mjs` (+1 line)

**Verification:**
- ✅ Build successful (npm run build)
- ✅ dist/dashboard/dashboard.html created
- ✅ dist/dashboard/dashboard.js created

#### Phase 4: Popup Integration ✅
**Changes:**
- Added "View Dashboard" button to popup UI with gradient styling
- Wired button to open dashboard in new tab using browser.tabs.create()
- Button positioned below "Manage Profile" for easy access

**Files Modified:**
- `apps/extension-firefox/public/popup/popup.html` (+1 button)
- `apps/extension-firefox/src/popup/popup.ts` (+6 lines)

**Verification:**
- ✅ TypeScript compiles successfully
- ✅ No linter errors
- ✅ Build outputs updated popup files

**Overall Status:**
- ✅ All code implementation complete (Phases 1-4)
- ⏳ Pending: Runtime testing with actual data (Phase 5)
- ⏳ Pending: Performance verification
- ⏳ Pending: Cross-browser compatibility testing

**Next Step:** Phase 5 - Testing & Polish (requires user to test in browser)

---

## Notes / Learning
- **Build System**: Extension uses esbuild (esbuild.config.mjs) with TypeScript
- **Storage Schema**: Uses browser.storage.local with keys like `dailySummary_YYYY-MM-DD`
- **Data Types**: `JobApplication`, `DailySummary` defined in `src/shared/types.ts`
- **Existing Implementation**: Partial dashboard found in `dist/` but disconnected from real data
- **Chart Library**: Recommend Chart.js (lightweight, ~60KB minified, well-documented)
- **Design Language**: Purple gradient theme (#667eea → #764ba2), matches popup UI

**Key Decisions:**
1. Kanban board is PRIMARY view (not grid)
2. **Use native HTML5 Drag-and-Drop API** (no external library needed)
3. Filter out "detected" status applications entirely (only show submitted+)
4. Edit/delete buttons on each tile for quick management
5. NO emojis in dashboard UI (professional appearance)
6. **Fix detection logic** - only trigger on actual job application pages
7. **Record on submit only** - remove PAGE_DETECTED tracking, use SUBMIT_ATTEMPT only
8. Aggregate historical data on-demand (no persistent cache initially)
9. Use CDN for Chart.js to keep extension bundle small
10. Dashboard opens in new tab (not popup overlay)
11. Reuse existing dashboard kanban HTML structure, enhance with drag/drop + edit/delete

---
Last updated: 2026-02-15 (Planner analysis)
