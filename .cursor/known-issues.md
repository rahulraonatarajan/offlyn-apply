# Known Issues & Solutions

This file tracks all issues encountered during development, their root causes, and solutions. Always check this file before implementing similar features.

---

## React Input Values Not Persisting - 2024
**Severity**: Critical  
**Context**: When autofilling forms on React-based websites  
**Symptoms**: 
- Values appear briefly then disappear
- Forms show as empty even though value was set
- React devtools show state not updated

**Root Cause**: 
React uses synthetic events and controlled components. Setting `input.value` directly bypasses React's state management, so the framework doesn't know the value changed.

**Solution**: 
1. Get the native property descriptor from HTMLInputElement.prototype
2. Call the native setter: `nativeInputValueSetter.call(input, value)`
3. Dispatch both 'input' and 'change' events
4. For React 16+, the event must be trusted or use proper event init

**Prevention**: 
- Always use `setReactInputValue()` from `shared/react-input.ts`
- Never use `input.value = x` directly
- See browserextension-bestpractices.mdc for implementation

**Related Files**: 
- `src/shared/react-input.ts`
- `src/content.ts` (fillFieldWithValue, executeFillPlan)

---

## Form Autofill Race Conditions - 2024
**Severity**: High  
**Context**: Filling forms immediately after page load or during dynamic updates  
**Symptoms**:
- Fields get filled then cleared
- Dropdown options not available when trying to select
- Autocomplete fields don't accept values

**Root Cause**: 
- React/Vue apps remount components during hydration
- Async data fetching populates dropdowns after initial render
- DOM mutations from framework lifecycle

**Solution**: 
Implement page stability gates:
1. `waitForPageStability()` - Wait for DOM to stop mutating (500-800ms quiet)
2. `hasPendingRequests()` - Check Performance API for active XHR/fetch
3. Apply before filling dropdowns, autocomplete, or any dynamic field

**Prevention**: 
- Always call `waitForStability()` before autofill operations
- Especially critical for dropdown/autocomplete fields
- See browserextension-bestpractices.mdc for implementation

**Related Files**: 
- `src/content.ts` (stability functions)
- All autofill operations

---

## Shadow DOM Elements Not Found - [Add Date When Encountered]
**Severity**: Medium  
**Context**: [To be filled when encountered]  
**Symptoms**: 
- querySelector returns null for elements that visibly exist
- Event listeners don't work on certain components

**Root Cause**: 
Shadow DOM encapsulation prevents regular DOM queries from accessing shadow root elements.

**Solution**: 
1. Recursively traverse shadow roots
2. Use `element.shadowRoot` to access shadow DOM
3. Query within each shadow root separately

**Prevention**: 
- Always implement shadow DOM fallback in selectors
- Test on sites using Web Components

**Related Files**: 
- [To be filled]

---

## Eightfold AI Dropdowns - Click Target Mismatch - 2026-02-04
**Severity**: Critical  
**Context**: Autofilling dropdown/combobox fields on Eightfold AI ATS (e.g., PayPal careers)  
**Symptoms**: 
- Dropdown opens and correct option is found (logs show "Best match" with score 10000)
- Option appears to be "clicked" but input value stays empty
- Extension falls back to forcing value via React native setter (visible typing)
- Logs show: `Input value before click: <empty string> | after click: <empty string>`
- Extension reports "Filled 14 fields, 0 failed" but dropdowns visually remain unselected

**Root Cause**: 
Eightfold uses `<LI role="presentation">` elements as dropdown option wrappers. These LI elements do **NOT** have click event handlers. The actual click handlers are on **child `<button>` elements** inside the LI (class: `menuItem-module_menu-item-button__-RdU7`). Clicking the LI dispatches events that bubble up but never trigger the button's React onClick handler.

**Solution**: 
1. After finding the best-match option element, check for clickable children before clicking
2. Query for `button`, `[role="button"]`, or `div[class*="item"]` inside the option element
3. Click the child element instead of the wrapper LI
4. Verify `element.value` changed after click; if not, fall back to React native setter

```typescript
const clickableChild = optionEl.querySelector('button, [role="button"], div[class*="item"]');
if (clickableChild) {
  clickTarget = clickableChild as HTMLElement;
}
```

