# Issue Brief

## Status
📋 **FEATURE-BASED PLANNING** - Multi-Agent Workflow Active

**Previous Phases**: 
- ✅ Kanban Dashboard + Detection Fixes (Implementation Complete)  
- ✅ UX Audit & Refinement Planning (6 Major Initiatives Complete)  
- ✅ Mockup Implementation Specs (Ready for dev)

**Current Phase**: 🎯 Cross-Browser Expansion  
**Completed Features (Firefox)**: 
1. ✅ Learned Values with Reinforcement Learning
2. ✅ Dashboard Data Fix & Test Generator
3. ✅ Autofill Bug Fixes - Resume Upload + Skipped Fields
4. ✅ Onboarding Redesign - Split Fields + Self-ID
5. ✅ Ollama Setup & Configuration

**Active Feature**: 
6. Chrome Extension Port (Priority: High - Expand Browser Support)

## Current State Summary
- [x] Feature request identified: Job application dashboard with charts and visualizations
- [x] Drag-and-drop requirement added: Kanban tiles movable between columns
- [x] Detection issues identified: Popup appears on non-job pages (false positives)
- [x] Submission tracking issue: Records on page load instead of form submit
- [x] Rebranding requirement: Change from "Offlyn" to "Offlyn Apply" (OA monogram)
- [x] **NEW Color scheme**: Navy (#0F172A) + Green (#27E38D) - NO gradients
- [x] **NEW Design system**: Centralized theme.ts file created
- [x] Brand assets exported: 13 logo files ready in Brandkit/exports/
- [x] Complete file list created: 27 files need updates

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

## NEW: UX Refinement Initiative (2026-02-16)

### Overview
Comprehensive UX audit and refinement plan based on job application workflow best practices.

**Objective**: Transform Offlyn Apply from "good" (6.2/10) to "exceptional" (9+/10)

### UX Audit Results

**Current Score**: 6.2/10

**What's Working** ✅:
- Privacy-first approach (local AI)
- Good performance (fast load times)
- Draggable in-page panel
- Core autofill functionality

**Critical Issues** ❌:
- Too many competing CTAs (cognitive overload) - 4/10
- No confidence indicators (trust issue) - 5/10
- Inconsistent spacing & colors - 4/10
- No progressive disclosure - 3/10
- No dark mode - Missing

### 6 Major Initiatives

#### 1. Complete Design System Structure ✅ SPEC COMPLETE
**Document**: `DESIGN_SYSTEM_COMPLETE.md`

**Deliverables**:
- [ ] Create `src/design-system/` directory (9 files)
  - colors.ts (light + dark themes)
  - spacing.ts (8px grid)
  - typography.ts
  - radius.ts
  - shadows.ts
  - animations.ts
  - buttons.ts
  - index.ts
  - README.md

**Impact**: Eliminates hardcoded values, ensures consistency across all surfaces

**Effort**: 4-5 hours to create + 8-10 hours to refactor existing components

---

#### 2. Popup Redesign (Context-Aware) ✅ SPEC COMPLETE
**Document**: `POPUP_REDESIGN.md`

**Key Changes**:
- Width: 300px → 340px
- Structure: Header → Context Card → Primary Action → Secondary Action → Quick Stats → Footer
- **State Machine**: 4 states (Not on job → On job → After fill → After submit)
- **Progressive Disclosure**: Advanced features in settings page (not inline)
- **Single Primary Action**: Only 1-2 buttons visible per state

**New Features**:
- Confidence indicators (high/medium/low)
- "What was filled" summary
- Micro-interactions (loading, success animations)
- "100% Local" privacy badge

**Impact**: Reduces cognitive load from 4/10 to 9/10

**Effort**: 6-8 hours

---

#### 3. Dark Mode Implementation ✅ SPEC COMPLETE
**Document**: `DARK_MODE_SPEC.md`

**Deliverables**:
- [ ] Create `theme-manager.ts` (detection + toggle logic)
- [ ] Update `colors.ts` with dark theme tokens
- [ ] Apply CSS variables to all HTML files
- [ ] Implement theme toggle (Light / Auto / Dark)

**Surfaces**:
- Popup
- Dashboard
- Onboarding
- All in-page components (9 files)

**Impact**: Modern UX standard, reduces eye strain, shows attention to detail

**Effort**: 8-10 hours

---

#### 4. Firefox Store Marketing Kit ✅ SPEC COMPLETE
**Document**: `FIREFOX_STORE_KIT.md`

**Deliverables**:
- [ ] 5 screenshots (1920x1080px PNG)
  1. Hero - Auto-Fill in Action
  2. Dashboard - Track Applications
  3. Privacy Focus - 100% Local
  4. Cover Letter Generator
  5. Easy Setup - Profile Form
- [ ] Store description copy (privacy-focused)
- [ ] Social media graphics (Twitter, Product Hunt)
- [ ] Press kit (boilerplate, media assets)

**Impact**: Professional store presence, higher install conversion

**Effort**: 6-8 hours (design) + 2-3 hours (copy)

---

#### 5. UX Audit (Diagnostic) ✅ COMPLETE
**Document**: `UX_AUDIT.md`

**Output**: Detailed assessment of 12 UX categories with scores, issues, and recommendations

**Key Findings**:
- Cognitive Load: 4/10 (too many CTAs)
- Trust & Privacy: 7/10 (good but needs clearer messaging)
- Progressive Disclosure: 3/10 (all features shown at once)
- Visual Hierarchy: 5/10 (no clear focal point)
- Spacing System: 4/10 (inconsistent, not on 8px grid)
- Color Usage: 6/10 (good palette, inconsistent application)

---

#### 6. Master Implementation Plan ✅ COMPLETE
**Document**: `UX_REFINEMENT_MASTER_PLAN.md`

**Output**: Consolidated 6-phase implementation plan with:
- Phased approach (Foundation → Trust → Redesign → Dark Mode → Marketing → Polish)
- File-by-file implementation guide
- Testing checklist
- Success metrics
- Timeline estimates (35-45 hours total)

---

### Implementation Priority

#### Must Have (Launch Blockers)
1. Design system created (Phase 1)
2. Existing components refactored (Phase 1)
3. Popup redesigned (Phase 3)
4. Confidence indicators added (Phase 2)

#### Should Have (Quality)
5. Dark mode implemented (Phase 4)
6. Micro-interactions polished (Phase 3)
7. Marketing assets created (Phase 5)

#### Nice to Have (Growth)
8. Social media graphics (Phase 5)
9. Press kit (Phase 5)
10. Promotional video (Phase 5)

---

### Documentation Created

1. ✅ **START_HERE.md** - Quick overview & next steps
2. ✅ **UX_AUDIT.md** - Current state assessment (6.2/10)
3. ✅ **DESIGN_SYSTEM_COMPLETE.md** - Complete design system structure
4. ✅ **POPUP_REDESIGN.md** - Context-aware popup spec
5. ✅ **DARK_MODE_SPEC.md** - Dark mode implementation guide
6. ✅ **FIREFOX_STORE_KIT.md** - Marketing assets & copy
7. ✅ **UX_REFINEMENT_MASTER_PLAN.md** - Master implementation plan

**Total**: 7 comprehensive specification documents

---

### Estimated Timeline

**Full-Time Work** (8 hours/day):
- Week 1: Design system + refactor (12-15 hours)
- Week 2: Popup redesign + confidence indicators (10-12 hours)
- Week 3: Dark mode (8-10 hours)
- Week 4: Marketing + testing (8-10 hours)
- **Total: 4 weeks (38-47 hours)**

**Part-Time Work** (4 hours/day):
- **Total: 8-10 weeks**

**Focused Sprint** (12 hours/day):
- **Total: 3-4 weeks**

---

### Success Metrics (Target)

**UX Scores** (after refinement):
- Cognitive Load: 4/10 → 9/10
- Trust & Privacy: 7/10 → 9/10
- Progressive Disclosure: 3/10 → 9/10
- Visual Hierarchy: 5/10 → 9/10
- Spacing Consistency: 4/10 → 10/10
- Color Consistency: 6/10 → 10/10

**User Metrics** (post-launch):
- Time to autofill: < 3 seconds
- User satisfaction: 4.5+ stars (Firefox Add-ons)
- Feature discovery: 80%+ use dashboard
- Privacy mentions: 90%+ positive sentiment in reviews

---

### Next Steps

1. **User Decision**: Review specs, approve scope & timeline
2. **DEV Phase**: Implement Phase 1 (Design System)
3. **Iterative Testing**: Test after each phase
4. **Launch Prep**: Marketing assets ready
5. **Store Submission**: Firefox Add-ons with polished screenshots

**See**: `START_HERE.md` for quick overview and decision points

---

## LATEST: Mockup Implementation (2026-02-16)

### Overview
User provided 3 UI mockups (Popup, Dashboard, Onboarding) showing desired final design. All implementation must match these mockups pixel-perfect.

**Mockup Images**:
- `assets/image-2c7d9d58...` - Browser Popup mockup
- `assets/image-db40289a...` - Dashboard mockup
- `assets/image-4b28798c...` - Onboarding mockup

### Key Design Changes from Current

#### Popup Changes
**Current**: 300px wide, purple gradient, multiple button rows  
**Mockup Target**: ~584px wide, navy (#2D3748), single column, green accents

**Major Updates**:
- Width: 300px → 584px ✅
- Background: Purple gradient → Navy solid (#2D3748) ✅
- Logo: Square icon → Circular green with "OA" ✅
- Toggle: Purple → Green (#27E38D) ✅
- Primary button: Purple → Green, full width ✅
- Secondary button: Transparent with border ✅
- Layout: Simplified, single column ✅

#### Dashboard Changes
**Current**: Purple gradient theme  
**Mockup Target**: White/light gray (#F7F9FC), professional look

**Major Updates**:
- Background: Purple gradient → Light gray (#F7F9FC) ✅
- Stats: 4 cards → 6 cards (with colored numbers) ✅
- Status colors: Blue (submitted), Green (interviewing), Red (rejected), Purple (accepted) ✅
- Cards: Add checkboxes, refined design ✅
- Search bar: New design with filter dropdown ✅

#### Onboarding Changes
**Current**: Purple gradient, basic form  
**Mockup Target**: Navy full-screen with white card, wizard with progress

**Major Updates**:
- Background: Purple gradient → Navy full screen (#0F172A) ✅
- Logo: Add white container around logo ✅
- Progress: 6-step indicator with icons ✅
- Upload area: Dashed border, centered design ✅
- Footer: Green primary button, privacy note ✅

### New Documentation

#### 1. **MOCKUP_IMPLEMENTATION_SPEC.md** ✅
**Purpose**: Detailed pixel-perfect implementation guide

**Contains**:
- Complete CSS specifications for all 3 pages
- Before/after comparisons
- Exact color codes from mockups
- Layout specifications
- Component-by-component breakdown
- Implementation checklist

**Size**: ~700 lines, comprehensive

#### 2. **MOCKUP_QUICK_START.md** ✅
**Purpose**: Quick reference for developers

**Contains**:
- Key changes summary
- Implementation order (Popup → Dashboard → Onboarding)
- Copy-paste code snippets
- Testing checklist
- Time estimates (6-10 hours total)
- Common issues to avoid

#### 3. **WEBPAGE_INVENTORY.md** ✅
**Purpose**: Complete inventory of all HTML pages and their functionality

**Contains**:
- 3 main user-facing pages (Popup, Dashboard, Onboarding)
- 6 in-page components (dynamically injected)
- 6 test pages (development only)
- User journey flowcharts
- Page access methods
- File modification guide

### Implementation Priority

**Phase 1: Popup** (2-3 hours) - HIGHEST PRIORITY
- Most-used interface
- High visibility
- Quick win

**Phase 2: Dashboard** (2-3 hours) - HIGH PRIORITY
- User engagement feature
- Already functional, needs polish

**Phase 3: Onboarding** (1-2 hours) - MEDIUM PRIORITY
- First impression
- Less frequent use (once per user)

**Total Estimated Effort**: 6-10 hours for mockup implementation

### Color Palette from Mockups

**Navy Shades**:
- `#0F172A` - Darkest (onboarding background)
- `#2D3748` - Medium (popup background)
- `#3A4556` - Light (popup cards)

**Accent Colors**:
- `#27E38D` - Green (primary actions, toggle, success)
- `#3B82F6` - Blue (submitted status)
- `#EF4444` - Red (rejected status)
- `#8B5CF6` - Purple (accepted status)

**Neutrals**:
- `#F7F9FC` - Light gray (dashboard background)
- `#E5E7EB` - Border gray
- `#64748B` - Text gray (secondary)
- `#1A202C` - Text dark (primary)

### Files to Modify (Priority Order)

**Immediate**:
1. `public/popup/popup.html` - Full redesign ✅
2. `src/popup/popup.ts` - Update styles ✅
3. `public/dashboard/dashboard.html` - Update layout & colors ✅
4. `src/dashboard/dashboard.ts` - Update chart colors ✅
5. `public/onboarding/onboarding.html` - Update wizard design ✅

**Follow-up**:
6. `src/shared/theme.ts` - Update color tokens ✅
7. `src/ui/field-summary.ts` - Match popup style ✅
8. `src/ui/cover-letter-panel.ts` - Match color scheme ✅

### Testing Requirements

**Visual**:
- [ ] Popup width exactly matches mockup (~584px)
- [ ] All colors match mockup hex codes
- [ ] Logo is circular green "OA"
- [ ] Stats cards have correct colored numbers
- [ ] Upload area has dashed border
- [ ] Progress indicator shows 6 steps

**Functional**:
- [ ] All buttons still work
- [ ] Toggle switch functional
- [ ] Drag-and-drop still works
- [ ] Charts render correctly
- [ ] Forms validate
- [ ] Build succeeds (npm run build)

**Cross-check**:
- [ ] Compare side-by-side with mockup images
- [ ] Test in Firefox (not just dev tools)
- [ ] Check responsive behavior
- [ ] Verify accessibility (contrast, focus states)

### Success Criteria

**Implementation Complete When**:
- ✅ All 3 pages match mockups pixel-perfect
- ✅ All existing functionality preserved
- ✅ Build succeeds with no errors
- ✅ Side-by-side comparison passes
- ✅ User approval obtained

### Next Steps

1. **Developer**: Read `MOCKUP_QUICK_START.md`
2. **Developer**: Start with Popup (highest priority)
3. **Developer**: Use `MOCKUP_IMPLEMENTATION_SPEC.md` for exact CSS
4. **Developer**: Test after each page
5. **User**: Review implementation, provide feedback
6. **Developer**: Iterate until pixel-perfect

---

**Quick Links**:
- Mockup specs: `MOCKUP_IMPLEMENTATION_SPEC.md`
- Quick start: `MOCKUP_QUICK_START.md`
- Page inventory: `WEBPAGE_INVENTORY.md`
- UX refinement: `START_HERE.md` (broader UX initiative)

---

## 2026-02-17 - Brand Logo Update (All Pages)

### Overview
Updated all pages to use the official Offlyn Apply Primary Logo (`Brandkit/Offlyn_Apply_Primary_Logo.png`) consistently across every surface.

### Changes Made

**Logo Asset**:
- Copied `Brandkit/Offlyn_Apply_Primary_Logo.png` → `public/icons/primary-logo.png`

**HTML Pages Updated (8 files)**:
1. `public/popup/popup.html` - Header logo: `monogram.png` → `primary-logo.png`
2. `public/home/home.html` - Hero logo: `brand-logo-transparent.png` → `primary-logo.png`
3. `public/dashboard/dashboard.html` - Header logo: `brand-logo.png` → `primary-logo.png` + added "Back to Home" link
4. `public/onboarding/onboarding.html` - Top nav logo: `brand-logo.png` → `primary-logo.png`
5. `public/settings/settings.html` - Header logo: `brand-logo-transparent.png` → `primary-logo.png`
6. `public/privacy/privacy.html` - Header logo: `brand-logo-transparent.png` → `primary-logo.png`
7. `public/help/help.html` - Header logo + tips icon: `brand-logo-transparent.png` / `monogram.png` → `primary-logo.png`
8. `public/manifest.json` - Added `icons/primary-logo.png` to `web_accessible_resources`

**TypeScript Files Updated (1 file)**:
- `src/ui/field-summary.ts` - In-page floating panel icon: `monogram.png` → `primary-logo.png`

### Verification
- Build successful (`npm run build`)
- No linter errors
- Logo present in `dist/icons/primary-logo.png`

---

## NEW: Multi-Agent Workflow (2026-02-17)

### Workflow Change

**Old Process**:
- Single DEV agent handles all features in one chat
- Long context, mixed concerns, harder to track

**New Process** (Starting Now):
- **PLANNER agent** (this chat): Creates feature briefs
- **DEV agents** (separate chats): Each handles ONE feature
- **Benefits**: Clear scope, fresh context, parallel work possible

### How It Works

1. **User** describes feature to PLANNER
2. **PLANNER** creates comprehensive feature brief:
   - Full project context
   - Current state analysis
   - Detailed requirements
   - File scope (exact files to modify)
   - Acceptance criteria
   - Step-by-step implementation plan
   - Handoff instructions for new agent
3. **User** opens NEW chat with DEV agent
4. **DEV agent** reads feature brief and implements
5. **PLANNER** reviews completed work (if needed)

### Feature Brief Format

Each feature gets a standalone document:
- **File**: `docs/FEATURE_[NAME].md`
- **Contains**: Complete context for new agent
- **Self-contained**: New agent doesn't need prior conversation history

---

## ACTIVE FEATURE: Learned Values with Reinforcement Learning

### Status: 📋 PLANNING COMPLETE

**Feature Brief**: `docs/FEATURE_LEARNED_VALUES_RL.md`

**Summary**:
Redo the "Learned Values" feature to use lightweight reinforcement learning. The system learns from user corrections to improve autofill accuracy over time.

**Problem**:
- Current learning system is broken
- Doesn't improve over time
- No confidence scoring
- UI doesn't match new design
- No feedback to user

**Solution**:
- Implement lightweight RL algorithm (local, fast)
- Track corrections vs successes
- Calculate confidence scores (0-1)
- Show learned patterns with confidence bars
- UI matches navy/green mockup style

**Key Concepts**:
- **Reward**: User submits without changes → +1 confidence
- **Penalty**: User changes value → -1 confidence
- **Decay**: Old patterns lose confidence over time
- **Threshold**: Only use patterns with confidence > 0.6

**Files to Create**:
1. `src/shared/learning-rl.ts` - NEW RL system (~400 lines)
2. `src/shared/learning-types.ts` - TypeScript interfaces

**Files to Modify**:
3. `src/shared/autofill.ts` - Integrate RL lookups
4. `src/content.ts` - Detect user corrections
5. `src/background.ts` - Record successes on submit
6. `src/onboarding/onboarding.ts` - New UI for learned values
7. `public/onboarding/onboarding.html` - Update styles

**Estimated Effort**: 8-12 hours

**Priority**: High (broken feature, user requested)

**Acceptance Criteria**:
- [ ] RL system tracks corrections and successes
- [ ] Confidence scores update correctly
- [ ] Old patterns decay over 30 days
- [ ] Only high-confidence patterns (>0.6) used
- [ ] UI shows confidence bars (green, navy style)
- [ ] User can delete individual patterns
- [ ] User can clear all data
- [ ] Performance < 50ms per lookup
- [ ] Build succeeds, no errors
- [ ] Tested in Firefox with real job application

**Next Step**: 
User will open NEW chat with DEV agent and share: `docs/FEATURE_LEARNED_VALUES_RL.md`

---

## ACTIVE FEATURE #2: Dashboard Data Fix & Test Generator

### Status: 📋 PLANNING COMPLETE

**Feature Brief**: `docs/FEATURE_DASHBOARD_DATA_FIX.md`

**Summary**:
Fix dashboard showing 0 applications by adding diagnostic logging and creating a test data generator.

**Problem**:
- Dashboard displays 0 for all metrics (Total, Submitted, Interviewing, etc.)
- Unclear if: (a) no data exists, (b) data not being saved, or (c) data not being retrieved
- No way to test dashboard UI without real job submissions
- Blocking development and demo

**Solution**:
- **Part 1**: Add comprehensive diagnostic logging
  - Log when `SUBMIT_ATTEMPT` events received
  - Log if `jobTitle` or `company` missing (fails save condition)
  - Log what `getAllApplications()` returns
  - Identify root cause of 0 applications
- **Part 2**: Create test data generator
  - "Generate Test Data" button in dashboard
  - Creates 12 realistic sample applications
  - Various statuses, dates, companies
  - Enables UI development without real submissions

**Files to Modify**:
1. `src/background.ts` - Add logging around `addJobApplication()`
2. `src/shared/storage.ts` - Add logging in save/retrieve functions
3. `src/dashboard/dashboard.ts` - Add logging + test data generator
4. `public/dashboard/dashboard.html` - Add "Generate Test Data" button

**Estimated Effort**: 2-4 hours

**Priority**: High (dashboard is currently unusable)

**Acceptance Criteria**:
- [ ] Console logs reveal why dashboard shows 0
- [ ] Test data generator creates 12 applications
- [ ] Dashboard displays test data correctly
- [ ] Stats, Kanban, charts all work with test data
- [ ] Can edit/delete/drag test applications
- [ ] Build succeeds, no errors

**Benefits**:
- Diagnose data flow issues
- Enable UI development
- Demo-ready dashboard
- Faster feature iteration

**Next Step**: 
User can open NEW chat with DEV agent and share: `docs/FEATURE_DASHBOARD_DATA_FIX.md`

---

## ACTIVE FEATURE #3: Autofill Bug Fixes (Resume Upload + Skipped Fields)

### Status: 📋 PLANNING COMPLETE + ROOT CAUSE IDENTIFIED

**Feature Brief**: `docs/FEATURE_AUTOFILL_BUGS.md`

**Summary**:
Fix two critical autofill bugs that are breaking core functionality:
1. **Resume not being attached** to file upload fields
2. **Form fields being skipped** during autofill

**Problem**:
- **Bug #1 (Resume Upload)**: 🔴 **ROOT CAUSE IDENTIFIED**
  - User's resume is 430KB (430,278 bytes)
  - `browser.storage.local` **fails to retrieve files this large**
  - Error: "An unexpected error occurred" when loading resume data
  - Metadata stores fine, but actual file data retrieval fails
  - Extension gives up before even attempting attachment
  - **This is a STORAGE QUOTA issue, not an attachment issue**
  - Affects all users with resumes > ~400KB
  
- **Bug #2 (Skipped Fields)**: User reports "form filling is skipping over a few values"
  - Fields skipped when: (a) value is empty, (b) validation fails, or (c) field label not recognized
  - Missing field patterns (website, mobile, city, state)
  - Profile may be incomplete
  - No visibility into why fields skipped

**Solution**:

### Part 0: CRITICAL - Fix Resume Storage (NEW - Highest Priority)
- **Problem**: Storage fails for files > 400KB
- **Solution**: Implement chunked storage
  - Split resume into 100KB chunks during upload
  - Store as separate keys: `resumeChunk_0`, `resumeChunk_1`, etc.
  - Reassemble chunks during retrieval
  - Support files up to 2MB
  - Backwards compatible with existing resumes
- **Alternative**: Size limit + compression guidance (quick fix)

### Part 1: Enhanced Diagnostic Logging
- Add comprehensive step-by-step logs to resume upload process
- Add detailed field-by-field logs to autofill matching
- Show why each field was skipped (no match, empty, validation)
- Summary statistics at end

### Part 2: Fix Resume Upload
- Add visual notifications (success/failure)
- Add retry mechanism (3-second delay for late-loaded inputs)
- Improve file input detection
- Log which attachment method succeeded (DataTransfer/Clipboard/DnD)

### Part 3: Fix Skipped Fields
- Add missing field patterns:
  - "website" → portfolio
  - "mobile" → phone
  - "city" → extract from location
  - "state" → extract from location
- Add profile completeness check
- Show warning if profile < 100% complete
- Add fallback values for common fields
- Review validation logic (ensure not too strict)

**Files to Modify**:
1. `src/content.ts` (~100-150 lines) - Resume upload logging, retry, notifications
2. `src/shared/autofill.ts` (~50-100 lines) - Field matching logging, new patterns, fallbacks
3. `src/shared/profile.ts` (~50-60 lines) - Add `checkProfileCompleteness()` function
4. `src/popup/popup.ts` (~20-30 lines) - Show profile completeness warning

**Estimated Effort**: 8-12 hours (updated with storage fix)
- Part 0 (Storage Fix): 2-3 hours  
- Part 1 (Diagnostic Logging): 2-3 hours  
- Part 2 (Resume Upload UX): 1-2 hours  
- Part 3 (Skipped Fields): 2-3 hours  
- Part 4 (Testing): 1-2 hours

**Priority**: Critical (core functionality broken - storage quota issue affects all users with resumes > 400KB)

**Acceptance Criteria**:

**Bug #1: Resume Upload**
- [ ] **CRITICAL**: Chunked storage works for resumes up to 2MB
- [ ] **CRITICAL**: 430KB test resume loads successfully from storage
- [ ] **CRITICAL**: Backwards compatible with existing resumes
- [ ] Console logs show resume upload process step-by-step
- [ ] Logs show which method (DataTransfer/Clipboard/DnD) succeeded
- [ ] Logs show why upload failed (if it fails)
- [ ] User sees notification when resume attached successfully
- [ ] User sees notification when resume fails to attach
- [ ] Retry mechanism attempts upload after 3 seconds
- [ ] Resume successfully attaches on major ATS sites (LinkedIn, Greenhouse, Lever, Workday, Indeed)

**Bug #2: Skipped Fields**
- [ ] Console logs show why each field was skipped
- [ ] Logs show field label, type, and attempted value
- [ ] Summary shows count of skipped fields by reason
- [ ] Missing field patterns added (website, mobile, city, state)
- [ ] Profile completeness check shows missing fields
- [ ] Popup shows warning if profile < 100% complete
- [ ] Fallback values added for common fields

**Overall**
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Test on real job application page
- [ ] Verify more fields are filled than before
- [ ] Verify resume attached (check file input has file)
- [ ] No console errors (only expected logs)

**Benefits**:
- User understands why resume didn't attach
- User knows which profile fields are missing
- Developer can debug autofill issues faster
- More fields filled = better UX
- Clear error messages = better trust

**Implementation Phases**:
1. **Phase 1**: Diagnostic Logging (2-3 hours) - Understand failures
2. **Phase 2**: Fix Resume Upload (2-3 hours) - Notifications + retry
3. **Phase 3**: Fix Skipped Fields (2-3 hours) - New patterns + completeness check
4. **Phase 4**: Testing (1-2 hours) - Test on 3-5 job sites

**Next Step**: 
User can open NEW chat with DEV agent and share: `docs/FEATURE_AUTOFILL_BUGS.md`

---

## ACTIVE FEATURE #4: Onboarding Redesign (Split Fields + Self-ID)

### Status: 📋 PLANNING COMPLETE

**Feature Brief**: `docs/FEATURE_ONBOARDING_REDESIGN.md`

**Summary**:
Redesign onboarding flow to use split fields for phone/location and add comprehensive self-identification section.

**Problem**:
- **Current state**: "Onboarding flow is broken"
- **Phone stored as single string**: e.g., "+1 (555) 123-4567"
  - Autofill has to parse it (error-prone)
  - No clean separation of country code and number
- **Location stored as single string**: e.g., "San Francisco, CA"
  - Autofill tries to split on commas (unreliable)
  - Fails for "City, State ZIP" formats
- **No self-ID collection**: Self-identification fields (gender, race, veteran, disability, etc.) never populated
  - Profile schema has `selfId` field but no UI to collect it
  - Autofill always skips diversity questions
  - User requested: "we need a section in the onboarding to take in the voluntary self id stuff, age, race, etc."

**Solution**:

### Part 1: Split Phone Field
- **Country Code** dropdown (e.g., "+1", "+44", "+91")
- **Phone Number** text input (digits only)
- Store as `PhoneDetails` object: `{ countryCode: "+1", number: "5551234567" }`
- Autofill uses directly, no parsing needed

### Part 2: Split Location Field
- **City** text input (e.g., "San Francisco")
- **State/Province** text input (e.g., "California" or "CA")
- **Country** dropdown (e.g., "United States")
- **ZIP/Postal Code** text input (optional)
- Store as `LocationDetails` object: `{ city, state, country, zipCode }`
- Autofill uses directly, no parsing needed

### Part 3: Self-Identification Section (NEW STEP)
Add new Step 4 in onboarding with voluntary fields:
- **Age** (exact or range)
- **Gender** (multi-select: Male, Female, Non-binary, Other, Prefer not to say)
- **Transgender** (Yes/No/Decline)
- **Ethnicity** (Hispanic or Latino / Not Hispanic or Latino / Prefer not to say)
- **Race** (multi-select: American Indian, Asian, Black, White, Two or more, etc.)
- **Veteran Status** (Protected veteran / Not protected veteran / Decline)
- **Disability Status** (Yes / No / Decline)
- **Sexual Orientation** (multi-select: Heterosexual, LGBTQ+, etc.)
- Store in `profile.selfId`
- All fields optional, "Prefer not to say" default
- Privacy notice: "This data stays on your device"

### Part 4: Backwards Compatibility
- Profile supports BOTH formats: `phone: string | PhoneDetails`
- Profile supports BOTH formats: `location: string | LocationDetails`
- Autofill uses type guards to detect format
- Existing users' profiles still work

**Files to Create/Modify**:
1. `src/shared/profile.ts` (~50-80 lines) - Add `PhoneDetails`, `LocationDetails` interfaces, update `SelfIdentification`
2. `public/onboarding/onboarding.html` (~200-300 lines) - Redesign Step 2, add Step 4
3. `src/onboarding/onboarding.ts` (~150-200 lines) - Update save handlers for split fields and self-ID
4. `src/shared/autofill.ts` (~100-150 lines) - Update phone/location matching with type guards

**Estimated Effort**: 12-16 hours
- Phase 1 (Profile Schema): 2-3 hours
- Phase 2 (Onboarding UI): 4-5 hours
- Phase 3 (Autofill Logic): 3-4 hours
- Phase 4 (Testing & Edge Cases): 2-3 hours

**Priority**: High (affects data quality, autofill accuracy, and user compliance)

**Acceptance Criteria**:
- [ ] Phone stored as `PhoneDetails` object with countryCode and number
- [ ] Location stored as `LocationDetails` object with city, state, country, zipCode
- [ ] NEW Step 4 collects self-ID data (gender, race, veteran, disability, age, ethnicity)
- [ ] All self-ID fields are voluntary with "Prefer not to say" default
- [ ] Autofill uses split fields directly (no parsing)
- [ ] Backwards compatible with existing string-based profiles
- [ ] Edge cases handled: international phones, non-US locations, multiple selections
- [ ] Build succeeds, no TypeScript errors
- [ ] Test onboarding flow end-to-end
- [ ] Test autofill with new profile format
- [ ] Test autofill with old profile format (backwards compat)

**Benefits**:
- Reliable autofill (no string parsing)
- Comprehensive self-ID data collection
- Better data quality
- Handles international formats
- User has full control over data

**Edge Cases Addressed**:
- International phone formats (+44, +91, etc.)
- Non-US locations (provinces, counties)
- Multiple gender/race selections
- "Other" options with custom text
- "Prefer not to say" for all fields
- Empty optional fields (zipCode, age)

**Implementation Phases**:
1. **Phase 1**: Profile schema updates (interfaces, type guards)
2. **Phase 2**: Onboarding UI (split fields, new self-ID step)
3. **Phase 3**: Autofill logic (use split fields, backwards compat)
4. **Phase 4**: Testing (new/old profiles, edge cases)

**Next Step**: 
User can open NEW chat with DEV agent and share: `docs/FEATURE_ONBOARDING_REDESIGN.md`

---

## ACTIVE FEATURE #5: Ollama Setup & Configuration (Onboarding)

### Status: 📋 PLANNING COMPLETE

**Feature Brief**: `docs/FEATURE_OLLAMA_ONBOARDING.md`

**Summary**:
Add Ollama detection, installation guidance, troubleshooting, and custom endpoint configuration to onboarding flow.

**Problem**:
- **Current state**: Onboarding does NOT check for Ollama
- **User experience**: Users complete onboarding → AI features fail silently → No guidance
- **No installation help**: Users don't know how to install Ollama
- **No troubleshooting**: Users stuck with connection issues
- **No custom endpoints**: Advanced users can't configure remote Ollama servers
- **No retry mechanism**: If Ollama is offline, no way to reconnect

**User Request**:
- "if ollama is not installed prompt the user to download ollama from here https://ollama.com/download"
- "would it make sense to do a troubleshooting guide if the user has trouble installing ollama or configuring it?"
- "maybe a custom endpoint option for the advanced users?"
- "lets add a connection refresh button if ollama is offline"
- "The current ollama config which i have on my local setup works best so get config info from there"

**Current Working Config** (User's Setup):
```typescript
endpoint: 'http://localhost:11434'
chatModel: 'llama3.2'
embeddingModel: 'nomic-embed-text'
```

**Solution**:

### Part 1: Add NEW Onboarding Step (Step 2 - Ollama Setup)
4 states:
1. **Loading** - Checking connection...
2. **Connected** - ✓ Shows version, endpoint, model, privacy notice
3. **Not Installed** - Shows 4-step setup guide, link to https://ollama.com/download
4. **Troubleshooting** - Modal with 6 common issues + solutions

### Part 2: Installation Guidance
- Clear 4-step setup:
  1. Download Ollama from https://ollama.com/download
  2. Install model: `ollama pull llama3.2`
  3. Verify: `ollama list`
  4. Retry connection (refresh button)
- Copy buttons for terminal commands
- Link to official docs

### Part 3: Troubleshooting Guide
Covers 6 common issues:
1. Ollama not running
2. Port already in use
3. Model not downloaded
4. Connection refused (CORS)
5. Slow performance
6. Remote Ollama server

### Part 4: Custom Endpoint Configuration (Advanced)
- "Advanced Configuration" section (collapsed by default)
- Custom endpoint input (default: http://localhost:11434)
- Custom model inputs (chat model, embedding model)
- Test connection button
- Reset to default button
- Config saved to storage

### Part 5: Skip AI Features
- "Skip AI Features" button → Continue without Ollama (basic mode)
- Extension works with autofill only, no AI features
- User can re-enable AI features in settings later

### Part 6: Centralized Config System
- Create `src/shared/ollama-config.ts` (NEW FILE)
- Store config in browser.storage: `{ endpoint, chatModel, embeddingModel, enabled }`
- All Ollama clients load config from storage (not hardcoded)
- Settings page allows reconfiguring Ollama

**Files to Create/Modify**:
1. `src/shared/ollama-config.ts` (NEW, ~100-120 lines) - Config storage and testing
2. `public/onboarding/onboarding.html` (~300-400 lines) - Add Step 2 with 4 states
3. `src/onboarding/onboarding.ts` (~200-250 lines) - Connection check, retry, skip handlers
4. `src/shared/ollama-client.ts` (~30-50 lines) - Load config from storage
5. `src/shared/ollama-service.ts` (~20-30 lines) - Load config from storage
6. `public/settings/settings.html` (~50-60 lines) - Add Ollama configuration section
7. `src/settings/settings.ts` (~40-50 lines) - Load/save config, test connection
8. `public/popup/popup.html` (~20-30 lines) - Show Ollama status indicator
9. `src/popup/popup.ts` (~30-40 lines) - Status check, retry button

**Estimated Effort**: 6-8 hours (could stretch to 10 hours with polish)
- Phase 1 (Config System): 2-3 hours
- Phase 2 (Onboarding UI): 3-4 hours
- Phase 3 (Settings Integration): 1-2 hours
- Phase 4 (Testing): 1-2 hours

**Priority**: High (Blocks AI features if Ollama not set up correctly)

**Acceptance Criteria**:
- [ ] Onboarding checks for Ollama during Step 2
- [ ] Shows "Connected" with version/endpoint if Ollama available
- [ ] Shows "Not Installed" with setup guide if Ollama unavailable
- [ ] Link to https://ollama.com/download opens in new tab
- [ ] Terminal commands shown with copy buttons
- [ ] "Test Connection Again" button retries check
- [ ] Troubleshooting modal covers 6 common issues
- [ ] Custom endpoint configuration works (advanced users)
- [ ] "Skip AI Features" allows continuing without Ollama
- [ ] Config saved to storage and persists
- [ ] All Ollama clients use stored config (not hardcoded)
- [ ] Settings page allows reconfiguring Ollama
- [ ] Build succeeds, no TypeScript errors
- [ ] Test with Ollama installed
- [ ] Test without Ollama
- [ ] Test custom endpoint
- [ ] Test skip AI features

**Benefits**:
- Users know if Ollama is installed
- Clear guidance for installation
- Troubleshooting help for common issues
- Advanced users can configure remote servers
- Graceful fallback (skip AI features)
- Better onboarding UX

**Next Step**: 
User can open NEW chat with DEV agent and share: `docs/FEATURE_OLLAMA_ONBOARDING.md`

---

## ACTIVE FEATURE #6: Chrome Extension Port

### Status: 📋 PLANNING COMPLETE

**Feature Brief**: `docs/FEATURE_CHROME_EXTENSION.md`

**Summary**:
Port Offlyn Apply to Chrome, maintaining feature parity with Firefox while adapting to Chrome's Manifest V3 and Service Worker requirements.

**Context**:
- **All 5 Firefox features completed and working**:
  1. ✅ Learned Values with Reinforcement Learning
  2. ✅ Dashboard Data Fix & Test Generator
  3. ✅ Autofill Bug Fixes (Resume upload with chunked storage)
  4. ✅ Onboarding Redesign (Split phone/location + self-ID)
  5. ✅ Ollama Setup & Configuration
- **Ready to expand to Chrome** for broader user reach

**Problem**:
- **Current**: Extension only works on Firefox
- **User base limitation**: Chrome has 65%+ browser market share
- **Technical challenges**:
  - Chrome requires Manifest V3 (Firefox uses V2)
  - Chrome uses Service Workers (Firefox uses persistent background scripts)
  - Chrome uses `chrome.*` namespace (Firefox uses `browser.*`)
  - Different manifest structure and CSP policies
  - Browser-specific APIs and behaviors

**Solution**:

### Strategy: Shared Codebase with Browser-Specific Builds

**Architecture**:
```
apps/
├── shared/src/          - Shared TypeScript code (100% reusable)
├── extension-firefox/   - Firefox-specific config + build
└── extension-chrome/    - Chrome-specific config + build
```

**Benefits**:
- ✅ Single codebase, bug fixes apply to both
- ✅ New features work on both browsers
- ✅ ~95% code reuse
- ✅ Easier maintenance

### Part 1: Setup Shared Codebase
- Create `apps/shared/src/` directory
- Move all existing TypeScript code to shared
- Create symlinks in Firefox/Chrome dirs
- Install `webextension-polyfill` for compatibility

### Part 2: Add Compatibility Layer
- Create `browser-compat.ts` to bridge Firefox/Chrome APIs
- Provides unified `browser.*` API using polyfill
- Detect browser type and manifest version
- Handle browser-specific differences

### Part 3: Chrome Manifest V3
- Create new manifest with V3 structure
- Service Worker instead of background script
- `action` instead of `browser_action`
- `host_permissions` separated from `permissions`
- Web accessible resources as array of objects

### Part 4: Service Worker Adaptation
- Remove global state from `background.ts`
- Make fully event-driven
- Store all state in `browser.storage`
- Handle Service Worker termination gracefully

### Part 5: Build System
- Chrome-specific esbuild config
- ES modules for Service Worker (not IIFE)
- Separate builds: `dist-firefox/`, `dist-chrome/`
- Package scripts for Chrome Web Store

### Part 6: Chrome-Specific Fixes
- Generate 16x16, 128x128 icons (Chrome sizes)
- Test Ollama localhost connection
- Verify chunked storage works
- Handle Chrome CSP differences

### Part 7: Testing
- Test all 5 features in Chrome
- Cross-browser comparison
- Performance testing
- Load in `chrome://extensions/`

**Files to Create**:
1. `apps/shared/src/` (move existing code)
2. `apps/shared/src/shared/browser-compat.ts` (NEW, ~100-120 lines)
3. `apps/extension-chrome/public/manifest.json` (NEW, Manifest V3)
4. `apps/extension-chrome/esbuild.config.mjs` (NEW, Chrome build)
5. `apps/extension-chrome/package.json` (NEW)
6. `apps/extension-chrome/README.md` (NEW)

**Files to Modify**:
7. `apps/shared/src/background.ts` (~100-150 lines) - Service Worker compatible
8. All TypeScript files (~40+ files) - Update browser imports
9. `apps/extension-firefox/esbuild.config.mjs` - Update paths to shared
10. `apps/extension-firefox/package.json` - Add polyfill dependency

**Estimated Effort**: 20-30 hours
- Phase 1 (Setup Shared): 3-4 hours
- Phase 2 (Compatibility): 2-3 hours
- Phase 3 (Manifest V3): 2-3 hours
- Phase 4 (Service Worker): 4-5 hours
- Phase 5 (Build System): 2-3 hours
- Phase 6 (Chrome Fixes): 3-4 hours
- Phase 7 (Testing): 4-6 hours

**Priority**: High (Expand to 65%+ browser market share)

**Acceptance Criteria**:
- [ ] Shared codebase builds for both Firefox and Chrome
- [ ] Firefox build still works (no regression)
- [ ] Chrome build loads in `chrome://extensions/`
- [ ] All 5 features work in Chrome:
  - [ ] Resume upload (430KB+ files, chunked storage)
  - [ ] Autofill on job sites
  - [ ] Ollama connection (localhost:11434)
  - [ ] Dashboard (Kanban, drag-and-drop)
  - [ ] Learned values (RL system)
  - [ ] Onboarding (Ollama, split fields, self-ID)
- [ ] Service Worker handles events correctly
- [ ] No global state issues
- [ ] Cross-browser testing passed
- [ ] Build succeeds for both browsers
- [ ] No TypeScript errors
- [ ] No console errors in either browser

**Benefits**:
- Reach Chrome users (65%+ market share)
- Single codebase = easier maintenance
- Bug fixes apply to both browsers
- New features work everywhere
- Established architecture for future browsers (Edge, Safari)

**Challenges**:
- Manifest V3 learning curve
- Service Worker limitations (no global state)
- Browser API differences
- Testing on both browsers
- Separate packaging for each store

**Implementation Phases**:
1. **Phase 1**: Setup shared codebase structure
2. **Phase 2**: Add browser compatibility layer
3. **Phase 3**: Create Chrome Manifest V3
4. **Phase 4**: Adapt background script to Service Worker
5. **Phase 5**: Update build system for both browsers
6. **Phase 6**: Handle Chrome-specific differences
7. **Phase 7**: Comprehensive testing & validation

**Next Step**: 
User can open NEW chat with DEV agent and share: `docs/FEATURE_CHROME_EXTENSION.md`

---

## Feature Queue (Planned)

Future features for separate DEV agents:

1. **Mockup Implementation** - Match UI mockups exactly
   - Popup redesign (navy background, 584px width)
   - Dashboard polish (light gray, professional)
   - Onboarding wizard (navy full-screen)
   - Estimated: 10-15 hours

2. **Dark Mode** - System-wide dark theme
   - Auto-detect system preference
   - Manual toggle
   - All pages supported
   - Estimated: 8-10 hours

3. **Firefox Store Marketing Kit** - Promotional assets
   - 5 screenshots (1920x1080)
   - Store description copy
   - Social media graphics
   - Estimated: 6-8 hours

**Note**: Each will get its own feature brief when ready to implement.

---

## Progress Log

### 2026-02-17 - UImockupfiles Implementation

**Task**: Match all UI pages to the design files in `/UImockupfiles/` (excluding Landing page).

**Changes Made**:

| File | Change |
|------|--------|
| `public/popup/popup.html` | Header gradient → slate-800/700; primary green → #16a34a; removed footer nav links; Ollama bar styled as proper bottom footer with slate-50 bg |
| `public/dashboard/dashboard.html` | Full layout restructure: flat sticky header (no card); section order → Stats → Charts → Search+Filter+Export toolbar → Kanban; filter dropdown added; green updated; columns now use border-top-4 color scheme |
| `src/dashboard/dashboard.ts` | `handleSearch()` now reads `filterStatus` dropdown; `setupEventListeners()` wires up filter change event |
| `public/onboarding/onboarding.html` | Body background → `linear-gradient(to bottom right, #f8fafc, #eff6ff)` (slate-50 to blue-50); all `#7cb342` → `#16a34a` |
| `public/home/home.html` | Full redesign matching ExtensionHome mockup: sticky header with Ollama status + Settings; dark slate welcome banner; 4-col quick stats; 2x2 action cards; 3-col feature highlights; sidebar with nav links + privacy badge |

**Build**: ✅ Passes with no errors.

### 2026-02-17 - Notification UI Brand Alignment

**Task**: Match all in-page slide-out notifications to the Offlyn Apply brand (navy #1e293b + green #16a34a).

| File | Change |
|------|--------|
| `src/ui/notification.ts` | Full restyle: navy left-border for `info`, green for `success`, consistent SVG icons in brand circles; slide-in/out from right; smaller compact layout (13px text, 10px gap) |
| `src/ui/progress-indicator.ts` | Rewritten: slides in from right (matches toasts); green spinner (`border-top: #16a34a`); green gradient progress bar; navy left border; completion state shows green ✓ or amber ⚠ icon |
| `src/ui/autofill-notification.ts` | Updated: green left border, green checkmark icon, navy title text, slate subtitle; smooth slide-from-right animation |

**Design tokens used**: `#1e293b` (navy), `#16a34a` (green-600), `#64748b` (slate-500), `#f1f5f9` (slate-100), `#e2e8f0` (slate-200)

**Build**: ✅ Passes with no errors.

### 2026-02-18 - Compatibility Widget Implementation

**Task**: Implement `CompatibilityWidget.tsx` + `CompatibilityDemo.tsx` mockups as a live content-script component.

| File | Change |
|------|--------|
| `src/ui/compatibility-widget.ts` | New file — floating oval tile + expandable panel injected via Shadow DOM. Computes score from profile vs page text (skills 35%, experience 30%, education 15%, location 10%, salary 10%). Shows skill badges (matched green / missing slate), per-category breakdown rows, AI insight card, Apply + Cover Letter action buttons. Fully self-contained styles via Shadow DOM. |
| `src/content.ts` | Import `showCompatibilityWidget`; after `showFieldSummary()`, async IIFE fetches profile and calls widget with jobTitle, company, page body text. |

**Design fidelity**: Collapsed oval → `#F5F1E8` (tusk white) with gloss gradient, score colour-coded green/amber/red. Expanded panel → white card with gradient header matching score tier, dot-pattern overlay, per-category progress bars, skill badge chips, purple AI insight card, green Apply + outline Cover Letter buttons.

**Build**: ✅ Passes with no errors.

### 2026-02-18 - Floating Widget: Monogram Pill + Top-Right Repositioning

**Task**: Replace the score-text circle with the `Offlyn_monogram_nosquare.png` as the minimized pill, and move the widget to the top of the page.

**Changes Made**:

| File | Change |
|------|--------|
| `Brandkit/Offlyn_monogram_nosquare.png` → `public/icons/monogram-nosquare.png` | Copied new asset into extension |
| `public/manifest.json` | Added `icons/monogram-nosquare.png` to `web_accessible_resources` |
| `src/ui/compatibility-widget.ts` | `buildPill`: replaced score+MATCH text with `<img>` of monogram (tusk-white oval 80×52px, pill border-radius, gloss radial gradient, colored score dot badge at bottom-right). `showCompatibilityWidget`: position changed from `bottom:24px` to `top:24px`; added `monogramUrl` param; `mount()` order swapped — pill first (top), panel second (opens below). |
| `src/content.ts` | Passes `browser.runtime.getURL('icons/monogram-nosquare.png')` as 6th arg to `showCompatibilityWidget`. |

**Build**: ✅ Passes with no errors.

Last updated: 2026-02-18 (Monogram Pill + Top Repositioning)
