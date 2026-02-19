# Feature Brief: Chrome Extension Port (Offlyn Apply)

## 🎯 Feature Overview

**Feature Name**: Chrome Extension Version of Offlyn Apply  
**Priority**: High (Expand browser support)  
**Complexity**: High  
**Estimated Effort**: 20-30 hours  
**Agent Assignment**: NEW DEV AGENT (Separate Chat)

**Objective**: Create a Chrome version of the Offlyn Apply extension, maintaining feature parity with Firefox while adapting to Chrome's requirements (Manifest V3, Service Worker, chrome.* APIs).

---

## 📋 Project Context

### What Was Accomplished (Firefox Extension)

The team has successfully implemented **5 major features** in the Firefox extension:

1. ✅ **Learned Values with Reinforcement Learning** - AI learns from user corrections
2. ✅ **Dashboard Data Fix & Test Generator** - Working metrics dashboard
3. ✅ **Autofill Bug Fixes** - Resume upload with chunked storage (430KB+ files)
4. ✅ **Onboarding Redesign** - Split phone/location fields + self-ID section
5. ✅ **Ollama Setup & Configuration** - AI detection, troubleshooting, custom endpoints

**Current Tech Stack**:
- **Manifest V2** (Firefox)
- **TypeScript** + esbuild
- **browser.* API** (~20 files using it)
- **Background script** (persistent)
- **Local AI** (Ollama)
- **Browser storage** (local, chunked for large files)

---

## 🔍 Current Firefox Extension Analysis

### File Structure
```
apps/extension-firefox/
├── public/
│   ├── manifest.json (Manifest V2, Firefox-specific)
│   ├── icons/
│   ├── popup/popup.html
│   ├── dashboard/dashboard.html
│   ├── onboarding/onboarding.html
│   └── settings/settings.html
├── src/
│   ├── background.ts (persistent background script)
│   ├── content.ts (content script)
│   ├── popup/popup.ts
│   ├── dashboard/dashboard.ts
│   ├── onboarding/onboarding.ts
│   ├── settings/settings.ts
│   └── shared/ (20+ utility files)
├── esbuild.config.mjs
└── package.json
```

### Browser API Usage

**Files using `browser.*` API** (~20 files):
- `background.ts` - 10 uses (storage, tabs, runtime, menus)
- `storage.ts` - 15 uses (storage.local)
- `popup.ts` - 17 uses (tabs, storage, runtime)
- `content.ts` - 8 uses (runtime, storage)
- `onboarding.ts` - 24 uses (storage, tabs)
- `dashboard.ts` - 5 uses (storage, tabs)
- `settings.ts` - 10 uses (storage)
- Plus 13 more shared utility files

### Key Features Using Browser APIs
1. **Storage** - Chunked resume storage, profile data, learned patterns
2. **Tabs** - Opening dashboard/settings pages
3. **Runtime** - Message passing between content/background
4. **Menus** - Context menu integration
5. **All URLs** - Content script injection

---

## 🎯 Chrome Extension Requirements

### Manifest V3 (Required for Chrome)

**Major Changes from V2**:

1. **Service Worker** instead of background script
   - No persistent background page
   - Terminates when idle
   - Event-driven architecture
   - No DOM access

2. **Host Permissions** separated from permissions
   ```json
   "host_permissions": ["<all_urls>"]
   ```

3. **Action API** instead of browser_action
   ```json
   "action": {
     "default_popup": "popup/popup.html"
   }
   ```

4. **Content Security Policy** changes
   - More restrictive
   - No inline scripts
   - No remote code execution

5. **chrome.* namespace** instead of browser.*
   - Some APIs renamed
   - Some APIs changed behavior

---

## 🏗️ Migration Strategy

### Recommended Approach: Shared Codebase

