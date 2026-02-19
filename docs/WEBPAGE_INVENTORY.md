# Offlyn Apply - Complete Webpage Inventory

## Overview
This document lists all HTML pages in the Offlyn Apply extension, their purpose, functionality, and how they fit into the user workflow.

---

## 🎯 Core UI Pages (User-Facing)

### 1. **Popup** (`public/popup/popup.html`)
**Type**: Browser Action Popup  
**Dimensions**: 300px width, variable height  
**Entry Point**: Click extension icon in browser toolbar

**Purpose**: Primary control center for the extension

**Key Features**:
- Extension enable/disable toggle
- Job detection status bar (shows current page info)
- Quick action buttons:
  - Auto-Fill (primary action)
  - Cover Letter Generator
  - Manage Profile
  - View Dashboard
- Quick stats display (Total applications, Interviewing count)
- Advanced section (collapsible):
  - View Learned Values
  - Clear Self-ID Data
  - Debug Profile Data
- Ollama connection status indicator
- Dry Run mode toggle

**User Workflow**:
1. User visits job application page
2. Clicks extension icon
3. Sees job info detected
4. Clicks "Auto-Fill" to fill form
5. Or clicks "Cover Letter" to generate letter

**Associated TypeScript**: `src/popup/popup.ts`

---

### 2. **Dashboard** (`public/dashboard/dashboard.html`)
**Type**: Full-Page Tab  
**Access**: Via "View Dashboard" button in popup  
**Entry Point**: Opens in new browser tab

**Purpose**: Comprehensive application tracking and analytics

**Key Features**:
- **Kanban Board Layout** with 5 status columns:
  - Submitted
  - Interviewing
  - Rejected
  - Accepted
  - Withdrawn
- **Drag-and-Drop**: Move application cards between statuses
- **Application Cards** with:
  - Company name
  - Position title
  - Application date
  - ATS detected (if available)
  - Status badge
  - Edit button (modal for status/notes)
  - Delete button (with confirmation)
- **Summary Stats Cards**:
  - Total applications
  - By status (Submitted, Interviewing, etc.)
  - Response rate
  - Unique companies
- **Charts** (Chart.js):
  - Applications over time (line chart)
  - Status breakdown (doughnut chart)
- **Search & Filter**:
  - Search by company, position, notes
  - Filter by status
- **Export**: CSV download of all applications
- **Empty State**: Encouraging message when no applications

**User Workflow**:
1. User clicks "View Dashboard" in popup
2. Sees Kanban board with all applications
3. Can drag cards to update status
4. Can edit/delete applications
5. Can export data to CSV

**Associated TypeScript**: `src/dashboard/dashboard.ts`

---

### 3. **Onboarding** (`public/onboarding/onboarding.html`)
**Type**: Full-Page Tab  
**Access**: Opens automatically on first install, or via "Manage Profile" in popup  
**Entry Point**: First-run experience or manual profile editing

**Purpose**: Initial setup and profile management

**Key Features**:
- **Multi-Step Wizard**:
  1. **Resume Upload** (optional)
     - Drag-and-drop or file picker
     - PDF parsing for auto-extraction
  2. **Personal Info**
     - Full name
     - Email
     - Phone number
     - Location (city, state, country)
  3. **Links**
     - LinkedIn profile
     - Portfolio URL
     - GitHub (optional)
  4. **Work Authorization**
     - Status dropdown
     - Visa status (if applicable)
  5. **Cover Letter Defaults** (optional)
     - Preferred tone
     - Key skills to highlight
  6. **Review & Confirm**
     - Summary of all entered data
     - Save to local storage

- **Progress Indicator**: Shows current step (e.g., "Step 2 of 6")
- **Navigation**: Back/Next buttons
- **Validation**: Real-time field validation
- **Privacy Message**: "Your data stays on your device - never uploaded"

