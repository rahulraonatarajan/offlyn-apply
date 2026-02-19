# Feature Brief: Onboarding Flow Redesign (Split Fields + Self-ID)

## 🎯 Feature Overview

**Feature Name**: Onboarding Flow Redesign - Split Fields & Self-Identification  
**Priority**: High (Currently broken, affects data quality)  
**Complexity**: High  
**Estimated Effort**: 12-16 hours  
**Agent Assignment**: NEW DEV AGENT (Separate Chat)

**Objective**: Redesign onboarding flow to use split fields for phone/location and add comprehensive self-identification section.

---

## 📋 Project Context (For New Agent)

### What is Offlyn Apply?
- Firefox browser extension for job application automation
- Auto-fills job application forms using user profile
- Currently uses AI to extract data from resume
- **100% local** - all data stays on device
- Built with TypeScript

### Current Problem
User reports: "the current onboarding flow is broken"

**Issues**:
1. **Phone field is single string** - Should be split: Country Code + Phone Number
2. **Location field is single string** - Should be split: City, State, Country
3. **No self-ID section** - Need voluntary self-identification fields (age, race, gender, veteran, disability, ethnicity, etc.)
4. **Autofill correlation issues** - Form filling doesn't correlate split fields correctly

**Impact**:
- Autofill logic already expects split fields (see `autofill.ts` lines 217-370)
- Profile stores combined values, autofill tries to split them (hacky)
- Users can't provide accurate data for self-ID questions
- Results in skipped fields or incorrect autofill

---

## 🔍 Current State Analysis

### Current Onboarding Flow

**Steps** (6 total):
1. **Upload Resume** - User uploads PDF/DOCX
2. **Review Profile** - Shows AI-extracted data (read-only preview)
3. **Professional Links** - LinkedIn, GitHub, Portfolio
4. **Work Authorization** - US work auth, visa sponsorship
5. **Cover Letter** - AI-generated cover letter preferences
6. **Success** - Completion

**Files**:
- `public/onboarding/onboarding.html` (~1600 lines)
- `src/onboarding/onboarding.ts` (~1900 lines)

### Current Profile Schema

**File**: `src/shared/profile.ts`

```typescript
export interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;           // ❌ SINGLE STRING (e.g., "+1 (555) 123-4567")
    location: string;        // ❌ SINGLE STRING (e.g., "San Francisco, CA")
  };
  professional: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    yearsOfExperience?: number;
  };
  selfId?: SelfIdentification; // ✅ EXISTS but NOT populated in onboarding
  // ... other fields
}

export interface SelfIdentification {
  gender: string[];         // ✅ Already defined
  race: string[];           // ✅ Already defined
  orientation: string[];    // ✅ Already defined
  veteran: string;          // ✅ Already defined
  transgender: string;      // ✅ Already defined
  disability: string;       // ✅ Already defined
}
```

**Problems**:
1. Phone stored as single string, autofill tries to parse it
2. Location stored as single string, autofill tries to split "City, State"
3. `selfId` schema exists but no UI to populate it

---

### Current Autofill Logic (Already Handles Split Fields!)

**File**: `src/shared/autofill.ts`

**Phone Handling** (lines 217-370):
- Detects "Country Code" fields → extracts `+1` from `"+1 (555) 123-4567"`
- Detects "Phone Number" fields → extracts `5551234567` from full phone
- **Problem**: Has to parse combined string, error-prone

**Location Handling** (lines 256-293):
- Detects "City" fields → tries to split "San Francisco, CA" → takes first part
- Detects "State" fields → tries to split "San Francisco, CA" → takes second part
- Detects "Country" fields → defaults to "United States"
- **Problem**: Hacky string splitting, fails for "City, State ZIP" formats

**Self-ID Handling** (lines 405-730):
- Already has logic for gender, race, veteran, disability
- Uses `profile.selfId.race`, `profile.selfId.gender`, etc.
- **Problem**: Profile never populates `selfId`, so autofill skips these fields

---