**Structure**:
```
apps/
├── extension-firefox/  (existing)
│   ├── public/
│   │   └── manifest.json (V2, Firefox)
│   ├── src/ → SYMLINK to ../shared/src/
│   ├── esbuild.config.mjs
│   └── package.json
│
├── extension-chrome/   (NEW)
│   ├── public/
│   │   └── manifest.json (V3, Chrome)
│   ├── src/ → SYMLINK to ../shared/src/
│   ├── esbuild.config.mjs
│   └── package.json
│
└── shared/  (NEW)
    └── src/
        ├── background.ts (compatible with both)
        ├── content.ts
        ├── popup/
        ├── dashboard/
        ├── onboarding/
        ├── settings/
        └── shared/
```

**Benefits**:
- ✅ Single codebase, less maintenance
- ✅ Bug fixes apply to both
- ✅ New features work on both browsers
- ✅ Code reuse ~95%

**Challenges**:
- Need browser detection logic
- Some APIs differ between browsers
- Need separate build configs

---

## 📦 Implementation Plan

### Phase 1: Setup Shared Codebase (3-4 hours)

**Step 1: Create Directory Structure**
```bash
# Create new directories
mkdir -p apps/shared/src
mkdir -p apps/extension-chrome/public
mkdir -p apps/extension-chrome/dist

# Move existing src to shared
mv apps/extension-firefox/src/* apps/shared/src/

# Create symlinks
ln -s ../../shared/src apps/extension-firefox/src
ln -s ../../shared/src apps/extension-chrome/src
```

**Step 2: Install webextension-polyfill**
```bash
cd apps/shared
npm install webextension-polyfill
npm install --save-dev @types/webextension-polyfill
```

**Benefits**: Provides `browser.*` API that works in both Firefox and Chrome

---

### Phase 2: Add Browser Compatibility Layer (2-3 hours)

**Create `apps/shared/src/shared/browser-compat.ts`**:

```typescript
/**
 * Browser compatibility layer
 * Provides unified API for Firefox and Chrome
 */

// Import polyfill for Chrome
import browser from 'webextension-polyfill';

// Detect browser
export const isFirefox = typeof (globalThis as any).browser !== 'undefined';
export const isChrome = typeof (globalThis as any).chrome !== 'undefined' && !isFirefox;

// Export unified browser API
export { browser };

/**
 * Get browser-specific manifest version
 */
export function getManifestVersion(): number {
  return browser.runtime.getManifest().manifest_version;
}

/**
 * Check if running in Manifest V3 (Chrome)
 */
export function isManifestV3(): boolean {
  return getManifestVersion() === 3;
}

/**
 * Get storage API (compatible with both browsers)
 */
export const storage = {
  local: browser.storage.local,
  sync: browser.storage.sync,
};

/**
 * Get tabs API (compatible with both browsers)
 */
export const tabs = browser.tabs;

/**
 * Get runtime API (compatible with both browsers)
 */
export const runtime = browser.runtime;

/**
 * Context menus API (has different names in Chrome MV3)
 */
export const contextMenus = isManifestV3() 
  ? browser.contextMenus 
  : (browser as any).menus || browser.contextMenus;

/**
 * Browser action API (different in V2 vs V3)
 */
export const action = isManifestV3()
  ? browser.action
  : (browser as any).browserAction;
```

**Step 3: Update All Files to Use Compatibility Layer**

Replace:
```typescript
// OLD
import browser from 'browser';
```

With:
```typescript
// NEW
import { browser, storage, tabs, runtime } from './shared/browser-compat';
```

**Files to Update** (~20 files):
- `background.ts`
- `content.ts`
- `popup/popup.ts`
- `dashboard/dashboard.ts`
- `onboarding/onboarding.ts`
- `settings/settings.ts`
- All `shared/*.ts` files (storage, profile, learning, etc.)

---

### Phase 3: Create Chrome Manifest V3 (2-3 hours)

**Create `apps/extension-chrome/public/manifest.json`**:

