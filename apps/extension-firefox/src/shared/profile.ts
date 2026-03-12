/**
 * User profile management - stores extracted resume data
 */

export interface PhoneDetails {
  countryCode: string;   // e.g., "+1"
  number: string;        // e.g., "5551234567"
  formatted?: string;    // e.g., "+1 (555) 123-4567" (display only)
}

export interface LocationDetails {
  city: string;          // e.g., "San Francisco"
  state: string;         // e.g., "California" or "CA"
  country: string;       // e.g., "United States"
  zipCode?: string;      // e.g., "94103" (optional)
}

export interface SelfIdentification {
  gender: string[];
  race: string[];
  orientation: string[];
  veteran: string;
  transgender: string;
  disability: string;
  // Extended fields
  age?: number;
  ageRange?: string;         // e.g., "25-34"
  ethnicity?: string;        // e.g., "Hispanic or Latino", "Not Hispanic or Latino"
  citizenshipStatus?: string; // e.g., "US Citizen", "Permanent Resident"
}

// ── Type guards ─────────────────────────────────────────────────────────────

export function isPhoneDetails(phone: string | PhoneDetails): phone is PhoneDetails {
  return typeof phone === 'object' && phone !== null && 'countryCode' in phone && 'number' in phone;
}

export function isLocationDetails(location: string | LocationDetails): location is LocationDetails {
  return typeof location === 'object' && location !== null && 'city' in location && 'state' in location;
}

// ── Helper formatters ────────────────────────────────────────────────────────

export function formatPhone(phone: string | PhoneDetails): string {
  if (isPhoneDetails(phone)) {
    return phone.formatted || `${phone.countryCode} ${phone.number}`;
  }
  return phone;
}

export function formatLocation(location: string | LocationDetails): string {
  if (isLocationDetails(location)) {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  }
  return location;
}

export interface WorkAuthorization {
  requiresSponsorship: boolean;
  legallyAuthorized: boolean;
  visaType?: string; // e.g., "H-1B", "OPT", "CPT", "Green Card", "TN", "O-1", etc.
  sponsorshipTimeline?: string; // e.g., "Immediately", "Within 6 months", "Within 1 year"
  currentStatus?: string; // e.g., "US Citizen", "Permanent Resident", "Work Visa", "Student Visa"
}

/**
 * Government / travel document fields — used by DS-160, ESTA, TSA PreCheck, etc.
 * All optional. Never required for job applications.
 */
export interface IdentityDocuments {
  dateOfBirth?: string;          // ISO date: "1995-03-14"
  placeOfBirth?: string;         // e.g., "Hyderabad, India"
  nationality?: string;          // e.g., "Indian", "American"
  countryOfBirth?: string;       // e.g., "India"
  passportNumber?: string;
  passportCountry?: string;      // country that issued the passport
  passportExpiryDate?: string;   // ISO date
  passportIssueDate?: string;    // ISO date
  nationalIdNumber?: string;     // e.g., Aadhaar, national ID
  ssnLast4?: string;             // last 4 digits of SSN (never full SSN)
  driversLicenseNumber?: string;
  driversLicenseState?: string;  // e.g., "CA"
  driversLicenseExpiry?: string; // ISO date
}

/**
 * Full address record — used by DMV, tax forms, financial institutions.
 */
export interface AddressRecord {
  line1?: string;       // street number + street name
  line2?: string;       // apt, suite, unit
  city?: string;
  state?: string;       // full name or abbreviation
  zipCode?: string;
  country?: string;
  isMailing?: boolean;  // distinguish physical vs mailing
}

/**
 * Emergency contact — used by HR onboarding, medical forms, school enrollment.
 */
export interface EmergencyContact {
  name?: string;
  relationship?: string;  // e.g., "Spouse", "Parent"
  phone?: string;
  email?: string;
}

export interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    middleName?: string;  // kept separate so lastName-only fields fill correctly
    preferredName?: string;
    suffix?: string;      // e.g., "Jr.", "III"
    email: string;
    phone: string | PhoneDetails;
    location: string | LocationDetails;
    /** Structured mailing / home addresses — used by DMV, tax, HR forms */
    addresses?: AddressRecord[];
  };
  professional: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    yearsOfExperience?: number;
    /** Expected / desired salary range */
    salaryExpectation?: string;
    /** Notice period at current employer */
    noticePeriod?: string;
  };
  work: Array<{
    company: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    graduationYear: string;
  }>;
  skills: string[];
  summary?: string;
  resumeText?: string;
  selfId?: SelfIdentification;
  workAuth?: WorkAuthorization;
  /** Government / travel documents — DS-160, DMV, TSA PreCheck, etc. */
  identity?: IdentityDocuments;
  /** Emergency contacts — HR onboarding, school enrollment, medical forms */
  emergencyContacts?: EmergencyContact[];
  lastUpdated: number;
}

const PROFILE_KEY = 'userProfile';

/**
 * Normalize a raw parsed profile before it is saved.
 *
 * LLMs sometimes return slightly wrong data even with good prompts. This
 * function is the last line of defense and runs regardless of which parser
 * produced the data. It is safe to call multiple times (idempotent).
 *
 * Rules applied:
 *  1. Name splitting — if middleName is empty but lastName contains multiple
 *     words, move everything except the last word into middleName.
 *  2. Work entry filtering — remove any entry that has no startDate (phantom
 *     sub-responsibility extracted as a job by the LLM).
 *  3. Work deduplication — keep only the first occurrence of each company+title.
 *  4. Work company sanity — if the company field contains the person's own
 *     full name (common LLM hallucination), drop that entry.
 *  5. Normalize startDate / endDate to YYYY-MM where easily detectable.
 */
