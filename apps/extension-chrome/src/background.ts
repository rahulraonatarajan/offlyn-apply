/**
 * Background service worker for managing Ollama communication and relaying events.
 * Chrome Manifest V3 — no persistent background page; event-driven only.
 */

import browser, { type Runtime } from './shared/browser-compat';
import type { ApplyEvent, TabJobInfo, JobApplication } from './shared/types';
import { getSettings, setTabJobInfo, getTabJobInfo, addJobApplication, getAllApplications } from './shared/storage';
import { log, info, warn, error } from './shared/log';
import { sendDailySummary } from './shared/whatsapp';
import { mastraAgent as ollama } from './shared/mastra-agent';
import { ragParser } from './shared/rag-parser';
import { enrichParseErrorMessage } from './shared/error-classify';

// ── Ephemeral state (lives only while the service worker is active) ────────

interface ConnectionState {
  connected: boolean;
  lastError: string | null;
  checking: boolean;
}

let connectionState: ConnectionState = {
  connected: false,
  lastError: null,
  checking: false,
};

const GENERIC_JOB_TITLES = new Set([
  'apply for this job',
  'apply now',
  'apply to this job',
  'apply to this position',
  'submit application',
  'submit your application',
  'job application',
  'application form',
  'apply',
  'apply here',
  'apply today',
  'apply online',
  'apply for this position',
  'apply for this role',
  'apply for job',
  'quick apply',
]);

const GENERIC_COMPANY_NAMES = new Set([
  'job-boards',
  'job boards',
  'jobs',
  'careers',
  'jobboard',
  'job board',
  'career',
  'hiring',
  'recruiter',
  'recruitment',
  'talent',
  'hr',
  'human resources',
  'greenhouse',
  'lever',
  'workday',
  'ashby',
  'bamboohr',
  'icims',
  'smartrecruiters',
  'taleo',
  'boards',
]);

function isGenericJobEntry(jobTitle: string, company: string): boolean {
  const titleNorm = jobTitle.trim().toLowerCase();
  const companyNorm = company.trim().toLowerCase();
  return GENERIC_JOB_TITLES.has(titleNorm) || GENERIC_COMPANY_NAMES.has(companyNorm);
}

// ── Ollama connection check ────────────────────────────────────────────────

async function checkOllamaConnection(): Promise<void> {
  if (connectionState.checking) return;

  connectionState.checking = true;

  try {
    const isAvailable = await ollama.isAvailable();

    if (isAvailable) {
      if (!connectionState.connected) {
        connectionState.connected = true;
        connectionState.lastError = null;
        info('Connected to Ollama');

        const version = await ollama.getVersion();
        if (version) {
          log('Ollama version:', version.version);
        }
      }
    } else {
      if (connectionState.connected) {
        connectionState.connected = false;
        connectionState.lastError = 'Ollama not reachable at http://localhost:11434';
        warn('Ollama connection lost');
      }
    }
  } catch (err) {
    connectionState.connected = false;
    connectionState.lastError = err instanceof Error ? err.message : 'Unknown error';
    error('Error checking Ollama connection:', err);
  } finally {
    connectionState.checking = false;
  }
}

// ── Message handler ────────────────────────────────────────────────────────

