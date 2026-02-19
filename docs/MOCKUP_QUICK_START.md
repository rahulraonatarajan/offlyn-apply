# Mockup Implementation - Quick Start Guide

## 🎯 Goal
Match the provided mockups pixel-perfect for Popup, Dashboard, and Onboarding pages.

---

## 📋 Key Changes from Current Design

### 1. Popup Changes
**Current**: 300px wide, purple gradient, multiple button rows  
**Mockup**: ~584px wide, dark navy (#2D3748), single column layout

**Major Updates**:
- ✅ Width: 300px → 584px
- ✅ Background: Purple gradient → Navy solid (#2D3748)
- ✅ Logo: Square icon → Circular green with "OA"
- ✅ Toggle: Purple → Green (#27E38D)
- ✅ Job card: New design with green status dot
- ✅ Primary button: Purple → Green, full width
- ✅ Secondary button: New bordered transparent style
- ✅ Stats: Side-by-side, bottom section
- ✅ Advanced: Collapsible with ollama status

---

### 2. Dashboard Changes
**Current**: Purple gradient theme, basic cards  
**Mockup**: White/light gray theme, professional design

**Major Updates**:
- ✅ Background: Purple gradient → Light gray (#F7F9FC)
- ✅ Header: Add logo + "Application Dashboard" title
- ✅ Stats: 6 cards with colored numbers
- ✅ Charts: 2-column layout (line + doughnut)
- ✅ Search bar: New design with filter dropdown
- ✅ Export button: Green, prominent
- ✅ Cards: Add checkbox, refined design
- ✅ Status colors: Blue (submitted), Green (interviewing), Red (rejected), Purple (accepted)

---

### 3. Onboarding Changes
**Current**: Purple gradient, basic form  
**Mockup**: Navy background with white card, professional wizard

**Major Updates**:
- ✅ Background: Purple gradient → Navy full screen (#0F172A)
- ✅ Logo: Add white container around logo
- ✅ Progress: 6-step indicator with icons
- ✅ Upload area: Dashed border, centered design
- ✅ Buttons: Green primary, gray secondary
- ✅ Privacy note: Add lock icon + text at bottom

---

## 🚀 Implementation Order

### Step 1: Update Design System Colors (30 minutes)
**File**: `src/design-system/colors.ts` (create if needed)

Add new colors from mockups:
```typescript
export const colors = {
  // Mockup colors
  navyDark: '#0F172A',      // Onboarding background
  navyMedium: '#2D3748',     // Popup background
  navyLight: '#3A4556',      // Popup cards
  green: '#27E38D',          // Primary actions
  blue: '#3B82F6',           // Submitted status
  red: '#EF4444',            // Rejected status
  purple: '#8B5CF6',         // Accepted status
  grayLight: '#F7F9FC',      // Dashboard background
  grayMedium: '#E5E7EB',     // Borders
  grayText: '#64748B',       // Secondary text
  grayDark: '#1A202C',       // Dark text
};
```

---

### Step 2: Popup Redesign (2-3 hours)
**File**: `public/popup/popup.html` + `src/popup/popup.ts`

**Priority Changes**:
1. ✅ Update body width to 584px
2. ✅ Change header background to #2D3748
3. ✅ Replace logo with circular green "OA"
4. ✅ Restyle toggle switch (green)
5. ✅ Create job detection card (#3A4556)
6. ✅ Update primary button (green, full width, sparkle icon)
7. ✅ Update secondary button (transparent, bordered)
8. ✅ Restyle navigation links (no background)
9. ✅ Update stats section (2 columns, border-top)
10. ✅ Update advanced section (collapsible)

**Reference**: `docs/MOCKUP_IMPLEMENTATION_SPEC.md` - Section "MOCKUP 1: Browser Popup"

---

### Step 3: Dashboard Refinement (2-3 hours)
**File**: `public/dashboard/dashboard.html` + `src/dashboard/dashboard.ts`

**Priority Changes**:
1. ✅ Change body background to #F7F9FC
2. ✅ Update header with logo + title
3. ✅ Create 6 stats cards (grid layout)
4. ✅ Color stat numbers (blue, green, red, purple)
5. ✅ Update search bar styling
6. ✅ Add filter dropdown
7. ✅ Style export button (green)
8. ✅ Update Kanban column colors
9. ✅ Add checkboxes to cards
10. ✅ Refine card hover states

**Reference**: `docs/MOCKUP_IMPLEMENTATION_SPEC.md` - Section "MOCKUP 2: Dashboard"

---

### Step 4: Onboarding Polish (1-2 hours)
**File**: `public/onboarding/onboarding.html` + `src/onboarding/onboarding.ts`

**Priority Changes**:
1. ✅ Update body background to #0F172A
2. ✅ Add white container around logo
3. ✅ Create progress indicator (6 steps with icons)
4. ✅ Add "Exit" button (top-right)
5. ✅ Update upload area (dashed border)
6. ✅ Style "Select File" button (green)
7. ✅ Add "Skip for now" link
8. ✅ Update footer buttons (back + next)
9. ✅ Add privacy note with lock icon

**Reference**: `docs/MOCKUP_IMPLEMENTATION_SPEC.md` - Section "MOCKUP 3: Onboarding"

---

## 🎨 Copy-Paste Code Snippets

### Popup Width Update
```css
/* public/popup/popup.html - Update body width */
body {
  width: 584px;  /* Changed from 300px */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #2D3748;  /* Changed from gradient */
}
```

### Circular Logo
```html
<!-- Add to popup header -->
<div class="header-logo">OA</div>
```

```css
.header-logo {
  width: 32px;
  height: 32px;
  background: #27E38D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 14px;
}
```

### Job Detection Card
```html
<div class="job-detection-card">
  <div class="status-indicator"></div>
  <div class="job-info">
    <h3>Job Page Detected</h3>
    <p id="jobTitle">Senior Frontend Developer • TechCorp</p>
  </div>
</div>
```

```css
.job-detection-card {
  background: #3A4556;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  display: flex;
  gap: 12px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #27E38D;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.job-info h3 {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.job-info p {
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
}
```

### Primary Button (Green)
```css
.btn-primary {
  background: #27E38D;
  color: #0F172A;
  width: calc(100% - 32px);
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(39, 227, 141, 0.3);
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #2EF39B;
  transform: translateY(-2px);
}
```

### Dashboard Background Update
```css
/* public/dashboard/dashboard.html - Update body */
body {
  background: #F7F9FC;  /* Changed from gradient */
  min-height: 100vh;
  padding: 20px;
}
```

### Stats Card with Colored Number
```html
<div class="stat-card">
  <div class="number interviewing">5</div>
  <div class="label">Interviewing</div>
</div>
```

```css
.stat-card .number {
  font-size: 32px;
  font-weight: bold;
}

.stat-card .number.submitted { color: #3B82F6; }
.stat-card .number.interviewing { color: #27E38D; }
.stat-card .number.rejected { color: #EF4444; }
.stat-card .number.accepted { color: #8B5CF6; }
```

### Onboarding Logo Container
```html
<div class="logo-container">
  <img src="../icons/logo-full-400w.png" class="onboarding-logo" alt="Offlyn Apply">
</div>
```

```css
.logo-container {
  display: inline-block;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.onboarding-logo {
  height: 48px;
  object-fit: contain;
}
```

---

## 🧪 Testing Checklist

### Popup
- [ ] Width is ~584px (check in browser)
- [ ] Background is navy (#2D3748)
- [ ] Logo is circular green with "OA"
- [ ] Toggle is green when active
- [ ] Job detection card shows on job pages
- [ ] Primary button is green, full width
- [ ] Secondary button is transparent with border
- [ ] Stats show at bottom with border-top
- [ ] Hover states work on all buttons

### Dashboard
- [ ] Background is light gray (#F7F9FC)
- [ ] Header shows logo + "Application Dashboard"
- [ ] 6 stats cards display correctly
- [ ] Stats have correct colors (blue, green, red, purple)
- [ ] Search bar styled correctly
- [ ] Export CSV button is green
- [ ] Kanban columns have correct status colors
- [ ] Cards have checkboxes
- [ ] Edit/delete buttons work
- [ ] Drag-and-drop still works

### Onboarding
- [ ] Full-screen navy background
- [ ] White container around logo
- [ ] Progress indicator shows 6 steps
- [ ] Active step is highlighted green
- [ ] Exit button in top-right
- [ ] Upload area has dashed border
- [ ] "Select File" button is green
- [ ] Back/Next buttons styled correctly
- [ ] Privacy note displays at bottom

---

## 📊 Before/After Comparison

### Popup
| Element | Before | After |
|---------|--------|-------|
| Width | 300px | 584px |
| Background | Purple gradient | Navy solid (#2D3748) |
| Logo | Square icon | Circular green "OA" |
| Primary button | Purple | Green (#27E38D) |
| Layout | Multiple rows | Single column |

### Dashboard
| Element | Before | After |
|---------|--------|-------|
| Background | Purple gradient | Light gray (#F7F9FC) |
| Stats cards | 4 cards | 6 cards |
| Status colors | Purple theme | Blue/Green/Red/Purple |
| Cards | Basic | Checkboxes + refined |

### Onboarding
| Element | Before | After |
|---------|--------|-------|
| Background | Purple gradient | Navy full screen (#0F172A) |
| Logo | Direct on bg | White container |
| Progress | Basic text | 6-step icon indicator |
| Buttons | Purple | Green primary |

---

## 🎯 Priority: Start with Popup

The popup is the most-used interface, so start there:

1. ✅ Update `public/popup/popup.html` CSS section
2. ✅ Change width, background, colors
3. ✅ Test in Firefox
4. ✅ Verify all interactions still work
5. ✅ Move to Dashboard next

---

## 📁 Files to Modify

### High Priority (Must Change)
1. `public/popup/popup.html` - Full redesign
2. `src/popup/popup.ts` - Update any hardcoded styles
3. `public/dashboard/dashboard.html` - Update colors & layout
4. `src/dashboard/dashboard.ts` - Update chart colors
5. `public/onboarding/onboarding.html` - Update layout & styling

### Medium Priority (Should Change)
6. `src/shared/theme.ts` - Update color definitions
7. `src/ui/field-summary.ts` - Match new popup style
8. `src/ui/cover-letter-panel.ts` - Match new color scheme

### Low Priority (Nice to Have)
9. All other UI components - Align with new colors

---

## ⏱️ Time Estimates

- **Popup redesign**: 2-3 hours
- **Dashboard updates**: 2-3 hours
- **Onboarding polish**: 1-2 hours
- **Testing & tweaks**: 1-2 hours

**Total**: 6-10 hours for all 3 pages

---

## 🚨 Common Issues to Avoid

1. **Don't forget to update TypeScript files** - HTML changes need matching JS updates
2. **Test in actual Firefox** - Not just browser dev tools
3. **Verify all interactions** - Buttons, toggles, drag-and-drop must still work
4. **Check responsive behavior** - Especially dashboard on smaller screens
5. **Maintain accessibility** - Color contrast, focus states, etc.

---

## ✅ Done Checklist

- [ ] Popup matches mockup
- [ ] Dashboard matches mockup
- [ ] Onboarding matches mockup
- [ ] All interactions work
- [ ] Build succeeds (npm run build)
- [ ] No console errors
- [ ] Tested in Firefox
- [ ] Colors consistent across all pages

---

**Ready to start?** Open `public/popup/popup.html` and begin with the width change!

**Reference**: `docs/MOCKUP_IMPLEMENTATION_SPEC.md` for detailed CSS and HTML
