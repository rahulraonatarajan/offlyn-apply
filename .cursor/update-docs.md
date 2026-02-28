# Documentation Update Reminders

## When to Manually Update Docs

### Daily Development Checklist
At the end of each coding session, ask yourself:
- [ ] Did I encounter any bugs today? → Update `known-issues.md`
- [ ] Did I find a better way to do something? → Update `best-practices.mdc`
- [ ] Did I make an architectural decision? → Add ADR to `architecture-decisions.md`
- [ ] Did I learn something new about browser extensions? → Document it

### Specific Triggers

**Update `known-issues.md` when:**
- ❌ Bug occurs during manual coding
- ❌ Production error reported
- ❌ User reports unexpected behavior
- ❌ Tests fail unexpectedly
- ❌ Integration issues with frameworks
- ❌ Browser compatibility problems

**Update `best-practices.mdc` when:**
- ✨ You discover a more reliable pattern
- ✨ Code review suggests improvements
- ✨ Performance optimization discovered
- ✨ Security issue prevented
- ✨ Accessibility improvement found

**Update `architecture-decisions.md` when:**
- 🏗️ Choosing between libraries/frameworks
- 🏗️ Refactoring major components
- 🏗️ Changing API design
- 🏗️ Modifying data flow patterns
- 🏗️ Updating storage strategies

## Quick Update Commands

### For Cursor AI
Just tell Cursor:
```
"Document this issue in known-issues.md"
"Add this pattern to best practices"
"Create an ADR for this decision"
"Update the learning docs with what we just fixed"
```

### Manual Updates
1. Open the relevant .md file
2. Copy the template (bottom of each file)
3. Fill in the details while it's fresh in your mind
4. Save and continue

## Integration with Git Workflow

Add to your commit messages when docs updated:
```bash
git commit -m "Fix: React dropdown autofill [Docs: known-issues.md updated]"
git commit -m "Feat: Shadow DOM support [Docs: ADR-003 created]"
```

## Code Comment Convention

When implementing a solution from docs, reference it:
```javascript
// Solution from known-issues.md: React Input Values Not Persisting
// Using native property descriptor setter
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value'
).set;
```

When making a decision based on ADR:
```javascript
// ADR-002: Using page stability gates to prevent race conditions
await waitForPageStability();
```

## Periodic Reviews

### Weekly (Friday afternoon)
- Review commits from the week
- Check if any bugs weren't documented
- Update CHANGELOG.md with learnings
- Promote patterns from known-issues to best-practices

### Monthly
- Review all ADRs for relevance
- Archive superseded patterns
- Check if documentation helped prevent issues
- Measure time saved by reusing patterns

## Automation Ideas

### Git Hooks (Optional)
Create `.git/hooks/prepare-commit-msg`:
```bash
#!/bin/bash
# Remind to update docs if fixing a bug

if grep -q -i "fix\|bug" "$1"; then
    echo "" >> "$1"
    echo "# Did you update known-issues.md?" >> "$1"
    echo "# Document root cause and solution!" >> "$1"
fi
```

### VS Code Task (Optional)
Add to `.vscode/tasks.json`:
```json
{
  "label": "Document Issue",
  "type": "shell",
  "command": "code .cursor/known-issues.md",
  "problemMatcher": []
}
```
Run with: Cmd+Shift+P → "Tasks: Run Task" → "Document Issue"

## AI Assistant Prompts

### When you encounter a bug manually:
```
"I just encountered [describe bug]. Can you:
1. Check if it's in known-issues.md
2. If new, help me document it with root cause
3. Update the docs with the solution"
```

### After fixing something:
```
"I fixed [issue]. Can you:
1. Document this in known-issues.md
2. Check if it should be promoted to best-practices.mdc
3. See if there's a pattern here"
```

### When making decisions:
```
"I'm deciding between [options]. Can you:
1. Check existing ADRs for similar decisions
2. Help me create ADR-XXX documenting this
3. List trade-offs objectively"
```

## Consistency Tips

1. **Document Immediately**: Don't wait until end of day
2. **Keep It Simple**: Brief notes are better than perfect later
3. **Use Templates**: Copy/paste from existing entries
4. **Ask AI for Help**: Let Cursor format the documentation
5. **Link Everything**: Cross-reference between docs
6. **Review Weekly**: Catch anything missed

## Signs Documentation is Falling Behind

🚨 **Red flags:**
- Same bug occurring multiple times
- Can't remember why you made a decision
- New teammate asking same questions
- Code comments don't reference docs
- CHANGELOG hasn't been updated in weeks
- Known-issues.md hasn't grown in months

## Recovery Plan

If docs get out of sync:
1. Block 1-2 hours for documentation debt
2. Review recent commits for undocumented fixes
3. Interview yourself: "What bugs did I fix?"
4. Add them to known-issues.md retroactively
5. Resume daily documentation habit

---

**Remember:** The system only works if you use it. But using it gets easier over time, and the payoff increases with each documented issue you avoid repeating.

**Pro tip:** Set a recurring calendar reminder: "Friday 4pm: Update learning docs"
