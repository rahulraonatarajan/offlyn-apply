# Offlyn Apply - Popup Redesign Specification

## Problem Statement
Current popup has too many competing CTAs, no clear hierarchy, and violates "low cognitive load" principle.

**Current Issues**:
- 4 primary actions compete for attention
- Stats section competes with actions
- Advanced section adds 5 more buttons
- No context-aware behavior
- No clear focal point

---

## Design Principles

1. **One Primary Action Per State**
2. **Context-Aware UI** (changes based on page)
3. **Progressive Disclosure** (hide advanced features)
4. **Speed** (instant load, immediate action)
5. **Trust** (show what will happen before doing it)

---

## Redesigned Popup Structure

### Layout Formula
```
┌─────────────────────────────┐
│  Header (Navy)              │  ← Brand + Status
├─────────────────────────────┤
│  Context Card               │  ← Where am I?
├─────────────────────────────┤
│  Primary Action (Green)     │  ← Main CTA
├─────────────────────────────┤
│  Secondary Action           │  ← Context-dependent
├─────────────────────────────┤
│  Quick Stats (Minimal)      │  ← 1-2 metrics only
├─────────────────────────────┤
│  Footer (Settings Icon)     │  ← Minimal footer
└─────────────────────────────┘
```

**Total Height**: ~420px (fits standard popup)  
**Width**: 340px (up from 300px for better breathing room)

---

## State-Based UI (Context-Aware)

### State 1: Not on Job Page
```
┌─────────────────────────────┐
│ [OA Icon] Offlyn Apply  [⚙] │
├─────────────────────────────┤
│ No job application detected │
│ Navigate to a job posting   │
│ to start auto-filling       │
├─────────────────────────────┤
│ [Open Dashboard]            │ ← Secondary action
├─────────────────────────────┤
│ 5 applications today        │
└─────────────────────────────┘
```

### State 2: On Job Page (Not Filled)
```
┌─────────────────────────────┐
│ [OA Icon] Offlyn Apply  [⚙] │
├─────────────────────────────┤
│ Software Engineer           │
│ at TechCorp                 │
│ 12 fields detected          │
├─────────────────────────────┤
│ [Auto-Fill Application]     │ ← Primary (Green)
├─────────────────────────────┤
│ [Generate Cover Letter]     │ ← Secondary (Navy outline)
├─────────────────────────────┤
│ 5 applications today        │
└─────────────────────────────┘
```

### State 3: After Auto-Fill
```
┌─────────────────────────────┐
│ [OA Icon] Offlyn Apply  [⚙] │
├─────────────────────────────┤
│ ✓ Filled 12 fields          │
│ 10 high confidence          │
│ 2 needs review              │
├─────────────────────────────┤
│ [Review & Submit]           │ ← Primary (Green)
├─────────────────────────────┤
│ [View Details]              │ ← Secondary
├─────────────────────────────┤
│ 5 applications today        │
└─────────────────────────────┘
```

### State 4: After Submission
```
┌─────────────────────────────┐
│ [OA Icon] Offlyn Apply  [⚙] │
├─────────────────────────────┤
│ ✓ Application Submitted!    │
│ Software Engineer @ TechCorp│
├─────────────────────────────┤
│ [View Dashboard]            │ ← Primary (Green)
├─────────────────────────────┤
│ 6 applications today (+1)   │
└─────────────────────────────┘
```

---

## Component Specifications

### Header
```
Height: 56px (down from ~70px)
Background: #0F172A (solid navy)
Layout: [Logo] [Title] [Spacer] [Settings Icon]

Logo: 24x24 icon
Title: "Offlyn Apply" (14px, white, semibold)
Settings: Minimal gear icon (18px)
```

### Context Card
```
Background: #F5F7FA (light gray)
Padding: 16px
Border-radius: 8px
Margin: 16px

Content:
- Job title (16px, navy, bold)
- Company (14px, gray-600)
- Fields count (12px, gray-500)
```

### Primary Action Button
```
Width: 100%
Height: 48px (large tap target)
Background: #27E38D
Color: #0F172A
Font: 16px semibold
Border-radius: 8px
Shadow: sm

Hover: #22CC7A + shadow-md + translateY(-1px)
Active: #1EB86B

Icon: 20px, left-aligned
Text: Centered with icon gap
```

### Secondary Action
```
Width: 100%
Height: 40px
Background: transparent
Color: #0F172A
Border: 2px solid #CBD5E1
Font: 14px medium
Border-radius: 8px

Hover: background #F5F7FA
```

### Quick Stats
```
Layout: Single line, minimal
Font: 12px, gray-500
Icon: Small green dot if active
No card background (just text)
```

### Footer
```
Height: 40px
Background: transparent
Layout: Centered settings icon only
```

---

## Settings Page (Gear Icon)

Clicking settings icon opens full settings page (not inline expansion):

```
Settings Page Structure:
├── Profile Management
│   ├── Edit Profile
│   ├── View Learned Values
│   └── Clear Self-ID Data
├── Extension Settings
│   ├── Enabled Toggle
│   ├── Dry Run Mode
│   └── Ollama Connection Status
├── Data & Privacy
│   ├── Export Applications (CSV)
│   ├── Clear All Data
│   └── Privacy Policy
└── About
    ├── Version
    ├── Help & Support
    └── Rate Extension
```

