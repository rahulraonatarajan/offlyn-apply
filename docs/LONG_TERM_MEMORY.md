# Long-Term Memory

This file captures durable lessons learned across all issues in the project.

## Format
Each entry should contain:
- **Problem**: What went wrong or what was the challenge
- **Root Cause**: Why it happened
- **Fix**: How it was resolved
- **Prevention**: How to avoid in the future
- **Signals/Tests**: How to detect it early

---

## Entries

### Cover Letter Functionality Testing - 2026-02-15

**Problem**: Cover letter generation feature needed comprehensive testing for state management, UI navigation, and caching behavior.

**Root Cause**: New feature implementation with complex state management (preventing duplicate generations, maintaining UI state across panel transitions, caching results).

**Fix**: Implemented comprehensive test strategy covering:
- Build verification and static analysis
- Ollama integration testing  
- Code logic validation
- UI component integration verification
- Created manual testing procedures for browser interaction

**Prevention**: 
- Always test extension builds before manual testing
- Verify external dependencies (Ollama) are running
- Create test HTML pages that match job application detection criteria
- Use web-ext for consistent extension loading during development

**Signals/Tests**: 
- Monitor for build failures: `npm run build` should always succeed
- Check Ollama connection: `node native-host/test-ollama.js` should pass
- Watch for console errors in web-ext output
- Verify extension loads on job application pages (forms with 3+ fields)
- Test state variables exist: `window.coverLetterGenerating`, `window.lastCoverLetterResult`

**Regression Prevention**:
- Add automated tests for cover letter state management
- Create test suite for UI navigation flows
- Monitor memory usage for caching mechanisms
- Test across multiple browser sessions for state persistence

---
Created: 2026-02-15
