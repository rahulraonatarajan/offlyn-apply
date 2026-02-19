# Design System Refactor - DEV Handoff

## Task Summary
Refactor Offlyn Apply to enforce unified design system with centralized color tokens.

**New Brand Colors**:
- Navy: `#0F172A`
- Green: `#27E38D`
- White: `#FFFFFF`

**Key Requirements**:
1. NO inline hex values allowed
2. ALL colors imported from `src/shared/theme.ts`
3. Remove ALL gradients (unless explicitly required)
4. Consistent button/header/accent styling

---

## Implementation Order

### Phase 1: Create Theme System (30 min)
✅ **File Created**: `apps/extension-firefox/src/shared/theme.ts`

**What DEV Needs to Do**:
1. File already created - review and adjust if needed
2. Ensure it builds without errors
3. Test imports work: `import { colors } from '../shared/theme'`

---

### Phase 2: Update Popup UI (1.5 hours)

#### File: `public/popup/popup.html`

**Current Issues**:
- Line 20: Gradient background `linear-gradient(135deg, #1e2a3a 0%, #2d4a5e 100%)`
- Line 113-114: Button has old gradient
- Line 149: Stat numbers use old green
- Multiple hardcoded hex colors

**Required Changes**:

```html
<!-- Line 19-25: Header - REMOVE GRADIENT -->
<style>
.header {
  background: #0F172A; /* Solid navy instead of gradient */
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

<!-- Line 36-37: Header title -->
.header-title {
  font-weight: 700;
  font-size: 15px;
  color: #FFFFFF; /* Keep white */
  letter-spacing: .3px;
}

<!-- Line 113-116: Primary button - USE GREEN -->
.btn-fill {
  background: #27E38D; /* New green */
  color: #0F172A; /* Navy text */
  border: none;
}
.btn-fill:hover {
  background: #22CC7A; /* Green hover */
  box-shadow: 0 4px 14px rgba(39, 227, 141, 0.35);
}

<!-- Line 125-128: Profile button border -->
.btn-profile {
  background: #fff;
  color: #0F172A; /* Navy */
  border: 1.5px solid #27E38D; /* Green border */
}
.btn-profile:hover {
  background: #f5f6ff;
  border-color: #22CC7A; /* Green hover */
  box-shadow: 0 2px 8px rgba(39, 227, 141, 0.15);
}

<!-- Line 149: Stat numbers -->
.stat-num {
  font-size: 20px;
  font-weight: 700;
  color: #27E38D; /* New green */
  line-height: 1;
}

<!-- Line 258: Mini toggle active -->
.mini-toggle.active { background: #27E38D; } /* Green toggle */
</style>
```

#### File: `src/popup/popup.ts`

**Required Changes**:
```typescript
// Add at top
import { colors } from '../shared/theme';

// If any dynamic styling exists, use colors.green, colors.navy
```

---

### Phase 3: Update Dashboard (2 hours)

#### File: `public/dashboard/dashboard.html`

**Current Issues**:
- Line 16: Gradient background
- Line 38: Headers use old colors
- Line 66: Stat numbers use old green
- Line 142: Active buttons use old colors
- Many hardcoded hex colors

**Required Changes**:

```html
<style>
/* Line 14-19: Body - REMOVE GRADIENT */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #FFFFFF; /* Solid white instead of gradient */
  min-height: 100vh;
  padding: 20px;
}

/* Line 36-41: h1 */
h1 {
  color: #0F172A; /* Navy */
  font-size: 28px;
  font-weight: 700;
}

/* Line 64-68: Stat numbers */
.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #27E38D; /* Green */
  margin-bottom: 5px;
}

/* Line 140-144: Active view button */
.view-btn.active {
  background: #27E38D; /* Green */
  color: #0F172A; /* Navy text */
}

/* Line 180-186: Kanban count badge */
.kanban-count {
  background: #27E38D; /* Green */
  color: #0F172A; /* Navy text */
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* Line 195-203: App card */
.app-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  border-left: 4px solid #27E38D; /* Green accent */
}

/* Line 288-295: Primary button */
.btn-primary {
  background: #27E38D; /* Green */
  color: #0F172A; /* Navy text */
}
.btn-primary:hover {
  background: #22CC7A; /* Green hover */
}

/* Line 217-228: Headers */
.app-company {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A; /* Navy */
  margin-bottom: 4px;
}
</style>
```

#### File: `src/dashboard/dashboard.ts`