## 🎯 Solution: Redesigned Onboarding Flow

### New Profile Schema

**File**: `src/shared/profile.ts` (UPDATE)

```typescript
export interface PhoneDetails {
  countryCode: string;      // e.g., "+1"
  number: string;           // e.g., "5551234567"
  formatted?: string;       // e.g., "+1 (555) 123-4567" (for display)
}

export interface LocationDetails {
  city: string;             // e.g., "San Francisco"
  state: string;            // e.g., "California" or "CA"
  country: string;          // e.g., "United States"
  zipCode?: string;         // e.g., "94103" (optional)
}

export interface SelfIdentification {
  // Existing fields
  gender: string[];         // e.g., ["Male"], ["Female"], ["Non-binary"], ["Prefer not to say"]
  race: string[];           // e.g., ["White"], ["Asian"], ["Hispanic or Latino"], ["Two or more races"]
  orientation: string[];    // e.g., ["Heterosexual"], ["LGBTQ+"], ["Prefer not to say"]
  veteran: string;          // e.g., "Yes", "No", "Decline to self-identify"
  transgender: string;      // e.g., "Yes", "No", "Decline to self-identify"
  disability: string;       // e.g., "Yes", "No", "Decline to self-identify"
  
  // NEW fields
  age?: number;             // e.g., 28
  ageRange?: string;        // e.g., "25-34" (alternative to exact age)
  ethnicity?: string;       // e.g., "Hispanic or Latino", "Not Hispanic or Latino", "Prefer not to say"
  citizenshipStatus?: string; // e.g., "US Citizen", "Permanent Resident", "Work Visa", "Prefer not to say"
}

export interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | PhoneDetails;     // ✅ SUPPORT BOTH (backwards compat)
    location: string | LocationDetails; // ✅ SUPPORT BOTH (backwards compat)
  };
  // ... rest unchanged
  selfId?: SelfIdentification; // ✅ Now populated in onboarding
}
```

**Backwards Compatibility**:
- Phone can be string OR `PhoneDetails` object
- Location can be string OR `LocationDetails` object
- Autofill checks type and handles both formats
- Existing users' profiles still work

---

### New Onboarding Flow (7 Steps)

**Updated Step Order**:
1. **Upload Resume** (unchanged)
2. **Review & Edit Personal Info** (NEW - manual input with split fields)
3. **Professional Links** (unchanged)
4. **Self-Identification** (NEW - voluntary self-ID)
5. **Work Authorization** (unchanged)
6. **Cover Letter** (unchanged)
7. **Success** (unchanged)

---

### Step 2: Review & Edit Personal Info (REDESIGNED)

**Current**: Read-only preview of AI-extracted data  
**New**: Editable form with split fields

**Form Fields**:

