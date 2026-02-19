# Feature Brief: Autofill Bug Fixes (Resume Upload + Skipped Fields)

## 🎯 Feature Overview

**Feature Name**: Autofill Bug Fixes - Resume Upload & Skipped Fields  
**Priority**: Critical (Core functionality broken)  
**Complexity**: Medium  
**Estimated Effort**: 8-12 hours (updated with storage fix)
- Part 0 (Storage Fix): 2-3 hours
- Part 1 (Diagnostic Logging): 2-3 hours  
- Part 2 (Resume Upload UX): 1-2 hours
- Part 3 (Skipped Fields): 2-3 hours
- Part 4 (Testing): 1-2 hours  
**Agent Assignment**: NEW DEV AGENT (Separate Chat)

**Objective**: Fix two critical autofill bugs:
1. **Resume not being attached** to file upload fields
2. **Form fields being skipped** (some values not filled)

---

## 📋 Project Context (For New Agent)

### What is Offlyn Apply?
- Firefox browser extension for job application automation
- Auto-fills job application forms using user profile
- Attaches resume to file upload fields
- **100% local** - all data stays on device
- Built with TypeScript

### Design System (For UI Updates)
**Brand Colors**:
- Navy: `#0F172A`
- Green: `#27E38D`
- No gradients, no emojis

### Current Architecture
```
apps/extension-firefox/
├── src/
│   ├── content.ts             - Main autofill orchestration + resume upload
│   ├── shared/
│   │   ├── autofill.ts        - Field matching logic
│   │   ├── profile.ts         - User profile type
│   │   └── field-data-validator.ts - Field validation
│   └── ui/
│       └── notification.ts    - Show success/error messages
```

---

## 🔴 Bug #1: Resume Not Being Attached

### User Report
"When filling out a job application, it's not attaching the resume"

**Additional Context from User**:
- ✅ Resume IS uploaded to profile (metadata confirmed in storage)
- ✗ Tested on job board site - resume did NOT attach
- 🔴 **CRITICAL ERROR FOUND** (from console logs):
  ```
  [OA] Resume file metadata exists (Joel_Resume2025_Updated.docx-1.pdf, 430278 bytes) 
  but data retrieval failed. Try re-uploading a smaller resume.
  ```

**ROOT CAUSE IDENTIFIED**:
- Resume file is **430KB** (430,278 bytes)
- `browser.storage.local` **fails to retrieve** files this large
- Metadata stores fine, but actual file data retrieval throws "unexpected error"
- Extension gives up before even attempting to attach resume
- **This is a STORAGE issue, not an attachment issue**

**This eliminates**: File input detection, attachment methods (never reached)
**This confirms**: Storage retrieval failure for large files (>~400KB)

### Current Implementation

**File**: `src/content.ts` (lines 1268-1567)

**Function**: `fillResumeFileInputs()`

**Process**:
1. Load resume from `browser.storage.local` (key: `resumeFile`)
2. Find all `input[type="file"]` elements
3. Create File object from stored data
4. Try 3 methods to attach:
   - Method 1: DataTransfer API
   - Method 2: ClipboardEvent
   - Method 3: Drag-and-drop simulation
5. Dispatch `input` and `change` events
6. Track uploaded inputs to avoid duplicates

**Root Cause Analysis** (Based on Console Logs):
1. ~~❌ Resume not saved to storage~~ (CONFIRMED: Metadata exists)
2. ~~❌ File input not detected~~ (Never reached - storage fails first)
3. ~~❌ Attachment methods fail~~ (Never reached - storage fails first)
4. ~~❌ Events dispatched but framework doesn't react~~ (Never reached)
5. ~~❌ File input detected but filtered out~~ (Never reached)
6. ✅ **ACTUAL ISSUE: Storage retrieval fails for files > ~400KB**

**Technical Details**:
- `browser.storage.local.get('resumeFile')` throws `Error: An unexpected error occurred`
- File size: 430,278 bytes (430KB)
- Storage format: base64 string (even larger after encoding)
- Firefox storage quota issue with large binary data
- Existing code catches error and returns early (lines 1275-1287 in content.ts)

---

### Diagnostic Logging Needed

**Current Logs**:
- ✅ "Resume file loaded: {name} ({size} bytes)"
- ✅ "Found {count} file input(s)"
- ✅ "✓ Auto-uploaded resume" or "✗ All file upload methods failed"

**Missing Logs**:
- ❌ Why file input was filtered out
- ❌ Which attachment method succeeded/failed
- ❌ If resume exists in storage at all
- ❌ If file input is visible/accessible
- ❌ Framework-specific event handling

---

### Fix Strategy (UPDATED - Storage Issue)

#### Part 0: CRITICAL - Fix Resume Storage for Large Files (NEW)

**Problem**: `browser.storage.local` fails to retrieve files > ~400KB

**Solution Options**:

**Option A: Chunked Storage (Recommended)**
- Split resume into 100KB chunks during upload
- Store as separate keys: `resumeChunk_0`, `resumeChunk_1`, etc.
- Store metadata separately with chunk count
- Reassemble chunks during retrieval
- **Pros**: Works for files up to several MB, uses existing storage API
- **Cons**: More complex, needs migration for existing resumes
- **Effort**: 2-3 hours

