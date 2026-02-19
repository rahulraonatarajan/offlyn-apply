# Offlyn Apply - Complete Implementation Plan

## Overview

Complete refactoring and feature implementation for Offlyn Apply browser extension.

**Four Major Initiatives**:
1. Dashboard with Kanban + Drag-and-Drop
2. Fix Detection & Submission Issues
3. Complete Rebranding (Offlyn → Offlyn Apply)
4. Unified Design System (Navy + Green)

---

## Initiative 1: Dashboard with Kanban + Drag-and-Drop

**Status**: Planned  
**Priority**: High  
**Effort**: 4-5 hours

### Features
- Kanban board layout with status columns
- Drag-and-drop tiles between columns
- Edit functionality (modal)
- Delete functionality (confirmation)
- Charts (applications over time, status breakdown)
- Search/filter
- CSV export

### Files
- `src/shared/storage.ts` - Add CRUD functions
- `src/dashboard/dashboard.ts` - Create Kanban with drag-and-drop
- `public/dashboard/dashboard.html` - Create dashboard layout
- `src/popup/popup.ts` - Add dashboard button handler
- `public/popup/popup.html` - Add dashboard button
- `esbuild.config.mjs` - Add dashboard to build

**See**: `docs/DEV_HANDOFF.md` for detailed specs

---

## Initiative 2: Fix Detection & Submission Issues

**Status**: Planned  
**Priority**: Critical  
**Effort**: 2-3 hours

### Issues
1. **False Positives**: Popup appears on non-job pages (Google, Reddit, etc.)
2. **Premature Recording**: Applications saved on page load, not on submit

### Fixes

#### Detection Logic (`src/shared/dom.ts`)
- Increase field thresholds: 6+ in forms, 8+ on page
- Require job-related URL keywords
- Add blacklist: login, contact, checkout pages
- Add content validation: resume upload OR job title OR apply button

#### Submission Tracking (`src/content.ts`, `src/background.ts`)
- Remove PAGE_DETECTED storage save
- Only save on SUBMIT_ATTEMPT event
- Status always 'submitted' initially
- Filter out any 'detected' status applications

### Files
- `src/shared/dom.ts` - Fix `isJobApplicationPage()`
- `src/content.ts` - Review submission handling
- `src/background.ts` - Ensure PAGE_DETECTED doesn't save

**See**: `docs/DEV_HANDOFF.md` Phase 3 for detailed changes

---

## Initiative 3: Complete Rebranding

**Status**: Assets Ready  
**Priority**: High  
**Effort**: 2-3 hours

### Assets Exported ✅
- 13 logo files in `Brandkit/exports/`
- Icons: 48, 96, 128, 256 (PNG)
- Full logos: 400w, 600w (PNG)
- Headers: 24, 32 (PNG)
- Cubes: 48, 64 (PNG)
- Favicon: ICO + PNGs

### Changes
- Update manifest name/description
- Copy assets to `public/icons/`
- Update all "Offlyn" → "Offlyn Apply"
- Replace logo images in popup, dashboard, onboarding
- Update minimized cube with OA monogram

### Files
- `dist/manifest.json` - Update metadata
- `public/icons/` - Copy 13 asset files
- `public/popup/popup.html` - Add OA logo
- `public/dashboard/dashboard.html` - Add full logo
- `public/onboarding/onboarding.html` - Add full logo
- `src/ui/field-summary.ts` - Update cube with OA icon

**See**: `docs/BRANDING_FILES_CHECKLIST.md` for detailed file list

---

## Initiative 4: Unified Design System

**Status**: Theme File Created ✅  
**Priority**: Critical  
**Effort**: 8-10 hours

### New Brand Colors
```
Navy:  #0F172A (primary text, headers)
Green: #27E38D (CTAs, accents)
White: #FFFFFF (backgrounds)
```