```html
<!-- Name -->
<div class="form-row">
  <div class="form-group">
    <label>First Name <span class="required">*</span></label>
    <input type="text" id="firstName" required>
  </div>
  <div class="form-group">
    <label>Last Name <span class="required">*</span></label>
    <input type="text" id="lastName" required>
  </div>
</div>

<!-- Email -->
<div class="form-group">
  <label>Email <span class="required">*</span></label>
  <input type="email" id="email" required>
</div>

<!-- Phone (SPLIT) -->
<div class="form-section-header">
  <h3>Phone Number</h3>
</div>
<div class="form-row">
  <div class="form-group" style="flex: 0 0 150px;">
    <label>Country Code <span class="required">*</span></label>
    <select id="phoneCountryCode" required>
      <option value="+1">United States (+1)</option>
      <option value="+44">United Kingdom (+44)</option>
      <option value="+91">India (+91)</option>
      <option value="+86">China (+86)</option>
      <option value="+81">Japan (+81)</option>
      <option value="+49">Germany (+49)</option>
      <option value="+33">France (+33)</option>
      <option value="+61">Australia (+61)</option>
      <option value="+1">Canada (+1)</option>
      <!-- Add more as needed -->
    </select>
  </div>
  <div class="form-group" style="flex: 1;">
    <label>Phone Number <span class="required">*</span></label>
    <input type="tel" id="phoneNumber" placeholder="5551234567" required>
    <small class="form-hint">Enter digits only (no spaces, dashes, or parentheses)</small>
  </div>
</div>

<!-- Location (SPLIT) -->
<div class="form-section-header">
  <h3>Location</h3>
</div>
<div class="form-row">
  <div class="form-group">
    <label>City <span class="required">*</span></label>
    <input type="text" id="city" placeholder="San Francisco" required>
  </div>
  <div class="form-group">
    <label>State / Province <span class="required">*</span></label>
    <input type="text" id="state" placeholder="California" required>
    <!-- OR use dropdown for US states -->
  </div>
</div>
<div class="form-row">
  <div class="form-group">
    <label>Country <span class="required">*</span></label>
    <select id="country" required>
      <option value="United States">United States</option>
      <option value="Canada">Canada</option>
      <option value="United Kingdom">United Kingdom</option>
      <option value="India">India</option>
      <option value="Australia">Australia</option>
      <!-- Add more -->
    </select>
  </div>
  <div class="form-group">
    <label>ZIP / Postal Code</label>
    <input type="text" id="zipCode" placeholder="94103">
  </div>
</div>
```

**Implementation**:
- Pre-fill with AI-extracted data (if available)
- Allow manual editing
- Validate phone format (digits only)
- Validate email format
- Required fields marked with asterisk

---

### Step 4: Self-Identification (NEW STEP)

**Purpose**: Collect voluntary self-identification data for diversity questions

**Important UX Principles**:
1. **Voluntary** - All fields optional
2. **Clear purpose** - Explain why data is collected ("Many applications ask...")
3. **"Prefer not to say"** - Always an option
4. **Multiple selections** - Gender and race can have multiple values
5. **Privacy notice** - "This data stays on your device and is never sent to servers"

**Form Fields**:

