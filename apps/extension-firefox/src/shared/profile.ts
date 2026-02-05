/**
 * User profile management - stores extracted resume data
 */

export interface SelfIdentification {
  gender: string[];
  race: string[];
  orientation: string[];
  veteran: string;
  transgender: string;
  disability: string;
}

export interface WorkAuthorization {
  requiresSponsorship: boolean;
  legallyAuthorized: boolean;
  visaType?: string; // e.g., "H-1B", "OPT", "CPT", "Green Card", "TN", "O-1", etc.
  sponsorshipTimeline?: string; // e.g., "Immediately", "Within 6 months", "Within 1 year"
  currentStatus?: string; // e.g., "US Citizen", "Permanent Resident", "Work Visa", "Student Visa"
}

export interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
  };
  professional: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    yearsOfExperience?: number;
  };
  work: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
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
  resumeText?: string; // Original resume text
  selfId?: SelfIdentification; // Optional self-identification data
  workAuth?: WorkAuthorization; // Work authorization and visa sponsorship info
  lastUpdated: number;
}

const PROFILE_KEY = 'userProfile';

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