```json
{
  "manifest_version": 3,
  "name": "Offlyn Apply - Job Application Assistant",
  "version": "0.1.0",
  "description": "Smart job application assistant - auto-fill forms, track applications, generate cover letters",
  
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  
  "permissions": [
    "storage",
    "unlimitedStorage",
    "tabs",
    "contextMenus"
  ],
  
  "host_permissions": [
    "<all_urls>",
    "http://localhost:11434/*",
    "http://127.0.0.1:11434/*"
  ],
  
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle",
      "all_frames": true
    }
  ],
  
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "Offlyn Apply"
  },
  
  "web_accessible_resources": [
    {
      "resources": [
        "icons/monogram.png",
        "icons/primary-logo.png",
        "icons/cube-48.png",
        "icons/header-icon-24.png"
      ],
      "matches": ["<all_urls>"]
    }
  ],
  
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

**Key Differences from Firefox V2**:
1. `manifest_version: 3` (was 2)
2. `service_worker` instead of `background.scripts`
3. `action` instead of `browser_action`
4. `host_permissions` separated from `permissions`
5. `web_accessible_resources` is now an array of objects
6. CSP is now an object

---

### Phase 4: Adapt Background Script for Service Worker (4-5 hours)

**Challenge**: Service workers don't persist, terminate when idle

**Solution**: Event-driven architecture

**Update `apps/shared/src/background.ts`**:

```typescript
import { browser, isManifestV3 } from './shared/browser-compat';

// Service Worker compatible - no global state
// All state must be in storage

/**
 * Initialize extension on install
 */
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('[Background] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // First install - open onboarding
    await browser.tabs.create({
      url: browser.runtime.getURL('onboarding/onboarding.html')
    });
  }
});

/**
 * Handle messages from content scripts
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', message.type);
  
  // Handle different message types
  switch (message.type) {
    case 'AUTO_FILL':
      handleAutoFill(message.data, sender.tab?.id);
      break;
    case 'SUBMIT_ATTEMPT':
      handleSubmit(message.data);
      break;
    case 'CHECK_OLLAMA':
      handleOllamaCheck().then(sendResponse);
      return true; // Async response
    default:
      console.warn('[Background] Unknown message type:', message.type);
  }
});

// ... rest of handlers (all async, no global state)

/**
 * IMPORTANT: For Manifest V3 (Chrome), avoid global variables
 * Use browser.storage for any state that needs to persist
 */

if (isManifestV3()) {
  console.log('[Background] Running as Service Worker (Manifest V3)');
} else {
  console.log('[Background] Running as persistent background script (Manifest V2)');
}
```

**Key Changes**:
- ❌ No global variables (Service Worker terminates)
- ✅ All state in `browser.storage`
- ✅ Event-driven handlers only
- ✅ Async message handling
- ✅ Lazy loading for heavy operations

---

### Phase 5: Update Build System (2-3 hours)

**Create `apps/extension-chrome/esbuild.config.mjs`**:

```javascript
import * as esbuild from 'esbuild';
import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const watch = process.argv.includes('--watch');