```html
<div class="content-card">
  <h2 class="step-title">Voluntary Self-Identification</h2>
  <p class="step-subtitle">
    Many job applications include voluntary diversity questions. 
    Provide this information to auto-fill these sections.
  </p>
  
  <div class="privacy-notice">
    <svg><!-- lock icon --></svg>
    <span>This information stays on your device and is never shared with anyone.</span>
  </div>
  
  <form id="selfIdForm">
    <!-- Age -->
    <div class="form-group">
      <label>Age</label>
      <div class="radio-group-inline">
        <label><input type="radio" name="ageOption" value="exact"> Enter exact age</label>
        <label><input type="radio" name="ageOption" value="range"> Select age range</label>
        <label><input type="radio" name="ageOption" value="none" checked> Prefer not to say</label>
      </div>
      <input type="number" id="exactAge" placeholder="28" style="display: none;">
      <select id="ageRange" style="display: none;">
        <option value="">Select...</option>
        <option value="18-24">18-24</option>
        <option value="25-34">25-34</option>
        <option value="35-44">35-44</option>
        <option value="45-54">45-54</option>
        <option value="55-64">55-64</option>
        <option value="65+">65+</option>
      </select>
    </div>
    
    <!-- Gender -->
    <div class="form-group">
      <label>Gender Identity (Select all that apply)</label>
      <div class="checkbox-group">
        <label><input type="checkbox" name="gender" value="Male"> Male</label>
        <label><input type="checkbox" name="gender" value="Female"> Female</label>
        <label><input type="checkbox" name="gender" value="Non-binary"> Non-binary</label>
        <label><input type="checkbox" name="gender" value="Genderqueer"> Genderqueer</label>
        <label><input type="checkbox" name="gender" value="Gender fluid"> Gender fluid</label>
        <label><input type="checkbox" name="gender" value="Agender"> Agender</label>
        <label><input type="checkbox" name="gender" value="Two-spirit"> Two-spirit</label>
        <label><input type="checkbox" name="gender" value="Other"> Other</label>
        <label><input type="checkbox" name="gender" value="Prefer not to say"> Prefer not to say</label>
      </div>
      <input type="text" id="genderOther" placeholder="Please specify (optional)" style="display: none;">
    </div>
    
    <!-- Transgender -->
    <div class="form-group">
      <label>Do you identify as transgender?</label>
      <div class="radio-group">
        <label><input type="radio" name="transgender" value="Yes"> Yes</label>
        <label><input type="radio" name="transgender" value="No"> No</label>
        <label><input type="radio" name="transgender" value="Decline to self-identify" checked> Decline to self-identify</label>
      </div>
    </div>
    
    <!-- Hispanic/Latino Ethnicity -->
    <div class="form-group">
      <label>Are you Hispanic or Latino?</label>
      <div class="radio-group">
        <label><input type="radio" name="ethnicity" value="Yes, Hispanic or Latino"> Yes, Hispanic or Latino</label>
        <label><input type="radio" name="ethnicity" value="No, not Hispanic or Latino"> No, not Hispanic or Latino</label>
        <label><input type="radio" name="ethnicity" value="Prefer not to say" checked> Prefer not to say</label>
      </div>
    </div>
    
    <!-- Race -->
    <div class="form-group">
      <label>Race (Select all that apply)</label>
      <div class="checkbox-group">
        <label><input type="checkbox" name="race" value="American Indian or Alaska Native"> American Indian or Alaska Native</label>
        <label><input type="checkbox" name="race" value="Asian"> Asian</label>
        <label><input type="checkbox" name="race" value="Black or African American"> Black or African American</label>
        <label><input type="checkbox" name="race" value="Hispanic or Latino"> Hispanic or Latino</label>
        <label><input type="checkbox" name="race" value="Native Hawaiian or Other Pacific Islander"> Native Hawaiian or Other Pacific Islander</label>
        <label><input type="checkbox" name="race" value="White"> White</label>
        <label><input type="checkbox" name="race" value="Two or more races"> Two or more races</label>
        <label><input type="checkbox" name="race" value="Prefer not to say"> Prefer not to say</label>
      </div>
    </div>
    
    <!-- Veteran Status -->
    <div class="form-group">
      <label>Are you a protected veteran?</label>
      <p class="form-hint">Protected veterans include disabled veterans, recently separated veterans, active duty wartime or campaign badge veterans, and Armed Forces service medal veterans.</p>
      <div class="radio-group">
        <label><input type="radio" name="veteran" value="Yes, I am a protected veteran"> Yes, I am a protected veteran</label>
        <label><input type="radio" name="veteran" value="No, I am not a protected veteran"> No, I am not a protected veteran</label>
        <label><input type="radio" name="veteran" value="I don't wish to answer" checked> I don't wish to answer</label>
      </div>
    </div>
    
    <!-- Disability Status -->
    <div class="form-group">
      <label>Do you have a disability?</label>
      <p class="form-hint">As defined by the ADA, a disability is a physical or mental impairment that substantially limits one or more major life activities.</p>
      <div class="radio-group">
        <label><input type="radio" name="disability" value="Yes, I have a disability"> Yes, I have a disability (or previously had a disability)</label>
        <label><input type="radio" name="disability" value="No, I don't have a disability"> No, I don't have a disability</label>
        <label><input type="radio" name="disability" value="I don't wish to answer" checked> I don't wish to answer</label>
      </div>
    </div>
    
    <!-- Sexual Orientation -->
    <div class="form-group">
      <label>Sexual Orientation (Select all that apply)</label>
      <div class="checkbox-group">
        <label><input type="checkbox" name="orientation" value="Heterosexual"> Heterosexual/Straight</label>
        <label><input type="checkbox" name="orientation" value="Gay"> Gay</label>
        <label><input type="checkbox" name="orientation" value="Lesbian"> Lesbian</label>
        <label><input type="checkbox" name="orientation" value="Bisexual"> Bisexual</label>
        <label><input type="checkbox" name="orientation" value="Pansexual"> Pansexual</label>
        <label><input type="checkbox" name="orientation" value="Asexual"> Asexual</label>
        <label><input type="checkbox" name="orientation" value="Queer"> Queer</label>
        <label><input type="checkbox" name="orientation" value="Questioning"> Questioning</label>
        <label><input type="checkbox" name="orientation" value="Other"> Other</label>
        <label><input type="checkbox" name="orientation" value="Prefer not to say"> Prefer not to say</label>
      </div>
    </div>
  </form>
</div>

<div class="button-group" style="margin-top: 24px;">
  <button id="backFromSelfIdBtn" class="btn btn-secondary">Back</button>
  <button id="saveSelfIdBtn" class="btn btn-primary">Next</button>
</div>
```

