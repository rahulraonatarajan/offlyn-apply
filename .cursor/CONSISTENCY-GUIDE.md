# Documentation Consistency Guide

## Answer: Will It Update Consistently?

**Short Answer**: Yes, when Cursor AI is involved. No, when you code manually without AI assistance.

## How Consistency Works

### ✅ Automatic (AI-Driven) Updates

When you use Cursor AI for development:

```
You: "Fix the autofill bug on React forms"
   ↓
AI: 1. Checks known-issues.md for similar past bugs ✅
    2. Implements fix using documented patterns ✅
    3. Updates known-issues.md with solution ✅
    4. Updates best-practices if pattern emerges ✅
    5. Tells you what docs were updated ✅
```

**This happens automatically because:**
- `.cursorrules` mandates documentation before completion
- AI is programmed to check docs before implementing
- Documentation is part of the "definition of done"
- AI reports doc updates as part of completion

### ⚠️ Manual Updates Needed

When you code without AI:

```
You: (Writing code manually, encounter bug, fix it)
   ↓
Docs: ❌ Not updated automatically
   ↓
Solution: Tell AI: "Document the bug I just fixed"
   ↓
AI: Updates docs for you ✅
```

**Manual coding scenarios that need explicit doc updates:**
- Bug fixes during solo coding sessions
- Production issues discovered by users
- Code written by team members
- Debugging outside Cursor
- External code reviews

## Consistency Strategies

### Strategy 1: Hybrid Workflow (Recommended)

**Code with AI help for complex tasks:**
- Bug fixes → AI documents automatically
- New features → AI applies patterns, documents decisions
- Refactoring → AI creates ADRs

**Code manually for simple tasks:**
- Quick style fixes
- Minor text changes
- Console.log additions
- Simple value updates

**End of session:**
- Ask AI: "Review my manual changes and update docs"
- AI scans git diff, updates documentation

**Consistency Level**: 🟢 High (95%+ coverage)

### Strategy 2: AI-First Development

**Always use AI for:**
- Bug investigation and fixes
- Architecture decisions
- New feature implementation
- Performance optimization
- Refactoring

**Only manual:**
- Trivial typo fixes
- Comment updates

**Consistency Level**: 🟢 Very High (99%+ coverage)

### Strategy 3: Manual with Periodic AI Review

**Code however you want**

**Weekly review:**
```bash
# Review commits from last week
git log --oneline --since="1 week ago"

# Ask AI to review and document
"Review commits from last week and update learning docs"
```

**Consistency Level**: 🟡 Medium (70-80% coverage)

### Strategy 4: Git Hook Enforcement

Add a pre-commit hook that reminds you:

```bash
#!/bin/bash
# .git/hooks/pre-commit

if git diff --cached --name-only | grep -q "src/"; then
    echo "🤔 Did you document any bugs/decisions?"
    echo "   Run: ./.cursor/check-docs.sh"
    echo ""
    echo "Press ENTER to continue or CTRL+C to abort"
    read
fi
```

**Consistency Level**: 🟢 High with reminders

## Measuring Consistency

### Run Health Check
```bash
./.cursor/check-docs.sh
```

**Good signs:**
- ✅ All docs modified in last 7 days
- ✅ No "TODO" or "[To be filled]" items
- ✅ Doc commits match code commits ratio
- ✅ Issue count grows steadily
- ✅ No repeated bugs in git history

**Bad signs:**
- ❌ Docs unchanged for 30+ days
- ❌ Many incomplete sections
- ❌ Same bug fixed multiple times
- ❌ Code comments reference non-existent docs
- ❌ Team asking "why did we do this?"

### Weekly Metrics

Track these numbers weekly:

```markdown
Week of [Date]:
- New issues documented: X
- Patterns promoted to best practices: X
- ADRs created: X
- Issues prevented by checking docs: X
- Time saved by reusing patterns: ~X hours
```

Add to `.cursor/CHANGELOG.md`

## Making It More Consistent

### Option 1: Cursor Agent Integration

Create a custom Cursor command:

```json
// .vscode/settings.json
{
  "cursor.commands": [
    {
      "name": "Document Recent Changes",
      "command": "Review my recent changes and update learning docs in .cursor/"
    }
  ]
}
```

### Option 2: GitHub Actions (If using GitHub)

```yaml
# .github/workflows/doc-check.yml
name: Documentation Check
on: [pull_request]
jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check if docs updated
        run: |
          if git diff --name-only origin/main | grep -q "src/"; then
            if ! git diff --name-only origin/main | grep -q ".cursor/"; then
              echo "⚠️ Code changed but docs not updated"
              exit 1
            fi
          fi
```

### Option 3: VS Code Task

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Update Learning Docs",
      "type": "shell",
      "command": "cursor --new-window --wait .cursor/known-issues.md",
      "problemMatcher": []
    }
  ]
}
```

## The Reality Check

### What Actually Happens

**Week 1**: 🔥 Excited, documenting everything  
**Week 2**: 🟢 Still documenting most things  
**Week 3**: 🟡 Documenting important things  
**Week 4**: 🟠 "I'll document it later"  
**Week 5**: 🔴 Docs are outdated  

### Prevention

1. **Make it easy**: Use AI to format documentation
2. **Make it quick**: Use templates (already provided)
3. **Make it valuable**: See benefits (prevented bugs)
4. **Make it habitual**: Same time every Friday
5. **Make it social**: Share learnings with team

### Recovery

If docs fall behind:

```bash
# 1. Run health check
./.cursor/check-docs.sh

# 2. Review recent history
git log --oneline --since="1 month ago" --no-merges

# 3. Ask AI for help
"Review the last 20 commits and update learning docs
based on bugs fixed and decisions made"

# 4. Resume good habits
# Set calendar reminder: "Friday 4pm: Update docs"
```

## Success Stories (How This Pays Off)

### Scenario 1: Prevented Duplicate Work
```
Developer tries to implement React form autofill
   ↓
Checks known-issues.md first
   ↓
Finds: "React Input Values Not Persisting - SOLVED"
   ↓
Uses documented solution from shared/react-input.ts
   ↓
Works on first try
   ↓
Time saved: 4 hours of debugging
```

### Scenario 2: Onboarding New Developer
```
New dev: "Why do we use page stability gates?"
   ↓
Reviews ADR-002: Page Stability Gates
   ↓
Understands context, rationale, trade-offs
   ↓
No need to ask senior dev
   ↓
Time saved: 30 minutes, knowledge transferred
```

### Scenario 3: Refactoring Confidence
```
Need to refactor input handling
   ↓
Reviews ADR-001: React-Compatible Input Handling Module
   ↓
Understands original constraints and alternatives
   ↓
Makes informed decision about changes
   ↓
No regression, preserved learnings
```

## Bottom Line

**Will it update consistently?**

**With AI-assisted development**: Yes, ~95-99% consistency  
**With manual coding**: Only if you remember to ask AI to document  
**With hybrid approach**: Yes, ~90-95% with end-of-session reviews  
**With no effort**: No, docs become stale quickly

**The system is as consistent as you make it**, but it's designed to make consistency easy:

✅ Templates provided  
✅ AI does the formatting  
✅ Checks available  
✅ Reminders built-in  
✅ Benefits compound over time  

**Key insight**: You don't have to be perfect. Even 70% consistency prevents most recurring issues and saves significant time.

---

**Your choice:**
1. **Purist** (99%): Always use AI for development
2. **Pragmatic** (95%): Use AI for complex work, review weekly
3. **Minimal** (70%): Document major issues only, review monthly

All three work. Choose based on your workflow.