**Option B: IndexedDB (Best for large files)**
- Use IndexedDB API instead of browser.storage
- Can handle files 10MB+
- **Pros**: Designed for large binary data
- **Cons**: Different API, more complex, needs migration
- **Effort**: 4-5 hours

**Option C: Compression (Quick improvement)**
- Compress base64 data before storing (pako.js or similar)
- Decompress on retrieval
- Can reduce size by 50-70%
- **Pros**: Quick to implement
- **Cons**: Still has limits, adds processing overhead
- **Effort**: 1-2 hours

**Option D: Size Limit + Better UX (Temporary fix)**
- Enforce 200KB limit during upload
- Show clear error: "Resume must be under 200KB (currently {size}KB)"
- Provide link to PDF compression tools
- **Pros**: Prevents the issue, quick fix
- **Cons**: User has to compress resume externally
- **Effort**: 30 minutes

**Recommended Approach**: Implement D immediately (30 min), then A (2-3 hours) for proper fix

---

#### Implementation: Chunked Storage (Option A)

**In `src/onboarding/onboarding.ts` (upload handler around line 855)**:

```typescript
// Constants
const CHUNK_SIZE = 100 * 1024; // 100KB chunks
const MAX_RESUME_SIZE = 2 * 1024 * 1024; // 2MB max

// Save resume with chunking
async function saveResumeWithChunking(file: File, base64Data: string) {
  // Check size limit
  if (file.size > MAX_RESUME_SIZE) {
    throw new Error(`Resume too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 2MB.`);
  }
  
  // Calculate chunks needed
  const chunkCount = Math.ceil(base64Data.length / CHUNK_SIZE);
  console.log(`[Resume Upload] Splitting ${file.name} into ${chunkCount} chunks`);
  
  // Save metadata
  await browser.storage.local.set({
    resumeFileMeta: {
      name: file.name,
      type: file.type,
      size: file.size,
      lastUpdated: Date.now(),
      chunkCount: chunkCount,
      chunked: true // Flag to indicate chunked storage
    }
  });
  
  // Save chunks
  for (let i = 0; i < chunkCount; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, base64Data.length);
    const chunk = base64Data.slice(start, end);
    
    await browser.storage.local.set({
      [`resumeChunk_${i}`]: chunk
    });
    
    console.log(`[Resume Upload] Saved chunk ${i + 1}/${chunkCount} (${chunk.length} chars)`);
  }
  
  console.log(`[Resume Upload] ✓ Resume saved successfully (${chunkCount} chunks)`);
}
```

**In `src/content.ts` (resume retrieval around line 1270)**:

```typescript
// Retrieve resume with chunk reassembly
async function loadResumeFromStorage(): Promise<{ name: string; type: string; size: number; data: string } | null> {
  try {
    // First, try to read metadata
    const metaResult = await browser.storage.local.get('resumeFileMeta');
    const meta = metaResult.resumeFileMeta;
    
    if (!meta) {
      console.log('[Resume] No resume metadata found');
      return null;
    }
    
    console.log(`[Resume] Found metadata: ${meta.name} (${meta.size} bytes, chunked: ${meta.chunked})`);
    
    // Check if this is chunked storage (new format)
    if (meta.chunked && meta.chunkCount) {
      console.log(`[Resume] Loading ${meta.chunkCount} chunks...`);
      
      // Load all chunks
      const chunks: string[] = [];
      for (let i = 0; i < meta.chunkCount; i++) {
        const chunkResult = await browser.storage.local.get(`resumeChunk_${i}`);
        const chunk = chunkResult[`resumeChunk_${i}`];
        
        if (!chunk) {
          throw new Error(`Missing chunk ${i}/${meta.chunkCount}`);
        }
        
        chunks.push(chunk);
      }
      
      // Reassemble
      const dataBase64 = chunks.join('');
      console.log(`[Resume] ✓ Reassembled ${meta.chunkCount} chunks (${dataBase64.length} chars)`);
      
      return {
        name: meta.name,
        type: meta.type,
        size: meta.size,
        data: dataBase64
      };
    }
    
    // Fall back to old format (single key, for backwards compatibility)
    console.log('[Resume] Trying legacy single-key format...');
    const resumeResult = await browser.storage.local.get('resumeFile');
    const resume = resumeResult.resumeFile;
    
    if (!resume || !resume.dataBase64) {
      throw new Error('Resume data not found in legacy format');
    }
    
    return {
      name: resume.name,
      type: resume.type,
      size: resume.size,
      data: resume.dataBase64
    };
    
  } catch (err) {
    console.error('[Resume] Failed to load resume:', err);
    return null;
  }
}

// Update fillResumeFileInputs() to use new loader
async function fillResumeFileInputs(): Promise<void> {
  try {
    console.log('[Resume Upload] Starting resume upload process');
    
    // Load resume (handles both chunked and legacy formats)
    const resumeData = await loadResumeFromStorage();
    
    if (!resumeData) {
      console.log('[Resume Upload] No resume found in storage');
      return;
    }
    
    // Create File object from base64 data
    const binaryString = atob(resumeData.data);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([uint8Array], { type: resumeData.type });
    const file = new File([blob], resumeData.name, { 
      type: resumeData.type,
      lastModified: Date.now()
    });
    
    console.log(`[Resume Upload] ✓ Created File object: ${file.name} (${file.size} bytes)`);
    
    // Continue with existing attachment logic...
    const fileInputs = findAllFileInputs();
    // ... rest of existing code
    
  } catch (err) {
    console.error('[Resume Upload] Error:', err);
  }
}
```