### Design System Rules
1. **NO inline hex values** - import from theme.ts
2. **Remove ALL gradients** - use solid colors
3. **Primary buttons**: Green bg + Navy text
4. **Headers**: Navy color
5. **Accents**: Green borders/highlights
6. **Hover**: Darken green by 8% (#22CC7A)
7. **Disabled**: Gray medium (#CBD5E1)

### Files Created
- ✅ `src/shared/theme.ts` - Centralized color system

### Files to Refactor (15 files)
- `public/popup/popup.html` - Remove gradient, update colors
- `src/popup/popup.ts` - Import theme
- `public/dashboard/dashboard.html` - Remove gradient, update colors
- `src/dashboard/dashboard.ts` - Import theme
- `public/onboarding/onboarding.html` - Remove gradients, update colors
- `src/onboarding/onboarding.ts` - Import theme
- `src/ui/field-summary.ts` - Import theme, update styles
- `src/ui/cover-letter-panel.ts` - Import theme, update styles
- `src/ui/notification.ts` - Import theme, green success
- `src/ui/progress-indicator.ts` - Import theme, green bars
- `src/ui/inline-suggestion-tile.ts` - Import theme, green hover
- `src/ui/field-highlighter.ts` - Import theme, green highlights
- `src/ui/suggestion-panel.ts` - Import theme
- `src/ui/autofill-notification.ts` - Import theme
- `dist/manifest.json` - Final checks

### Old Colors to Remove
```
#667eea (Purple) → REMOVE
#764ba2 (Purple accent) → REMOVE  
#1e2a3a (Old navy) → REPLACE with #0F172A
#7cb342 (Old green) → REPLACE with #27E38D
#9ccc65 (Light green) → REPLACE with #27E38D
All gradients → REMOVE
```

**See**: `docs/DESIGN_SYSTEM_REFACTOR.md` for detailed refactoring plan  
**See**: `docs/DESIGN_SYSTEM_HANDOFF.md` for implementation guide

---

## Combined Implementation Order

### Phase 1: Foundation (1 hour)
1. ✅ Create `src/shared/theme.ts`
2. Copy brand assets from `Brandkit/exports/` → `public/icons/`
3. Update `dist/manifest.json` with new name/description/icons
4. Test: Build succeeds, icons visible

### Phase 2: Core UI Refactor (4 hours)
5. Refactor `public/popup/popup.html` - colors + logo
6. Refactor `src/popup/popup.ts` - import theme
7. Refactor `public/dashboard/dashboard.html` - colors + logo + no gradients
8. Refactor `src/dashboard/dashboard.ts` - import theme
9. Test: Popup and existing dashboard use new colors

### Phase 3: Detection Fixes (2 hours) **CRITICAL**
10. Fix `src/shared/dom.ts` - `isJobApplicationPage()`
11. Fix `src/content.ts` - submission tracking
12. Fix `src/background.ts` - remove PAGE_DETECTED save
13. Test: No false positives, only records on submit

### Phase 4: Dashboard Features (4 hours)
14. Add CRUD functions to `src/shared/storage.ts`
15. Implement Kanban with drag-and-drop in `src/dashboard/dashboard.ts`
16. Update `public/dashboard/dashboard.html` with new structure
17. Add dashboard button to popup
18. Test: Drag-and-drop works, edit/delete work, charts render

### Phase 5: Onboarding Refactor (2 hours)
19. Refactor `public/onboarding/onboarding.html` - colors + logo
20. Refactor `src/onboarding/onboarding.ts` - import theme
21. Test: Onboarding flow uses new colors and logo

### Phase 6: In-Page Components (3 hours)
22. Refactor `src/ui/field-summary.ts` - theme + OA cube
23. Refactor `src/ui/cover-letter-panel.ts` - theme
24. Refactor `src/ui/notification.ts` - theme
25. Refactor `src/ui/progress-indicator.ts` - theme
26. Refactor `src/ui/inline-suggestion-tile.ts` - theme
27. Refactor `src/ui/field-highlighter.ts` - theme
28. Test: All in-page components use new colors

### Phase 7: Testing & Polish (2 hours)
29. Full visual audit - no purple, no gradients, all green buttons
30. Test detection on non-job sites (should NOT trigger)
31. Test detection on job sites (should trigger)
32. Test submission tracking (only on apply click)
33. Test dashboard drag-and-drop
34. Test all UI surfaces with new branding
35. Fix any issues found

---

## Total Effort Estimate

| Initiative | Hours |
|-----------|-------|
| Dashboard + Drag-and-Drop | 4-5 |
| Detection Fixes | 2-3 |
| Rebranding | 2-3 |
| Design System | 8-10 |
| Testing & Polish | 2 |
| **TOTAL** | **18-23 hours** |

---

## Files Summary

### Created (2 files)
- `src/shared/theme.ts` - Design system
- `src/dashboard/dashboard.ts` - New Kanban dashboard

### Modified (19 files)
- `dist/manifest.json`
- `public/popup/popup.html`
- `src/popup/popup.ts`
- `public/dashboard/dashboard.html`
- `public/onboarding/onboarding.html`
- `src/onboarding/onboarding.ts`
- `src/shared/storage.ts`
- `src/shared/dom.ts`
- `src/content.ts`
- `src/background.ts`
- `src/ui/field-summary.ts`
- `src/ui/cover-letter-panel.ts`
- `src/ui/notification.ts`
- `src/ui/progress-indicator.ts`
- `src/ui/inline-suggestion-tile.ts`
- `src/ui/field-highlighter.ts`
- `src/ui/suggestion-panel.ts`
- `src/ui/autofill-notification.ts`
- `esbuild.config.mjs`

### Copied (13 files)
- Brand assets from `Brandkit/exports/` → `public/icons/`

**Total: 34 files**

---

## Detailed Documentation

All specifications and implementation guides are complete:

1. **Dashboard & Features**:
   - `docs/ISSUE_BRIEF.md` - Complete feature specs
   - `docs/DEV_HANDOFF.md` - Detailed implementation guide
   - `docs/PLAN_SUMMARY.md` - Quick reference

2. **Detection Fixes**:
   - `docs/DEV_HANDOFF.md` Phase 3 - Detailed fix instructions

3. **Rebranding**:
   - `docs/BRANDING_GUIDE.md` - Brand identity guide
   - `docs/BRANDING_FILES_CHECKLIST.md` - File-by-file checklist
   - `docs/REBRANDING_PLAN.md` - Asset requirements
   - `Brandkit/EXPORT_VERIFICATION.md` - Asset verification ✅

4. **Design System**:
   - `docs/DESIGN_SYSTEM_REFACTOR.md` - Complete refactoring plan
   - `docs/DESIGN_SYSTEM_HANDOFF.md` - Implementation guide
   - `src/shared/theme.ts` - Centralized color system ✅

---

## Ready for Implementation ✅

All planning is complete. DEV can begin implementation following:
1. `docs/DESIGN_SYSTEM_HANDOFF.md` for Phase 1-2 (Foundation + Core UI)
2. `docs/DEV_HANDOFF.md` for Phase 3-4 (Detection + Dashboard)
3. Remaining phases follow naturally from documentation

**Estimated completion**: 18-23 hours of focused development work