**Prevention**: 
- NEVER assume the matched option element itself is the click target
- Always search for clickable children (button, [role="button"]) inside list items
- Verify input value changed after click; implement fallback if not
- This pattern applies to ANY dropdown library that wraps buttons in LI/DIV containers

**Related Files**: 
- `src/content.ts` (tryMatchOption helper, executeFillPlan dropdown handling)

---

## Cross-Origin Iframe Forms Not Detected - 2026-02-04
**Severity**: Critical  
**Context**: Job applications embedded in cross-origin iframes (e.g., Greenhouse on careers.roblox.com)  
**Symptoms**: 
- Extension detects the page as a job application but finds 0 fields
- Logs show: "Found 1 iframe(s) - fields might be inside iframe"
- Clicking "Fill Form" says the form is empty
- After adding `all_frames: true`, fields detected in iframe but "Fill Form" button on parent page still says empty

**Root Cause**: 
Two-part issue:
1. Content script wasn't injected into cross-origin iframes (manifest missing `all_frames: true`)
2. Even after injection, the autofill trigger from the popup/parent frame only checked `allDetectedFields` in the parent context, which had 0 fields. The iframe had its own separate content script instance with its own `allDetectedFields`.

**Solution**: 
1. Add `"all_frames": true` to `manifest.json` content_scripts entry
2. Implement cross-frame messaging via `window.postMessage`:
   - Parent frame: if no local fields, iterate iframes and send `OFFLYN_TRIGGER_AUTOFILL`
   - Iframe: listen for `OFFLYN_TRIGGER_AUTOFILL` message and trigger `tryAutoFill` locally
   - Same pattern for `OFFLYN_TRIGGER_SUGGESTIONS`

**Prevention**: 
- Always consider iframe-embedded forms (Greenhouse, Lever often use iframes)
- Test on sites that embed ATS forms in iframes
- Any new trigger mechanism must include cross-frame forwarding

**Related Files**: 
- `public/manifest.json` (all_frames: true)
- `src/content.ts` (postMessage listeners, iframe iteration)

---

## Workday Multi-Page Forms Not Auto-Advancing - 2026-02-04
**Severity**: High  
**Context**: Multi-step Workday job applications (myworkdayjobs.com)  
**Symptoms**: 
- Autofill works on first page but doesn't click "Save and Continue"
- User has to manually advance each page
- Some pages have no fillable fields but still need advancing

**Root Cause**: 
The extension had no awareness of multi-page Workday wizards. After filling fields, it stopped. Workday requires clicking "Save and Continue" (or "Next"/"Continue") to advance to the next page, then re-scanning for new fields.

**Solution**: 
1. After `executeFillPlan`, detect if on Workday (`myworkdayjobs.com`)
2. Auto-click "Save and Continue" button after a 1.5s delay
3. Click even if `filledCount === 0` (page may be optional or pre-filled)
4. Fall back to "Next"/"Continue" button patterns
5. Re-trigger field detection after page transition

**Prevention**: 
- Multi-page ATS forms need explicit navigation handling
- Always attempt to advance even if no fields were filled on current page
- Treat each page transition as a fresh form scan

**Related Files**: 
- `src/content.ts` (Workday auto-advance logic after executeFillPlan)

---

## Template for New Issues

Copy this template when documenting new issues:

```markdown
## [Issue Title] - [YYYY-MM-DD]
**Severity**: Critical/High/Medium/Low  
**Context**: [When/where this occurs - be specific]  
**Symptoms**: 
- [Observable behavior 1]
- [Observable behavior 2]

**Root Cause**: 
[Technical explanation of WHY this happens, not just WHAT happens]

**Solution**: 
[Step-by-step fix with code references]

**Prevention**: 
- [How to avoid this in future implementations]
- [Patterns/checks to apply]

**Related Files**: 
- [List all files that needed changes]
- [Reference relevant best practice docs]

---
```

## Notes

- Keep this file up to date after every bug fix
- Be specific with dates and context
- Focus on ROOT CAUSE, not just symptoms
- Link to related files and documentation
- If an issue becomes a pattern, promote it to best practices