**Size Limit Check (Option D - Quick Fix)**

**In `src/onboarding/onboarding.ts` (before upload, around line 320)**:

```typescript
// Add size check before upload
const MAX_RESUME_SIZE_TEMP = 200 * 1024; // 200KB temporary limit

if (uploadedFile.size > MAX_RESUME_SIZE_TEMP) {
  const sizeMB = (uploadedFile.size / 1024 / 1024).toFixed(2);
  showStatus('error', `Resume too large (${sizeMB}MB). Please compress to under 200KB. Try: smallpdf.com/compress-pdf`);
  return;
}
```

---

#### Part 1: Enhanced Diagnostic Logging
Add comprehensive logs to understand failure points (STILL NEEDED for other issues):

**In `content.ts`, update `fillResumeFileInputs()` (around line 1268)**:
```typescript
async function fillResumeFileInputs(): Promise<void> {
  try {
    console.log('═══════════════════════════════════════');
    console.log('[Resume Upload] Starting resume upload process');
    console.log('═══════════════════════════════════════');
    
    // Step 1: Retrieve stored resume file
    log('Step 1/5: Loading resume from storage...');
    let resumeFile: { name: string; type: string; size: number; data?: number[] | null; dataBase64?: string; lastUpdated?: number } | null = null;
    
    try {
      const storageResult = await browser.storage.local.get('resumeFile');
      resumeFile = storageResult.resumeFile;
      
      if (!resumeFile) {
        console.error('[Resume Upload] ✗ No resume file found in storage');
        console.log('[Resume Upload] User needs to upload resume in profile settings');
        return;
      }
      
      console.log('[Resume Upload] ✓ Resume found:', resumeFile.name, `(${resumeFile.size} bytes)`);
    } catch (storageErr) {
      console.error('[Resume Upload] ✗ Failed to read from storage:', storageErr);
      return;
    }
    
    // Check data format
    const hasBase64 = resumeFile?.dataBase64 && resumeFile.dataBase64.length > 0;
    const hasLegacyArray = resumeFile?.data && Array.isArray(resumeFile.data) && resumeFile.data.length > 0;
    
    if (!hasBase64 && !hasLegacyArray) {
      console.error('[Resume Upload] ✗ Resume file has no data (corrupted)');
      return;
    }
    
    console.log('[Resume Upload] ✓ Data format:', hasBase64 ? 'base64' : 'legacy array');
    
    // Step 2: Create File object
    log('Step 2/5: Creating File object...');
    // ... rest of file creation
    console.log('[Resume Upload] ✓ File object created:', file.name);
    
    // Step 3: Find file inputs
    log('Step 3/5: Finding file inputs on page...');
    const fileInputs = findAllFileInputs();
    console.log('[Resume Upload] Found', fileInputs.length, 'file input(s)');
    
    if (fileInputs.length === 0) {
      console.warn('[Resume Upload] ⚠️ No file inputs detected on page');
      console.log('[Resume Upload] Trying to trigger upload button...');
      // ... trigger logic
    }
    
    // Step 4: Attach to inputs
    log('Step 4/5: Attaching resume to file inputs...');
    await attachFileToInputs(fileInputs, file);
    
    console.log('═══════════════════════════════════════');
    console.log('[Resume Upload] Resume upload process complete');
    console.log('═══════════════════════════════════════');
  } catch (err) {
    console.error('[Resume Upload] ✗ Fatal error:', err);
  }
}
```

