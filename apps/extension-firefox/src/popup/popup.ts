/**
 * Popup UI logic
 */

import type { PopupState } from '../shared/types';
import { getSettings, setSettings, getTodayApplications, generateSummaryMessage } from '../shared/storage';
import { log, error } from '../shared/log';

let currentState: PopupState = {
  enabled: true,
  dryRun: false,
  nativeHostConnected: false,
  lastError: null,
  lastJob: null,
};

/**
 * Update UI from state
 */
function updateUI(): void {
  // Update toggles
  const enabledToggle = document.getElementById('enabled-toggle');
  const dryrunToggle = document.getElementById('dryrun-toggle');
  
  if (enabledToggle) {
    enabledToggle.classList.toggle('active', currentState.enabled);
  }
  if (dryrunToggle) {
    dryrunToggle.classList.toggle('active', currentState.dryRun);
  }
  
  // Update status
  const statusEl = document.getElementById('status');
  const errorTextEl = document.getElementById('error-text');
  
  if (statusEl) {
    if (currentState.nativeHostConnected) {
      statusEl.textContent = 'Native Host Connected';
      statusEl.className = 'status connected';
      if (errorTextEl) {
        errorTextEl.style.display = 'none';
      }
    } else {
      statusEl.textContent = 'Native Host Disconnected';
      statusEl.className = 'status disconnected';
      if (errorTextEl && currentState.lastError) {
        errorTextEl.textContent = currentState.lastError;
        errorTextEl.style.display = 'block';
      } else if (errorTextEl) {
        errorTextEl.style.display = 'none';
      }
    }
  }
  
  // Update job info
  const jobInfoEl = document.getElementById('job-info');
  if (jobInfoEl) {
    if (currentState.lastJob) {
      const title = currentState.lastJob.title || 'Unknown Title';
      const ats = currentState.lastJob.atsHint ? ` (${currentState.lastJob.atsHint})` : '';
      const hostname = currentState.lastJob.hostname;
      
      jobInfoEl.innerHTML = `
        <div class="job-info-title">${escapeHtml(title)}${escapeHtml(ats)}</div>
        <div class="job-info-meta">${escapeHtml(hostname)}</div>
      `;
    } else {
      jobInfoEl.innerHTML = '<div class="job-info-empty">No job detected yet</div>';
    }
  }
}

/**
 * Update summary count
 */
async function updateSummaryCount(): Promise<void> {
  try {
    const summary = await getTodayApplications();
    const countEl = document.getElementById('summary-count');
    
    if (countEl) {
      const total = summary.applications.length;
      const submitted = summary.applications.filter(a => a.status === 'submitted').length;
      const detected = total - submitted;
      
      if (total === 0) {
        countEl.innerHTML = 'No applications today yet';
      } else {
        countEl.innerHTML = `
          <strong>${total}</strong> application${total !== 1 ? 's' : ''} today
          <br>
          <span style="font-size: 12px;">✅ ${submitted} submitted · 👁️ ${detected} detected</span>
        `;
      }
    }
  } catch (err) {
    error('Failed to update summary count:', err);
  }
}

/**
 * Copy daily summary to clipboard
 */
async function copySummary(): Promise<void> {
  const btn = document.getElementById('copy-summary-btn') as HTMLButtonElement;
  const statusEl = document.getElementById('summary-status');
  const textArea = document.getElementById('summary-text') as HTMLTextAreaElement;
  
  if (!btn || !statusEl || !textArea) return;
  
  try {
    const summary = await getTodayApplications();
    const message = generateSummaryMessage(summary);
    
    // Show the text area with the message
    textArea.value = message;
    textArea.style.display = 'block';
    
    // Copy to clipboard
    await navigator.clipboard.writeText(message);
    
    statusEl.textContent = '✅ Summary copied to clipboard!';
    statusEl.className = 'summary-status success';
    statusEl.style.display = 'block';
    
    // Hide status after 3 seconds
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  } catch (err) {
    error('Failed to copy summary:', err);
    if (statusEl) {
      statusEl.textContent = '❌ Failed to copy summary';
      statusEl.className = 'summary-status error';
      statusEl.style.display = 'block';
    }
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Request state from background
 */
async function requestState(): Promise<void> {
  try {
    await browser.runtime.sendMessage({ kind: 'GET_STATE' });
  } catch (err) {
    error('Failed to request state:', err);
  }
}

/**
 * Initialize popup
 */
async function init(): Promise<void> {
  // Load current settings
  const settings = await getSettings();
  currentState.enabled = settings.enabled;
  currentState.dryRun = settings.dryRun;
  
  // Request state from background
  requestState();
  
  // Setup profile button
  const setupBtn = document.getElementById('setup-profile-btn');
  if (setupBtn) {
    setupBtn.addEventListener('click', () => {
      browser.tabs.create({
        url: browser.runtime.getURL('onboarding/onboarding.html')
      });
    });
  }
  
  // Set up toggle handlers
  const enabledToggle = document.getElementById('enabled-toggle');
  const dryrunToggle = document.getElementById('dryrun-toggle');
  
  if (enabledToggle) {
    enabledToggle.addEventListener('click', async () => {
      currentState.enabled = !currentState.enabled;
      await setSettings({ enabled: currentState.enabled });
      updateUI();
    });
  }
  
  if (dryrunToggle) {
    dryrunToggle.addEventListener('click', async () => {
      currentState.dryRun = !currentState.dryRun;
      await setSettings({ dryRun: currentState.dryRun });
      updateUI();
    });
  }
  
  // Set up copy summary button
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  if (copySummaryBtn) {
    copySummaryBtn.addEventListener('click', () => {
      copySummary();
    });
  }
  
  // Listen for state updates from background
  browser.runtime.onMessage.addListener((message: unknown) => {
    if (typeof message === 'object' && message !== null && 'kind' in message) {
      if (message.kind === 'STATE_UPDATE') {
        const update = message as Partial<PopupState> & { kind: string };
        currentState = {
          ...currentState,
          enabled: update.enabled ?? currentState.enabled,
          dryRun: update.dryRun ?? currentState.dryRun,
          nativeHostConnected: update.nativeHostConnected ?? currentState.nativeHostConnected,
          lastError: update.lastError ?? currentState.lastError,
          lastJob: update.lastJob ?? currentState.lastJob,
        };
        updateUI();
        updateSummaryCount(); // Update summary count when state changes
      }
    }
  });
  
  // Initial UI update
  updateUI();
  updateSummaryCount();
  
  // Poll for state updates every 2 seconds
  setInterval(() => {
    requestState();
    updateSummaryCount();
  }, 2000);
  
  log('Popup initialized');
}

init();