**Implementation Notes**:
- All fields default to "Prefer not to say" / "Decline"
- No required fields (100% voluntary)
- "Other" options show text input for specification
- Privacy notice emphasizes local-only storage

---

## 📂 Files to Modify

### HIGH PRIORITY (Core Changes)

1. **`src/shared/profile.ts`** (~50-80 lines)
   - Add `PhoneDetails` interface
   - Add `LocationDetails` interface
   - Update `SelfIdentification` interface (add age, ageRange, ethnicity, citizenshipStatus)
   - Update `UserProfile.personal` to support both string and object types
   - Add type guards: `isPhoneDetails()`, `isLocationDetails()`

2. **`public/onboarding/onboarding.html`** (~200-300 lines)
   - Redesign Step 2 with split phone/location fields
   - Add NEW Step 4 for self-identification
   - Update step wizard to show 7 steps (was 6)
   - Add styling for new form layouts

3. **`src/onboarding/onboarding.ts`** (~150-200 lines)
   - Update `STEP_ORDER` array (add `step-selfid`)
   - Modify Step 2 save handler to collect split fields
   - Add Step 4 (self-ID) save handler
   - Create `PhoneDetails` and `LocationDetails` objects
   - Populate `profile.selfId` with form data
   - Add validation for phone/location fields

4. **`src/shared/autofill.ts`** (~100-150 lines)
   - Update phone matching logic (lines 217-370)
   - Check if `profile.personal.phone` is object or string
   - If object: use `phone.countryCode` and `phone.number` directly
   - If string: use existing parsing logic (backwards compat)
   - Update location matching logic (lines 256-293)
   - Check if `profile.personal.location` is object or string
   - If object: use `location.city`, `location.state`, `location.country` directly
   - If string: use existing splitting logic (backwards compat)

---

## ✅ Acceptance Criteria

### Profile Schema
- [ ] `PhoneDetails` interface defined
- [ ] `LocationDetails` interface defined
- [ ] `SelfIdentification` interface updated with new fields (age, ageRange, ethnicity)
- [ ] `UserProfile` supports both string and object for phone/location
- [ ] Type guards implemented for backwards compatibility

### Onboarding UI
- [ ] Step 2 redesigned with split phone fields (country code dropdown + number input)
- [ ] Step 2 has split location fields (city, state, country, zipCode)
- [ ] NEW Step 4 for self-identification added
- [ ] All self-ID fields are optional
- [ ] "Prefer not to say" is default for all self-ID fields
- [ ] Privacy notice visible on self-ID step
- [ ] Step wizard shows 7 steps correctly
- [ ] Navigation (Back/Next) works between all steps

### Data Collection
- [ ] Phone saved as `PhoneDetails` object with countryCode and number
- [ ] Location saved as `LocationDetails` object with city, state, country, zipCode
- [ ] Self-ID data saved to `profile.selfId`
- [ ] Multiple selections work for gender, race, orientation
- [ ] Age stored as number or ageRange string based on user choice
- [ ] All fields validate correctly

