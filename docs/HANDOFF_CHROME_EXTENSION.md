# Quick Handoff: Chrome Extension Port

**For User** - How to hand off this feature to a new DEV agent

---

## 🎯 What This Feature Does

Ports Offlyn Apply to Chrome with full feature parity:
- **Shared codebase** → 95% code reuse between Firefox and Chrome
- **Manifest V3** → Chrome's modern extension format
- **Service Worker** → Event-driven background script
- **All 5 features** → Resume upload, autofill, dashboard, learned values, Ollama setup
- **Same UX** → Identical user experience across browsers

---

## 📄 Feature Brief Location

**File**: `docs/FEATURE_CHROME_EXTENSION.md`

This is a **complete, standalone feature brief** with:
- Firefox extension analysis (~40+ TypeScript files, ~20 using browser APIs)
- Chrome Manifest V3 requirements
- Shared codebase architecture
- Service Worker migration plan
- Browser compatibility layer design
- Step-by-step implementation plan (7 phases)
- Testing checklist
- Chrome Web Store packaging

---

## 🚀 How to Hand Off to DEV Agent

### Step 1: Open New Chat with DEV Agent
In Cursor, start a fresh chat with a new agent.

### Step 2: Share the Feature Brief
Say to the new DEV agent:
```
Please implement the feature described in: docs/FEATURE_CHROME_EXTENSION.md

This ports Offlyn Apply to Chrome while maintaining the Firefox version. Complete migration plan included.
```

### Step 3: Let DEV Agent Work Independently
The feature brief contains:
- Complete architecture plan (shared codebase)
- Manifest V3 template
- Service Worker refactoring guide
- Build system updates
- Testing matrix
- Estimated 20-30 hours of work

---

## 📊 Migration Strategy Overview

### Current State (Firefox Only)
```
apps/extension-firefox/
├── src/              ← All TypeScript code (~40+ files)
├── public/           ← HTML, manifest, icons
├── dist/             ← Build output
└── esbuild.config.mjs
```

**Uses**:
- Manifest V2
- Persistent background script
- `browser.*` API (~20 files)

---

### Target State (Firefox + Chrome)
```
apps/
├── shared/
│   └── src/          ← All TypeScript code (moved here)
│       ├── background.ts (Service Worker compatible)
│       ├── content.ts
│       ├── popup/
│       ├── dashboard/
│       ├── onboarding/
│       └── shared/
│           └── browser-compat.ts (NEW - compatibility layer)
│
├── extension-firefox/
│   ├── src/ → symlink to ../shared/src/
│   ├── public/
│   │   └── manifest.json (V2, Firefox)
│   └── esbuild.config.mjs (paths to ../shared/src/)
│
└── extension-chrome/
    ├── src/ → symlink to ../shared/src/
    ├── public/
    │   └── manifest.json (V3, Chrome)
    └── esbuild.config.mjs (ESM format, paths to ../shared/src/)
```

**Both use**:
- Shared TypeScript code
- `webextension-polyfill` for compatibility
- Browser-specific manifests
- Browser-specific builds

---

## 🔑 Key Technical Changes

### 1. Browser API Compatibility

**Before (Firefox-specific)**:
```typescript
import browser from 'browser'; // Firefox-specific
await browser.storage.local.set({ key: value });
```

**After (Cross-browser)**:
```typescript
import { browser } from './shared/browser-compat'; // Works in both
await browser.storage.local.set({ key: value });
```

**Polyfill handles**: `browser.*` API in Chrome using webextension-polyfill

---

### 2. Manifest V2 → V3 (Chrome)

**Firefox (V2)**:
```json
{
  "manifest_version": 2,
  "background": {
    "scripts": ["background.js"],
    "persistent": true
  },
  "browser_action": {
    "default_popup": "popup/popup.html"
  }
}
```

**Chrome (V3)**:
```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup/popup.html"
  },
  "host_permissions": ["<all_urls>"]
}
```

---

### 3. Background Script → Service Worker

**Before (Persistent)**:
```typescript
// Global state (doesn't work in Service Worker)
let connectionState = { connected: false };

browser.runtime.onMessage.addListener((msg) => {
  connectionState.connected = true; // Lost when SW terminates!
});
```

**After (Event-driven)**:
```typescript
// No global state - use storage
browser.runtime.onMessage.addListener(async (msg) => {
  const state = await browser.storage.local.get('connectionState');
  state.connected = true;
  await browser.storage.local.set({ connectionState: state });
});
```

---

## ⏱️ Time Estimate

**Total**: 20-30 hours

**By Phase**:
1. Setup Shared Codebase (3-4 hours)
2. Compatibility Layer (2-3 hours)
3. Chrome Manifest V3 (2-3 hours)
4. Service Worker Adaptation (4-5 hours)
5. Build System (2-3 hours)
6. Chrome-Specific Fixes (3-4 hours)
7. Testing & Validation (4-6 hours)

---

## 🎯 Success Metrics

**Chrome port is successful when**:

### Build System
- [ ] Both Firefox and Chrome extensions build from shared code
- [ ] Firefox: `npm run build` outputs to `dist/`
- [ ] Chrome: `npm run build` outputs to `dist/`
- [ ] No TypeScript errors in either build

