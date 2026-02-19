# Offlyn Apply Rebranding - Complete File Checklist

## Summary
Rebrand extension from "Offlyn" to "Offlyn Apply" (OA monogram) with new color scheme based on logo.

**Color Change**: Purple gradient (#667eea → #764ba2) → Dark blue to green (#1e2a3a → #7cb342)

---

## Files to Modify (Grouped by Category)

### 1. MANIFEST & METADATA (2 files)

```
apps/extension-firefox/dist/manifest.json
apps/extension-firefox/public/manifest.json (if exists)
```

**Changes**:
- `name`: "Offlyn Apply - Job Application Assistant"
- `description`: "Automate your job applications with AI-powered autofill"  
- `default_title`: "Offlyn Apply"

---

### 2. ICONS & ASSETS (6-8 files)

**Existing icons to REPLACE**:
```
apps/extension-firefox/public/icons/icon-48.png
apps/extension-firefox/public/icons/icon-96.png
apps/extension-firefox/dist/icons/icon-48.png (auto-generated)
apps/extension-firefox/dist/icons/icon-96.png (auto-generated)
```

**New assets to CREATE**:
```
apps/extension-firefox/public/icons/icon-128.png (optional, recommended)
apps/extension-firefox/public/icons/logo-full.png (for onboarding header)
apps/extension-firefox/public/icons/logo-full.svg (vector version)
apps/extension-firefox/public/icons/favicon.ico (for dashboard/onboarding)
```

**Asset Specs**:
- OA monogram: 48x48, 96x96, 128x128 PNG with transparency
- Full logo: 400x200 PNG for onboarding
- Favicon: 16x16 + 32x32 multi-resolution ICO

---

### 3. POPUP UI (2 files)

```
apps/extension-firefox/public/popup/popup.html
apps/extension-firefox/src/popup/popup.ts
```

**popup.html Changes**:
```html
<!-- Line ~6: Update title -->
<title>Offlyn Apply</title>

<!-- Line ~277-278: Update header branding -->
<span class="header-logo">
  <img src="../icons/icon-48.png" alt="OA" width="24" height="24">
</span>
<span class="header-title">Offlyn Apply</span>

<!-- Update all gradient backgrounds -->
<style>
  /* Line ~20-21: Header gradient */
  background: linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%);
  
  /* Line ~113-114: Button gradient */
  background: linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%);
  
  /* Line ~125: Hover color */
  color: #7cb342;
  border: 1.5px solid #7cb342;
  
  /* Line ~149: Stat number color */
  color: #7cb342;
</style>
```

**popup.ts Changes**:
- Any hardcoded "Offlyn" strings in notifications/messages

---

### 4. DASHBOARD (2 files)

```
apps/extension-firefox/public/dashboard/dashboard.html
apps/extension-firefox/src/dashboard/dashboard.ts
```

**dashboard.html Changes**:
```html
<!-- Line ~6: Update title -->
<title>Job Applications Dashboard - Offlyn Apply</title>

<!-- Line ~16: Update background -->
<style>
  body {
    background: linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%);
  }
  
  /* Line ~38: Update h1 color -->
  h1 { color: #1e2a3a; }
  
  /* Line ~66: Stat numbers */
  .stat-number { color: #7cb342; }
  
  /* Line ~142: Active view button */
  .view-btn.active { background: #7cb342; }
  
  /* Line ~182: Kanban count badge */
  .kanban-count { background: #7cb342; }
  
  /* Line ~202: Card border */
  .app-card { border-left: 4px solid #7cb342; }
  
  /* Line ~289: Primary button */
  .btn-primary { background: #7cb342; }
  .btn-primary:hover { background: #9ccc65; }
</style>

<!-- Line ~434: Add logo in header -->
<header>
  <div style="display: flex; align-items: center; gap: 10px;">
    <img src="../icons/icon-48.png" alt="OA" width="32" height="32">
    <h1>Job Applications Dashboard - Offlyn Apply</h1>
  </div>
  <button class="btn export-btn" id="exportBtn">Export CSV</button>
</header>
```

**dashboard.ts Changes**:
- Update any "Offlyn" strings in messages/notifications

---

### 5. ONBOARDING (2 files)

```
apps/extension-firefox/public/onboarding/onboarding.html
apps/extension-firefox/src/onboarding/onboarding.ts
```

**onboarding.html Changes**:
```html
<!-- Line ~6: Update title -->
<title>Setup Your Profile - Offlyn Apply</title>

<!-- Add logo at top of page -->
<div style="text-align: center; padding: 40px 20px 20px;">
  <img src="../icons/logo-full.png" alt="Offlyn Apply" 
       style="max-width: 300px; height: auto;">
  <h1 style="margin-top: 20px; color: #1e2a3a;">Welcome to Offlyn Apply</h1>
  <p style="color: #9ca3af;">Set up your profile to start automating job applications</p>
</div>

<!-- Update all purple colors -->
<style>
  /* Progress indicators */
  .progress-active { background: #7cb342; }
  
  /* Buttons */
  .btn-primary { 
    background: linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%);
  }
  
  /* Headers */
  h2 { color: #1e2a3a; }
  
  /* Success states */
  .success { color: #7cb342; }
</style>
```

**onboarding.ts Changes**:
- Update welcome messages to say "Offlyn Apply"
- Update success messages

---

### 6. IN-PAGE COMPONENTS (6 files)

#### Field Summary Panel
```
apps/extension-firefox/src/ui/field-summary.ts
```

**Changes**:
```typescript
// Line ~150-250: Update addStyles() function
const styles = `
  #offlyn-field-summary {
    /* Line ~160: Update gradient */
    background: linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%);
  }
  
  .ofl-cube {
    /* Line ~220: Update cube background */
    background: linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%);
    /* Add OA monogram image instead of text */
  }
  
  /* Line ~180: Update button colors */
  .ofl-btn-primary {
    background: #7cb342;
  }
  .ofl-btn-primary:hover {
    background: #9ccc65;
  }