### Autofill Integration
- [ ] Autofill detects if phone is object or string
- [ ] Autofill uses `phone.countryCode` for "Country Code" fields
- [ ] Autofill uses `phone.number` for "Phone Number" fields
- [ ] Autofill detects if location is object or string
- [ ] Autofill uses `location.city` for "City" fields
- [ ] Autofill uses `location.state` for "State" fields
- [ ] Autofill uses `location.country` for "Country" fields
- [ ] Backwards compatible with existing string-based profiles
- [ ] Self-ID fields autofill correctly (gender, race, veteran, disability, etc.)

### Edge Cases
- [ ] International phone numbers work (non-US country codes)
- [ ] State/Province field handles both US states and international regions
- [ ] "Prefer not to say" selections save correctly
- [ ] Multiple gender/race selections save as array
- [ ] "Other" options with custom text input work
- [ ] Empty/optional fields (zipCode, age) handled gracefully
- [ ] Existing users' profiles still load (backwards compat)

### Overall
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Test onboarding flow end-to-end
- [ ] Test autofill with new profile format
- [ ] Test autofill with old profile format (backwards compat)
- [ ] No console errors

---

## 🔧 Implementation Plan

### Phase 1: Profile Schema Updates (2-3 hours)

**Step 1: Update `src/shared/profile.ts`**
- Add `PhoneDetails` interface
- Add `LocationDetails` interface
- Update `SelfIdentification` with new fields
- Update `UserProfile.personal` types
- Add type guard functions

```typescript
// Type guards
export function isPhoneDetails(phone: string | PhoneDetails): phone is PhoneDetails {
  return typeof phone === 'object' && 'countryCode' in phone && 'number' in phone;
}

export function isLocationDetails(location: string | LocationDetails): location is LocationDetails {
  return typeof location === 'object' && 'city' in location && 'state' in location;
}

// Helper functions
export function formatPhone(phone: string | PhoneDetails): string {
  if (isPhoneDetails(phone)) {
    return `${phone.countryCode} ${phone.number}`;
  }
  return phone;
}

export function formatLocation(location: string | LocationDetails): string {
  if (isLocationDetails(location)) {
    return `${location.city}, ${location.state}, ${location.country}`;
  }
  return location;
}
```

---

### Phase 2: Onboarding UI Updates (4-5 hours)

**Step 2: Update `public/onboarding/onboarding.html`**
- Redesign Step 2 (`step-review`) with editable split fields
- Add NEW Step 4 (`step-selfid`) after Step 3 (links)
- Update step wizard from 6 to 7 steps
- Add CSS for form layouts (2-column rows, etc.)

**Step 3: Update `src/onboarding/onboarding.ts`**
- Update `STEP_ORDER` to include `'step-selfid'`
- Modify Step 2 save handler:
  - Collect firstName, lastName, email
  - Collect phoneCountryCode and phoneNumber → create `PhoneDetails` object
  - Collect city, state, country, zipCode → create `LocationDetails` object
- Add Step 4 save handler:
  - Collect all self-ID checkboxes and radios
  - Create `SelfIdentification` object
  - Handle "prefer not to say" defaults

---

### Phase 3: Autofill Logic Updates (3-4 hours)

**Step 4: Update `src/shared/autofill.ts`**
- Phone matching (around line 217):
  ```typescript
  // Country Code field
  if (matchesAny([label, name, id], ['country code', 'country_code'])) {
    const phone = profile.personal.phone;
    if (isPhoneDetails(phone)) {
      return phone.countryCode; // Direct access
    } else {
      return getCountryCode(phone); // Parse string (backwards compat)
    }
  }
  
  // Phone Number field
  if (matchesAny([label, name, id], ['phone', 'mobile', 'tel'])) {
    const phone = profile.personal.phone;
    if (isPhoneDetails(phone)) {
      return phone.number; // Direct access
    } else {
      return getPhoneNumber(phone); // Parse string (backwards compat)
    }
  }
  ```