**In `content.ts`, update `attachFileToInputs()` (around line 1450)**:
```typescript
async function attachFileToInputs(fileInputs: HTMLInputElement[], file: File): Promise<void> {
  let successCount = 0;
  let failedInputs: string[] = [];
  
  for (const fileInput of fileInputs) {
    try {
      const inputId = fileInput.id || fileInput.name || generateInputSelector(fileInput);
      console.log('─────────────────────────────────────');
      console.log('[Resume] Attempting upload to:', inputId);
      
      // Check if already uploaded
      if (resumeFilesUploaded.has(inputId)) {
        console.log('[Resume] ⊘ Already uploaded to this input');
        continue;
      }
      
      // Check if resume field
      const isResume = isResumeFileInput(fileInput);
      if (!isResume) {
        console.log('[Resume] ⊘ Not a resume field, skipping');
        continue;
      }
      console.log('[Resume] ✓ Identified as resume field');
      
      // Check if already has file
      if (fileInput.files && fileInput.files.length > 0) {
        console.log('[Resume] ⊘ Already has a file');
        continue;
      }
      
      // Check visibility
      const isVisible = fileInput.offsetParent !== null;
      const isHidden = fileInput.style.display === 'none' || fileInput.style.visibility === 'hidden';
      console.log('[Resume] Visibility:', isVisible ? 'visible' : 'hidden', '| Display style:', isHidden ? 'hidden' : 'normal');
      
      // Try attachment methods
      let success = false;
      
      // Method 1: DataTransfer
      console.log('[Resume] Trying Method 1: DataTransfer API...');
      try {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        success = fileInput.files.length > 0;
        if (success) console.log('[Resume] ✓ Method 1 succeeded');
      } catch (dtErr) {
        console.log('[Resume] ✗ Method 1 failed:', dtErr.message);
      }
      
      // Method 2: ClipboardEvent (if method 1 failed)
      if (!success) {
        console.log('[Resume] Trying Method 2: ClipboardEvent...');
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          const event = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true });
          fileInput.dispatchEvent(event);
          success = fileInput.files !== null && fileInput.files.length > 0;
          if (success) console.log('[Resume] ✓ Method 2 succeeded');
        } catch (clipErr) {
          console.log('[Resume] ✗ Method 2 failed:', clipErr.message);
        }
      }
      
      // Method 3: Drag-and-drop (if method 2 failed)
      if (!success) {
        console.log('[Resume] Trying Method 3: Drag-and-drop...');
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          const dropZone = fileInput.closest('[class*="drop"], [class*="upload"]') || fileInput.parentElement;
          const target = dropZone || fileInput;
          
          target.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
          target.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true }));
          target.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
          
          await new Promise(resolve => setTimeout(resolve, 200));
          success = fileInput.files !== null && fileInput.files.length > 0;
          if (success) console.log('[Resume] ✓ Method 3 succeeded');
        } catch (dragErr) {
          console.log('[Resume] ✗ Method 3 failed:', dragErr.message);
        }
      }
      
      if (success) {
        // Dispatch events
        console.log('[Resume] Dispatching change events...');
        fileInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        fileInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        
        resumeFilesUploaded.add(inputId);
        successCount++;
        console.log('[Resume] ✓✓✓ Successfully uploaded to:', inputId);
      } else {
        console.error('[Resume] ✗✗✗ All 3 methods failed for:', inputId);
        failedInputs.push(inputId);
      }
      
    } catch (err) {
      console.error('[Resume] Error processing input:', err);
    }
  }
  
  console.log('─────────────────────────────────────');
  console.log('[Resume] Upload summary:', successCount, 'succeeded,', failedInputs.length, 'failed');
  if (failedInputs.length > 0) {
    console.log('[Resume] Failed inputs:', failedInputs);
  }
}
```

#### Part 2: Add Visual Feedback

**In `src/content.ts`, add user notification**:
```typescript
// After fillResumeFileInputs() completes
if (successCount > 0) {
  showNotification(
    'Resume Attached',
    `Successfully attached ${file.name} to ${successCount} field(s)`,
    'success',
    3000
  );
} else if (failedInputs.length > 0) {
  showNotification(
    'Resume Upload Failed',
    `Could not attach resume to ${failedInputs.length} field(s). You may need to upload manually.`,
    'warning',
    5000
  );
}
```

#### Part 3: Add Retry Mechanism

**Problem**: Some ATS sites load file inputs asynchronously

**Solution**: Retry resume upload after 2-3 seconds if initial attempt finds 0 file inputs

```typescript
// In content.ts, after first fillResumeFileInputs() call
setTimeout(async () => {
  console.log('[Resume] Retry check: Looking for late-loaded file inputs...');
  const newInputs = findAllFileInputs().filter(input => {
    const id = input.id || input.name || generateInputSelector(input);
    return !resumeFilesUploaded.has(id);
  });
  
  if (newInputs.length > 0) {
    console.log('[Resume] Found', newInputs.length, 'new file input(s), retrying upload');
    await fillResumeFileInputs();
  }
}, 3000); // Retry after 3 seconds
```

---

## 🔴 Bug #2: Form Fields Being Skipped

### User Report
"Form filling is skipping over a few values"

### Current Implementation

**File**: `src/shared/autofill.ts` (lines 14-110)

**Function**: `generateFillMappings()`

**Fields are skipped when**:
1. **Empty value** (line 77):
   ```typescript
   if (valueStr === '') {
     console.log(`Skipping field "${field.label}" - empty value`);
     continue;
   }
   ```

2. **Validation fails** (line 91):
   ```typescript
   if (!validation.isValid) {
     console.warn(`Skipping field "${field.label}" - validation failed: ${validation.reason}`);
   }
   ```

3. **matchFieldToProfile() returns null**:
   - Field label doesn't match any profile field
   - Profile field is empty/undefined

---

### Root Causes

#### Cause 1: Profile Data Missing
User profile might be incomplete:
- Missing fields (e.g., no LinkedIn URL, no portfolio)
- Partial phone number
- No work authorization set

#### Cause 2: Field Label Not Recognized
Field label doesn't match patterns in `matchFieldToProfile()`:
- Example: "Website URL" vs. "Portfolio URL"
- Example: "Mobile" vs. "Phone"
- Custom ATS field names

