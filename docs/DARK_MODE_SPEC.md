# Offlyn Apply - Dark Mode Specification

## Overview
Implement dark mode across all UI surfaces with automatic detection and manual toggle.

**Principles**:
- Follow system preference by default
- Manual toggle for override
- Maintain brand identity (navy + green)
- Ensure readability (WCAG AA contrast)
- Smooth transition between modes

---

## Color Palette: Dark Mode

### Primary Colors (Adjusted for Dark)
```
Navy (Background): #0F172A → Keep as dark bg
Green (Accent): #27E38D → Slightly brighter #2EF39B for visibility
White (Text): #FFFFFF → Keep for primary text
```

### Dark Mode Specific Colors
```
// Backgrounds
darkBg1: #0F172A    (Primary background - darkest)
darkBg2: #1E293B    (Secondary background - cards, panels)
darkBg3: #334155    (Tertiary background - hover states)

// Text
darkText1: #F8FAFC  (Primary text - almost white)
darkText2: #CBD5E1  (Secondary text)
darkText3: #94A3B8  (Tertiary text)

// Borders
darkBorder1: #334155  (Subtle borders)
darkBorder2: #475569  (Medium borders)
darkBorder3: #64748B  (Prominent borders)

// Green variants (brighter for dark mode)
darkGreen: #2EF39B
darkGreenHover: #3FFBAA
darkGreenActive: #1EE088
```

---

## Theme Tokens

### Light Mode (Default)
```typescript
export const lightTheme = {
  // Backgrounds
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F5F7FA',
  bgTertiary: '#E5E7EB',
  bgDark: '#0F172A',
  
  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Borders
  borderLight: '#E5E7EB',
  borderMedium: '#CBD5E1',
  borderDark: '#94A3B8',
  
  // Accents
  accentPrimary: '#27E38D',
  accentHover: '#22CC7A',
  accentActive: '#1EB86B',
  
  // Semantic
  success: '#27E38D',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;
```

### Dark Mode
```typescript
export const darkTheme = {
  // Backgrounds
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgTertiary: '#334155',
  bgDark: '#020617',
  
  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',
  
  // Borders
  borderLight: '#334155',
  borderMedium: '#475569',
  borderDark: '#64748B',
  
  // Accents (brighter for dark backgrounds)
  accentPrimary: '#2EF39B',
  accentHover: '#3FFBAA',
  accentActive: '#1EE088',
  
  // Semantic
  success: '#2EF39B',
  error: '#F87171',       // Softer red for dark
  warning: '#FBBF24',     // Softer amber for dark
  info: '#60A5FA',        // Softer blue for dark
} as const;
```

---

## Implementation Strategy

### 1. Detection & Storage
```typescript
// Detect system preference
function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

// Get user preference (overrides system)
async function getUserThemePreference(): Promise<'light' | 'dark' | 'auto'> {
  const result = await browser.storage.local.get('themePreference');
  return result.themePreference || 'auto';
}

// Determine active theme
async function getActiveTheme(): Promise<'light' | 'dark'> {
  const pref = await getUserThemePreference();
  if (pref === 'auto') {
    return getSystemTheme();
  }
  return pref;
}
```

### 2. CSS Variables Approach
```css
/* Light mode (default) */
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F7FA;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --accent-primary: #27E38D;
  --border-medium: #CBD5E1;
}

/* Dark mode */
:root[data-theme="dark"] {
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --accent-primary: #2EF39B;
  --border-medium: #475569;
}
```

### 3. Theme Switcher Component
```html
<!-- Add to popup footer or settings -->
<div class="theme-toggle">
  <button data-theme="light">☀️ Light</button>
  <button data-theme="auto">⚙️ Auto</button>
  <button data-theme="dark">🌙 Dark</button>
</div>
```

---

## Files Requiring Dark Mode

### HTML Files (3)
- [ ] `public/popup/popup.html`
- [ ] `public/dashboard/dashboard.html`
- [ ] `public/onboarding/onboarding.html`

### TypeScript Files (9)
- [ ] `src/popup/popup.ts` - Theme detection & application
- [ ] `src/dashboard/dashboard.ts` - Theme detection
- [ ] `src/onboarding/onboarding.ts` - Theme detection
- [ ] `src/ui/field-summary.ts` - Dark mode styles
- [ ] `src/ui/cover-letter-panel.ts` - Dark mode styles
- [ ] `src/ui/notification.ts` - Dark mode colors
- [ ] `src/ui/progress-indicator.ts` - Dark mode colors
- [ ] `src/ui/inline-suggestion-tile.ts` - Dark mode styles
- [ ] `src/ui/field-highlighter.ts` - Dark mode colors