- Location matching (around line 256):
  ```typescript
  // City field
  if (matchesAny([label, name, id], ['city'])) {
    const location = profile.personal.location;
    if (isLocationDetails(location)) {
      return location.city; // Direct access
    } else {
      return location.split(',')[0]?.trim(); // Parse string (backwards compat)
    }
  }
  
  // State field
  if (matchesAny([label, name, id], ['state', 'province'])) {
    const location = profile.personal.location;
    if (isLocationDetails(location)) {
      return location.state; // Direct access
    } else {
      return location.split(',')[1]?.trim(); // Parse string (backwards compat)
    }
  }
  
  // Country field
  if (matchesAny([label, name, id], ['country'])) {
    const location = profile.personal.location;
    if (isLocationDetails(location)) {
      return location.country; // Direct access
    } else {
      return 'United States'; // Default (backwards compat)
    }
  }
  ```

---

### Phase 4: Testing & Edge Cases (2-3 hours)

**Step 5: Test New Onboarding Flow**
- Upload resume and complete all steps
- Verify split fields pre-filled correctly
- Verify self-ID fields save correctly
- Check profile JSON structure

**Step 6: Test Autofill**
- Test with NEW profile (object-based phone/location)
- Test with OLD profile (string-based phone/location)
- Verify country code, phone, city, state, country fields fill correctly
- Verify self-ID fields fill correctly

**Step 7: Edge Case Testing**
- International phone numbers (non-US)
- International locations (non-US states/provinces)
- Multiple gender/race selections
- "Prefer not to say" options
- Empty optional fields (zipCode, age)

---

## 🚨 Edge Cases to Handle

### Phone Edge Cases

1. **International Formats**
   - Country codes: +1 (US/Canada), +44 (UK), +91 (India), +86 (China), etc.
   - Phone lengths vary: US (10 digits), UK (10-11), India (10), China (11)
   - **Solution**: Don't validate phone length, just strip non-digits

2. **Formatting**
   - User enters: "(555) 123-4567" or "555-123-4567"
   - **Solution**: Strip all non-digit characters before saving

3. **Country Code Dropdown**
   - Need comprehensive list of countries
   - **Solution**: Use top 20-30 countries, plus "Other"

---

### Location Edge Cases

1. **US States**
   - Full names: "California", "New York"
   - Abbreviations: "CA", "NY"
   - **Solution**: Accept both, store what user enters

2. **Non-US Regions**
   - Canada: Provinces (Ontario, British Columbia)
   - UK: Counties (England, Scotland, Wales)
   - India: States (Maharashtra, Karnataka)
   - **Solution**: Use free text input for state/province, not dropdown

3. **City Names with Commas**
   - e.g., "Washington, D.C."
   - **Solution**: Store as object, not string (no parsing issues)

4. **Zip/Postal Codes**
   - US: 5 digits (12345) or 9 digits (12345-6789)
   - Canada: A1A 1A1
   - UK: SW1A 1AA
   - **Solution**: Free text, no validation

---

### Self-ID Edge Cases

1. **"Prefer Not to Say" Default**
   - All fields should default to "Decline to self-identify"
   - **Solution**: Set as default checked option

2. **Multiple Selections**
   - Gender: Can select multiple (e.g., "Non-binary" + "Genderqueer")
   - Race: Can select multiple (e.g., "Asian" + "White")
   - **Solution**: Use checkboxes, store as array

3. **"Other" Options**
   - Gender "Other" → show text input
   - **Solution**: Toggle text input visibility, append custom value to array

4. **Empty Self-ID**
   - User skips entire step
   - **Solution**: Save as `selfId: undefined` or with all "Prefer not to say"

5. **Age vs Age Range**
   - Some users prefer exact age, others prefer range
   - **Solution**: Offer both options, save only one

---

## 📊 Expected Outcomes

### Before Fix
**Console Output** (Current):
```
[Autofill] 📞 Phone number field - split detected: true
[Autofill] 📞 Returning local number: 5551234567  ← parsed from "+1 (555) 123-4567"
[Autofill] Skipping field "City" - empty value  ← can't split "San Francisco, CA" reliably
```

**Issues**:
- Phone parsing is hacky
- City/State splitting fails
- Self-ID fields always skipped (no data)

---

