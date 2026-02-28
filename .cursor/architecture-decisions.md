# Architecture Decision Records (ADR)

This file documents significant architecture and design decisions made during development. Always review before making similar decisions.

---

## ADR-001: React-Compatible Input Handling Module - 2024
**Status**: ✅ Accepted  
**Context**: 
Browser extension needs to autofill forms on React-based websites. Direct `input.value` assignment doesn't work with React controlled components.

**Decision**: 
Create a dedicated module (`shared/react-input.ts`) with specialized functions for setting React input values using native property descriptors and proper event dispatching.

**Rationale**: 
1. **Reusability**: Single source of truth for React input handling
2. **Reliability**: Uses proven pattern (native setters + events)
3. **Maintainability**: All input-related fixes go in one place
4. **Testability**: Can be tested independently
5. **Consistency**: Same approach used throughout extension

**Consequences**: 
- ✅ All form filling operations now work reliably on React sites
- ✅ Reduced code duplication across content scripts
- ✅ Easier to update if React changes behavior
- ⚠️ Must remember to use these functions instead of direct assignment
- ⚠️ Slight overhead vs direct assignment (negligible in practice)

**Alternatives Considered**: 
1. **Direct value assignment**: Doesn't work with React
2. **Simulate keyboard input**: Too slow, unreliable, can trigger validation
3. **React DevTools injection**: Too invasive, fragile, CSP issues
4. **Framework detection**: Too complex, would need Vue/Angular variants too

**Related**: 
- See `browserextension-bestpractices.mdc` for implementation details
- See `known-issues.md` for the original React input problem

---

## ADR-002: Page Stability Gates - 2024
**Status**: ✅ Accepted  
**Context**: 
Autofill operations were racing with page load, React hydration, and async data fetching, causing values to be set then immediately cleared.

**Decision**: 
Implement stability check functions that wait for:
1. DOM mutations to settle (quiet period of 500-800ms)
2. Pending XHR/fetch requests to complete (via Performance API)

**Rationale**: 
1. **Reliability**: Prevents race conditions with framework lifecycles
2. **User Experience**: Reduces visible "flashing" of values
3. **Framework Agnostic**: Works with React, Vue, Angular, plain JS
4. **Composable**: Can be called before any DOM operation

**Consequences**: 
- ✅ Dramatically improved autofill success rate
- ✅ Works consistently across different frameworks/sites
- ⚠️ Adds 500-2000ms delay before filling (acceptable UX trade-off)
- ⚠️ May still fail if site has continuous background requests
- ⚠️ Requires tuning timeout values for different scenarios

**Alternatives Considered**: 
1. **Fixed delays (setTimeout)**: Too brittle, either too short or unnecessarily long
2. **MutationObserver only**: Misses pending network requests
3. **Retry on failure**: Works but poor UX (values flash multiple times)
4. **Framework-specific detection**: Too complex, brittle, misses edge cases

**Related**: 
- See `browserextension-bestpractices.mdc` for implementation
- See `known-issues.md` for race condition issues

---

## ADR-003: [Next Decision Title] - [Date]
**Status**: 🟡 Proposed / ✅ Accepted / ❌ Rejected / ⚪ Superseded  
**Context**: 
[Describe the problem space and requirements]

**Decision**: 
[What was decided]

**Rationale**: 
1. [Reason 1]
2. [Reason 2]

**Consequences**: 
- ✅ [Positive consequence]
- ⚠️ [Trade-off]
- ❌ [Negative consequence]

**Alternatives Considered**: 
1. **[Option 1]**: [Why not chosen]
2. **[Option 2]**: [Why not chosen]

**Related**: 
- [Links to relevant docs/files]

---

## Template for New ADRs

Copy this template when documenting new architecture decisions:

```markdown
## ADR-XXX: [Decision Title] - [YYYY-MM-DD]
**Status**: 🟡 Proposed / ✅ Accepted / ❌ Rejected / ⚪ Superseded  
**Context**: 
[Describe the problem, requirements, and constraints. Why is this decision needed?]

**Decision**: 
[Clear statement of what was decided. Should be implementable.]

**Rationale**: 
1. [Key reason 1]
2. [Key reason 2]
3. [Key reason 3]
[Why this decision makes sense given the context]

**Consequences**: 
- ✅ [Positive outcomes and benefits]
- ⚠️ [Trade-offs and neutral impacts]
- ❌ [Negative consequences or technical debt]
[Be honest about pros AND cons]

**Alternatives Considered**: 
1. **[Alternative 1]**: [Why it was rejected]
2. **[Alternative 2]**: [Why it was rejected]
3. **[Alternative 3]**: [Why it was rejected]
[Show you considered multiple options]

**Related**: 
- [Link to related ADRs]
- [Link to implementation files]
- [Link to relevant issues or docs]

---
```

## Guidelines for ADRs

1. **When to Create an ADR**:
   - Major architectural pattern adoption
   - Technology or library choice
   - Design pattern for recurring problems
   - Breaking changes to existing patterns
   - Cross-cutting concerns (error handling, logging, etc.)

2. **When NOT to Create an ADR**:
   - Minor implementation details
   - Obvious/standard choices (e.g., using JSON for config)
   - Temporary workarounds
   - Code style preferences (use linter config instead)

3. **ADR Qualities**:
   - **Immutable**: Once accepted, don't edit - create new ADR to supersede
   - **Contextual**: Explain constraints and requirements
   - **Honest**: Document trade-offs and downsides
   - **Actionable**: Someone should be able to implement from reading it

4. **Status Lifecycle**:
   - 🟡 **Proposed**: Under discussion, not yet implemented
   - ✅ **Accepted**: Implemented and should be followed
   - ❌ **Rejected**: Decided against, document why for future reference
   - ⚪ **Superseded**: Replaced by newer ADR, kept for history

## Notes

- Keep ADRs concise but complete
- Number them sequentially (ADR-001, ADR-002, etc.)
- Cross-reference with known-issues.md and best practices
- Review ADRs when onboarding new developers
- Reference ADR numbers in code comments for context
