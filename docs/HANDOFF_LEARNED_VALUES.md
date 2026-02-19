# Handoff: Learned Values with Reinforcement Learning

## 🎯 For the User (You!)

### What Just Happened?
I created a **comprehensive feature brief** for a NEW DEV agent to implement the "Learned Values with Reinforcement Learning" feature.

### What's Next?
1. **Open a NEW chat** with a DEV agent in Cursor
2. **Share this document**: `docs/FEATURE_LEARNED_VALUES_RL.md`
3. **Say**: "Please implement the feature described in this document"
4. The DEV agent will have ALL the context needed to work independently

---

## 📄 Feature Brief Location

**File**: `docs/FEATURE_LEARNED_VALUES_RL.md`

**Size**: ~700 lines (comprehensive!)

**Contains**:
- Full project context (what is Offlyn Apply?)
- Design system (navy/green, mockup style)
- Current state (what's broken?)
- New requirements (RL algorithm)
- Data models (TypeScript interfaces)
- Integration points (autofill, content script, background)
- UI design (confidence bars, cards, etc.)
- Files to modify (exact list)
- Step-by-step implementation plan (4 phases)
- Acceptance criteria (checkboxes)
- Common pitfalls to avoid
- Handoff instructions for DEV agent

---

## 🚀 Quick Start for DEV Agent

When you open the new chat, the DEV agent should:

### 1. Read the Feature Brief
```
"I'm a new DEV agent. Please read: docs/FEATURE_LEARNED_VALUES_RL.md"
```

### 2. Confirm Understanding
The agent should confirm:
- Feature goal (RL-based learning)
- Design style (navy/green mockup)
- Files to modify (7 files)
- Acceptance criteria

### 3. Start Implementation
Follow the 4-phase plan:
- Phase 1: Core RL System (3-4 hours)
- Phase 2: Integration (2-3 hours)
- Phase 3: UI Implementation (3-4 hours)
- Phase 4: Testing & Polish (1-2 hours)

**Total**: 8-12 hours

---

## 📋 What's in the Feature Brief?

### Section Breakdown

**1. Feature Overview** (Page 1)
- What we're building
- Priority, complexity, effort estimate

**2. Project Context** (Pages 1-2)
- What is Offlyn Apply?
- Design system (navy/green colors)
- Architecture overview
- For new agents who don't know the project

**3. Current State** (Pages 2-3)
- What's broken with current learning system
- Current files and data structures
- Storage keys
- UI location

**4. New Requirements** (Pages 3-6)
- Reinforcement learning approach
- New data model (LearnedPattern, CorrectionEvent)
- Core logic (RL algorithm)
- Integration points (autofill, content script, background)
- UI requirements with mockup

**5. Files to Modify** (Page 6)
- NEW files to create (2 files)
- Files to modify (6 files)
- Line counts for each

**6. Acceptance Criteria** (Pages 6-7)
- Functional requirements
- UI requirements
- Performance requirements
- Testing requirements

**7. Implementation Plan** (Pages 7-8)
- Step-by-step, phase by phase
- 4 phases with subtasks
- Time estimates per phase

**8. Common Pitfalls** (Page 8)
- Things to avoid
- Based on past experience

**9. Reference Materials** (Page 9)
- Mockup images
- Documentation links
- Brand assets

**10. Handoff Instructions** (Pages 9-10)
- How to start
- Commands to run
- What to confirm
- How to ask for help

**11. Success Metrics** (Page 10)
- How to know it's successful
- Accuracy improvement targets

**12. RL Concepts Simplified** (Page 10)
- For developers not familiar with ML
- Clear explanations

**13. Quick Start Commands** (Page 10)
- Copy-paste terminal commands

---

## 🎨 Key Features of This Feature

### 1. Lightweight Reinforcement Learning
- **Not** deep learning or neural networks
- **Not** embeddings or complex math
- **IS** simple scoring: +1 for success, -1 for failure
- **IS** fast: < 50ms per lookup
- **IS** local: 100% on-device

### 2. Confidence Scoring
- 0.0 to 1.0 scale
- Only use patterns with confidence > 0.6
- Old patterns decay over 30 days
- Show confidence bars in UI (green = high)

### 3. User Feedback Loop
- User changes autofilled value → System learns
- User submits without changes → System gets +1 confidence
- User sees learned patterns in UI
- User can delete patterns they don't trust

### 4. UI Design (Matches Mockup)
- Navy header (#0F172A)
- White cards for each pattern
- Green confidence bars (#27E38D)
- Stats: "Used 12 times successfully", "Last used: 2 days ago"
- Edit/Delete buttons
- Empty state message
- No emojis, no gradients

---

## 📊 Example Workflow (After Implementation)

### User Applies to Job
1. Extension autofills LinkedIn URL: `linkedin.com/in/johndoe`
2. User manually changes it to: `linkedin.com/in/john-doe`
3. User submits application
4. System records: "User prefers hyphens in LinkedIn URLs"
5. Confidence starts at 0.5

### Next Job Application
6. Extension autofills LinkedIn URL: `linkedin.com/in/john-doe` (learned!)
7. User submits without changing
8. System increases confidence to 0.7

### After 10 Successful Uses
9. Confidence reaches 0.9 (very high)
10. User opens "View Learned Values"
11. Sees card:
    ```
    LinkedIn URL
    Learned: linkedin.com/in/john-doe
    Confidence: ████████░░ 92%
    Used 10 times successfully
    Last used: 5 minutes ago
    [Edit] [Delete]
    ```

---

## ✅ Success Checklist (For DEV Agent)

After implementation, verify:

### Functional
- [ ] Corrections are recorded
- [ ] Successes are recorded
- [ ] Confidence scores update
- [ ] High-confidence patterns are used in autofill
- [ ] Low-confidence patterns are ignored
- [ ] Old patterns decay over time

### UI
- [ ] "View Learned Values" button works
- [ ] Navy header with logo
- [ ] White cards for each pattern
- [ ] Green confidence bars (accurate %)
- [ ] Stats display correctly
- [ ] Delete button works (with confirmation)
- [ ] "Clear All" works (with confirmation)
- [ ] Empty state shows when no patterns
- [ ] No emojis
- [ ] No gradients
- [ ] Proper spacing (8px grid)

### Technical
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No console errors in Firefox
- [ ] RL lookups < 50ms
- [ ] Storage persists correctly
- [ ] Handles 1000+ patterns

---

## 🔧 Troubleshooting (For DEV Agent)

### If Build Fails
1. Check TypeScript errors: `npx tsc --noEmit`
2. Verify imports are correct
3. Check file paths

### If RL Doesn't Learn
1. Verify corrections are being recorded
2. Check browser storage: `browser.storage.local.get()`
3. Verify `recordCorrection()` is called on blur
4. Check console logs

### If UI Doesn't Match Mockup
1. Compare hex codes: Navy `#0F172A`, Green `#27E38D`
2. Check spacing: use 8px grid
3. Verify confidence bar calculation (% should be accurate)
4. Compare with mockup images in `assets/` folder

### If Performance is Slow
1. Check RL lookups are cached
2. Verify no blocking operations on main thread
3. Batch storage writes
4. Limit patterns to 1000 max

---

## 📞 Support

### If DEV Agent Gets Stuck
Ask DEV agent to:
1. Re-read relevant section of feature brief
2. Check reference materials
3. Review common pitfalls
4. Ask specific question (not "help me debug")

### If Requirements Unclear
Come back to PLANNER agent (this chat) and ask for clarification.

---

## 🎯 Final Checklist Before Handoff

I (PLANNER) have completed:
- [x] Created comprehensive feature brief (`FEATURE_LEARNED_VALUES_RL.md`)
- [x] Documented current broken state
- [x] Specified RL algorithm (lightweight, local)
- [x] Defined data models (TypeScript interfaces)
- [x] Listed files to modify (7 files)
- [x] Created step-by-step plan (4 phases, 18 steps)
- [x] Provided acceptance criteria (20+ checkboxes)
- [x] Included UI mockup specs (navy/green)
- [x] Added common pitfalls to avoid
- [x] Wrote handoff instructions for DEV agent
- [x] Updated ISSUE_BRIEF.md with new workflow
- [x] Created this handoff summary

**You (User) can now**:
- Open new chat with DEV agent
- Share: `docs/FEATURE_LEARNED_VALUES_RL.md`
- Let DEV agent implement independently

---

**Ready to go!** 🚀

Open a new Cursor chat and share the feature brief with a fresh DEV agent.

Good luck!
