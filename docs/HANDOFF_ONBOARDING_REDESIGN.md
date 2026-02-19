# Quick Handoff: Onboarding Redesign (Split Fields + Self-ID)

**For User** - How to hand off this feature to a new DEV agent

---

## 🎯 What This Feature Does

Redesigns the onboarding flow to:
1. **Split phone field** → Country Code + Phone Number (separate inputs)
2. **Split location field** → City, State, Country, ZIP (separate inputs)
3. **Add self-ID section** → Voluntary diversity questions (gender, race, veteran, disability, etc.)
4. **Fix autofill correlation** → Use split values directly, no parsing needed

---

## 📄 Feature Brief Location

**File**: `docs/FEATURE_ONBOARDING_REDESIGN.md`

This is a **complete, standalone feature brief** with:
- Full project context
- Current state analysis (what's broken and why)
- New profile schema (PhoneDetails, LocationDetails, SelfIdentification)
- Complete UI mockups (split field forms, self-ID step)
- Autofill integration plan (type guards, backwards compatibility)
- Edge case handling (international formats, "Prefer not to say")
- Step-by-step implementation plan
- Acceptance criteria
- Testing checklist

---

## 🚀 How to Hand Off to DEV Agent

### Step 1: Open New Chat with DEV Agent
In Cursor, start a fresh chat with a new agent.

### Step 2: Share the Feature Brief
Say to the new DEV agent:
```
Please implement the feature described in: docs/FEATURE_ONBOARDING_REDESIGN.md

This is a complete feature brief with all context, requirements, and implementation plan.
```

### Step 3: Let DEV Agent Work Independently
The feature brief contains:
- What files to modify
- Exact interface definitions
- Form HTML with all fields
- Autofill logic updates
- Testing instructions
- Edge case handling

The DEV agent can work autonomously with this information.

---

## 📊 Feature Summary

### Problem #1: Phone Field (Single String)

**Current**:
```typescript
profile.personal.phone = "+1 (555) 123-4567"; // Single string
```

**Issues**:
- Autofill has to parse country code from string (error-prone)
- Autofill has to strip formatting to get digits
- International formats cause parsing failures

**Fix**:
```typescript
profile.personal.phone = {
  countryCode: "+1",
  number: "5551234567",
  formatted: "+1 (555) 123-4567" // optional
};
```

**UI Changes**:
- Country Code dropdown ("+1", "+44", "+91", etc.)
- Phone Number text input (digits only)

**Autofill Benefits**:
- Direct access: `phone.countryCode` → no parsing
- Direct access: `phone.number` → no parsing
- Reliable, no regex needed

---

### Problem #2: Location Field (Single String)

**Current**:
```typescript
profile.personal.location = "San Francisco, CA"; // Single string
```

**Issues**:
- Autofill tries to split on comma (unreliable)
- Fails for formats like "City, State ZIP"
- Can't handle international addresses well
- No country information

**Fix**:
```typescript
profile.personal.location = {
  city: "San Francisco",
  state: "California",
  country: "United States",
  zipCode: "94103" // optional
};
```

**UI Changes**:
- City text input
- State/Province text input
- Country dropdown
- ZIP/Postal Code text input (optional)

**Autofill Benefits**:
- Direct access: `location.city` → no parsing
- Direct access: `location.state` → no parsing
- Direct access: `location.country` → no guessing
- Works internationally

---

### Problem #3: No Self-ID Data

**Current**:
```typescript
profile.selfId = undefined; // Never populated
```

**Issues**:
- Diversity questions on job applications always skipped
- User has to manually enter same data every time
- Profile schema has `selfId` field but no UI to collect it

**Fix**:
```typescript
profile.selfId = {
  age: 28,
  gender: ["Non-binary"],
  race: ["Asian", "White"],
  ethnicity: "Not Hispanic or Latino",
  veteran: "No, I am not a protected veteran",
  disability: "I don't wish to answer",
  transgender: "Decline to self-identify",
  orientation: ["Prefer not to say"]
};
```

**UI Changes**:
- NEW Step 4 in onboarding wizard
- All fields voluntary ("Prefer not to say" default)
- Multi-select for gender, race, orientation
- Privacy notice: "This data stays on your device"

**Autofill Benefits**:
- Auto-fills gender questions
- Auto-fills race/ethnicity questions
- Auto-fills veteran status questions
- Auto-fills disability questions
- User enters once, reuses forever

---

## ⏱️ Time Estimate

**Total**: 12-16 hours

**Breakdown**:
- Phase 1 (Profile Schema): 2-3 hours
- Phase 2 (Onboarding UI): 4-5 hours
- Phase 3 (Autofill Logic): 3-4 hours
- Phase 4 (Testing & Edge Cases): 2-3 hours

---

## 🎯 Success Metrics

**Onboarding Redesign is complete when**:

1. **Split Phone**: Users enter country code and phone number separately
2. **Split Location**: Users enter city, state, country, zip separately
3. **Self-ID Section**: Users provide voluntary diversity data
4. **Autofill Accuracy**: 95%+ of split fields autofill correctly (no parsing)
5. **Backwards Compatibility**: Existing profiles still work
6. **Edge Cases**: International phones, non-US locations handled
7. **Privacy**: Clear notice that data stays local

---

## ✅ Acceptance Criteria Quick Check

**Profile Schema**:
- [ ] `PhoneDetails` interface created
- [ ] `LocationDetails` interface created
- [ ] `SelfIdentification` updated with new fields (age, ethnicity)
- [ ] Type guards implemented (`isPhoneDetails`, `isLocationDetails`)

**Onboarding UI**:
- [ ] Step 2 redesigned with split phone fields
- [ ] Step 2 has split location fields
- [ ] NEW Step 4 for self-ID added (7 steps total now)
- [ ] All self-ID fields optional with "Prefer not to say" default
- [ ] Privacy notice visible

**Autofill Integration**:
- [ ] Autofill detects phone format (object or string)
- [ ] Autofill uses split phone values directly
- [ ] Autofill detects location format (object or string)
- [ ] Autofill uses split location values directly
- [ ] Self-ID fields populate correctly
- [ ] Backwards compatible with old profiles

**Edge Cases**:
- [ ] International phone numbers work
- [ ] Non-US locations work
- [ ] Multiple gender/race selections work
- [ ] "Prefer not to say" saves correctly
- [ ] Empty optional fields handled

**Overall**:
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Test complete onboarding flow
- [ ] Test autofill with new profile
- [ ] Test autofill with old profile (backwards compat)

---

## 🔍 Quick Commands for Testing

```bash
# Navigate to extension
cd /Users/nishanthreddy/Documents/SideQuests/axesimplify/apps/extension-firefox

# Build
npm run build

# Run in Firefox
npm run run:firefox

# Check TypeScript
npx tsc --noEmit

# View profile structure (in browser console)
await browser.storage.local.get('userProfile')

# Check if phone is split (in browser console)
const profile = (await browser.storage.local.get('userProfile')).userProfile;
console.log(typeof profile.personal.phone === 'object' ? 'Split' : 'String');

# Check if location is split (in browser console)
console.log(typeof profile.personal.location === 'object' ? 'Split' : 'String');

# View self-ID data (in browser console)
console.log((await browser.storage.local.get('userProfile')).userProfile.selfId);
```

---

## 📚 Key Files to Modify

1. **`src/shared/profile.ts`** (~50-80 lines)
   - Add `PhoneDetails`, `LocationDetails` interfaces
   - Update `SelfIdentification` with new fields
   - Add type guard functions

2. **`public/onboarding/onboarding.html`** (~200-300 lines)
   - Redesign Step 2 with split fields
   - Add Step 4 for self-ID

3. **`src/onboarding/onboarding.ts`** (~150-200 lines)
   - Update save handlers for split fields
   - Add self-ID save handler

4. **`src/shared/autofill.ts`** (~100-150 lines)
   - Update phone/location matching
   - Add type guard checks

---

## 🚨 Important Notes

1. **Start with Phase 1 (Profile Schema)** - Foundation for everything else
2. **Backwards compatibility is critical** - Don't break existing users' profiles
3. **All self-ID fields are optional** - "Prefer not to say" should be default
4. **Privacy notice is mandatory** - Users need to know data stays local
5. **Test with both formats** - New object-based and old string-based profiles
6. **Handle edge cases** - International formats, multiple selections, empty fields

---

## 🎯 Expected User Flow (After Fix)

### Onboarding Flow

**Step 1**: Upload Resume (unchanged)

**Step 2**: Review & Edit Personal Info (REDESIGNED)
- First Name: `John`
- Last Name: `Doe`
- Email: `john@example.com`
- Country Code: `+1` (dropdown)
- Phone Number: `5551234567` (text input, digits only)
- City: `San Francisco` (text input)
- State: `California` (text input)
- Country: `United States` (dropdown)
- ZIP Code: `94103` (optional text input)

**Step 3**: Professional Links (unchanged)

**Step 4**: Self-Identification (NEW)
- Age: 28 OR "25-34" (radio choice + inputs)
- Gender: ☑ Non-binary (multi-select checkboxes)
- Transgender: ○ Decline to self-identify (radio, default)
- Ethnicity: ○ Not Hispanic or Latino (radio)
- Race: ☑ Asian, ☑ White (multi-select checkboxes)
- Veteran: ○ No, I am not a protected veteran (radio)
- Disability: ○ I don't wish to answer (radio, default)
- Sexual Orientation: ☑ Prefer not to say (multi-select checkboxes, default)

**Step 5**: Work Authorization (unchanged)

**Step 6**: Cover Letter (unchanged)

**Step 7**: Success (unchanged)

---

### Autofill Result (After Fix)

On job application page with fields:
- "Country Code" → Auto-fills `+1` (from `phone.countryCode`)
- "Phone Number" → Auto-fills `5551234567` (from `phone.number`)
- "City" → Auto-fills `San Francisco` (from `location.city`)
- "State" → Auto-fills `California` (from `location.state`)
- "Country" → Auto-fills `United States` (from `location.country`)
- "Gender" → Auto-fills `Non-binary` (from `selfId.gender`)
- "Race" → Auto-fills `Asian, White` (from `selfId.race`)
- "Veteran Status" → Auto-fills `No` (from `selfId.veteran`)

**No parsing, no errors, just direct mapping!**

---

**Ready to hand off!** The DEV agent has everything needed in `docs/FEATURE_ONBOARDING_REDESIGN.md`. 🚀
