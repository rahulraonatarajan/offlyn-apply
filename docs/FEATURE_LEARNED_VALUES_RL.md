# Feature Brief: Learned Values with Reinforcement Learning

## 🎯 Feature Overview

**Feature Name**: Learned Values with Reinforcement Learning  
**Priority**: High  
**Complexity**: Medium  
**Estimated Effort**: 8-12 hours  
**Agent Assignment**: NEW DEV AGENT (Separate Chat)

**Objective**: Completely redo the "Learned Values" feature to learn from user corrections using lightweight reinforcement learning principles. The system should improve autofill accuracy over time by learning when users manually change values.

---

## 📋 Project Context (For New Agent)

### What is Offlyn Apply?
- Firefox browser extension for job application automation
- Uses local AI (Ollama) for autofill and cover letter generation
- **100% local** - all data stays on device, no cloud
- Built with TypeScript, runs entirely in browser

### Design System (MUST FOLLOW)
**Brand Colors**:
- Navy: `#0F172A` (text, headers, backgrounds)
- Green: `#27E38D` (primary actions, success states)
- White: `#FFFFFF` (backgrounds, inverse text)

**UI Mockups Available**:
- Popup: Navy background (#2D3748), green buttons
- Dashboard: Light gray background (#F7F9FC), professional look
- Onboarding: Navy full-screen with white cards

**Key Rules**:
- No gradients (solid colors only)
- No emojis in UI
- No hardcoded hex values (use `src/shared/theme.ts`)
- Popup width: ~584px
- 8px spacing grid

### Current Architecture
```
apps/extension-firefox/
├── src/
│   ├── background.ts          - Background script
│   ├── content.ts             - Injected into job pages
│   ├── shared/
│   │   ├── learning-system.ts - CURRENT learning logic (BROKEN)
│   │   ├── autofill.ts        - Autofill orchestration
│   │   ├── storage.ts         - Browser storage wrappers
│   │   └── types.ts           - TypeScript interfaces
│   └── onboarding/
│       └── onboarding.ts      - Profile setup + learned values UI
└── public/
    └── onboarding/
        └── onboarding.html    - Learned values UI (NEEDS UPDATE)
```

---

## 🔴 Current State (BROKEN)

### What's Wrong?
1. **Learning system exists** (`src/shared/learning-system.ts`) but is **broken/incomplete**
2. **UI exists** (in onboarding page) but shows old data incorrectly
3. **No reinforcement learning** - just stores corrections, doesn't improve
4. **No confidence scoring** - doesn't know which corrections to trust
5. **No UI feedback** - user doesn't see what was learned
6. **Old design** - doesn't match new navy/green style

### Current Implementation
File: `src/shared/learning-system.ts` (~615 lines)

**Data Structures**:
```typescript
interface FieldCorrection {
  fieldLabel: string;
  autoFilledValue: string | boolean;
  userCorrectedValue: string | boolean;
  timestamp: number;
  context: { company, jobTitle, url };
}

interface SubmittedValue {
  fieldLabel: string;
  value: string;
  timestamp: number;
}
```

**Storage Keys**:
- `field_corrections` - Array of corrections
- `submitted_values` - Array of submitted values
- `learning_patterns` - Derived patterns (not used effectively)

**UI Location**:
- "View Learned Values" button in popup (`popup.html` line 400)
- Display in onboarding page (`onboarding.ts` lines 1216-1350)
- Shows: field name, auto-filled value, corrected value, date, company

---

## ✨ New Requirements

### 1. Reinforcement Learning Approach

**Goal**: Learn which corrections improve autofill accuracy over time.

**Key Concept**: When a user manually changes a value and submits, that's a "reward signal" that the autofill was wrong.

**Lightweight RL Algorithm** (suitable for local execution):
1. **Track confidence scores** for each field type
2. **Reward**: User submits without changing → +1 confidence
3. **Penalty**: User changes value → -1 confidence for that pattern
4. **Decay**: Old patterns lose confidence over time (30-day window)
5. **Threshold**: Only suggest patterns with confidence > 0.6

**Example**:
```
Field: "LinkedIn URL"
Auto-filled: "linkedin.com/in/johndoe"
User changed to: "linkedin.com/in/john-doe"
→ System learns: "Use hyphens in LinkedIn URLs for this user"
→ Confidence: 0.8 after 5 similar corrections
→ Next time: Suggest hyphenated version
```

### 2. New Data Model

```typescript
interface LearnedPattern {
  id: string;                    // Unique ID
  fieldType: string;              // "email", "phone", "linkedin", etc.
  fieldLabel: string;             // Normalized label
  
  // RL Components
  originalValue: string;          // What autofill suggested
  learnedValue: string;           // What user prefers
  confidence: number;             // 0.0 to 1.0 (RL score)
  
  // Tracking
  successCount: number;           // Times used without correction
  failureCount: number;           // Times corrected again
  lastUsed: number;               // Timestamp
  createdAt: number;              // First learned
  
  // Context
  contexts: Array<{
    company: string;
    jobTitle: string;
    url: string;
    timestamp: number;
  }>;
}

interface CorrectionEvent {
  id: string;
  fieldType: string;
  fieldLabel: string;
  autoFilledValue: string;
  userCorrectedValue: string;
  timestamp: number;
  patternId?: string;             // Link to learned pattern
  
  context: {
    company: string;
    jobTitle: string;
    url: string;
  };
}
```

### 3. Core Logic

**File**: `src/shared/learning-rl.ts` (NEW FILE, replace old system)

**Key Functions**:
```typescript
class ReinforcementLearningSystem {
  // Initialize from storage
  async initialize(): Promise<void>;
  
  // Record when user corrects autofill
  async recordCorrection(
    field: FieldSchema,
    autoFilledValue: string,
    userCorrectedValue: string,
    context: JobContext
  ): Promise<void>;
  
  // Record when user submits without changing (positive signal)
  async recordSuccess(
    field: FieldSchema,
    value: string,
    context: JobContext
  ): Promise<void>;
  
  // Get learned value for a field (if confidence > threshold)
  async getLearnedValue(
    field: FieldSchema,
    context: JobContext
  ): Promise<{ value: string; confidence: number } | null>;
  
  // Update confidence scores (decay old patterns)
  private updateConfidence(patternId: string, reward: number): void;
  
  // Export for UI display
  async getAllPatterns(): Promise<LearnedPattern[]>;
  
  // Delete a learned pattern
  async deletePattern(patternId: string): Promise<void>;
  
  // Clear all learned data
  async clearAll(): Promise<void>;
}
```

**RL Algorithm**:
```typescript
function updateConfidence(pattern: LearnedPattern, reward: number): number {
  // Simple RL update formula
  const learningRate = 0.1;  // How quickly to adapt
  const decay = 0.95;         // Decay old patterns
  
  // Age-based decay (30-day window)
  const age = Date.now() - pattern.lastUsed;
  const ageFactor = Math.exp(-age / (30 * 24 * 60 * 60 * 1000));
  
  // Update confidence
  let newConfidence = pattern.confidence + (learningRate * reward);
  newConfidence *= ageFactor * decay;
  
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, newConfidence));
}
```

### 4. Integration Points

**A. During Autofill** (`src/shared/autofill.ts`):
```typescript
// Before filling a field, check for learned patterns
const learned = await rlSystem.getLearnedValue(field, context);
if (learned && learned.confidence > 0.6) {
  // Use learned value instead of profile value
  fillValue = learned.value;
  console.log(`[RL] Using learned value (confidence: ${learned.confidence})`);
}
```

**B. After User Edits Field** (content script):
```typescript
// Detect when user changes a value
field.addEventListener('blur', async (e) => {
  const originalValue = field.dataset.autofilledValue;
  const newValue = field.value;
  
  if (originalValue && newValue !== originalValue) {
    // User corrected the autofill
    await rlSystem.recordCorrection(
      fieldSchema,
      originalValue,
      newValue,
      { company, jobTitle, url }
    );
  }
});
```

**C. After Form Submission** (`src/background.ts`):
```typescript
// When user submits application
async function handleSubmit(tabId: number) {
  // Get all field values
  const fields = await getFilledFields(tabId);
  
  // Record successes (fields that weren't changed)
  for (const field of fields) {
    if (!field.wasEdited) {
      await rlSystem.recordSuccess(field, field.value, context);
    }
  }
}
```

### 5. UI Requirements

**Location**: Onboarding page (also accessible from popup)

**Access**:
- Popup → "View Learned Values" button
- Opens onboarding page with learned values displayed

**Design** (Match mockup style):
```
┌─────────────────────────────────────────┐
│  [OA Logo]  Learned Values              │  ← Navy header
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ LinkedIn URL                    │   │  ← Card (white bg)
│  │ ────────────────────────────    │   │
│  │ Learned: linkedin.com/in/       │   │
│  │          john-doe               │   │
│  │                                 │   │
│  │ Confidence: ████████░░ 82%      │   │  ← Green bar
│  │ Used 12 times successfully      │   │
│  │ Last used: 2 days ago           │   │
│  │                                 │   │
│  │ [Edit] [Delete]                 │   │  ← Action buttons
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Phone Number                    │   │
│  │ ────────────────────────────    │   │
│  │ Learned: +1 (555) 123-4567      │   │
│  │ Confidence: ██████░░░░ 65%      │   │
│  │ Used 5 times successfully       │   │
│  │ Last used: 1 week ago           │   │
│  │                                 │   │
│  │ [Edit] [Delete]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [← Back]  [Clear All]                  │  ← Footer
└─────────────────────────────────────────┘
```

**Card Components**:
- **Field Type**: Bold, 16px, navy (#0F172A)
- **Learned Value**: Green text (#27E38D), 14px
- **Confidence Bar**: Green fill, gray background, percentage label
- **Stats**: Gray text (#64748B), 12px
- **Edit Button**: Navy border, transparent background
- **Delete Button**: Red text (#EF4444), transparent background
- **Empty State**: "No learned patterns yet. The system will learn as you use the extension."

**Confidence Colors**:
- 80-100%: Strong green (#27E38D)
- 60-79%: Medium green (lightened)
- 40-59%: Amber (#F59E0B)
- 0-39%: Gray (low confidence, not shown)

---

## 📂 Files to Modify/Create

### NEW Files (Create)
1. **`src/shared/learning-rl.ts`** (NEW)
   - Main RL system implementation
   - ~400-500 lines
   - Replaces old `learning-system.ts` logic

2. **`src/shared/learning-types.ts`** (NEW)
   - TypeScript interfaces for RL system
   - `LearnedPattern`, `CorrectionEvent`, etc.

### MODIFY Files
3. **`src/shared/autofill.ts`**
   - Add RL system integration
   - Check learned values before filling
   - Lines to modify: ~50-100

4. **`src/content.ts`**
   - Add field edit detection
   - Track user corrections
   - Lines to add: ~30-50

5. **`src/background.ts`**
   - Record successes on submit
   - Initialize RL system
   - Lines to add: ~20-30

6. **`src/onboarding/onboarding.ts`**
   - Replace old learned values display (lines 1216-1350)
   - New UI with confidence bars
   - Add edit/delete functionality
   - Lines to modify: ~150

7. **`public/onboarding/onboarding.html`**
   - Update learned values section styles
   - Match navy/green design system
   - Add confidence bar CSS
   - Lines to modify: ~50-100

8. **`src/popup/popup.ts`**
   - Update "View Learned Values" button handler
   - Lines to modify: ~5

### OPTIONAL (Nice to Have)
9. **`src/shared/learning-system.ts`**
   - Deprecate old system (add warning comment)
   - Or delete entirely if confident

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] RL system tracks user corrections
- [ ] RL system records successes (no changes)
- [ ] Confidence scores update correctly
- [ ] Old patterns decay over time (30-day window)
- [ ] Only patterns with confidence > 0.6 are used
- [ ] Learned values integrate with autofill
- [ ] User can view all learned patterns
- [ ] User can delete individual patterns
- [ ] User can clear all learned data
- [ ] System persists to `browser.storage.local`

### UI Requirements
- [ ] "View Learned Values" button works
- [ ] Learned values page matches mockup style
- [ ] Navy header with logo
- [ ] White cards for each pattern
- [ ] Confidence bars (green, accurate percentage)
- [ ] Stats display (times used, last used)
- [ ] Edit button opens modal (optional)
- [ ] Delete button with confirmation
- [ ] Empty state message
- [ ] "Clear All" button with confirmation
- [ ] No emojis
- [ ] No gradients
- [ ] Proper spacing (8px grid)

### Performance Requirements
- [ ] RL calculations complete in < 50ms
- [ ] No blocking operations on main thread
- [ ] Storage writes are batched
- [ ] Max 1000 learned patterns (old ones pruned)
- [ ] Confidence updates happen async

### Testing Requirements
- [ ] Test correction recording
- [ ] Test success recording
- [ ] Test confidence updates
- [ ] Test pattern retrieval
- [ ] Test UI display
- [ ] Test delete functionality
- [ ] Test with 0 patterns (empty state)
- [ ] Test with 100+ patterns (performance)
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console errors in Firefox

---

## 🎯 Implementation Plan (Step-by-Step)

### Phase 1: Core RL System (3-4 hours)
1. Create `src/shared/learning-types.ts` with interfaces
2. Create `src/shared/learning-rl.ts` with class skeleton
3. Implement `initialize()` - load from storage
4. Implement `recordCorrection()` - store correction events
5. Implement `recordSuccess()` - positive reinforcement
6. Implement `updateConfidence()` - RL algorithm
7. Implement `getLearnedValue()` - retrieve for autofill
8. Implement `save()` - persist to storage
9. Add unit tests (optional but recommended)

### Phase 2: Integration (2-3 hours)
10. Update `src/shared/autofill.ts`:
    - Import RL system
    - Check learned values before filling
    - Pass learned value to fill function
11. Update `src/content.ts`:
    - Add `blur` event listeners to filled fields
    - Store original autofilled value in `data-` attribute
    - Send correction message to background script
12. Update `src/background.ts`:
    - Initialize RL system on startup
    - Handle correction messages from content script
    - Record successes on submit event

### Phase 3: UI Implementation (3-4 hours)
13. Update `public/onboarding/onboarding.html`:
    - Update styles for learned values section
    - Navy header, white cards, green accents
    - Add confidence bar HTML/CSS
14. Update `src/onboarding/onboarding.ts`:
    - Replace `loadLearnedValues()` function (lines 1216-1350)
    - Fetch patterns from RL system
    - Render cards with confidence bars
    - Implement delete handler
    - Implement "Clear All" handler
    - Add confirmation modals
15. Test UI in Firefox:
    - Verify styles match mockup
    - Test empty state
    - Test with sample data
    - Test delete functionality

### Phase 4: Testing & Polish (1-2 hours)
16. End-to-end testing:
    - Fill a job application
    - Manually change a field
    - Submit application
    - Check learned values page
    - Verify confidence bar appears
    - Test second autofill uses learned value
17. Build and verify:
    - `npm run build`
    - No TypeScript errors
    - No console errors
    - Load in Firefox
    - Test full workflow
18. Polish:
    - Add loading states
    - Add success/error messages
    - Smooth animations
    - Final style tweaks

---

## 🚨 Common Pitfalls to Avoid

1. **Don't use embedding similarity** - Old system used embeddings (too heavy). Use exact field label matching + fuzzy string matching instead.

2. **Don't block autofill** - RL lookups should be fast (< 50ms). Cache patterns in memory.

3. **Don't forget decay** - Old patterns should lose confidence over time. Implement age-based decay.

4. **Don't show low-confidence patterns** - Only use patterns with confidence > 0.6. Lower confidence = ignore.

5. **Don't forget UI polish** - Confidence bars must match mockup style. No gradients, use solid green.

6. **Don't skip confirmation dialogs** - "Clear All" and "Delete" need confirmation modals.

7. **Don't hardcode colors** - Use `src/shared/theme.ts` color tokens.

8. **Don't use emojis** - No emoji characters in UI.

---

## 📚 Reference Materials

### Mockup Images
- Popup: `assets/7c2377ca-58db-41ba-8a36-6beecc082aef-bf8d63a4-5fcb-4a38-83f5-bb8eed1a4a52.png`
- Dashboard: `assets/42d6e334-3e05-4efd-88dd-1ff0659e7526-71567036-ffa1-41a0-ac76-6d2cc7ad3063.png`
- Onboarding: `assets/706ed420-49d9-466b-b43a-d07c0b4acb40-194a5475-5fce-4288-9444-50336a22ab8c.png`

### Documentation
- Design System: `docs/DESIGN_SYSTEM_COMPLETE.md`
- Mockup Spec: `docs/MOCKUP_IMPLEMENTATION_SPEC.md`
- Color Guide: `docs/BRANDING_GUIDE.md`
- Page Inventory: `docs/WEBPAGE_INVENTORY.md`

### Brand Assets
- Logo: `Brandkit/exports/logo-full-400w.png`
- Monogram: `Brandkit/exports/icon-48.png`

---

## 🔄 Handoff Instructions for DEV Agent

### When You Start Your New Chat:

1. **Read This Document First** - Complete context is here
2. **Confirm Understanding**:
   - "I'm implementing Learned Values with RL"
   - "I understand the lightweight RL approach"
   - "I will match the navy/green mockup style"

3. **Initial Setup**:
   ```bash
   cd /Users/nishanthreddy/Documents/SideQuests/axesimplify/apps/extension-firefox
   npm install
   npm run build  # Verify build works
   ```

4. **Start with Phase 1** (Core RL System):
   - Create `src/shared/learning-types.ts`
   - Create `src/shared/learning-rl.ts`
   - Implement core functions

5. **Test as You Go**:
   - Build after each file: `npm run build`
   - Check TypeScript errors
   - Test in Firefox: `npm run run:firefox`

6. **Ask for Clarification** if:
   - RL algorithm details unclear
   - UI design ambiguous
   - Integration point confusing
   - Performance concerns

7. **Report Progress**:
   - "Phase 1 complete - Core RL system works"
   - "Phase 2 in progress - Integrating with autofill"
   - etc.

8. **Final Checklist** before marking complete:
   - All acceptance criteria checked ✅
   - Build succeeds with no errors
   - Tested in Firefox with real job application
   - UI matches mockup style
   - No console errors

---

## 📊 Success Metrics

**Feature is successful when**:
1. **Accuracy**: Autofill accuracy improves by 20%+ after 10 corrections
2. **User Satisfaction**: User sees learned patterns in UI and trusts them
3. **Performance**: No lag in autofill (RL lookup < 50ms)
4. **Adoption**: 80%+ of users interact with "View Learned Values"
5. **Retention**: Learned patterns persist across browser restarts

---

## 🎓 RL Concepts Simplified

**For non-ML developers**:
- **Reward**: +1 when user doesn't change the autofilled value (good!)
- **Penalty**: -1 when user changes the value (bad, learn from this)
- **Confidence**: Score 0-1, higher = more trustworthy
- **Decay**: Old patterns lose confidence over time (freshness matters)
- **Threshold**: Only use patterns with confidence > 0.6 (filter noise)

**This is NOT**:
- Deep learning (no neural networks)
- Embeddings (no vector similarity)
- Cloud AI (100% local)
- Complex math (just addition and decay)

**This IS**:
- Simple scoring algorithm
- Lightweight and fast
- Local and private
- Easy to debug

---

## ⚡ Quick Start Commands

```bash
# Navigate to extension folder
cd /Users/nishanthreddy/Documents/SideQuests/axesimplify/apps/extension-firefox

# Install dependencies (if needed)
npm install

# Build extension
npm run build

# Run in Firefox (auto-reload)
npm run run:firefox

# Check TypeScript errors
npx tsc --noEmit
```

---

**Ready to implement?** Start with Phase 1 and work through each phase sequentially. Good luck! 🚀

**Questions?** Refer back to this document or ask the PLANNER agent for clarification.