#### Cause 3: Validation Too Strict
`field-data-validator.ts` rejects valid values:
- Phone format mismatch
- Email format issues
- URL validation too strict

#### Cause 4: Learned Values Rejected
Learned values might be rejected if:
- URL for non-URL field (line 40)
- Short string for URL field (line 47)

---

### Fix Strategy

#### Part 1: Enhanced Field Matching Logging

**In `src/shared/autofill.ts`, update `generateFillMappings()` (around line 14)**:
```typescript
export function generateFillMappings(schema: FieldSchema[], profile: UserProfile): FillMapping[] {
  const mappings: FillMapping[] = [];
  
  console.log('═══════════════════════════════════════');
  console.log('[Autofill] Generating fill mappings for', schema.length, 'fields');
  console.log('═══════════════════════════════════════');
  
  let skippedCount = 0;
  let emptyValueCount = 0;
  let validationFailCount = 0;
  let learnedValueCount = 0;
  let profileValueCount = 0;
  
  for (const field of schema) {
    console.log('─────────────────────────────────────');
    console.log('[Field]', field.label || field.name || field.id);
    console.log('[Type]', field.type);
    console.log('[Selector]', field.selector);
    
    // PRIORITY 1: Check for learned corrections
    const learnedValue = rlSystem.getLearnedValue(field);
    let value: any;
    let source: string;
    
    if (learnedValue && learnedValue.confidence >= 0.6) {
      value = learnedValue.value;
      source = 'learned';
      learnedValueCount++;
      console.log('[Source] Learned (confidence:', learnedValue.confidence.toFixed(2), ')');
      console.log('[Value]', '"' + value + '"');
    } else {
      // PRIORITY 2: Fall back to profile
      value = matchFieldToProfile(field, profile);
      source = 'profile';
      
      if (value !== null) {
        profileValueCount++;
        console.log('[Source] Profile');
        console.log('[Value]', '"' + value + '"');
      } else {
        skippedCount++;
        console.log('[Source] ✗ No match found');
        console.log('[Reason] Field label not recognized OR profile field empty');
        console.log('[Action] SKIPPED');
        continue;
      }
    }
    
    if (value !== null) {
      // Check if empty
      const valueStr = String(value).trim();
      if (valueStr === '') {
        emptyValueCount++;
        console.log('[Value] Empty string');
        console.log('[Action] SKIPPED (empty)');
        continue;
      }
      
      // Validate
      const validation = validateFieldData(field, value);
      
      if (validation.isValid) {
        mappings.push({ selector: field.selector, value });
        console.log('[Validation] ✓ PASSED');
        console.log('[Action] WILL FILL');
      } else {
        validationFailCount++;
        console.log('[Validation] ✗ FAILED:', validation.reason);
        
        // Try suggested fix
        if (validation.suggestedFix) {
          console.log('[Fix] Trying suggested fix:', validation.suggestedFix);
          const retryValidation = validateFieldData(field, validation.suggestedFix);
          if (retryValidation.isValid) {
            mappings.push({ selector: field.selector, value: validation.suggestedFix });
            console.log('[Fix] ✓ Suggested fix worked');
            console.log('[Action] WILL FILL (with fix)');
          } else {
            console.log('[Fix] ✗ Suggested fix also failed');
            console.log('[Action] SKIPPED (validation)');
          }
        } else {
          console.log('[Action] SKIPPED (validation, no fix available)');
        }
      }
    }
  }
  
  console.log('═══════════════════════════════════════');
  console.log('[Autofill] Mapping Summary:');
  console.log('  Total fields:', schema.length);
  console.log('  Will fill:', mappings.length);
  console.log('  Skipped (no match):', skippedCount);
  console.log('  Skipped (empty):', emptyValueCount);
  console.log('  Skipped (validation):', validationFailCount);
  console.log('  From learned values:', learnedValueCount);
  console.log('  From profile:', profileValueCount);
  console.log('═══════════════════════════════════════');
  
  return mappings;
}
```

#### Part 2: Add Missing Field Patterns

**In `src/shared/autofill.ts`, extend `matchFieldToProfile()` with more patterns**:

Common missing patterns:
```typescript
// Website/Personal Website (not just "portfolio")
if (matchesAny([label, name, id], ['website', 'personal website', 'web site', 'homepage', 'personal site'])) {
  return profile.links.portfolio || null;
}

// Mobile (not just "phone")
if (matchesAny([label, name, id], ['mobile', 'cell', 'cellphone', 'mobile phone'])) {
  return profile.personal.phone;
}

// City/State split
if (matchesAny([label, name, id], ['city']) && !matchesAny([label], ['country'])) {
  // Extract city from location
  const parts = profile.personal.location.split(',');
  return parts[0]?.trim() || null;
}

if (matchesAny([label, name, id], ['state', 'province', 'region'])) {
  // Extract state from location
  const parts = profile.personal.location.split(',');
  return parts[1]?.trim() || null;
}

// Zip/Postal Code
if (matchesAny([label, name, id], ['zip', 'postal', 'postcode', 'zip code', 'postal code'])) {
  // TODO: Add to profile schema or extract from location
  console.log('[Autofill] Zip code field - not in profile (user must enter manually)');
  return null;
}
```

