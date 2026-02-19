# Offlyn Apply - Design System Refactoring Plan

## Objective
Enforce a unified design system with centralized color tokens and consistent styling across all UI surfaces.

---

## New Brand Colors

### Primary Colors
```
Navy:  #0F172A  (Primary text, headers, dark backgrounds)
Green: #27E38D  (CTAs, accents, highlights)
White: #FFFFFF  (Light backgrounds, inverse text)
```

### Supporting Colors
```
Gray Light:  #F5F7FA  (Light backgrounds)
Gray Medium: #CBD5E1  (Borders, disabled states)
Gray Dark:   #64748B  (Secondary text)
```

---

## Old Colors to Replace

### Old Brand Colors (REMOVE)
```
Purple Primary:   #667eea → REMOVE
Purple Accent:    #764ba2 → REMOVE
Old Dark Blue:    #1e2a3a → REPLACE with #0F172A
Old Green:        #7cb342 → REPLACE with #27E38D
Old Light Green:  #9ccc65 → REPLACE with #27E38D
```

### Gradients (REMOVE UNLESS REQUIRED)
```
linear-gradient(135deg, #667eea 0%, #764ba2 100%) → REMOVE
linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%) → REMOVE
linear-gradient(135deg, #1e2a3a 0%, #2d4a5e 100%) → REMOVE
```

---

## Design System Rules

### 1. Primary Buttons
```css
/* REQUIRED */
background: #27E38D;
color: #0F172A;
border: none;

/* Hover */
background: #22CC7A; /* Green darkened by 8% */

/* Active */
background: #1EB86B; /* Green darkened by 15% */

/* Disabled */
background: #CBD5E1;
color: #FFFFFF;
cursor: not-allowed;
```

### 2. Headers & Major Titles
```css
color: #0F172A;
font-weight: 600-700;
```

### 3. Accent Highlights, Focus Rings, Active States
```css
border-color: #27E38D;
outline-color: #27E38D;
box-shadow: 0 0 0 3px rgba(39, 227, 141, 0.1);
```

### 4. Secondary Text
```css
color: #64748B;
```

### 5. Disabled States
```css
color: #CBD5E1;
cursor: not-allowed;
opacity: 0.5;
```

---

## Centralized Theme File

**Location**: `apps/extension-firefox/src/shared/theme.ts`

All components MUST import colors from this file:

```typescript
import { colors, computed } from '../shared/theme';

// ✅ GOOD
const styles = `
  background: ${colors.green};
  color: ${colors.navy};
`;

// ❌ BAD - NO INLINE HEX VALUES
const styles = `
  background: #27E38D;
  color: #0F172A;
`;
```

---

## Files Requiring Refactoring

### Phase 1: Core Theme (NEW FILE)
- [ ] `src/shared/theme.ts` (CREATE) - Centralized color system

### Phase 2: Popup UI (2 files)
- [ ] `public/popup/popup.html`
  - Line 20: Remove gradient, use solid navy
  - Line 113-114: Update button colors to green
  - Line 125: Update hover to green
  - Line 149: Update stat numbers to green
  - Remove ALL purple colors
  
- [ ] `src/popup/popup.ts`
  - Import theme colors
  - Use `colors.green` for any dynamic styling