**Required Changes**:
```typescript
// Add at top
import { colors } from '../shared/theme';

// Replace any inline hex with colors.navy, colors.green, etc.
```

---

### Phase 4: Update Onboarding (1.5 hours)

#### File: `public/onboarding/onboarding.html`

**Current Issues**:
- Multiple gradients
- Old purple/green colors
- 104 style declarations to update

**Required Changes**:
```html
<style>
/* Remove ALL gradients */
/* Update button backgrounds to #27E38D */
/* Update button text to #0F172A */
/* Update headers to #0F172A */
/* Update progress indicators to #27E38D */

/* Example: Primary button */
.btn-primary {
  background: #27E38D;
  color: #0F172A;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover {
  background: #22CC7A;
}

/* Example: Headers */
h1, h2, h3 {
  color: #0F172A;
}

/* Example: Progress indicator */
.progress-active {
  background: #27E38D;
}
</style>
```

---

### Phase 5: Update In-Page Components (3 hours)

#### File: `src/ui/field-summary.ts`

**Location**: Lines 150-250 (addStyles function)

**Current Issues**:
- Gradients in panel background
- Old colors for buttons
- Cube uses old colors

**Required Changes**:
```typescript
import { colors, computed } from '../shared/theme';

function addStyles(): void {
  const css = `
    #offlyn-field-summary {
      /* Remove gradient */
      background: ${colors.white};
      border: 2px solid ${colors.borderMedium};
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .ofl-header {
      background: ${colors.navy};
      color: ${colors.white};
      padding: 12px 16px;
      border-radius: 10px 10px 0 0;
    }
    
    .ofl-btn-primary {
      background: ${colors.green};
      color: ${colors.navy};
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .ofl-btn-primary:hover {
      background: ${computed.greenHover};
    }
    
    .ofl-cube {
      width: 64px;
      height: 64px;
      background: ${colors.navy};
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  `;
  
  // Inject styles...
}
```

#### File: `src/ui/cover-letter-panel.ts`

**Required Changes**:
```typescript
import { colors, computed } from '../shared/theme';

// Update all gradient backgrounds to solid colors
// Update button colors to green
// Update header colors to navy
```

#### File: `src/ui/notification.ts`

**Required Changes**:
```typescript
import { colors } from '../shared/theme';

// Success notifications: green background or border
const styles = `
  .offlyn-notification-success {
    background: ${colors.green};
    color: ${colors.navy};
    border-left: 4px solid ${colors.green};
  }
`;
```

#### File: `src/ui/progress-indicator.ts`

**Required Changes**:
```typescript
import { colors } from '../shared/theme';

const styles = `
  .offlyn-progress-bar {
    background: ${colors.green};
    height: 4px;
    border-radius: 2px;
  }
`;
```

#### File: `src/ui/inline-suggestion-tile.ts`

**Required Changes**:
```typescript
import { colors, computed } from '../shared/theme';

const styles = `
  .offlyn-suggestion-tile:hover {
    border-color: ${colors.green};
  }
  
  .offlyn-suggestion-tile-selected {
    border-color: ${colors.green};
    background: ${computed.greenAlpha10};
  }
`;
```

#### File: `src/ui/field-highlighter.ts`

**Required Changes**:
```typescript
import { colors } from '../shared/theme';

const styles = `
  .offlyn-field-success {
    box-shadow: 0 0 0 2px ${colors.green};
  }
`;
```

---

### Phase 6: Copy Brand Assets (15 min)

**Required Actions**:
```bash
# Copy logo assets from Brandkit to extension
cp Brandkit/exports/icon-48.png apps/extension-firefox/public/icons/
cp Brandkit/exports/icon-96.png apps/extension-firefox/public/icons/
cp Brandkit/exports/icon-128.png apps/extension-firefox/public/icons/
cp Brandkit/exports/icon-256.png apps/extension-firefox/public/icons/
cp Brandkit/exports/logo-full-400w.png apps/extension-firefox/public/icons/
cp Brandkit/exports/logo-full-600w.png apps/extension-firefox/public/icons/
cp Brandkit/exports/favicon.ico apps/extension-firefox/public/icons/
cp Brandkit/exports/header-icon-24.png apps/extension-firefox/public/icons/
cp Brandkit/exports/header-icon-32.png apps/extension-firefox/public/icons/
cp Brandkit/exports/cube-64.png apps/extension-firefox/public/icons/
cp Brandkit/exports/cube-48.png apps/extension-firefox/public/icons/
```

**Update Manifest**:
```json
{
  "name": "Offlyn Apply - Job Application Assistant",
  "description": "Automate your job applications with AI-powered autofill",
  "icons": {
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png",
    "128": "icons/icon-128.png"
  }
}
```

**Update HTML References**:
```html
<!-- Popup header -->
<img src="../icons/icon-48.png" alt="OA" class="header-logo">

<!-- Dashboard header -->
<img src="../icons/logo-full-400w.png" alt="Offlyn Apply" style="height: 40px;">

<!-- Onboarding -->
<img src="../icons/logo-full-600w.png" alt="Offlyn Apply" style="max-width: 300px;">
```

---

## Testing Checklist

### Visual Verification
- [ ] No purple colors (#667eea, #764ba2) anywhere
- [ ] No old blue (#1e2a3a, #2d4a5e) anywhere
- [ ] No old green (#7cb342, #9ccc65) anywhere
- [ ] All primary buttons are green (#27E38D) with navy text (#0F172A)
- [ ] All headers are navy (#0F172A)
- [ ] All hover states use darker green (#22CC7A)
- [ ] All disabled states use gray medium (#CBD5E1)
- [ ] All accents/borders use green (#27E38D)
- [ ] No gradients visible (unless explicitly required)

### Code Verification
- [ ] `src/shared/theme.ts` exists and exports colors
- [ ] All TS files import from theme (no inline hex)
- [ ] All HTML files use new colors
- [ ] No orphaned old color values
- [ ] Build succeeds without errors
- [ ] TypeScript compiles without errors

### Component Testing
- [ ] Popup: Green buttons, navy headers, works correctly
- [ ] Dashboard: No gradients, green accents, navy text
- [ ] Onboarding: Green progress, navy headers, flows correctly
- [ ] Field summary: Green buttons, navy/white theme
- [ ] Cover letter: Green CTAs, navy text
- [ ] Notifications: Green success states
- [ ] Progress bars: Green fill
- [ ] Inline tiles: Green hover/selection
- [ ] Field highlights: Green success glow
- [ ] Toolbar icon: OA monogram visible

---

## Files Summary

### Created (1 file)
- ✅ `apps/extension-firefox/src/shared/theme.ts`

### Modified (15 files)
- [ ] `apps/extension-firefox/public/popup/popup.html`
- [ ] `apps/extension-firefox/src/popup/popup.ts`
- [ ] `apps/extension-firefox/public/dashboard/dashboard.html`
- [ ] `apps/extension-firefox/src/dashboard/dashboard.ts`
- [ ] `apps/extension-firefox/public/onboarding/onboarding.html`
- [ ] `apps/extension-firefox/src/onboarding/onboarding.ts`
- [ ] `apps/extension-firefox/src/ui/field-summary.ts`
- [ ] `apps/extension-firefox/src/ui/cover-letter-panel.ts`
- [ ] `apps/extension-firefox/src/ui/notification.ts`
- [ ] `apps/extension-firefox/src/ui/progress-indicator.ts`
- [ ] `apps/extension-firefox/src/ui/inline-suggestion-tile.ts`
- [ ] `apps/extension-firefox/src/ui/field-highlighter.ts`
- [ ] `apps/extension-firefox/src/ui/suggestion-panel.ts`
- [ ] `apps/extension-firefox/src/ui/autofill-notification.ts`
- [ ] `apps/extension-firefox/dist/manifest.json`

### Copied (11 files)
- [ ] Brand assets from `Brandkit/exports/` → `public/icons/`

**Total**: 27 files

---

## Estimated Effort

- Create theme system: 30 minutes ✅ DONE
- Update popup: 1.5 hours
- Update dashboard: 2 hours
- Update onboarding: 1.5 hours
- Update in-page components: 3 hours
- Copy assets & update manifest: 30 minutes
- Testing & fixes: 2 hours

**Total**: ~10-11 hours

---

## Priority Order

1. **DONE** ✅: Create theme.ts
2. **HIGH**: Copy brand assets to icons/
3. **HIGH**: Update popup.html (most visible)
4. **HIGH**: Update dashboard.html
5. **MEDIUM**: Update in-page components
6. **MEDIUM**: Update onboarding.html
7. **LOW**: Test and polish

---

## Questions Before Starting

All requirements are clear. Ready to implement!

**Key Constraints**:
- NO inline hex values
- ALL colors from theme.ts
- Remove ALL gradients
- Green buttons with navy text
- Navy headers
- Green accents