export function normalizeProfile(raw: any): UserProfile {
  const p: any = { ...raw };

  // ── 1. Name splitting ──────────────────────────────────────────────────────
  if (p.personal) {
    const firstName = (p.personal.firstName || '').trim();
    const lastName  = (p.personal.lastName  || '').trim();
    const middleName = (p.personal.middleName || '').trim();

    if (!middleName && lastName.includes(' ')) {
      // e.g. "Nishanth Ponukumatla" → middleName:"Nishanth" lastName:"Ponukumatla"
      const parts = lastName.split(/\s+/);
      p.personal = {
        ...p.personal,
        middleName: parts.slice(0, -1).join(' '),
        lastName: parts[parts.length - 1],
      };
    } else if (!middleName && firstName.includes(' ')) {
      // Sometimes the LLM puts everything in firstName
      const parts = firstName.split(/\s+/);
      if (parts.length >= 3) {
        p.personal = {
          ...p.personal,
          firstName: parts[0],
          middleName: parts.slice(1, -1).join(' '),
          lastName: p.personal.lastName || parts[parts.length - 1],
        };
      }
    }
  }

  // ── 2 & 3 & 4. Work entry cleaning ────────────────────────────────────────
  if (Array.isArray(p.work)) {
    const fullName = [
      p.personal?.firstName,
      p.personal?.middleName,
      p.personal?.lastName,
    ].filter(Boolean).join(' ').toLowerCase().trim();

    // Filter: must have startDate + company + title; company must not be the person's own name
    const filtered = p.work.filter((job: any) => {
      if (!job.startDate || !String(job.startDate).trim()) return false;
      if (!job.company || !job.title) return false;
      if (fullName && job.company.toLowerCase().trim() === fullName) return false;
      return true;
    });

    // Deduplicate by company+title (keep first/oldest occurrence which is usually most detailed)
    const seen = new Set<string>();
    p.work = filtered.filter((job: any) => {
      const key = `${job.company}|${job.title}`.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ── 5. Normalize date formats to YYYY-MM ──────────────────────────────────
  const MONTH_MAP: Record<string, string> = {
    jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06',
    jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12',
  };
  const normDate = (d: string | null | undefined): string | null => {
    if (!d) return null;
    const s = String(d).trim();
    if (/^\d{4}-\d{2}$/.test(s)) return s;          // already YYYY-MM
    if (/^\d{4}$/.test(s)) return `${s}-01`;         // "2020" → "2020-01"
    // "Jan 2020" or "January 2020"
    const m = s.match(/([a-zA-Z]+)[.\s]+(\d{4})/);
    if (m) {
      const month = MONTH_MAP[m[1].toLowerCase().slice(0,3)] || '01';
      return `${m[2]}-${month}`;
    }
    return s; // leave as-is if unrecognised
  };

  if (Array.isArray(p.work)) {
    p.work = p.work.map((job: any) => ({
      ...job,
      startDate: normDate(job.startDate),
      endDate: job.current ? null : normDate(job.endDate),
    }));
  }

  p.lastUpdated = p.lastUpdated ?? Date.now();
  return p as UserProfile;
}

/**
 * Get stored user profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const result = await browser.storage.local.get(PROFILE_KEY);
    return result[PROFILE_KEY] || null;
  } catch (err) {
    console.error('Failed to get profile:', err);
    return null;
  }
}

/**
 * Save user profile
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    profile.lastUpdated = Date.now();
    await browser.storage.local.set({ [PROFILE_KEY]: profile });
  } catch (err) {
    console.error('Failed to save profile:', err);
    throw err;
  }
}

/**
 * Clear user profile
 */
export async function clearUserProfile(): Promise<void> {
  try {
    await browser.storage.local.remove(PROFILE_KEY);
  } catch (err) {
    console.error('Failed to clear profile:', err);
    throw err;
  }
}

/**
 * Check if profile exists
 */
export async function hasUserProfile(): Promise<boolean> {
  const profile = await getUserProfile();
  return profile !== null;
}

export interface ProfileCompleteness {
  isComplete: boolean;
  missingFields: string[];
  filledFields: string[];
  completionPercentage: number;
}

/**
 * Check how complete a user profile is, listing which fields are missing.
 * Useful for showing warnings in the popup when key data is absent.
 */
export function checkProfileCompleteness(profile: UserProfile): ProfileCompleteness {
  const fields: Array<{ label: string; value: unknown }> = [
    { label: 'First Name', value: profile.personal.firstName },
    { label: 'Last Name', value: profile.personal.lastName },
    { label: 'Email', value: profile.personal.email },
    { label: 'Phone', value: formatPhone(profile.personal.phone) },
    { label: 'Location', value: formatLocation(profile.personal.location) },
    { label: 'LinkedIn', value: profile.professional?.linkedin },
    { label: 'GitHub', value: profile.professional?.github },
    { label: 'Portfolio', value: profile.professional?.portfolio },
    { label: 'Current Role', value: (profile.professional as any)?.currentRole },
    { label: 'Years of Experience', value: profile.professional?.yearsOfExperience },
  ];

  const filledFields: string[] = [];
  const missingFields: string[] = [];

  for (const f of fields) {
    if (f.value !== null && f.value !== undefined && String(f.value).trim() !== '') {
      filledFields.push(f.label);
    } else {
      missingFields.push(f.label);
    }
  }

  const completionPercentage = Math.round((filledFields.length / fields.length) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    filledFields,
    completionPercentage,
  };
}