#### Part 3: Profile Completeness Check

**Add diagnostic function to check profile completeness**:

**File**: `src/shared/profile.ts` (or create new util)

```typescript
export interface ProfileCompleteness {
  isComplete: boolean;
  missingFields: string[];
  filledFields: string[];
  completionPercentage: number;
}

export function checkProfileCompleteness(profile: UserProfile): ProfileCompleteness {
  const requiredFields = [
    { key: 'firstName', value: profile.personal.firstName, label: 'First Name' },
    { key: 'lastName', value: profile.personal.lastName, label: 'Last Name' },
    { key: 'email', value: profile.personal.email, label: 'Email' },
    { key: 'phone', value: profile.personal.phone, label: 'Phone' },
    { key: 'location', value: profile.personal.location, label: 'Location' },
  ];
  
  const optionalFields = [
    { key: 'linkedin', value: profile.links.linkedin, label: 'LinkedIn' },
    { key: 'github', value: profile.links.github, label: 'GitHub' },
    { key: 'portfolio', value: profile.links.portfolio, label: 'Portfolio' },
    { key: 'currentRole', value: profile.professional.currentRole, label: 'Current Role' },
    { key: 'yearsExperience', value: profile.professional.yearsExperience, label: 'Years of Experience' },
  ];
  
  const allFields = [...requiredFields, ...optionalFields];
  const filledFields: string[] = [];
  const missingFields: string[] = [];
  
  for (const field of allFields) {
    if (field.value && String(field.value).trim() !== '') {
      filledFields.push(field.label);
    } else {
      missingFields.push(field.label);
    }
  }
  
  const completionPercentage = Math.round((filledFields.length / allFields.length) * 100);
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    filledFields,
    completionPercentage,
  };
}
```

**Show profile completeness in popup**:
```typescript
// In popup.ts, after loading profile
const completeness = checkProfileCompleteness(profile);
if (completeness.completionPercentage < 100) {
  console.warn('[Profile] Incomplete:', completeness.completionPercentage + '%');
  console.warn('[Profile] Missing:', completeness.missingFields.join(', '));
  
  // Show warning in popup
  showWarning(`Profile ${completeness.completionPercentage}% complete. Missing: ${completeness.missingFields.slice(0, 3).join(', ')}`);
}
```

#### Part 4: Fallback Values for Common Fields

**For fields that often fail, add smart defaults**:

```typescript
// In matchFieldToProfile(), add fallback section at end:

// === FALLBACKS (when profile doesn't have the field) ===

// Work authorization - default to "Authorized" if not set
if (matchesAny([label, name, id], ['work authorization', 'authorized to work', 'employment authorization'])) {
  return profile.professional.workAuthorization || 'Authorized to work in the United States';
}

// Years of experience - calculate from profile if missing
if (matchesAny([label, name, id], ['years of experience', 'experience', 'total experience'])) {
  if (profile.professional.yearsExperience) {
    return String(profile.professional.yearsExperience);
  }
  // Fallback: calculate from work history if available
  // TODO: Add work history to profile
  return null;
}

// Current company - extract from current role if available
if (matchesAny([label, name, id], ['current company', 'employer', 'current employer'])) {
  // TODO: Add to profile schema
  return null;
}
```

---

## 📂 Files to Modify

### HIGH PRIORITY (Fix Bugs)

1. **`src/content.ts`** (lines 1268-1567)
   - Add comprehensive resume upload logging
   - Add visual feedback (notifications)
   - Add retry mechanism for late-loaded inputs
   - ~100-150 lines to modify

2. **`src/shared/autofill.ts`** (lines 14-110, 152-730)
   - Add detailed field matching logging
   - Add missing field patterns (website, mobile, city, state)
   - Add fallback values for common fields
   - ~50-100 lines to modify

3. **`src/shared/profile.ts`** (new function)
   - Add `checkProfileCompleteness()` function
   - ~50-60 lines to add

4. **`src/popup/popup.ts`** (existing)
   - Add profile completeness check
   - Show warning if profile incomplete
   - ~20-30 lines to add

### MEDIUM PRIORITY (Improve UX)

5. **`src/ui/notification.ts`** (existing)
   - Ensure notifications work properly
   - May need style updates for mockup

6. **`public/popup/popup.html`** (existing)
   - Add profile completeness indicator
   - ~20-30 lines to add

---

## ✅ Acceptance Criteria

### Bug #1: Resume Upload

