/**
 * Typed wrappers around browser.storage.local
 */

import type { ExtensionSettings, JobApplication, DailySummary } from './types';

const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  dryRun: false,
  whatsappTarget: undefined, // User must set their WhatsApp number
};

export async function getSettings(): Promise<ExtensionSettings> {
  try {
    const result = await browser.storage.local.get('settings');
    return result.settings || DEFAULT_SETTINGS;
  } catch (err) {
    console.error('Failed to get settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function setSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await browser.storage.local.set({ settings: updated });
  } catch (err) {
    console.error('Failed to set settings:', err);
    throw err;
  }
}

export async function getTabJobInfo(tabId: number): Promise<Record<string, unknown> | null> {
  try {
    const key = `tabJobInfo_${tabId}`;
    const result = await browser.storage.local.get(key);
    return result[key] || null;
  } catch (err) {
    console.error('Failed to get tab job info:', err);
    return null;
  }
}

export async function setTabJobInfo(tabId: number, info: Record<string, unknown>): Promise<void> {
  try {
    const key = `tabJobInfo_${tabId}`;
    await browser.storage.local.set({ [key]: info });
  } catch (err) {
    console.error('Failed to set tab job info:', err);
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get today's job applications
 */
export async function getTodayApplications(): Promise<DailySummary> {
  try {
    const today = getTodayDate();
    const key = `dailySummary_${today}`;
    const result = await browser.storage.local.get(key);
    
    if (result[key]) {
      return result[key] as DailySummary;
    }
    
    return {
      date: today,
      applications: [],
      lastSentAt: null,
    };
  } catch (err) {
    console.error('Failed to get today applications:', err);
    return {
      date: getTodayDate(),
      applications: [],
      lastSentAt: null,
    };
  }
}

/**
 * Add a job application to today's summary
 */
export async function addJobApplication(app: JobApplication): Promise<void> {
  try {
    const summary = await getTodayApplications();
    
    // Check if this job already exists (by URL)
    const exists = summary.applications.some(a => a.url === app.url);
    if (exists) {
      // Update status if it's a submission
      if (app.status === 'submitted') {
        summary.applications = summary.applications.map(a => 
          a.url === app.url ? { ...a, status: 'submitted', timestamp: app.timestamp } : a
        );
      }
    } else {
      summary.applications.push(app);
    }
    
    const key = `dailySummary_${summary.date}`;
    await browser.storage.local.set({ [key]: summary });
  } catch (err) {
    console.error('Failed to add job application:', err);
  }
}

/**
 * Mark today's summary as sent
 */
export async function markSummaryAsSent(): Promise<void> {
  try {
    const summary = await getTodayApplications();
    summary.lastSentAt = Date.now();
    const key = `dailySummary_${summary.date}`;
    await browser.storage.local.set({ [key]: summary });
  } catch (err) {
    console.error('Failed to mark summary as sent:', err);
  }
}

/**
 * Generate WhatsApp message from today's applications
 */
export function generateSummaryMessage(summary: DailySummary): string {
  const count = summary.applications.length;
  
  if (count === 0) {
    return `📊 Daily Job Application Summary (${summary.date})\n\n✅ No applications today.`;
  }
  
  const submittedCount = summary.applications.filter(a => a.status === 'submitted').length;
  const detectedCount = count - submittedCount;
  
  let message = `📊 Daily Job Application Summary (${summary.date})\n\n`;
  message += `Total: ${count} positions\n`;
  message += `✅ Submitted: ${submittedCount}\n`;
  message += `👁️ Detected: ${detectedCount}\n\n`;
  
  message += `📋 Details:\n`;
  summary.applications.forEach((app, i) => {
    const status = app.status === 'submitted' ? '✅' : '👁️';
    message += `\n${i + 1}. ${status} ${app.jobTitle}\n`;
    message += `   🏢 ${app.company}\n`;
    if (app.atsHint) {
      message += `   📝 ATS: ${app.atsHint}\n`;
    }
  });
  
  return message;
}
