# Plan Summary - Updated Spec

## Changes Made Based on User Feedback

### 1. Drag-and-Drop Functionality (NEW)
- **Requirement**: Drag tiles between Kanban columns to change application status
- **Implementation**: Use HTML5 Drag API (no external library)
- **Visual Feedback**: Dragging state on cards, drop zone highlighting
- **Status Update**: Automatically update application status when dropped in new column

### 2. Fix False Detection (CRITICAL FIX)
**Problem**: Popup appears on non-job websites (Google, Reddit, login pages, etc.)

**Root Cause**: Detection logic too broad
- Triggers on ANY form with >= 3 fields
- Triggers on ANY page with >= 4 total fields
- No URL validation required

**Solution**:
- Increase field thresholds (6+ fields in form, 8+ on page)
- Require job-related keywords in URL first
- Add blacklist for common false positives (login, contact, checkout pages)
- Require job-specific content (resume upload, job title, or apply button)

### 3. Record Only on Submit (CRITICAL FIX)
**Problem**: Applications recorded on page detection, not actual submission

**Root Cause**: PAGE_DETECTED event might be saving to storage

**Solution**:
- Remove any storage save on PAGE_DETECTED event
- Only save applications on SUBMIT_ATTEMPT event (when user clicks Apply button)
- Default status always 'submitted' (never 'detected')

---

## Complete Feature Spec

### Dashboard Features
1. **Kanban Board Layout** - columns for each status
2. **Drag-and-Drop** - move tiles between columns
3. **Edit Functionality** - modal to update status, notes, details
4. **Delete Functionality** - confirmation dialog before removal
5. **Charts** - applications over time (line chart), status breakdown (doughnut chart)
6. **Search/Filter** - find applications by company or position
7. **Export CSV** - download all application data
8. **No Emojis** - clean, professional design

### Status Columns
1. Submitted
2. Interviewing
3. Rejected
4. Accepted
5. Withdrawn

### Detection Improvements
1. Higher field count thresholds
2. URL keyword validation required
3. Blacklist for non-job pages
4. Content validation (resume upload, job title, apply button)

### Submission Tracking
1. Only save on SUBMIT_ATTEMPT event
2. No saving on PAGE_DETECTED
3. Status always 'submitted' initially
4. Filter out any existing 'detected' status applications

---

## File Changes

### Modified Files
- `apps/extension-firefox/src/shared/storage.ts`
  - Add `getAllApplications()` - filter out detected status
  - Add `updateApplicationStatus()` - for edit functionality
  - Add `deleteApplication()` - for delete functionality
  - Add `getApplicationStats()` - summary metrics
  - Add `getApplicationTrends()` - time-series data

- `apps/extension-firefox/src/shared/dom.ts`
  - Fix `isJobApplicationPage()` function
  - Increase field thresholds
  - Add URL validation
  - Add blacklist patterns
  - Add content validation

- `apps/extension-firefox/src/content.ts`
  - Review background.ts message handling
  - Ensure PAGE_DETECTED doesn't save to storage
  - Ensure SUBMIT_ATTEMPT saves with status='submitted'

- `apps/extension-firefox/src/popup/popup.ts`
  - Add dashboard button event listener
  - Filter out detected status from stats

- `apps/extension-firefox/public/popup/popup.html`
  - Add "View Dashboard" button

- `apps/extension-firefox/esbuild.config.mjs`
  - Add dashboard entry point to build

### New Files
- `apps/extension-firefox/src/dashboard/dashboard.ts`
  - Kanban board rendering
  - HTML5 drag-and-drop implementation
  - Edit modal logic
  - Delete confirmation
  - Chart.js integration
  - Search/filter logic

- `apps/extension-firefox/public/dashboard/dashboard.html`
  - Kanban column layout
  - Draggable cards with data attributes
  - Edit modal structure
  - Chart canvas elements
  - No emojis anywhere

---

## Testing Requirements

### Dashboard Tests
- [ ] Drag-and-drop between columns works
- [ ] Status updates correctly after drop
- [ ] Visual feedback during drag (ghost image, drop zone highlight)
- [ ] Edit modal opens and saves changes
- [ ] Delete confirmation and removal works
- [ ] Charts render with real data
- [ ] Search filters correctly
- [ ] CSV export works
- [ ] No emojis visible anywhere

### Detection Tests
- [ ] Popup does NOT appear on:
  - Google search pages
  - Reddit, Twitter, Facebook
  - Login/signup pages
  - Contact forms
  - E-commerce checkout pages
- [ ] Popup DOES appear on:
  - Greenhouse.io applications
  - Lever.co applications  
  - Company career pages with application forms

### Submission Tests
- [ ] Applications NOT saved on page visit
- [ ] Applications ONLY saved after clicking Apply/Submit button
- [ ] Status is always 'submitted' initially
- [ ] No 'detected' status applications in storage

---

## Implementation Priority

1. **CRITICAL** - Fix detection logic (Phase 3)
2. **CRITICAL** - Fix submission tracking (Phase 3)
3. **HIGH** - Data layer functions (Phase 1)
4. **HIGH** - Dashboard with drag-and-drop (Phase 2)
5. **MEDIUM** - Build integration (Phase 4)
6. **MEDIUM** - Popup integration (Phase 5)
7. **LOW** - Polish and testing (Phase 6)

---

## Next Steps

Hand off to DEV agent with:
- Full specification in `docs/ISSUE_BRIEF.md`
- Implementation guide in `docs/DEV_HANDOFF.md`
- This summary for quick reference

Estimated effort: 3-4 hours implementation + 1-2 hours testing