### After Fix
**Console Output** (New):
```
[Autofill] 📞 Phone country code field: +1  ← direct from phone.countryCode
[Autofill] 📞 Returning local number: 5551234567  ← direct from phone.number
[Autofill] 🌍 City field: San Francisco  ← direct from location.city
[Autofill] 🌍 State field: California  ← direct from location.state
[Autofill] 🏁 Race field detected: Asian, White  ← direct from selfId.race
```

**Improvements**:
- No parsing needed for phone/location
- Reliable field filling
- Self-ID fields now populate correctly

---

## 📚 Reference Materials

### Mockup Images
- Popup: `assets/7c2377ca-58db-41ba-8a36-6beecc082aef-bf8d63a4-5fcb-4a38-83f5-bb8eed1a4a52.png`
- Dashboard: `assets/42d6e334-3e05-4efd-88dd-1ff0659e7526-71567036-ffa1-41a0-ac76-6d2cc7ad3063.png`
- Onboarding: `assets/4b28798c-e59e-4b01-a476-c06afde3a91e-7c2ffeb9-c71d-4db7-880a-c1b3d8d02ef9.png`

### Documentation
- Profile Schema: `src/shared/profile.ts`
- Autofill Logic: `src/shared/autofill.ts`
- Page Inventory: `docs/WEBPAGE_INVENTORY.md`
- Design System: `docs/DESIGN_SYSTEM_COMPLETE.md`

---

## 🔄 Handoff Instructions for DEV Agent

### When You Start Your New Chat:

1. **Read This Document First** - Complete redesign plan is here

2. **Understand the Core Issues**:
   - Phone/location stored as single strings → need split storage
   - Self-ID data not collected → need new onboarding step
   - Autofill tries to parse strings → fragile and error-prone

3. **Start with Phase 1 (Profile Schema)**:
   - Update `src/shared/profile.ts` with new interfaces
   - Add type guards for backwards compatibility
   - Build and verify TypeScript compiles

4. **Then Phase 2 (Onboarding UI)**:
   - Redesign Step 2 with split fields
   - Add Step 4 for self-ID
   - Update step wizard

5. **Then Phase 3 (Autofill Logic)**:
   - Update phone/location matching in `autofill.ts`
   - Use type guards to check format
   - Test with both old and new profiles

6. **Finally Phase 4 (Testing)**:
   - Test complete onboarding flow
   - Test autofill on job application page
   - Test edge cases

7. **Initial Setup**:
   ```bash
   cd /Users/nishanthreddy/Documents/SideQuests/axesimplify/apps/extension-firefox
   npm run build
   npm run run:firefox
   # Open onboarding page
   # Complete all steps
   # Test autofill on job site
   ```

---

## ⏱️ Time Estimates

- **Phase 1** (Profile Schema): 2-3 hours
- **Phase 2** (Onboarding UI): 4-5 hours
- **Phase 3** (Autofill Logic): 3-4 hours
- **Phase 4** (Testing): 2-3 hours

**Total**: 12-16 hours

---

## 🎯 Success Metrics

**Onboarding Redesign is complete when**:

1. **Split Phone**: Users can enter country code and phone number separately
2. **Split Location**: Users can enter city, state, country, zip separately
3. **Self-ID Section**: Users can provide voluntary self-identification data
4. **Autofill Accuracy**: 95%+ of split fields autofill correctly (no parsing needed)
5. **Backwards Compatibility**: Existing profiles still work
6. **Edge Cases**: International phones, non-US locations handled
7. **UX**: All self-ID fields optional, "Prefer not to say" default
8. **Privacy**: Clear notice that data stays local

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

# View profile (in browser console)
await browser.storage.local.get('userProfile')

# Check if phone is object or string
(await browser.storage.local.get('userProfile')).userProfile.personal.phone

# Check if location is object or string
(await browser.storage.local.get('userProfile')).userProfile.personal.location
```

---

**Ready to redesign!** Start with Phase 1 (profile schema) to lay the foundation for split fields. 🚀
