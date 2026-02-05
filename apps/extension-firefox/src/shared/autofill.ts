/**
 * Auto-fill form fields using user profile
 */

import type { FieldSchema, FillMapping } from './types';
import type { UserProfile } from './profile';
import { getCountryCode, getPhoneNumber, parsePhoneNumber } from './phone-parser';

/**
 * Generate fill mappings from profile and form schema
 */
export function generateFillMappings(schema: FieldSchema[], profile: UserProfile): FillMapping[] {
  const mappings: FillMapping[] = [];
  
  for (const field of schema) {
    const value = matchFieldToProfile(field, profile);
    if (value !== null) {
      mappings.push({
        selector: field.selector,
        value,
      });
    }
  }
  
  return mappings;
}

/**
 * Match a form field to profile data
 */
function matchFieldToProfile(field: FieldSchema, profile: UserProfile): string | boolean | null {
  const label = (field.label || field.name || field.id || '').toLowerCase();
  const name = (field.name || '').toLowerCase();
  const id = (field.id || '').toLowerCase();
  
  // First name
  if (matchesAny([label, name, id], ['first', 'fname', 'firstname', 'given'])) {
    return profile.personal.firstName;
  }
  
  // Last name
  if (matchesAny([label, name, id], ['last', 'lname', 'lastname', 'family', 'surname'])) {
    return profile.personal.lastName;
  }
  
  // Full name
  if (matchesAny([label, name, id], ['name', 'fullname', 'full_name']) && 
      !matchesAny([label, name, id], ['first', 'last', 'company'])) {
    return `${profile.personal.firstName} ${profile.personal.lastName}`;
  }
  
  // Email
  if (matchesAny([label, name, id], ['email', 'e-mail', 'mail'])) {
    return profile.personal.email;
  }
  
  // Phone - Country Code (separate field)
  if (matchesAny([label, name, id], ['country code', 'countrycode', 'country_code', 'phone_country', 'phonecountry', 'dialcode', 'dial code', 'dial_code', 'phone code', 'select country'])) {
    const code = getCountryCode(profile.personal.phone);
    
    // Check if this is a custom dropdown (type=text but has options)
    // Some fields expect full format: "United States (+1)"
    // Others expect just: "+1"
    // Check current value to determine expected format
    const currentValue = field.valuePreview || '';
    if (currentValue.includes('United States') || currentValue.includes('🇺🇸')) {
      // This field expects full country name format
      // Map common country codes to names
      const countryNames: Record<string, string> = {
        '+1': 'United States',
        '+44': 'United Kingdom',
        '+91': 'India',
        '+86': 'China',
        '+81': 'Japan',
        '+49': 'Germany',
        '+33': 'France',
        '+61': 'Australia',
        // Add more as needed
      };
      
      const countryName = countryNames[code];
      if (countryName) {
        return `${countryName} (${code})`; // Format: "United States (+1)"
      }
    }
    
    // Default: just return the code
    return code;
  }
  
  // Phone - Check if this is JUST the phone number field (without country code)
  if (matchesAny([label, name, id], ['phone', 'mobile', 'tel', 'telephone', 'cell', 'phone_number', 'phonenumber', 'mobile_number', 'mobilenumber'])) {
    // Try to detect if this is a split phone field by checking:
    // 1. Field type (tel fields are often split)
    // 2. Nearby labels/fields mentioning country code
    // 3. Field length (short fields suggest split)
    
    const fieldType = field.type;
    const maxLength = field instanceof HTMLInputElement ? field.maxLength : -1;
    
    // Check DOM for nearby country code field
    let hasCountryCodeField = false;
    try {
      // Look in the same form or parent container
      const container = typeof document !== 'undefined' ? 
        (field.closest?.('form') || field.closest?.('div[class*="form"]') || field.closest?.('fieldset') || document.body) : 
        null;
      
      if (container) {
        hasCountryCodeField = !!container.querySelector('[name*="country"][name*="code"], [name*="countrycode"], [id*="country"][id*="code"], [id*="countrycode"], [placeholder*="country code"], select[name*="country"]');
      }
    } catch (e) {
      // DOM not available, fallback
    }
    
    // Also check if max length suggests a local number (10-11 digits)
    const suggestsSplit = hasCountryCodeField || (maxLength > 0 && maxLength <= 11);
    
    if (suggestsSplit) {
      // Return just the phone number without country code
      return getPhoneNumber(profile.personal.phone);
    } else {
      // Return full phone number with country code
      const parsed = parsePhoneNumber(profile.personal.phone);
      return parsed.fullNumber;
    }
  }
  
  // Location / City / Address
  // EXCLUDE if this is asking about work authorization/sponsorship
  if (matchesAny([label, name, id], ['location', 'city', 'address', 'where'])) {
    const labelLower = (label || '').toLowerCase();
    
    // Don't match if this is really asking about work authorization
    if (labelLower.includes('sponsorship') || 
        labelLower.includes('visa') || 
        labelLower.includes('work authorization') ||
        (labelLower.includes('require') && labelLower.includes('work'))) {
      // Skip - this is work auth question, not location
      return null;
    }
    
    return profile.personal.location || '';
  }
  
  // LinkedIn
  if (matchesAny([label, name, id], ['linkedin', 'linked-in'])) {
    return profile.professional.linkedin || '';
  }
  
  // GitHub
  if (matchesAny([label, name, id], ['github', 'git'])) {
    return profile.professional.github || '';
  }
  
  // Portfolio / Website
  if (matchesAny([label, name, id], ['portfolio', 'website', 'site', 'web'])) {
    return profile.professional.portfolio || '';
  }
  
  // Years of experience
  if (matchesAny([label, name, id], ['experience', 'years', 'yoe'])) {
    const labelLower = (label || '').toLowerCase();
    
    // EXCLUDE self-ID questions
    if (labelLower.includes('transgender') || 
        labelLower.includes('veteran') ||
        labelLower.includes('disability') ||
        labelLower.includes('gender') ||
        labelLower.includes('identity')) {
      // This is a self-ID question, not experience
      return null;
    }
    
    return profile.professional.yearsOfExperience?.toString() || '';
  }
  
  // Cover letter / Summary
  if (field.tagName === 'TEXTAREA' && matchesAny([label, name, id], ['cover', 'letter', 'summary', 'about', 'bio'])) {
    return profile.summary || '';
  }

  // Work Authorization fields (if user has provided this data)
  if (profile.workAuth) {
    // Legally authorized to work
    if (matchesAny([label, name, id], ['legally', 'authorized', 'legal', 'eligible', 'work authorization'])) {
      if (field.type === 'checkbox' || field.type === 'radio') {
        const fieldValue = (field.valuePreview || '').toLowerCase();
        const fieldLabel = (field.label || '').toLowerCase();
        
        // Check if this is asking for "yes" answer
        const isYesOption = fieldValue.includes('yes') || fieldLabel.includes('yes') || 
                           fieldValue.includes('authorized') || fieldValue.includes('eligible');
        const isNoOption = fieldValue.includes('no') || fieldLabel.includes('no');
        
        if (profile.workAuth.legallyAuthorized) {
          return isYesOption;
        } else {
          return isNoOption;
        }
      } else if (field.type === 'select-one') {
        return profile.workAuth.legallyAuthorized ? 'Yes' : 'No';
      }
    }

    // Requires sponsorship
    if (matchesAny([label, name, id], ['sponsorship', 'visa', 'sponsor', 'work permit', 'require'])) {
      const labelLower = (label || '').toLowerCase();
      
      // Skip if this is asking about visa TYPE (handled below)
      if (matchesAny([label, name, id], ['type', 'kind', 'which'])) {
        // This is asking for visa type, not yes/no
        if (profile.workAuth.visaType) {
          return profile.workAuth.visaType;
        }
      } else {
        // Ensure this is really a sponsorship YES/NO question
        if (!labelLower.includes('sponsor') && !labelLower.includes('visa') && !labelLower.includes('require')) {
          return null; // Not specific enough
        }
        
        // This is asking yes/no about sponsorship requirement
        if (field.type === 'checkbox' || field.type === 'radio') {
          const fieldValue = (field.valuePreview || '').toLowerCase();
          const fieldLabel = (field.label || '').toLowerCase();
          
          const isYesOption = fieldValue.includes('yes') || fieldLabel.includes('yes') ||
                             fieldValue.includes('require') || fieldValue.includes('need');
          const isNoOption = fieldValue.includes('no') || fieldLabel.includes('no');
          
          if (profile.workAuth.requiresSponsorship) {
            return isYesOption;
          } else {
            return isNoOption;
          }
        } else if (field.type === 'select-one' || field.type === 'text') {
          // For text fields (custom dropdowns), return Yes/No
          const answer = profile.workAuth.requiresSponsorship ? 'Yes' : 'No';
          console.log('[Autofill] Sponsorship question detected, returning:', answer);
          return answer;
        }
      }
    }

    // Current work status
    if (matchesAny([label, name, id], ['status', 'citizenship', 'citizen', 'resident', 'permanent'])) {
      if (profile.workAuth.currentStatus) {
        return profile.workAuth.currentStatus;
      }
    }

    // Visa type
    if (matchesAny([label, name, id], ['visa type', 'visa', 'h-1b', 'opt', 'cpt', 'immigration'])) {
      if (profile.workAuth.visaType) {
        return profile.workAuth.visaType;
      }
    }

    // Sponsorship timeline
    if (matchesAny([label, name, id], ['when', 'timeline', 'timeframe', 'how soon'])) {
      if (profile.workAuth.sponsorshipTimeline) {
        return profile.workAuth.sponsorshipTimeline;
      }
    }
  }
  
  // Self-ID questions (if user has provided this data)
  if (profile.selfId) {
    // Gender identity
    if (matchesAny([label, name, id], ['gender', 'sex'])) {
      // For checkboxes/radio buttons, check if this specific option matches user's selections
      if (field.type === 'checkbox' || field.type === 'radio') {
        const fieldValue = field.valuePreview || '';
        const fieldLabel = (field.label || '').toLowerCase();
        
        // Check if any of the user's gender selections match this field's value or label
        return profile.selfId.gender.some(g => {
          const gLower = g.toLowerCase();
          return fieldValue.toLowerCase().includes(gLower) || 
                 fieldLabel.includes(gLower) ||
                 gLower.includes(fieldValue.toLowerCase());
        });
      }
      // For select/text, return first selection
      return profile.selfId.gender[0] || '';
    }
    
    // Race/Ethnicity
    if (matchesAny([label, name, id], ['race', 'ethnicity', 'ethnic'])) {
      if (field.type === 'checkbox' || field.type === 'radio') {
        const fieldValue = field.valuePreview || '';
        const fieldLabel = (field.label || '').toLowerCase();
        
        return profile.selfId.race.some(r => {
          const rLower = r.toLowerCase();
          return fieldValue.toLowerCase().includes(rLower) || 
                 fieldLabel.includes(rLower) ||
                 rLower.includes(fieldValue.toLowerCase());
        });
      }
      
      // For text/select fields, validate the value makes sense
      const value = profile.selfId.race[0] || '';
      // Don't fill if value looks like wrong data (location, sponsorship, etc.)
      if (value && (
        value.toLowerCase().includes('palo alto') ||
        value.toLowerCase().includes('resident') ||
        value.toLowerCase().includes('citizen') ||
        value.toLowerCase().includes('sponsorship') ||
        value.toLowerCase().includes('visa') ||
        /^\d+$/.test(value) // Just a number
      )) {
        console.warn('[Autofill] Race value looks suspicious (might be location/work auth):', value);
        return null; // Skip filling
      }
      
      return value;
    }
    
    // Hispanic/Latino ethnicity (specific question)
    if (matchesAny([label, name, id], ['hispanic', 'latino', 'latina', 'latinx'])) {
      const labelLower = (label || '').toLowerCase();
      
      // STRICT: Only if label explicitly mentions hispanic/latino
      if (!labelLower.includes('hispanic') && !labelLower.includes('latino')) {
        return null;
      }
      
      if (field.type === 'checkbox' || field.type === 'radio') {
        const fieldValue = field.valuePreview || '';
        const fieldLabel = (field.label || '').toLowerCase();
        
        // Check if user's ethnicity data includes Hispanic/Latino
        const isHispanic = profile.selfId.race.some(r => 
          r.toLowerCase().includes('hispanic') || r.toLowerCase().includes('latino')
        );
        
        return fieldValue.toLowerCase().includes(isHispanic ? 'yes' : 'no');
      }
      
      // For text/select, return appropriate answer
      const isHispanic = profile.selfId.race.some(r => 
        r.toLowerCase().includes('hispanic') || r.toLowerCase().includes('latino')
      );
      return isHispanic ? 'Yes' : 'No';
    }
    
    // Sexual orientation
    if (matchesAny([label, name, id], ['orientation', 'sexual'])) {
      if (field.type === 'checkbox' || field.type === 'radio') {
        const fieldValue = field.valuePreview || '';
        const fieldLabel = (field.label || '').toLowerCase();
        
        return profile.selfId.orientation.some(o => {
          const oLower = o.toLowerCase();
          return fieldValue.toLowerCase().includes(oLower) || 
                 fieldLabel.includes(oLower) ||
                 oLower.includes(fieldValue.toLowerCase());
        });
      }
      return profile.selfId.orientation[0] || '';
    }
    
    // Veteran status
    if (matchesAny([label, name, id], ['veteran', 'military'])) {
      // STRICT: Only if label explicitly mentions veteran (not just contains "us" or "permanent")
      const labelLower = (label || '').toLowerCase();
      if (!labelLower.includes('veteran') && !labelLower.includes('military')) {
        return null; // Don't match if not clearly veteran question
      }
      
      if (field.type === 'radio' || field.type === 'checkbox') {
        const fieldValue = field.valuePreview || '';
        const fieldLabel = (field.label || '').toLowerCase();
        const veteranLower = profile.selfId.veteran.toLowerCase();
        
        return fieldValue.toLowerCase().includes(veteranLower) || 
               fieldLabel.includes(veteranLower) ||
               veteranLower.includes(fieldValue.toLowerCase());
      }
      
      // For text/select fields, validate the value makes sense
      const value = profile.selfId.veteran;
      // Don't fill if value looks like wrong data (contains "resident", "citizen", etc.)
      if (value && (
        value.toLowerCase().includes('resident') ||
        value.toLowerCase().includes('citizen') ||
        value.toLowerCase().includes('sponsorship') ||
        /^\d+$/.test(value) // Just a number
      )) {
        console.warn('[Autofill] Veteran value looks suspicious:', value);
        return null; // Skip filling
      }
      
      return value;
    }
    
    // Transgender experience
    if (matchesAny([label, name, id], ['transgender', 'trans'])) {
      // STRICT: Only if label explicitly mentions transgender
      const labelLower = (label || '').toLowerCase();
      if (!labelLower.includes('transgender') && !labelLower.includes('trans ')) {
        return null;
      }
      
      if (field.type === 'radio' || field.type === 'checkbox') {
        const fieldValue = field.valuePreview || '';
        const fieldLabel = (field.label || '').toLowerCase();
        const transLower = profile.selfId.transgender.toLowerCase();
        
        return fieldValue.toLowerCase().includes(transLower) || 
               fieldLabel.includes(transLower) ||
               transLower.includes(fieldValue.toLowerCase());
      }
      
      // Validate value is reasonable (Yes, No, Prefer not to answer, etc.)
      const value = profile.selfId.transgender;
      if (value && (
        /^\d+$/.test(value) || // Just a number
        value.length > 50 || // Too long
        value.toLowerCase().includes('resident') ||
        value.toLowerCase().includes('sponsorship')
      )) {
        console.warn('[Autofill] Transgender value looks suspicious:', value);
        return null;
      }
      
      return value;
    }
    
    // Disability status
    if (matchesAny([label, name, id], ['disability', 'disabled'])) {
      // STRICT: Only if label explicitly mentions disability
      const labelLower = (label || '').toLowerCase();
      if (!labelLower.includes('disability') && !labelLower.includes('disabled')) {
        return null; // Don't match if not clearly disability question
      }
      
      if (field.type === 'radio' || field.type === 'checkbox') {
        const fieldValue = field.valuePreview || '';
        const fieldLabel = (field.label || '').toLowerCase();
        const disabilityLower = profile.selfId.disability.toLowerCase();
        
        return fieldValue.toLowerCase().includes(disabilityLower) || 
               fieldLabel.includes(disabilityLower) ||
               disabilityLower.includes(fieldValue.toLowerCase());
      }
      
      // For text/select fields, validate the value makes sense
      const value = profile.selfId.disability;
      // Don't fill if value looks like wrong data (contains "resident", "citizen", etc.)
      if (value && (
        value.toLowerCase().includes('resident') ||
        value.toLowerCase().includes('citizen') ||
        value.toLowerCase().includes('sponsorship') ||
        value.toLowerCase().includes('palo alto') ||
        value.toLowerCase().includes('visa') ||
        /^\d+$/.test(value) // Just a number
      )) {
        console.warn('[Autofill] Disability value looks suspicious:', value);
        return null; // Skip filling
      }
      
      return value;
    }
  }
  
  return null;
}

/**
 * Check if any of the texts match any of the patterns
 */
function matchesAny(texts: string[], patterns: string[]): boolean {
  for (const text of texts) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        return true;
      }
    }
  }
  return false;
}