`;

// Line ~140: Update cube HTML to show OA image
function buildCubeHTML(): string {
  return `
    <div class="ofl-cube">
      <img src="${browser.runtime.getURL('icons/icon-48.png')}" 
           alt="OA" width="32" height="32" />
    </div>
  `;
}

// Line ~120: Update header HTML
function buildPanelHTML(fields, jobTitle, company) {
  return `
    <div class="ofl-header">
      <img src="${browser.runtime.getURL('icons/icon-48.png')}" 
           alt="OA" width="20" height="20" />
      <span class="ofl-title">Offlyn Apply</span>
      <button class="ofl-close">×</button>
    </div>
    ...
  `;
}
```

#### Cover Letter Panel
```
apps/extension-firefox/src/ui/cover-letter-panel.ts
```

**Changes**:
```typescript
// Update styles gradient (similar to field-summary)
// Update header to show "Offlyn Apply - Cover Letter"
// Replace purple with brand-green (#7cb342)
```

#### Notifications
```
apps/extension-firefox/src/ui/notification.ts
```

**Changes**:
```typescript
// Line ~50-100: Update styles
const styles = `
  .offlyn-notification-success {
    background: #7cb342;
  }
  
  .offlyn-notification {
    border-left: 4px solid #7cb342;
  }
`;
```

#### Progress Indicator
```
apps/extension-firefox/src/ui/progress-indicator.ts
```

**Changes**:
```typescript
// Line ~30-80: Update progress bar color
const styles = `
  .offlyn-progress-bar {
    background: #7cb342;
  }
`;
```

#### Inline Suggestion Tiles
```
apps/extension-firefox/src/ui/inline-suggestion-tile.ts
```

**Changes**:
```typescript
// Update tile highlight color from purple to green
const styles = `
  .offlyn-suggestion-tile:hover {
    border-color: #7cb342;
  }
  
  .offlyn-suggestion-tile-selected {
    border-color: #7cb342;
    background: rgba(124, 179, 66, 0.1);
  }
`;
```

#### Field Highlighter
```
apps/extension-firefox/src/ui/field-highlighter.ts
```

**Changes**:
```typescript
// Line ~20-60: Update success highlight color
const styles = `
  .offlyn-field-success {
    box-shadow: 0 0 0 2px #7cb342;
  }
`;
```

---

### 7. SHARED UTILITIES (1 NEW file)

```
apps/extension-firefox/src/shared/brand.ts (CREATE NEW)
```

**Content**: See BRANDING_GUIDE.md for full code

---

## Quick Color Migration Script

Run these find-and-replace operations across all HTML/TS files:

```bash
# Purple primary to dark blue
find apps/extension-firefox -type f \( -name "*.html" -o -name "*.ts" \) \
  -exec sed -i '' 's/#667eea/#1e2a3a/g' {} +

# Purple accent to green
find apps/extension-firefox -type f \( -name "*.html" -o -name "*.ts" \) \
  -exec sed -i '' 's/#764ba2/#7cb342/g' {} +

# Update gradient strings
find apps/extension-firefox -type f \( -name "*.html" -o -name "*.ts" \) \
  -exec sed -i '' 's/linear-gradient(135deg, #667eea 0%, #764ba2 100%)/linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%)/g' {} +
```

**WARNING**: Always backup before running bulk find-and-replace!

---

## Implementation Order

1. **Assets First** (Required before anything else works)
   - Create all PNG icons (48, 96, 128)
   - Create full logo PNG
   - Place in `public/icons/`

2. **Core Extension** (Most visible)
   - Update manifest.json
   - Update popup.html & popup.ts
   - Test: Load extension and check popup

3. **Dashboard** (User-facing)
   - Update dashboard.html & dashboard.ts
   - Test: Open dashboard from popup

4. **Onboarding** (First impression)
   - Update onboarding.html & onboarding.ts
   - Test: Go through onboarding flow

5. **In-Page Components** (Field interactions)
   - Update all 6 UI component files
   - Test: Visit a job site and trigger autofill

6. **Polish** (Final touches)
   - Create brand.ts constants file
   - Run color migration script
   - Global search for remaining "Offlyn" strings
   - Test all features end-to-end

---

## Testing Checklist

After implementation:

- [ ] Extension icon in browser toolbar shows OA monogram
- [ ] Popup says "Offlyn Apply" and uses new colors
- [ ] Dashboard header shows "Offlyn Apply" branding
- [ ] Onboarding shows full logo at top
- [ ] Field summary panel (minimized) shows OA cube
- [ ] All purple colors replaced with dark-blue/green
- [ ] Cover letter panel uses new branding
- [ ] Notifications use green for success
- [ ] Progress bars are green
- [ ] All user-facing text says "Offlyn Apply"

---

## File Count Summary

- **2** Manifest/metadata files
- **6-8** Icon/asset files (4 to replace, 4 to create)
- **2** Popup files
- **2** Dashboard files
- **2** Onboarding files
- **6** In-page component files
- **1** New brand constants file

**Total: ~21-23 files** to modify/create