**Changes**:
- Header: Solid navy background (#0F172A)
- Primary buttons: Green (#27E38D) with navy text
- Hover states: Darkened green (#22CC7A)
- Stat numbers: Green (#27E38D)
- Toggle active: Green (#27E38D)

### Phase 3: Dashboard (2 files)
- [ ] `public/dashboard/dashboard.html`
  - Line 16: Remove gradient, use solid navy or white
  - Line 38: Headers to navy
  - Line 66: Stat numbers to green
  - Line 142: Active buttons to green
  - Line 182: Kanban badges to green
  - Line 202: Card accent border to green
  - Line 289: Primary buttons to green
  - Remove ALL gradients and purple colors
  
- [ ] `src/dashboard/dashboard.ts`
  - Import theme colors
  - Update any inline styles to use theme

**Changes**:
- Background: White or light gray (no gradient)
- Headers: Navy (#0F172A)
- Primary buttons: Green with navy text
- Stat cards: Navy text, green accents
- Kanban columns: White cards, green accents

### Phase 4: Onboarding (2 files)
- [ ] `public/onboarding/onboarding.html`
  - Remove gradients
  - Update all button colors to green
  - Update headers to navy
  - Update progress indicators to green
  - Remove ALL purple colors
  
- [ ] `src/onboarding/onboarding.ts`
  - Import theme colors
  - Update dynamic styling

**Changes**:
- Background: White or light gray
- Headers: Navy
- Progress indicators: Green
- Primary buttons: Green with navy text
- Success states: Green

### Phase 5: In-Page Components (6 files)

#### Field Summary Panel
- [ ] `src/ui/field-summary.ts`
  - Line 150-250: Update `addStyles()` function
  - Remove gradients
  - Header: Navy background or white with navy text
  - Primary buttons: Green
  - Cube (minimized): Navy or green background with icon
  
**Changes**:
```typescript
// OLD
background: linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%);

// NEW
background: ${colors.navy};
// OR for light theme
background: ${colors.white};
border: 2px solid ${colors.green};
```

#### Cover Letter Panel
- [ ] `src/ui/cover-letter-panel.ts`
  - Remove gradients
  - Header: Navy text
  - Primary buttons: Green
  - Borders: Green accents

#### Notification Toasts
- [ ] `src/ui/notification.ts`
  - Success: Green background or border
  - Error: Keep red (#EF4444)
  - Warning: Keep amber (#F59E0B)
  - Info: Navy or blue

#### Progress Indicator
- [ ] `src/ui/progress-indicator.ts`
  - Progress bar: Green (#27E38D)
  - Background: Light gray
  - Text: Navy

#### Inline Suggestion Tiles
- [ ] `src/ui/inline-suggestion-tile.ts`
  - Hover border: Green
  - Selected: Green border + green alpha background
  - Text: Navy

#### Field Highlighter
- [ ] `src/ui/field-highlighter.ts`
  - Success highlight: Green border/shadow
  - Error: Keep red
  - Focus: Green

### Phase 6: Additional UI Components (3 files)
- [ ] `src/ui/suggestion-panel.ts` - Update colors to theme
- [ ] `src/ui/autofill-notification.ts` - Update colors to theme
- [ ] `src/ui/progress-indicator.ts` - Green progress bars

---

## Codebase Scan Results

### Files with Hardcoded Colors (12 files found)
```
✓ apps/extension-firefox/public/popup/popup.html
✓ apps/extension-firefox/public/dashboard/dashboard.html
✓ apps/extension-firefox/public/onboarding/onboarding.html
✓ apps/extension-firefox/src/dashboard/dashboard.ts
✓ apps/extension-firefox/src/ui/field-summary.ts
✓ apps/extension-firefox/src/ui/cover-letter-panel.ts
✓ apps/extension-firefox/src/ui/progress-indicator.ts
✓ apps/extension-firefox/src/ui/field-highlighter.ts
✓ apps/extension-firefox/src/ui/suggestion-panel.ts
✓ apps/extension-firefox/test-workauth.html (test file - low priority)
✓ apps/extension-firefox/test-resume-upload.html (test file - low priority)
✓ apps/extension-firefox/test-selfid.html (test file - low priority)
```

### Files with Gradients (9 files found)
```
✓ apps/extension-firefox/public/popup/popup.html
✓ apps/extension-firefox/public/dashboard/dashboard.html
✓ apps/extension-firefox/public/onboarding/onboarding.html
✓ apps/extension-firefox/src/ui/field-summary.ts
✓ apps/extension-firefox/src/ui/cover-letter-panel.ts
✓ apps/extension-firefox/src/ui/progress-indicator.ts
✓ apps/extension-firefox/src/ui/field-highlighter.ts
✓ apps/extension-firefox/src/ui/suggestion-panel.ts
✓ apps/extension-firefox/public/pdf.worker.mjs (ignore - third-party)
```

### Color Style Count
```
popup.html: 39 color/background/border style declarations
dashboard.html: 53 color/background/border style declarations
onboarding.html: 104 color/background/border style declarations
```

---

## Implementation Strategy

### Step 1: Create Theme File
1. Create `src/shared/theme.ts` with new color system
2. Export colors, computed colors, and CSS variables
3. Add helper functions for CSS injection

### Step 2: Update HTML Files (High Priority)
1. Replace all hex colors with CSS variables
2. Remove gradients (except where explicitly needed)
3. Update button styles to green
4. Update headers to navy
5. Update accents to green

### Step 3: Update TypeScript Files (High Priority)
1. Import `colors` from `theme.ts`
2. Replace all inline hex values with `colors.*`
3. Update gradient styles to solid colors
4. Update button/hover states

### Step 4: Update Component Styles (Medium Priority)
1. Field summary panel
2. Cover letter panel
3. Notification toasts
4. Progress indicators
5. Inline tiles
6. Field highlighters

### Step 5: Testing & Verification
1. Load extension in browser
2. Check popup appearance
3. Check dashboard appearance
4. Check onboarding flow
5. Test all in-page components on a job site
6. Verify no purple colors remain
7. Verify all buttons are green
8. Verify all headers are navy
9. Verify hover states work correctly

---

## Color Migration Table

| Old Color | New Color | Usage |
|-----------|-----------|-------|
| #667eea (Purple) | #27E38D (Green) | Primary buttons, accents |
| #764ba2 (Purple) | #27E38D (Green) | Button hover, highlights |
| #1e2a3a (Old Navy) | #0F172A (New Navy) | Headers, dark backgrounds |
| #2d4a5e (Blue-gray) | #0F172A (New Navy) | Header backgrounds |
| #7cb342 (Old Green) | #27E38D (New Green) | CTAs, success states |
| #9ccc65 (Light Green) | #27E38D (New Green) | Hover states |
| Gradients | Solid colors | Remove unless required |

---

## Verification Checklist

### Visual Checks
- [ ] No purple colors visible anywhere
- [ ] All primary buttons are green with navy text
- [ ] All headers are navy
- [ ] All hover states darken green by ~8%
- [ ] Disabled states use gray medium
- [ ] Focus rings are green
- [ ] No gradients (unless explicitly required)

### Code Checks
- [ ] No inline hex values in TS files (all use `colors.*`)
- [ ] All HTML uses CSS variables or inline theme colors
- [ ] `theme.ts` file exists and exports all colors
- [ ] All components import from `theme.ts`
- [ ] Old color hex codes removed (#667eea, #764ba2, etc.)

### Component Checks
- [ ] Popup: Green buttons, navy headers
- [ ] Dashboard: Green accents, navy text, no gradients
- [ ] Onboarding: Green progress, navy headers
- [ ] Field summary: Navy/white with green accents
- [ ] Cover letter panel: Green buttons, navy text
- [ ] Notifications: Green success states
- [ ] Progress bars: Green fill
- [ ] Inline tiles: Green hover/selection
- [ ] Field highlights: Green success glow

---

## Estimated Effort

- **Create theme file**: 30 minutes
- **Update 3 HTML files**: 2 hours
- **Update 6 UI component TS files**: 3 hours
- **Update dashboard TS**: 1 hour
- **Testing & fixes**: 2 hours

**Total**: ~8-9 hours

---

## Files Summary

### Created (1 file)
- `src/shared/theme.ts` - Centralized design system

### Modified (15 files)
- `public/popup/popup.html`
- `src/popup/popup.ts`
- `public/dashboard/dashboard.html`
- `src/dashboard/dashboard.ts`
- `public/onboarding/onboarding.html`
- `src/onboarding/onboarding.ts`
- `src/ui/field-summary.ts`
- `src/ui/cover-letter-panel.ts`
- `src/ui/notification.ts`
- `src/ui/progress-indicator.ts`
- `src/ui/inline-suggestion-tile.ts`
- `src/ui/field-highlighter.ts`
- `src/ui/suggestion-panel.ts`
- `src/ui/autofill-notification.ts`
- `Brandkit/BRANDING_GUIDE.md` (update colors)

**Total**: 16 files

---

## Priority Order

1. **CRITICAL**: Create `theme.ts` file (blocks everything)
2. **HIGH**: Update popup.html (most visible)
3. **HIGH**: Update dashboard.html (user-facing)
4. **MEDIUM**: Update onboarding.html
5. **MEDIUM**: Update in-page components (6 files)
6. **LOW**: Update test files