// Copy public files to dist
function copyPublicFiles() {
  const publicDir = join(__dirname, 'public');
  const distDir = join(__dirname, 'dist');
  
  function copyRecursive(src, dest) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    
    const entries = readdirSync(src);
    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      const stat = statSync(srcPath);
      
      if (stat.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyRecursive(publicDir, distDir);
}

// Build configuration (Chrome-specific)
const buildOptions = {
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'esm', // ES modules for Service Worker
  sourcemap: watch,
  minify: !watch,
  define: {
    'process.env.NODE_ENV': watch ? '"development"' : '"production"',
    'process.env.BROWSER': '"chrome"', // Browser flag
  },
};

// Custom output paths (same as Firefox)
const pathMap = {
  '../shared/src/background.ts': 'dist/background.js',
  '../shared/src/content.ts': 'dist/content.js',
  '../shared/src/popup/popup.ts': 'dist/popup/popup.js',
  '../shared/src/onboarding/onboarding.ts': 'dist/onboarding/onboarding.js',
  '../shared/src/dashboard/dashboard.ts': 'dist/dashboard/dashboard.js',
  '../shared/src/settings/settings.ts': 'dist/settings/settings.js',
};

async function build() {
  try {
    // Copy public files first
    copyPublicFiles();
    
    // Build each entry point separately
    for (const [entry, outfile] of Object.entries(pathMap)) {
      await esbuild.build({
        ...buildOptions,
        entryPoints: [entry],
        outfile,
      });
    }
    
    console.log('Chrome extension build complete!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

if (watch) {
  // Watch mode
  async function watchBuild() {
    copyPublicFiles();
    
    const contexts = [];
    for (const [entry, outfile] of Object.entries(pathMap)) {
      const ctx = await esbuild.context({
        ...buildOptions,
        entryPoints: [entry],
        outfile,
      });
      contexts.push(ctx);
    }
    
    await Promise.all(contexts.map(ctx => ctx.watch()));
    console.log('Watching Chrome extension for changes...');
  }
  
  watchBuild().catch(err => {
    console.error('Watch setup failed:', err);
    process.exit(1);
  });
} else {
  build();
}
```

**Key Differences from Firefox config**:
- `format: 'esm'` for Service Worker (was 'iife')
- `BROWSER` env variable set to `'chrome'`
- Paths point to `../shared/src/`

---

**Create `apps/extension-chrome/package.json`**:

```json
{
  "name": "offlyn-chrome-extension",
  "version": "0.1.0",
  "description": "Chrome WebExtension for job application automation",
  "type": "module",
  "scripts": {
    "build": "node esbuild.config.mjs",
    "dev": "node esbuild.config.mjs --watch",
    "package": "cd dist && zip -r ../offlyn-chrome.zip .",
    "lint": "echo 'Linting not configured'"
  },
  "keywords": [
    "chrome",
    "webextension",
    "job-application",
    "automation"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/webextension-polyfill": "^0.10.7",
    "esbuild": "^0.19.8",
    "typescript": "^5.3.3"
  },
  "dependencies": {
    "webextension-polyfill": "^0.10.0",
    "ai": "^6.0.73",
    "ollama-ai-provider-v2": "^2.0.0",
    "zod": "^4.1.8"
  }
}
```

---

### Phase 6: Handle Chrome-Specific Differences (3-4 hours)

**1. Storage Quota Differences**

Chrome has stricter storage limits:
- `sync`: 100KB (same as Firefox)
- `local`: No quota (but subject to disk space)

**Already handled**: Resume chunking (100KB chunks) works for both!

---

**2. Ollama Connection (localhost)**

Chrome may block localhost connections from extensions in some cases.

**Solution**: Already using direct `fetch()` calls, which work in both browsers.

---

**3. Content Script Injection**

Chrome MV3 requires explicit declaration in manifest (already done).

**No changes needed**.

---

**4. Icon Sizes**

Chrome requires different icon sizes:
- 16x16 (toolbar)
- 48x48 (extension management)
- 128x128 (Chrome Web Store)

**Action**: Generate 16x16 and 128x128 icons from existing assets.

---

### Phase 7: Testing & Validation (4-6 hours)

**Test Matrix**:

| Feature | Firefox | Chrome | Notes |
|---------|---------|--------|-------|
| Resume upload (430KB+) | ✅ | ⏳ | Test chunked storage |
| Autofill | ✅ | ⏳ | Test on job sites |
| Ollama connection | ✅ | ⏳ | Test localhost:11434 |
| Dashboard | ✅ | ⏳ | Test drag-and-drop |
| Learned values | ✅ | ⏳ | Test RL system |
| Onboarding | ✅ | ⏳ | Test split fields |
| Self-ID | ✅ | ⏳ | Test multi-select |
| Settings | ✅ | ⏳ | Test Ollama config |

**Testing Steps**:

1. **Build Chrome Extension**:
   ```bash
   cd apps/extension-chrome
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `apps/extension-chrome/dist/` folder

3. **Test All Features**:
   - Complete onboarding (upload resume, Ollama setup, split fields, self-ID)
   - Test autofill on job application page
   - Test resume upload (large file)
   - Test dashboard (add/edit/delete applications)
   - Test learned values (manual correction, submit, verify learning)
   - Test Ollama connection (custom endpoint, retry)

4. **Cross-Browser Comparison**:
   - Same resume → both browsers
   - Same job site → both browsers
   - Same autofill behavior → both browsers

---

## 📂 Files to Create/Modify

### CREATE (New Chrome Extension)

1. **`apps/extension-chrome/`** (NEW directory)
   - `public/manifest.json` (Manifest V3)
   - `public/icons/` (16x16, 48x48, 128x128)
   - `esbuild.config.mjs` (Chrome build config)
   - `package.json` (Chrome dependencies)
   - `README.md` (Chrome-specific docs)

2. **`apps/shared/`** (NEW directory)
   - `src/` → All existing TypeScript code moved here
   - `src/shared/browser-compat.ts` (NEW - compatibility layer)

### MODIFY (Existing Files)

3. **`apps/extension-firefox/`** (existing)
   - `src/` → Convert to symlink to `../shared/src/`
   - `package.json` → Add webextension-polyfill
   - `esbuild.config.mjs` → Update paths to `../shared/src/`

4. **All TypeScript files** (~40+ files)
   - Replace `import browser` with `import { browser } from './shared/browser-compat'`
   - Update ~20 files with browser API usage

5. **`apps/shared/src/background.ts`** (critical)
   - Remove global state
   - Make event-driven
   - Service Worker compatible

---

## ✅ Acceptance Criteria

### Build System
- [ ] Shared codebase builds for both Firefox and Chrome
- [ ] Firefox build outputs to `apps/extension-firefox/dist/`
- [ ] Chrome build outputs to `apps/extension-chrome/dist/`
- [ ] No TypeScript errors in either build
- [ ] Both extensions load without errors

### Compatibility Layer
- [ ] `browser-compat.ts` provides unified API
- [ ] Works in Firefox (Manifest V2)
- [ ] Works in Chrome (Manifest V3)
- [ ] All 20+ files using browser APIs updated

### Chrome Extension
- [ ] Manifest V3 valid
- [ ] Service Worker starts and handles events
- [ ] No global state in background script
- [ ] All icons (16x16, 48x48, 128x128) present

### Feature Parity
- [ ] Resume upload works (430KB+ files, chunked storage)
- [ ] Autofill works on job application pages
- [ ] Ollama connection works (localhost:11434)
- [ ] Dashboard works (Kanban, drag-and-drop, edit/delete)
- [ ] Learned values work (RL system, corrections)
- [ ] Onboarding works (Ollama setup, split fields, self-ID)
- [ ] Settings works (Ollama config, custom endpoint)

### Cross-Browser Testing
- [ ] Same resume works in both browsers
- [ ] Same autofill behavior in both browsers
- [ ] Same dashboard data in both browsers
- [ ] Same learned patterns in both browsers

### Overall
- [ ] Both extensions build successfully
- [ ] No console errors in either browser
- [ ] All 5 implemented features work in Chrome
- [ ] No regression in Firefox

---

## 🚨 Common Pitfalls to Avoid

### 1. Service Worker Termination

**Problem**: Service Worker terminates after 30 seconds of inactivity  
**Solution**: No global state, use `browser.storage` for everything

### 2. ESM vs IIFE

**Problem**: Service Worker requires ES modules, not IIFE  
**Solution**: Set `format: 'esm'` in Chrome build config

### 3. Manifest Differences

**Problem**: V3 manifest structure is different from V2  
**Solution**: Use separate manifest files, don't try to share

### 4. Storage Quota

**Problem**: Chrome may have different storage limits  
**Solution**: Already handled with chunked storage (100KB chunks)

### 5. Ollama CORS

**Problem**: Chrome may block localhost:11434 requests  
**Solution**: Already using direct `fetch()`, works in both browsers

---

## 📊 Expected Outcomes

### Scenario A: Successful Chrome Port

**Console Output**:
```
[Background] Running as Service Worker (Manifest V3)
[Ollama] Connection check: http://localhost:11434
[Ollama] ✓ Connected
[Autofill] Generating fill mappings for 25 fields
[Autofill] ✓ Filled 22 fields
[Resume] Reassembled 4 chunks (430KB)
[Resume] ✓ Auto-uploaded resume
```

**Result**: Chrome extension works identically to Firefox

---

### Scenario B: Service Worker Compatibility Issue

**Problem**: Background script uses global state  
**Console**:
```
[Background] Service Worker terminated
[Background] Lost connection
[Error] Cannot access global variable after restart
```

**Solution**: Refactor to use `browser.storage` for all state

---

## ⏱️ Time Estimates

- **Phase 1** (Setup Shared Codebase): 3-4 hours
- **Phase 2** (Compatibility Layer): 2-3 hours
- **Phase 3** (Chrome Manifest V3): 2-3 hours
- **Phase 4** (Service Worker Adaptation): 4-5 hours
- **Phase 5** (Build System): 2-3 hours
- **Phase 6** (Chrome-Specific Fixes): 3-4 hours
- **Phase 7** (Testing & Validation): 4-6 hours

**Total**: 20-30 hours

---

## 🎯 Success Metrics

**Chrome port is successful when**:

1. **Builds**: Both Firefox and Chrome extensions build from shared codebase
2. **Loads**: Chrome extension loads without errors
3. **Feature Parity**: All 5 implemented features work in Chrome
4. **No Regression**: Firefox extension still works perfectly
5. **Same UX**: User experience identical in both browsers
6. **Same Data**: Profile/resume/learned patterns work across browsers

---

## 📚 Reference Materials

### Chrome Extension Documentation
- **Manifest V3 Migration**: https://developer.chrome.com/docs/extensions/mv3/intro/
- **Service Workers**: https://developer.chrome.com/docs/extensions/mv3/service_workers/
- **Chrome APIs**: https://developer.chrome.com/docs/extensions/reference/
- **Migration Checklist**: https://developer.chrome.com/docs/extensions/mv3/mv3-migration-checklist/

### webextension-polyfill
- **GitHub**: https://github.com/mozilla/webextension-polyfill
- **Docs**: https://github.com/mozilla/webextension-polyfill/blob/master/README.md

---

## 🔄 Handoff Instructions for DEV Agent

### When You Start Your New Chat:

1. **Read This Document First** - Complete Chrome migration plan

2. **Understand the Architecture**:
   - Shared codebase in `apps/shared/src/`
   - Browser-specific configs in `apps/extension-firefox/` and `apps/extension-chrome/`
   - Compatibility layer (`browser-compat.ts`) bridges Firefox and Chrome

3. **Start with Phase 1 (Setup)**:
   - Create `apps/shared/` directory
   - Move existing `src/` to `apps/shared/src/`
   - Create symlinks
   - Install webextension-polyfill

4. **Then Phase 2 (Compatibility)**:
   - Create `browser-compat.ts`
   - Update all files to use compatibility layer
   - Test Firefox still works

5. **Then Phase 3 (Chrome Manifest)**:
   - Create Manifest V3
   - Generate missing icons
   - Set up Chrome directory

6. **Then Phase 4 (Service Worker)**:
   - Refactor `background.ts`
   - Remove global state
   - Make event-driven

7. **Then Phase 5 (Build)**:
   - Create Chrome build config
   - Test builds for both browsers

8. **Then Phase 6 (Fixes)**:
   - Handle Chrome-specific differences
   - Test Ollama connection

9. **Finally Phase 7 (Testing)**:
   - Load in Chrome
   - Test all 5 features
   - Compare with Firefox

10. **Commands**:
    ```bash
    # Build Firefox
    cd apps/extension-firefox
    npm run build
    npm run run:firefox
    
    # Build Chrome
    cd apps/extension-chrome
    npm run build
    # Load dist/ in chrome://extensions/
    ```

---

## 🚀 Quick Commands

```bash
# Setup
mkdir -p apps/shared/src apps/extension-chrome/{public,dist}
mv apps/extension-firefox/src/* apps/shared/src/
ln -s ../../shared/src apps/extension-firefox/src
ln -s ../../shared/src apps/extension-chrome/src

# Install
cd apps/shared && npm install webextension-polyfill @types/webextension-polyfill
cd apps/extension-chrome && npm install

# Build both
cd apps/extension-firefox && npm run build
cd apps/extension-chrome && npm run build

# Package Chrome extension
cd apps/extension-chrome && npm run package
# Creates offlyn-chrome.zip
```

---

---

## 🏗️ Architecture Diagrams

### Current Architecture (Firefox Only)

```
┌─────────────────────────────────────────┐
│   apps/extension-firefox/               │
│   ┌─────────────────────────────────┐   │
│   │  src/ (TypeScript)              │   │
│   │  ├── background.ts              │   │
│   │  ├── content.ts                 │   │
│   │  ├── popup/                     │   │
│   │  ├── dashboard/                 │   │
│   │  ├── onboarding/                │   │
│   │  └── shared/ (20+ files)        │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │  public/                        │   │
│   │  ├── manifest.json (V2)         │   │
│   │  └── *.html                     │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │  esbuild → dist/                │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

Browser Support: Firefox only (4% market share)
```

---

### Target Architecture (Firefox + Chrome)

```
┌──────────────────────────────────────────────────────────────────┐
│                    apps/shared/                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  src/ (Shared TypeScript - 95% reusable)                 │   │
│   │  ├── background.ts (Service Worker compatible)           │   │
│   │  ├── content.ts                                          │   │
│   │  ├── popup/                                              │   │
│   │  ├── dashboard/                                          │   │
│   │  ├── onboarding/                                         │   │
│   │  └── shared/                                             │   │
│   │      └── browser-compat.ts (NEW - compatibility layer)   │   │
│   └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                               ↓
         ┌─────────────────────┴─────────────────────┐
         ↓                                           ↓
┌──────────────────────────┐        ┌──────────────────────────┐
│  extension-firefox/      │        │  extension-chrome/       │
│  ┌────────────────────┐  │        │  ┌────────────────────┐  │
│  │ src/ → symlink     │  │        │  │ src/ → symlink     │  │
│  └────────────────────┘  │        │  └────────────────────┘  │
│  ┌────────────────────┐  │        │  ┌────────────────────┐  │
│  │ public/            │  │        │  │ public/            │  │
│  │ manifest.json (V2) │  │        │  │ manifest.json (V3) │  │
│  └────────────────────┘  │        │  └────────────────────┘  │
│  ┌────────────────────┐  │        │  ┌────────────────────┐  │
│  │ esbuild (IIFE)     │  │        │  │ esbuild (ESM)      │  │
│  │ → dist/            │  │        │  │ → dist/            │  │
│  └────────────────────┘  │        │  └────────────────────┘  │
└──────────────────────────┘        └──────────────────────────┘
         ↓                                       ↓
    Firefox Store                          Chrome Web Store

Browser Support: Firefox (4%) + Chrome (65%) = 69% combined
```

---

## 🔄 Browser Compatibility Layer

### How It Works

**File**: `apps/shared/src/shared/browser-compat.ts`

```typescript
import browser from 'webextension-polyfill';

// Detect browser
export const isFirefox = /* detection logic */;
export const isChrome = /* detection logic */;

// Detect manifest version
export const isManifestV3 = /* version check */;

// Export unified API
export { browser };
export const storage = browser.storage.local;
export const tabs = browser.tabs;
export const runtime = browser.runtime;
```

**Usage in any file**:
```typescript
import { browser, storage, isChrome } from './shared/browser-compat';

// Works in both Firefox and Chrome!
await storage.set({ key: value });

// Browser-specific logic when needed
if (isChrome) {
  // Chrome-only code
}
```

---

**Ready to port to Chrome!** Start with Phase 1 (shared codebase setup) to establish the foundation. 🚀

---

## 📈 Estimated Timeline

**Full-Time Work** (8 hours/day):
- Week 1: Setup + Compatibility Layer (5 days)
- Week 2: Manifest V3 + Service Worker (5 days)
- Week 3: Build System + Testing (5 days)
- **Total: 3 weeks (20-30 hours)**

**Part-Time Work** (4 hours/day):
- **Total: 5-6 weeks**

**Focused Sprint** (12 hours/day):
- **Total: 2-2.5 weeks**
