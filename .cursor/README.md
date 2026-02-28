# Cursor Recursive Learning System

This directory contains a self-improving knowledge base for the browser extension development. The system learns from mistakes and prevents recurring issues.

## 📁 Files Overview

### `.cursorrules` (Root level)
**The Master Protocol** - Rules that govern how development happens
- Pre-implementation checks
- Error handling protocol  
- Documentation requirements
- Self-correction mechanisms

### `browserextension-bestpractices.mdc`
**Proven Solutions** - Patterns that work reliably
- React input handling
- Page stability gates
- Implementation details
- Quick reference checklist

### `known-issues.md`
**Living Error Log** - All bugs encountered and their fixes
- Symptoms and root causes
- Step-by-step solutions
- Prevention strategies
- Related files

### `architecture-decisions.md`
**Design Rationale** - Why things are built this way
- ADR (Architecture Decision Records)
- Options considered
- Trade-offs made
- Context for decisions

### `CONSISTENCY-GUIDE.md` 🆕
**Answer to: "Will docs update consistently?"**
- How automatic vs manual updates work
- Strategies for different workflows
- Measuring and maintaining consistency
- Recovery when docs fall behind

### `update-docs.md` 🆕
**Practical reminders and tips**
- When to manually update docs
- Quick update commands
- Git workflow integration
- Automation ideas

### `check-docs.sh` 🆕
**Health check script**
- Validates all docs exist
- Checks last modification dates
- Counts documented patterns
- Identifies incomplete sections

## 🔄 The Learning Loop

```
┌─────────────────────────────────────────────────┐
│  1. Before Implementation                       │
│     ✓ Check known-issues.md                    │
│     ✓ Review best practices                    │
│     ✓ Check architecture decisions             │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  2. During Implementation                       │
│     ✓ Apply proven patterns                    │
│     ✓ Follow best practices                    │
│     ✓ Reference ADRs in code                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  3. When Error Occurs                           │
│     ✓ STOP and analyze root cause              │
│     ✓ Document in known-issues.md              │
│     ✓ Implement fix with understanding         │
│     ✓ Verify solution thoroughly               │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  4. After Resolution                            │
│     ✓ Update known-issues.md with solution     │
│     ✓ If pattern emerges, add to best practices│
│     ✓ If architectural, create ADR             │
│     ✓ Add code comments linking to docs        │
└──────────────────┬──────────────────────────────┘
                   │
                   │
                   └────────► (Back to step 1)
```

## 🚀 Quick Start

### For New Features
1. Search `known-issues.md` for similar past problems
2. Check `browserextension-bestpractices.mdc` for relevant patterns
3. Review `architecture-decisions.md` for design context
4. Implement using proven approaches
5. Document any new issues encountered

### For Bug Fixes
1. Reproduce the issue
2. Find root cause (not just symptoms)
3. Document in `known-issues.md` immediately
4. Implement fix based on understanding
5. Verify thoroughly
6. If pattern, promote to best practices

### For Architecture Decisions
1. Review existing ADRs in `architecture-decisions.md`
2. Document new decision with context
3. List alternatives considered
4. Be honest about trade-offs
5. Reference ADR number in code

## 🎯 Success Criteria

The system is working if:
- ✅ Issues don't repeat after being documented
- ✅ Implementation gets faster over time
- ✅ Fewer unexpected bugs in new features
- ✅ Clear documentation trail exists
- ✅ Team can understand context from docs

## ⚠️ Red Flags

Document immediately if you see:
- Same error appearing multiple times
- Solution works but you don't know why
- Workaround instead of root fix
- Framework-specific quirks (React/Vue)
- Different behavior across browsers
- Fragile or timing-dependent code

## 📋 Templates

### New Issue Template (known-issues.md)
```markdown
## [Issue Title] - [Date]
**Severity**: Critical/High/Medium/Low
**Context**: [When/where]
**Symptoms**: [What you see]
**Root Cause**: [Why it happens]
**Solution**: [How to fix]
**Prevention**: [Avoid in future]
**Related Files**: [List]
```

### New ADR Template (architecture-decisions.md)
```markdown
## ADR-XXX: [Title] - [Date]
**Status**: Proposed/Accepted/Rejected
**Context**: [Problem space]
**Decision**: [What decided]
**Rationale**: [Why]
**Consequences**: [Trade-offs]
**Alternatives Considered**: [Options]
```

## 💡 Best Practices

### Writing Documentation
- **Be Specific**: Include dates, file paths, exact symptoms
- **Focus on WHY**: Root causes matter more than symptoms
- **Keep Updated**: Document as you go, not later
- **Cross-Reference**: Link between different docs
- **Be Honest**: Document failures and trade-offs too

### Using Documentation
- **Check First**: Before coding, read relevant docs
- **Apply Learnings**: Use proven patterns
- **Trust But Verify**: Understand why solutions work
- **Keep Updated**: Add new learnings immediately
- **Reference in Code**: Link to docs in comments

## 🔧 Maintenance

### Weekly
- Review recent issues for patterns
- Promote common fixes to best practices
- Clean up duplicate documentation

### Monthly
- Review all ADRs for relevance
- Update best practices with new patterns
- Archive superseded decisions

### Quarterly
- Assess if learning system is preventing recurring issues
- Identify gaps in documentation
- Refine templates and processes

## 🤔 Common Questions

### "Will docs update consistently?"
👉 See [`CONSISTENCY-GUIDE.md`](./CONSISTENCY-GUIDE.md) for detailed answer

**TL;DR**: Yes when using AI-assisted development (~95-99%), requires manual prompting for manual coding. Hybrid approach recommended.

### "What if I code without AI?"
👉 See [`update-docs.md`](./update-docs.md) for reminders and tips

**TL;DR**: Ask AI at end of session: "Review my changes and update learning docs"

### "How do I know if docs are current?"
👉 Run `./check-docs.sh` for health check

**TL;DR**: Script validates docs, checks dates, identifies gaps

## 📚 Further Reading

- [`.cursorrules`](../.cursorrules) - Complete protocol
- [`browserextension-bestpractices.mdc`](./browserextension-bestpractices.mdc) - All proven patterns
- [`known-issues.md`](./known-issues.md) - All documented issues
- [`architecture-decisions.md`](./architecture-decisions.md) - All ADRs
- [`CONSISTENCY-GUIDE.md`](./CONSISTENCY-GUIDE.md) - Ensuring docs stay updated
- [`update-docs.md`](./update-docs.md) - Update reminders and tips

## 🚀 Quick Commands

```bash
# Check documentation health
./.cursor/check-docs.sh

# Ask AI to update docs after manual coding
"Review my recent changes and update learning docs"

# Document a bug you just fixed
"Document this bug in known-issues.md with root cause"

# Create architecture decision record
"Create ADR for [decision] with context and alternatives"
```

---

**Remember**: The goal is continuous improvement through systematic learning. Every issue is an opportunity to make the system smarter.