**Storage Fix (CRITICAL)**:
- [ ] **Chunked storage works for resumes up to 2MB**
- [ ] **430KB test resume (user's file) loads successfully from storage**
- [ ] **Backwards compatible with existing non-chunked resumes**
- [ ] Size limit enforced during upload (clear error if > 2MB)
- [ ] Helpful error message suggests compression tools

**Upload & Attachment**:
- [ ] Console logs show resume upload process step-by-step
- [ ] Logs show which method (DataTransfer/Clipboard/DnD) succeeded
- [ ] Logs show why upload failed (if it fails)
- [ ] User sees notification when resume attached successfully
- [ ] User sees notification when resume fails to attach
- [ ] Retry mechanism attempts upload after 3 seconds
- [ ] Resume successfully attaches on major ATS sites:
  - [ ] LinkedIn
  - [ ] Greenhouse
  - [ ] Lever
  - [ ] Workday
  - [ ] Indeed

### Bug #2: Skipped Fields
- [ ] Console logs show why each field was skipped
- [ ] Logs show field label, type, and attempted value
- [ ] Summary shows count of skipped fields by reason
- [ ] Missing field patterns added (website, mobile, city, state)
- [ ] Profile completeness check shows missing fields
- [ ] Popup shows warning if profile < 100% complete
- [ ] Fallback values added for common fields

### Overall
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Test on real job application page
- [ ] Verify more fields are filled than before
- [ ] Verify resume attached (check file input has file)
- [ ] No console errors (only expected logs)

---

## 🔧 Implementation Plan

### Phase 1: Diagnostic Logging (2-3 hours)

**Step 1: Add Resume Upload Logging**
- Update `fillResumeFileInputs()` in `content.ts`
- Add step-by-step logs
- Add method success/failure logs
- Add summary at end

**Step 2: Add Field Matching Logging**
- Update `generateFillMappings()` in `autofill.ts`
- Log each field processing
- Log source (learned vs profile vs none)
- Log why skipped (empty, validation, no match)
- Add summary statistics

**Step 3: Test & Review Logs**
- Build extension
- Test on job application page
- Review console logs
- Identify patterns of failures

---

### Phase 2: Fix Resume Upload (2-3 hours)

**Step 4: Add Visual Feedback**
- Show notification when resume attached
- Show notification when upload fails
- Include file name and count

**Step 5: Add Retry Mechanism**
- Retry after 3 seconds if 0 file inputs found initially
- Check for new file inputs
- Avoid duplicate uploads

**Step 6: Improve File Input Detection**
- Add more selector patterns
- Check for late-loaded inputs
- Handle shadow DOM better (already implemented, verify it works)

**Step 7: Test Resume Upload**
- Test on LinkedIn
- Test on Greenhouse
- Test on Lever
- Test on Workday
- Verify notifications appear
- Verify retry works

---

### Phase 3: Fix Skipped Fields (2-3 hours)

**Step 8: Add Missing Field Patterns**
- Add "website" pattern → portfolio
- Add "mobile" pattern → phone
- Add "city" pattern → extract from location
- Add "state" pattern → extract from location
- Test each new pattern

**Step 9: Add Profile Completeness Check**
- Create `checkProfileCompleteness()` function
- Add to popup display
- Show warning if profile incomplete
- List missing fields

**Step 10: Add Fallback Values**
- Work authorization default
- Calculate years of experience
- Other common fields

**Step 11: Review Validation Logic**
- Check `field-data-validator.ts`
- Ensure phone validation isn't too strict
- Ensure email validation isn't too strict
- Ensure URL validation accepts common formats

---

### Phase 4: Testing & Verification (1-2 hours)

**Step 12: End-to-End Testing**
- Test on 3-5 different job sites
- Count fields before/after fix
- Verify more fields filled
- Verify resume attached
- Check console logs for remaining issues

**Step 13: Performance Check**
- Ensure logging doesn't slow down autofill
- Check memory usage with detailed logs
- Consider adding log level toggle (verbose vs normal)

**Step 14: Clean Up (Optional)**
- Can reduce logging verbosity for production
- Or add `DEBUG` flag to control log level

---

## 🚨 Common Pitfalls to Avoid

1. **Don't remove existing logs** - Add new logs, keep old ones
2. **Don't break existing functionality** - Resume upload has multiple fallbacks, preserve all
3. **Don't add emojis** - Even in console logs, user sees these
4. **Don't make validation too loose** - Balance between filling fields and data quality
5. **Don't forget notifications** - User needs visual feedback
6. **Don't block UI thread** - Keep logging async where possible
7. **Don't hardcode values** - Use profile data or smart defaults

---

## 📊 Expected Diagnostic Outcomes

### Resume Upload - Scenario A: No Resume in Storage
**Console Output**:
```
[Resume Upload] Starting resume upload process
[Resume Upload] ✗ No resume file found in storage
[Resume Upload] User needs to upload resume in profile settings
```
**Solution**: User needs to upload resume in onboarding

---

### Resume Upload - Scenario B: Resume Exists, No File Inputs
**Console Output**:
```
[Resume Upload] ✓ Resume found: resume.pdf (245KB)
[Resume Upload] Found 0 file input(s)
[Resume Upload] ⚠️ No file inputs detected on page
```
**Solution**: Either page has no file upload, or inputs are lazy-loaded (retry will catch them)

---

### Resume Upload - Scenario C: File Input Found, All Methods Fail
**Console Output**:
```
[Resume] Attempting upload to: resume-upload-field
[Resume] ✓ Identified as resume field
[Resume] Visibility: hidden | Display style: normal
[Resume] Trying Method 1: DataTransfer API...
[Resume] ✗ Method 1 failed: Cannot set property files
[Resume] Trying Method 2: ClipboardEvent...
[Resume] ✗ Method 2 failed: ...
[Resume] Trying Method 3: Drag-and-drop...
[Resume] ✗ Method 3 failed: ...
[Resume] ✗✗✗ All 3 methods failed
```
**Solution**: ATS uses custom component, need site-specific workaround

---

### Skipped Fields - Scenario A: Profile Incomplete
**Console Output**:
```
[Field] LinkedIn Profile URL
[Type] text
[Source] Profile
[Value] "" (empty)
[Action] SKIPPED (empty)

[Autofill] Mapping Summary:
  Total fields: 25
  Will fill: 18
  Skipped (empty): 7  ← Missing profile fields
```
**Solution**: User needs to complete profile

---

### Skipped Fields - Scenario B: Field Not Recognized
**Console Output**:
```
[Field] Website URL
[Type] text
[Selector] input#website_url
[Source] ✗ No match found
[Reason] Field label not recognized
[Action] SKIPPED
```
**Solution**: Add "website" pattern → portfolio mapping

---

### Skipped Fields - Scenario C: Validation Failed
**Console Output**:
```
[Field] Phone Number
[Type] tel
[Source] Profile
[Value] "+1 (555) 123-4567"
[Validation] ✗ FAILED: Field expects numbers only, got formatted string
[Fix] Trying suggested fix: "5551234567"
[Fix] ✓ Suggested fix worked
[Action] WILL FILL (with fix)
```
**Solution**: Validator working correctly (auto-fixes format)

---

## 📚 Reference Materials

### Mockup Images
- Popup: `assets/7c2377ca-58db-41ba-8a36-6beecc082aef-bf8d63a4-5fcb-4a38-83f5-bb8eed1a4a52.png`
- Dashboard: `assets/42d6e334-3e05-4efd-88dd-1ff0659e7526-71567036-ffa1-41a0-ac76-6d2cc7ad3063.png`

### Documentation
- Page Inventory: `docs/WEBPAGE_INVENTORY.md`
- Design System: `docs/DESIGN_SYSTEM_COMPLETE.md`

---

## 🔄 Handoff Instructions for DEV Agent

### When You Start Your New Chat:

1. **Read This Document First** - Complete diagnostic and fix plan is here

2. **Understand the Two Bugs**:
   - Bug #1: Resume not being attached
   - Bug #2: Some form fields are skipped

3. **Start with Phase 1 (Diagnostic Logging)**:
   - Add enhanced logs to resume upload process
   - Add enhanced logs to field matching
   - Build and test: `npm run build && npm run run:firefox`
   - Review console output to understand root causes

4. **Then Phase 2 (Fix Resume Upload)**:
   - Add notifications
   - Add retry mechanism
   - Test on multiple ATS sites

5. **Then Phase 3 (Fix Skipped Fields)**:
   - Add missing field patterns
   - Add profile completeness check
   - Add fallback values

6. **Finally Phase 4 (Testing)**:
   - Test on 3-5 different job sites
   - Count fields filled before/after
   - Verify resume attached
   - Get user approval

7. **Initial Setup**:
   ```bash
   cd /Users/nishanthreddy/Documents/SideQuests/axesimplify/apps/extension-firefox
   npm run build
   npm run run:firefox
   # Open browser console (Ctrl+Shift+K)
   # Visit job application page
   # Click "Auto-Fill" and review logs
   ```

8. **Report Findings**:
   - What do logs reveal about resume upload?
   - What do logs reveal about skipped fields?
   - How many fields filled before vs after fix?

---

## ⏱️ Time Estimates

- **Phase 1** (Diagnostic Logging): 2-3 hours
- **Phase 2** (Fix Resume Upload): 2-3 hours
- **Phase 3** (Fix Skipped Fields): 2-3 hours
- **Phase 4** (Testing): 1-2 hours

**Total**: 6-10 hours

---

## 🎯 Success Metrics

**Bugs are fixed when**:

### Resume Upload
1. **Attachment rate**: 80%+ of job sites successfully receive resume
2. **User feedback**: User sees notification "Resume attached" or clear error
3. **Diagnostic**: Console logs clearly show why upload succeeded/failed

### Skipped Fields
1. **Fill rate**: 90%+ of visible fields filled (up from current rate)
2. **Profile completeness**: User knows which profile fields are missing
3. **Diagnostic**: Console logs show exactly why each field was skipped
4. **Field coverage**: Common patterns (website, mobile, city, state) now recognized

---

## 🚀 Quick Commands

```bash
# Navigate to extension
cd /Users/nishanthreddy/Documents/SideQuests/axesimplify/apps/extension-firefox

# Build
npm run build

# Run in Firefox with console
npm run run:firefox

# Check TypeScript
npx tsc --noEmit

# View storage (in browser console)
await browser.storage.local.get(null)

# View resume storage (in browser console)
await browser.storage.local.get('resumeFile')

# View profile (in browser console)
await browser.storage.local.get('profile')
```

---

**Ready to debug and fix!** Start with Phase 1 (diagnostic logging) to understand the exact failure points. 🔍🚀