### Feature Parity (All 5 Features Work in Chrome)
- [ ] **Resume Upload**: 430KB+ files, chunked storage
- [ ] **Autofill**: Job application pages, split fields
- [ ] **Ollama**: Connection check, setup guide, custom endpoint
- [ ] **Dashboard**: Kanban board, drag-and-drop, edit/delete
- [ ] **Learned Values**: RL system, corrections, confidence scores

### Chrome-Specific
- [ ] Manifest V3 valid
- [ ] Service Worker starts and handles events
- [ ] No global state issues (Service Worker terminates correctly)
- [ ] Icons (16x16, 48x48, 128x128) present
- [ ] Loads in `chrome://extensions/` without errors

### Cross-Browser
- [ ] Same resume works in both browsers
- [ ] Same autofill behavior
- [ ] Same dashboard data
- [ ] Firefox still works (no regression)

---

## ✅ Acceptance Criteria Quick Check

**Setup**:
- [ ] `apps/shared/src/` contains all TypeScript code
- [ ] Symlinks created: `extension-firefox/src/` → `../shared/src/`
- [ ] Symlinks created: `extension-chrome/src/` → `../shared/src/`
- [ ] `webextension-polyfill` installed

**Compatibility**:
- [ ] `browser-compat.ts` created
- [ ] All 40+ files updated to use compatibility layer
- [ ] Firefox build still works (no regression)

**Chrome Extension**:
- [ ] Manifest V3 created
- [ ] Service Worker compatible background script
- [ ] Chrome build config created
- [ ] Icons (16x16, 48x48, 128x128) generated

**Testing**:
- [ ] Load in Chrome: `chrome://extensions/`
- [ ] Complete onboarding in Chrome
- [ ] Test autofill on job site in Chrome
- [ ] Test dashboard in Chrome
- [ ] Compare Firefox vs Chrome behavior

---

## 🔍 Quick Commands

### Setup
```bash
# Create shared structure
mkdir -p apps/shared/src
mv apps/extension-firefox/src/* apps/shared/src/
ln -s ../../shared/src apps/extension-firefox/src

# Create Chrome extension
mkdir -p apps/extension-chrome/{public,dist}
ln -s ../../shared/src apps/extension-chrome/src

# Install polyfill
cd apps/shared
npm install webextension-polyfill @types/webextension-polyfill

# Setup Chrome
cd apps/extension-chrome
npm init -y
npm install
```

### Build
```bash
# Build Firefox
cd apps/extension-firefox
npm run build

# Build Chrome
cd apps/extension-chrome
npm run build

# Package Chrome for Web Store
npm run package
# Creates offlyn-chrome.zip
```

### Test
```bash
# Firefox
cd apps/extension-firefox
npm run run:firefox

# Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select apps/extension-chrome/dist/
```

---

## 📚 Key Files

**Create** (6 files):
1. `apps/shared/src/shared/browser-compat.ts` (NEW)
2. `apps/extension-chrome/public/manifest.json` (NEW, V3)
3. `apps/extension-chrome/esbuild.config.mjs` (NEW)
4. `apps/extension-chrome/package.json` (NEW)
5. `apps/extension-chrome/README.md` (NEW)
6. `apps/extension-chrome/public/icons/` (16x16, 128x128)

**Modify** (~42 files):
7. `apps/shared/src/background.ts` (Service Worker compatible)
8. All TypeScript files with browser APIs (~40+ files)
9. `apps/extension-firefox/esbuild.config.mjs` (paths)

---

## 🚨 Critical Challenges

### 1. Service Worker Termination
**Problem**: Chrome Service Workers terminate after 30s idle  
**Solution**: No global state, use storage for everything

### 2. Browser API Differences
**Problem**: Some APIs renamed or changed in Chrome  
**Solution**: Use webextension-polyfill for compatibility

### 3. Manifest V3 CSP
**Problem**: More restrictive CSP in Chrome MV3  
**Solution**: No inline scripts, all scripts external (already done)

### 4. Testing Complexity
**Problem**: Need to test on both browsers for every change  
**Solution**: Automated testing, shared test suite

---

## 🎯 Recommended Implementation Order

### Week 1: Foundation (8-12 hours)
1. Setup shared codebase
2. Add compatibility layer
3. Update all imports
4. Verify Firefox still works

### Week 2: Chrome Basics (8-10 hours)
5. Create Manifest V3
6. Adapt Service Worker
7. Setup Chrome build
8. Load in Chrome

### Week 3: Testing & Polish (4-8 hours)
9. Test all 5 features
10. Fix Chrome-specific bugs
11. Cross-browser validation
12. Package for stores

---

## 📈 Market Impact

**Current**: Firefox only (~4% browser market share)  
**After Chrome**: Firefox + Chrome (~69% combined market share)

**User Reach**: ~17x increase in potential users

---

## 🚀 Future Extensions

After Chrome, the architecture supports:
- **Edge** (Chromium-based, similar to Chrome)
- **Brave** (Chromium-based)
- **Opera** (Chromium-based)
- **Safari** (WebKit, requires Safari-specific build)

**With shared codebase**: Adding new browsers is easier (just new manifest + build config)

---

**Ready to port to Chrome!** Start with Phase 1 (shared codebase setup). The DEV agent has everything needed in `docs/FEATURE_CHROME_EXTENSION.md`. 🚀