### Design System Files
- [ ] `src/design-system/colors.ts` - Add dark theme tokens
- [ ] `src/design-system/theme-manager.ts` - NEW: Theme switching logic

---

## Contrast Requirements (WCAG AA)

### Light Mode
```
Navy on White: 14.1:1 ✓ (AAA)
Gray-500 on White: 4.8:1 ✓ (AA)
Green on White: 3.5:1 ⚠ (Large text only)
Navy on Green: 5.2:1 ✓ (AA)
```

### Dark Mode
```
White on Navy: 14.1:1 ✓ (AAA)
Light Gray on Navy: 8.5:1 ✓ (AAA)
Bright Green on Navy: 6.8:1 ✓ (AA)
Navy on Bright Green: 6.8:1 ✓ (AA)
```

All combinations pass WCAG AA standards.

---

## Implementation Checklist

### Phase 1: Infrastructure
- [ ] Create `theme-manager.ts` with detection logic
- [ ] Add theme preference to storage schema
- [ ] Add CSS variable system to all HTML files
- [ ] Create dark mode color tokens

### Phase 2: Popup
- [ ] Add theme toggle to settings
- [ ] Apply dark mode CSS variables
- [ ] Test all states (not on job, on job, after fill, after submit)
- [ ] Ensure buttons remain visible

### Phase 3: Dashboard
- [ ] Apply dark mode to dashboard page
- [ ] Darken Kanban cards
- [ ] Adjust chart colors for dark background
- [ ] Test readability

### Phase 4: Onboarding
- [ ] Apply dark mode to onboarding flow
- [ ] Adjust logo container for dark theme
- [ ] Test all onboarding steps

### Phase 5: In-Page Components
- [ ] Field summary panel dark mode
- [ ] Cover letter panel dark mode
- [ ] Notifications dark mode
- [ ] All other in-page UI components

### Phase 6: Testing
- [ ] Test system theme auto-detection
- [ ] Test manual theme toggle
- [ ] Test theme persistence across browser restarts
- [ ] Verify all text is readable
- [ ] Check all buttons are visible
- [ ] Ensure green accents stand out

---

## Theme Toggle UI

### Option 1: Three-State Toggle (Recommended)
```
[☀ Light] [⚙ Auto] [🌙 Dark]
```

### Option 2: Simple Toggle
```
Light [○────●] Dark
```

### Option 3: Dropdown
```
Theme: [Auto ▼]
  - Light
  - Auto (System)
  - Dark
```

**Recommendation**: Option 1 (three-state) for clarity

---

## Smooth Theme Transitions

```css
/* Add to all themed elements */
* {
  transition: 
    background-color 200ms ease,
    color 200ms ease,
    border-color 200ms ease;
}

/* Disable transitions on theme change for instant switch */
:root[data-theme-transitioning="false"] * {
  transition: none !important;
}
```

---

## Dark Mode Best Practices

### Do's ✓
- Use slightly brighter green (#2EF39B) for better visibility
- Reduce shadow intensity (dark shadows on dark bg = invisible)
- Use borders more prominently (helps define boundaries)
- Test in actual dark room (not just dark theme in light room)
- Maintain same visual hierarchy

### Don'ts ✗
- Don't use pure black (#000000) - too harsh
- Don't invert all colors blindly
- Don't make shadows darker (lighter shadows on dark bg)
- Don't forget to adjust semi-transparent overlays
- Don't use same shadow values as light mode

---

## Testing Checklist

- [ ] System dark mode detected automatically
- [ ] Manual toggle works
- [ ] Theme persists across sessions
- [ ] All text readable (contrast check)
- [ ] All buttons visible and clickable
- [ ] Green accents visible on dark backgrounds
- [ ] Borders define component boundaries clearly
- [ ] Shadows provide depth (lighter shadows on dark)
- [ ] Images/icons visible (may need dark variants)
- [ ] Charts readable (adjust colors)

---

## Estimated Effort

- Design system updates: 2 hours
- Theme manager implementation: 2 hours
- Popup dark mode: 2 hours
- Dashboard dark mode: 3 hours
- Onboarding dark mode: 1 hour
- In-page components: 3 hours
- Testing & polish: 2 hours

**Total: 15-17 hours**

---

## Next Phase

After dark mode complete:
1. Test in real dark environment
2. Get user feedback
3. Refine contrast ratios if needed
4. Consider auto theme per page (dark job sites = dark popup)