**User Workflow**:
1. First install → Automatically opens onboarding
2. User uploads resume (optional)
3. Fills in personal details
4. Reviews and saves profile
5. Extension ready to use

**Associated TypeScript**: `src/onboarding/onboarding.ts`

---

## 🧪 Test Pages (Development Only)

These HTML files are for testing specific extension features during development. They are **not** part of the production extension.

### 4. **Job Application Test** (`job-application-test.html`)
**Purpose**: Mock job application form for testing autofill functionality

**Features**:
- Sample form fields (name, email, phone, location, etc.)
- Various input types (text, email, tel, select, textarea)
- Mimics real job application forms (LinkedIn/Indeed style)
- Used to test form detection and autofill logic

---

### 5. **Dropdown Test** (`test-dropdown.html`)
**Purpose**: Test dropdown/select field handling

**Features**:
- Various dropdown styles
- Single-select and multi-select
- Tests option selection logic
- Custom select components

---

### 6. **Phone Split Test** (`test-phone-split.html`)
**Purpose**: Test phone number field parsing (split format)

**Features**:
- Phone fields split into area code, prefix, suffix
- Tests phone number formatting logic
- International phone formats

---

### 7. **Work Authorization Test** (`test-workauth.html`)
**Purpose**: Test work authorization field detection and filling

**Features**:
- Work authorization dropdowns
- Visa status fields
- Sponsorship questions
- Various ATS implementations

---

### 8. **Resume Upload Test** (`test-resume-upload.html`)
**Purpose**: Test resume file upload functionality

**Features**:
- File upload inputs
- Drag-and-drop zones
- Multiple file formats (PDF, DOCX, TXT)
- Upload validation

---

### 9. **Self-ID Test** (`test-selfid.html`)
**Purpose**: Test self-identification (EEO) field handling

**Features**:
- Gender dropdown
- Race/ethnicity checkboxes
- Veteran status
- Disability status
- Tests sensitive data handling and "prefer not to answer" options

---

## 🎨 In-Page Components (Injected by Content Script)

These are **not** separate HTML files but are dynamically created and injected into job application pages by the content script.

### 10. **Field Summary Panel** (`src/ui/field-summary.ts`)
**Type**: Floating overlay panel  
**Injection**: When job page detected

**Purpose**: Show detected fields and autofill progress

**Features**:
- Minimizes to small cube icon after 3 seconds
- Draggable
- Shows field count and autofill status
- Quick action buttons (Auto-Fill, Cover Letter)
- Expandable details view

---

### 11. **Cover Letter Panel** (`src/ui/cover-letter-panel.ts`)
**Type**: Floating side panel  
**Injection**: When "Generate Cover Letter" clicked

**Purpose**: Display AI-generated cover letter

**Features**:
- Generated cover letter text
- Copy to clipboard button
- Regenerate option
- Close button

---

### 12. **Notification Toasts** (`src/ui/notification.ts`)
**Type**: Temporary overlay notification  
**Injection**: On success/error events

**Purpose**: Show feedback messages

**Features**:
- Success (green)
- Error (red)
- Info (blue)
- Warning (amber)
- Auto-dismiss after 3-5 seconds

---

### 13. **Progress Indicator** (`src/ui/progress-indicator.ts`)
**Type**: Loading overlay  
**Injection**: During async operations

**Purpose**: Show operation progress

**Features**:
- Spinner animation
- Progress percentage (if available)
- Operation description

---

### 14. **Inline Suggestion Tiles** (`src/ui/inline-suggestion-tile.ts`)
**Type**: Small suggestion cards near form fields  
**Injection**: When field focused and suggestions available

**Purpose**: Show learned values for quick selection

**Features**:
- Hover-to-preview
- Click-to-apply
- Multiple suggestions per field

---

### 15. **Field Highlighter** (`src/ui/field-highlighter.ts`)
**Type**: Visual highlight effect  
**Injection**: When field is filled or validated

