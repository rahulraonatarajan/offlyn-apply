/**
 * WhatsApp messaging via OpenClaw CLI
 */

import browser from './browser-compat';
import { getTodayApplications, markSummaryAsSent, generateSummaryMessage, getSettings } from './storage';

/**
 * Send a message via OpenClaw CLI to WhatsApp
 * Note: This will be called via the native host bridge
 */
export async function sendToWhatsApp(message: string, target: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Send request to native host to execute OpenClaw CLI command
    // The native host will execute: openclaw message send --channel whatsapp --target <target> --message <message>
    
    const request = {
      kind: 'SEND_WHATSAPP',
      target,
      message,
    };
    
    // Send to background script which will forward to native host
    const response = await browser.runtime.sendMessage(request);
    
    if (response && response.success) {
      return { success: true };
    } else {
      return { success: false, error: response?.error || 'Unknown error' };
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('Failed to send to WhatsApp:', error);
    return { success: false, error };
  }
}

/**
 * Send today's job application summary to WhatsApp
 */
export async function sendDailySummary(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const settings = await getSettings();
    
    if (!settings.whatsappTarget) {
      return { 
        success: false, 
        error: 'WhatsApp target number not configured. Set it in extension settings.' 
      };
    }
    
    const summary = await getTodayApplications();
    const message = generateSummaryMessage(summary);

    const result = await sendToWhatsApp(message, settings.whatsappTarget);

    if (result.success) {
      await markSummaryAsSent();
      return { success: true, message };
    } else {
      return { success: false, error: result.error || 'Failed to send to WhatsApp' };
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('Failed to send daily summary:', error);
    return { success: false, error };
  }
}