browser.runtime.onMessage.addListener(async (message: unknown, sender: Runtime.MessageSender) => {
  try {
    if (typeof message !== 'object' || message === null || !('kind' in message)) {
      return;
    }

    if (message.kind === 'PARSE_RESUME') {
      info('Received PARSE_RESUME request from onboarding');

      if (!connectionState.connected) {
        await checkOllamaConnection();
      }

      if (!connectionState.connected) {
        error('Ollama not connected');
        return {
          kind: 'ERROR',
          requestId: 'parse_error',
          message: 'Ollama not connected. Please ensure Ollama is running at http://localhost:11434',
        };
      }

      const requestId = `parse_${Date.now()}`;
      const resumeText = (message as any).resumeText;

      info('Parsing resume with Ollama, length:', resumeText?.length);

      const broadcastProgress = (stage: string, percent: number, detail?: string) => {
        browser.runtime.sendMessage({
          kind: 'PARSE_PROGRESS',
          stage,
          percent,
          detail: detail || '',
        }).catch(() => {});
      };

      try {
        const useRAG = (message as any).useRAG !== false;

        let profile: any;

        if (useRAG) {
          info('Using RAG-based parsing for higher accuracy...');

          profile = await ragParser.parseResume(resumeText, (stage, percent, detail) => {
            info(`RAG parsing: ${stage} (${percent}%)`);
            broadcastProgress(stage, percent, detail);
          });

          info('Successfully parsed profile with RAG');
        } else {
          info('Using legacy chunking parser...');

          profile = await ollama.parseResume(resumeText, (stage, percent) => {
            info(`Parsing progress: ${stage} (${percent}%)`);
            broadcastProgress(stage, percent);
          });

          info('Successfully parsed profile with chunking');
        }

        return {
          kind: 'RESUME_PARSED',
          requestId,
          profile,
        };
      } catch (err) {
        error('Failed to parse resume:', err);

        if ((message as any).useRAG !== false) {
          warn('RAG parsing failed, trying legacy parser...');
          try {
            const profile = await ollama.parseResume(resumeText, (stage, percent) => {
              info(`Fallback parsing: ${stage} (${percent}%)`);
            });

            return {
              kind: 'RESUME_PARSED',
              requestId,
              profile,
            };
          } catch (fallbackErr) {
            error('Fallback parsing also failed:', fallbackErr);
          }
        }

        const messageText = enrichParseErrorMessage(
          err instanceof Error ? err.message : 'Failed to parse resume',
        );

        return {
          kind: 'ERROR',
          requestId,
          message: messageText,
        };
      }
    }

    if (message.kind === 'SUGGEST_FIELD') {
      const { fieldName, resumeText } = message as any;
      info('Received SUGGEST_FIELD request for:', fieldName);

      if (!connectionState.connected) {
        await checkOllamaConnection();
      }
      if (!connectionState.connected) {
        return { kind: 'SUGGEST_FIELD_RESULT', fieldName, value: '', error: 'Ollama not connected' };
      }

      const fieldHints: Record<string, string> = {
        firstName: 'the person\'s first name',
        lastName: 'the person\'s last name',
        email: 'the person\'s email address',
        phone: 'the person\'s phone number',
        location: 'the person\'s city and state/country location',
        linkedin: 'the person\'s LinkedIn profile URL',
        github: 'the person\'s GitHub profile URL',
        portfolio: 'the person\'s portfolio or personal website URL',
        yearsOfExperience: 'the total years of professional experience (just the number)',
        summary: 'a concise 2-3 sentence professional summary highlighting key qualifications',
      };

      const hint = fieldHints[fieldName] || `the value for the "${fieldName}" field`;

      try {
        const { OllamaClient } = await import('./shared/ollama-client');
        const client = new OllamaClient();
        const raw = await client.chat([
          {
            role: 'system',
            content: 'You extract information from resumes. Return ONLY the requested value, nothing else. No labels, no quotes, no explanation. If the information is not found, return an empty string.',
          },
          {
            role: 'user',
            content: `From this resume, extract ${hint}:\n\n${(resumeText || '').substring(0, 4000)}`,
          },
        ], { temperature: 0.1 });

        const value = (raw || '').trim().replace(/^["']|["']$/g, '');
        info('SUGGEST_FIELD result for', fieldName, ':', value.substring(0, 80));
        return { kind: 'SUGGEST_FIELD_RESULT', fieldName, value };
      } catch (err) {
        error('SUGGEST_FIELD failed:', err);
        return {
          kind: 'SUGGEST_FIELD_RESULT',
          fieldName,
          value: '',
          error: err instanceof Error ? err.message : 'Failed to generate suggestion',
        };
      }
    }

    if (message.kind === 'JOB_APPLY_EVENT') {
      const event = message as ApplyEvent;
      const tabId = sender.tab?.id;

      if (!tabId) {
        warn('Received event without tab ID');
        return;
      }

      const jobInfo: TabJobInfo = {
        lastJobMeta: event.jobMeta,
        lastSchemaHash: JSON.stringify(event.schema).length.toString(),
        lastSeenAt: Date.now(),
      };
      await setTabJobInfo(tabId, jobInfo);

      if (event.eventType === 'SUBMIT_ATTEMPT') {
        console.log('[Background] SUBMIT_ATTEMPT event received:', {
          jobTitle: event.jobMeta.jobTitle,
          company: event.jobMeta.company,
          url: event.jobMeta.url,
        });

        let jobTitle = event.jobMeta.jobTitle;
        let company = event.jobMeta.company;

        if (!jobTitle) {
          console.warn('[Background] Missing jobTitle - using fallback');
          try {
            const pathParts = new URL(event.jobMeta.url).pathname.split('/').filter(Boolean);
            const lastPart = pathParts[pathParts.length - 1];
            jobTitle = lastPart ? lastPart.replace(/[-_]/g, ' ') : 'Unknown Position';
          } catch {
            jobTitle = 'Unknown Position';
          }
        }

        if (!company) {
          console.warn('[Background] Missing company - using fallback');
          try {
            const parsedUrl = new URL(event.jobMeta.url);
            const hostname = parsedUrl.hostname.toLowerCase();
            const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
            if (hostname === 'job-boards.greenhouse.io' || hostname === 'boards.greenhouse.io' || hostname === 'jobs.lever.co') {
              company = pathParts[0] || 'Unknown Company';
            } else {
              const parts = hostname.replace(/^www\./, '').split('.');
              const GENERIC_SUBDOMAINS = new Set(['careers', 'jobs', 'hiring', 'apply', 'work', 'talent', 'recruit', 'hr', 'job', 'career', 'boards', 'job-boards']);
              const companyPart = parts.find(p => !GENERIC_SUBDOMAINS.has(p.toLowerCase()) && p !== 'com' && p !== 'io' && p !== 'net' && p !== 'org' && p !== 'co' && p.length > 1);
              company = companyPart || parts[0] || 'Unknown Company';
            }
          } catch {
            company = 'Unknown Company';
          }
        }

        if (isGenericJobEntry(jobTitle, company)) {
          console.warn('[Background] Skipping generic/invalid entry:', jobTitle, 'at', company);
        } else {
          const app: JobApplication = {
            jobTitle,
            company,
            url: event.jobMeta.url,
            atsHint: event.jobMeta.atsHint,
            timestamp: Date.now(),
            status: 'submitted',
          };
          await addJobApplication(app);
          console.log('[Background] Application tracked:', app.jobTitle, 'at', app.company);
          log(`Tracked submitted application:`, app.jobTitle, 'at', app.company);
        }
      }

      return;
    }

    if (message.kind === 'GET_STATE') {
      const settings = await getSettings();
      let lastJob = null;

      let tabId = sender.tab?.id;

      if (!tabId) {
        try {
          const activeTabs = await browser.tabs.query({ active: true, currentWindow: true });
          if (activeTabs[0]?.id) {
            tabId = activeTabs[0].id;
          }
        } catch {
          // Ignore query errors
        }
      }

      if (tabId) {
        const jobInfo = await getTabJobInfo(tabId) as TabJobInfo | null;
        if (jobInfo?.lastJobMeta) {
          try {
            const url = new URL(jobInfo.lastJobMeta.url);
            lastJob = {
              title: jobInfo.lastJobMeta.jobTitle,
              atsHint: jobInfo.lastJobMeta.atsHint,
              hostname: url.hostname,
            };
          } catch {
            // Ignore
          }
        }
      }

      if (!connectionState.connected) {
        await checkOllamaConnection();
      }

      let statTotal = 0;
      let statInterviewing = 0;
      try {
        const apps = await getAllApplications();
        statTotal = apps.length;
        statInterviewing = apps.filter(a => a.status === 'interviewing').length;
      } catch {
        // Non-fatal
      }

      return {
        kind: 'STATE_UPDATE',
        enabled: settings.enabled,
        dryRun: settings.dryRun,
        nativeHostConnected: connectionState.connected,
        lastError: connectionState.lastError,
        lastJob,
        statTotal,
        statInterviewing,
      };
    }

    if (message.kind === 'SEND_DAILY_SUMMARY') {
      const result = await sendDailySummary();
      return {
        kind: 'SUMMARY_SENT',
        success: result.success,
        error: result.error,
      };
    }

    if (message.kind === 'GET_CONNECTION_STATUS') {
      await checkOllamaConnection();

      return {
        connected: connectionState.connected,
        lastError: connectionState.lastError,
      };
    }

    return;
  } catch (err) {
    error('Error handling message:', err);
    return {
      kind: 'ERROR',
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
});

// ── Context Menus (right-click text transform) ─────────────────────────────

function createContextMenus(): void {
  browser.contextMenus.removeAll();

  browser.contextMenus.create({
    id: 'offlyn-text-transform',
    title: 'Offlyn Apply',
    contexts: ['editable'],
  });

  browser.contextMenus.create({
    id: 'offlyn-professional-fix',
    parentId: 'offlyn-text-transform',
    title: 'Professional Fix',
    contexts: ['editable'],
  });

  browser.contextMenus.create({
    id: 'offlyn-expand',
    parentId: 'offlyn-text-transform',
    title: 'Expand',
    contexts: ['editable'],
  });

  browser.contextMenus.create({
    id: 'offlyn-shorten',
    parentId: 'offlyn-text-transform',
    title: 'Shorten',
    contexts: ['editable'],
  });

  info('Context menus created');
}

browser.contextMenus.onClicked.addListener((menuInfo, tab) => {
  if (!tab?.id) return;

  const actionMap: Record<string, string> = {
    'offlyn-professional-fix': 'professional-fix',
    'offlyn-expand': 'expand',
    'offlyn-shorten': 'shorten',
  };

  const action = actionMap[menuInfo.menuItemId as string];
  if (!action) return;

  info(`Context menu: "${action}" on tab ${tab.id}`);

  browser.tabs.sendMessage(tab.id, {
    kind: 'TEXT_TRANSFORM',
    action,
  }, menuInfo.frameId != null ? { frameId: menuInfo.frameId } : undefined);
});

// ── Lifecycle events (MV3 service worker) ──────────────────────────────────

browser.runtime.onInstalled.addListener(() => {
  log('Extension installed / updated');
  createContextMenus();
  checkOllamaConnection();
});

browser.runtime.onStartup.addListener(() => {
  log('Browser startup — re-creating context menus');
  createContextMenus();
  checkOllamaConnection();
});

// Use chrome.alarms for periodic work (minimum interval = 1 min in MV3)
const ALARM_OLLAMA_CHECK = 'offlyn-ollama-check';

chrome.alarms.create(ALARM_OLLAMA_CHECK, { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_OLLAMA_CHECK) {
    checkOllamaConnection();
  }
});