**Purpose**: Visual feedback for filled fields

**Features**:
- Green glow for success
- Red glow for errors
- Animated transition

---

## 📊 Page Relationship Diagram

```
Extension Install
       ↓
   Onboarding.html (first run)
       ↓
   [User Profile Saved]
       ↓
┌──────────────────────────┐
│   Browser Action Icon    │
└──────────────────────────┘
       ↓ (click)
   Popup.html
       ↓
   ┌────────────────┬─────────────────┬───────────────┐
   │                │                 │               │
   ↓                ↓                 ↓               ↓
Auto-Fill    Cover Letter     Manage Profile   View Dashboard
   │                │                 │               │
   ↓                ↓                 ↓               ↓
In-Page      Cover Letter      Onboarding.html   Dashboard.html
Components      Panel          (profile edit)    (full tracking)
```

---

## 📦 Manifest Configuration

From `dist/manifest.json`:

**Browser Action**:
- Default popup: `popup/popup.html`
- Default title: "Offlyn Apply"
- Icon: 48px and 96px

**Permissions**:
- storage (save profile and applications)
- unlimitedStorage (for large data)
- tabs (open dashboard in new tab)
- menus (context menu integration)
- <all_urls> (detect job pages on any site)
- localhost:11434 (Ollama AI local server)

**Content Scripts**:
- Matches: `<all_urls>`
- Script: `content.js`
- Run at: `document_idle`
- All frames: true

---

## 🔄 User Journey Flow

### First-Time User
1. Installs extension from Firefox Add-ons
2. **Onboarding.html** opens automatically
3. User uploads resume and fills profile
4. User navigates to job site
5. Extension detects job page
6. **Popup.html** shows "Job detected"
7. User clicks "Auto-Fill"
8. In-page components show progress
9. Form fields filled automatically
10. User reviews and submits application
11. Application saved to dashboard
12. User can view **Dashboard.html** anytime

### Returning User
1. Visits job page
2. Clicks extension icon → **Popup.html**
3. Clicks "Auto-Fill"
4. Application tracked automatically
5. Views **Dashboard.html** to see all applications

---

## 🎯 Page Access Summary

| Page | Access Method | Frequency |
|------|---------------|-----------|
| Popup | Click toolbar icon | Every use |
| Dashboard | Click "View Dashboard" in popup | Periodic review |
| Onboarding | First install or "Manage Profile" | Once/occasional |
| Test Pages | Developer only (not in build) | Testing |
| In-Page Components | Automatic injection | Every job page |

---

## 📝 Notes

### Build Output
- All `public/*.html` files are copied to `dist/` during build
- TypeScript files in `src/` are compiled to `dist/*.js`
- Test HTML files are **not** included in production build

### Future Pages (Planned)
Based on UX refinement specs:
- **Settings Page** - Dedicated settings page (moved from popup inline)
- **Help/Tutorial** - Interactive guide for new users
- **Privacy Policy** - In-extension privacy information

---

## 🚀 Quick Reference for Developers

**Want to modify the popup?**
- HTML: `public/popup/popup.html`
- Logic: `src/popup/popup.ts`

**Want to modify the dashboard?**
- HTML: `public/dashboard/dashboard.html`
- Logic: `src/dashboard/dashboard.ts`

**Want to modify onboarding?**
- HTML: `public/onboarding/onboarding.html`
- Logic: `src/onboarding/onboarding.ts`

**Want to modify in-page UI?**
- Field summary: `src/ui/field-summary.ts`
- Cover letter: `src/ui/cover-letter-panel.ts`
- Notifications: `src/ui/notification.ts`

---

**Last Updated**: February 16, 2026  
**Total User-Facing Pages**: 3 (Popup, Dashboard, Onboarding)  
**Total In-Page Components**: 6 (Field Summary, Cover Letter, Notifications, etc.)  
**Total Test Pages**: 6 (Development only)