Opens in new tab, not inline expansion.

---

## Confidence Indicators (NEW FEATURE)

After auto-fill, show confidence breakdown:

```
┌────────────────────────────────┐
│ ✓ 12 fields filled             │
│                                │
│ ● 10 High confidence           │ ← Green dot
│ ● 2 Medium confidence          │ ← Amber dot
│ ● 0 Low confidence             │ ← Red dot (gray if 0)
│                                │
│ [Review Fields]                │
└────────────────────────────────┘
```

Clicking "Review Fields" expands in-page panel with field-by-field breakdown.

---

## Micro-Interactions

### Auto-Fill Button Click
```
1. Button text: "Auto-Fill Application"
2. Click → Button shows spinner: "Filling..."
3. Fields highlight one by one (green glow, 50ms delay each)
4. Button updates: "✓ Filled 12 Fields"
5. Confidence summary appears below button
6. Button changes to: "Review & Submit"
```

### Cover Letter Generation
```
1. Button text: "Generate Cover Letter"
2. Click → Button shows spinner: "Generating..."
3. Progress bar appears (0% → 100% over ~3 seconds)
4. Button updates: "✓ Cover Letter Ready"
5. New action appears: "View Cover Letter"
```

---

## Spacing & Sizing

### Container
```
Width: 340px
Max-height: 550px
Padding: 0 (sections have their own padding)
```

### Sections
```
Header: 56px height, 16px padding
Context Card: 16px padding, 16px margin
Primary Button: 48px height, 16px margin-x
Secondary Button: 40px height, 16px margin-x
Stats: 16px padding, minimal height
Footer: 40px height, 8px padding
```

### Gaps
```
Between sections: 8px
Between buttons: 8px
Between stats items: 16px
Icon to text: 8px
```

---

## Color Usage Rules

### In Popup

**Green (#27E38D) used for**:
- Primary action button background
- Success icons (checkmarks)
- Active status indicators
- Confidence badges (high confidence)

**Navy (#0F172A) used for**:
- Header background
- Primary text
- Button text (on green background)
- Icons (outline style)

**Gray used for**:
- Secondary text (#64748B)
- Borders (#CBD5E1)
- Secondary backgrounds (#F5F7FA)

**Never use**:
- Multiple shades of green in same view
- Gradients
- Random blues or purples
- Bright reds except for errors

---

## Implementation Files

### New Files to Create
```
apps/extension-firefox/src/design-system/
  ├── colors.ts
  ├── spacing.ts
  ├── typography.ts
  ├── radius.ts
  ├── shadows.ts
  ├── animations.ts
  ├── buttons.ts
  ├── index.ts
  └── README.md
```

### Files to Refactor
```
apps/extension-firefox/public/popup/popup.html
apps/extension-firefox/src/popup/popup.ts
```

### HTML Structure (New)
```html
<div class="popup-container">
  <!-- Header -->
  <header class="popup-header">
    <img src="../icons/icon-48.png" class="header-icon" alt="OA">
    <h1 class="header-title">Offlyn Apply</h1>
    <button class="header-settings" id="settingsBtn">⚙</button>
  </header>
  
  <!-- Context Card (dynamic based on state) -->
  <div class="context-card" id="contextCard">
    <!-- Populated by JS -->
  </div>
  
  <!-- Primary Action (dynamic) -->
  <button class="btn-primary-large" id="primaryAction">
    <!-- Populated by JS -->
  </button>
  
  <!-- Secondary Action (dynamic, optional) -->
  <button class="btn-secondary" id="secondaryAction" style="display:none;">
    <!-- Populated by JS -->
  </button>
  
  <!-- Quick Stats (minimal) -->
  <div class="quick-stats" id="quickStats">
    <!-- Populated by JS -->
  </div>
  
  <!-- Footer (minimal) -->
  <footer class="popup-footer">
    <span class="privacy-badge">🔒 100% Local</span>
  </footer>
</div>
```

---

## Comparison: Old vs New

### Old Popup (Current)
- 300px wide
- 4 visible buttons always
- Advanced section expands inline
- Stats cards prominent
- Multiple gradients
- All features always visible

### New Popup (Proposed)
- 340px wide
- 1-2 buttons based on context
- Settings opens in new tab
- Stats minimal (one line)
- Solid colors only
- Progressive disclosure

---

## Success Metrics

After redesign, users should:
1. Complete auto-fill in < 3 seconds from popup open
2. Understand primary action immediately (< 1 second)
3. Trust the system (confidence indicators visible)
4. Never see irrelevant actions
5. Experience smooth, polished interactions

---

## Next Steps

1. Create design system files
2. Build new popup HTML structure
3. Implement state machine in popup.ts
4. Add confidence indicator logic
5. Add micro-interactions
6. Test with users

**See**: `DESIGN_SYSTEM_COMPLETE.md` for design system structure  
**Estimated Effort**: 6-8 hours for popup redesign
