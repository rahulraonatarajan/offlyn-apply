/**
 * Autofill Action Popup — floating panel that appears when a job application
 * page is detected. Shows fully for 3 seconds, then auto-minimizes into a
 * small branded cube. Click the cube to re-expand.
 */

import type { FieldSchema } from '../shared/types';
import { setHTML } from '../shared/html';

let summaryPanel: HTMLElement | null = null;
let panelFields: FieldSchema[] = [];
let isMinimized = false;
let autoMinTimer: ReturnType<typeof setTimeout> | null = null;
let mouseInsidePanel = false;
let dragOffset = { x: 0, y: 0 }; // persists across minimize/expand

// ── Public API ─────────────────────────────────────────────────────────────

export function showFieldSummary(fields: FieldSchema[], jobTitle?: string, company?: string): void {
  panelFields = fields;

  if (summaryPanel && summaryPanel.parentElement) {
    updatePanelContent(summaryPanel, fields, jobTitle, company);
    // Reset auto-minimize timer on updates
    scheduleAutoMinimize();
    return;
  }

  // Remove orphaned panels
  document.getElementById('offlyn-field-summary')?.remove();

  addStyles();

  // Build expanded panel
  summaryPanel = document.createElement('div');
  summaryPanel.id = 'offlyn-field-summary';
  setHTML(summaryPanel, buildPanelHTML(fields, jobTitle, company));

  document.body.appendChild(summaryPanel);

  attachListeners(summaryPanel);
  makeDraggable(summaryPanel);

  isMinimized = false;

  // Auto-minimize after 3 seconds
  scheduleAutoMinimize();
}

export function hideFieldSummary(): void {
  clearAutoMinTimer();
  mouseInsidePanel = false;
  if (summaryPanel) { summaryPanel.remove(); summaryPanel = null; }
  isMinimized = false;
}

export function toggleFieldSummary(fields: FieldSchema[], jobTitle?: string, company?: string): void {
  if (summaryPanel) hideFieldSummary();
  else showFieldSummary(fields, jobTitle, company);
}

// ── Minimize / Expand ──────────────────────────────────────────────────────

function scheduleAutoMinimize(): void {
  clearAutoMinTimer();
  // Don't even start the timer if the mouse is already inside the panel
  if (mouseInsidePanel) return;
  autoMinTimer = setTimeout(() => {
    // Double-check: don't minimize if mouse moved in while timer was running
    if (summaryPanel && !isMinimized && !mouseInsidePanel) minimizePanel();
  }, 3000);
}

function clearAutoMinTimer(): void {
  if (autoMinTimer) { clearTimeout(autoMinTimer); autoMinTimer = null; }
}

function minimizePanel(): void {
  if (!summaryPanel || isMinimized) return;
  isMinimized = true;

  summaryPanel.classList.add('ofl-minimized');

  // Hide inner content, show cube logo
  const body = summaryPanel.querySelector('.ofl-body') as HTMLElement;
  const footer = summaryPanel.querySelector('.ofl-footer') as HTMLElement;
  const header = summaryPanel.querySelector('.ofl-header') as HTMLElement;
  const cube = summaryPanel.querySelector('.ofl-cube') as HTMLElement;

  if (body) body.style.display = 'none';
  if (footer) footer.style.display = 'none';
  if (header) header.style.display = 'none';
  if (cube) cube.style.display = 'flex';
}

function expandPanel(autoMin = true): void {
  if (!summaryPanel || !isMinimized) return;
  isMinimized = false;

  summaryPanel.classList.remove('ofl-minimized');

  const body = summaryPanel.querySelector('.ofl-body') as HTMLElement;
  const footer = summaryPanel.querySelector('.ofl-footer') as HTMLElement;
  const header = summaryPanel.querySelector('.ofl-header') as HTMLElement;
  const cube = summaryPanel.querySelector('.ofl-cube') as HTMLElement;

  if (body) body.style.display = '';
  if (footer) footer.style.display = '';
  if (header) header.style.display = '';
  if (cube) cube.style.display = 'none';

  if (autoMin) {
    // Auto-minimize again after 5 seconds when re-expanded by user click
    scheduleAutoMinimize();
  }
}

/**
 * Ensure the field summary is expanded and keep it expanded (no auto-minimize).
 * Used when returning from sub-panels like the cover letter panel.
 */
export function ensureFieldSummaryExpanded(): void {
  clearAutoMinTimer();
  if (summaryPanel && isMinimized) {
    expandPanel(false);
  }
  // Even if already expanded, cancel any pending auto-minimize
  clearAutoMinTimer();
}

// ── HTML ───────────────────────────────────────────────────────────────────

function buildPanelHTML(fields: FieldSchema[], jobTitle?: string, company?: string): string {
  const requiredCount = fields.filter(f => f.required).length;
  const cubeIconUrl = browser.runtime.getURL('icons/monogram-transparent.png');
  const headerIconUrl = browser.runtime.getURL('icons/primary-logo.png');

  return `
    <!-- Minimized cube (hidden initially) -->
    <div class="ofl-cube" style="display:none;" title="Click to expand Offlyn Apply">
      <img class="ofl-cube-logo" src="${cubeIconUrl}" alt="Offlyn Apply">
    </div>

    <!-- Expanded view -->
    <div class="ofl-header">
      <div class="ofl-brand">
        <img class="ofl-logo" src="${headerIconUrl}" alt="Offlyn Apply">
        <span class="ofl-title">Offlyn Apply</span>
      </div>
      <div class="ofl-header-actions">
        <button class="ofl-minimize-btn" title="Minimize">&#8722;</button>
        <button class="ofl-close" title="Close">&times;</button>
      </div>
    </div>

    <div class="ofl-body">
      ${jobTitle || company ? `
        <div class="ofl-job">
          ${jobTitle ? `<div class="ofl-job-title">${escapeHtml(jobTitle)}</div>` : ''}
          ${company ? `<div class="ofl-job-company">${escapeHtml(company)}</div>` : ''}
        </div>
      ` : ''}

      <div class="ofl-stats">
        <div class="ofl-stat">
          <span class="ofl-stat-num">${fields.length}</span>
          <span class="ofl-stat-label">fields</span>
        </div>
        ${requiredCount > 0 ? `
          <div class="ofl-stat">
            <span class="ofl-stat-num ofl-required">${requiredCount}</span>
            <span class="ofl-stat-label">required</span>
          </div>
        ` : ''}
      </div>

      <div class="ofl-actions">
        <button class="ofl-btn ofl-btn-fill" id="ofl-autofill-btn">
          <span class="ofl-btn-icon">&#9889;</span>
          Auto-Fill Form
        </button>
        <button class="ofl-btn ofl-btn-cover" id="ofl-cover-letter-btn">
          <span class="ofl-btn-icon">&#9998;</span>
          Cover Letter
        </button>
      </div>

      <div class="ofl-status" id="ofl-status"></div>
    </div>

    <div class="ofl-footer">
      <button class="ofl-link-btn" id="ofl-refresh-btn" title="Re-scan page for fields">
        &#8635; Refresh
      </button>
      <span class="ofl-sep"></span>
      <button class="ofl-link-btn" id="ofl-details-btn" title="Copy field details as JSON">
        &#128203; Details
      </button>
    </div>
  `;
}

// ── Listeners ──────────────────────────────────────────────────────────────

function attachListeners(panel: HTMLElement): void {
  // Close
  panel.querySelector('.ofl-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideFieldSummary();
  });

  // Minimize button
  panel.querySelector('.ofl-minimize-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearAutoMinTimer();
    minimizePanel();
  });

  // Cube click → expand
  panel.querySelector('.ofl-cube')?.addEventListener('click', (e) => {
    e.stopPropagation();
    expandPanel();
  });

  // Auto-Fill
  panel.querySelector('#ofl-autofill-btn')?.addEventListener('click', () => {
    setStatus('Filling...', 'info');
    window.dispatchEvent(new CustomEvent('offlyn-manual-autofill'));
  });

  // Cover Letter
  panel.querySelector('#ofl-cover-letter-btn')?.addEventListener('click', () => {
    setStatus('Generating cover letter...', 'info');
    window.dispatchEvent(new CustomEvent('offlyn-generate-cover-letter'));
  });

  // Refresh
  panel.querySelector('#ofl-refresh-btn')?.addEventListener('click', () => {
    const btn = panel.querySelector('#ofl-refresh-btn') as HTMLButtonElement;
    if (btn) {
      btn.textContent = '⟳ Scanning...';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = '⟳ Refresh'; btn.disabled = false; }, 2000);
    }
    window.dispatchEvent(new CustomEvent('offlyn-refresh-scan'));
  });

  // Details
  panel.querySelector('#ofl-details-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(panelFields, null, 2))
      .then(() => setStatus('Field details copied!', 'success'))
      .catch(() => setStatus('Copy failed', 'error'));
  });

  // Pause auto-minimize while user's mouse is inside the panel
  panel.addEventListener('mouseenter', () => {
    mouseInsidePanel = true;
    if (!isMinimized) clearAutoMinTimer();
  });
  panel.addEventListener('mouseleave', () => {
    mouseInsidePanel = false;
    if (!isMinimized) scheduleAutoMinimize();
  });
}

function setStatus(text: string, type: 'info' | 'success' | 'error'): void {
  const el = summaryPanel?.querySelector('#ofl-status');
  if (!el) return;
  el.textContent = text;
  el.className = `ofl-status ofl-status-${type}`;
  if (type !== 'info') {
    setTimeout(() => { el.textContent = ''; el.className = 'ofl-status'; }, 3000);
  }
}

// ── Update ─────────────────────────────────────────────────────────────────

function updatePanelContent(panel: HTMLElement, fields: FieldSchema[], jobTitle?: string, company?: string): void {
  panelFields = fields;
  const requiredCount = fields.filter(f => f.required).length;

  const jobEl = panel.querySelector('.ofl-job');
  if (jobTitle || company) {
    if (jobEl) {
      setHTML(jobEl, `
        ${jobTitle ? `<div class="ofl-job-title">${escapeHtml(jobTitle)}</div>` : ''}
        ${company ? `<div class="ofl-job-company">${escapeHtml(company)}</div>` : ''}
      `);
    }
  }

  const statsEl = panel.querySelector('.ofl-stats');
  if (statsEl) {
    setHTML(statsEl, `
      <div class="ofl-stat">
        <span class="ofl-stat-num">${fields.length}</span>
        <span class="ofl-stat-label">fields</span>
      </div>
      ${requiredCount > 0 ? `
        <div class="ofl-stat">
          <span class="ofl-stat-num ofl-required">${requiredCount}</span>
          <span class="ofl-stat-label">required</span>
        </div>
      ` : ''}
    `);
  }
}

// ── Dragging ───────────────────────────────────────────────────────────────

function makeDraggable(panel: HTMLElement): void {
  let isDragging = false;
  let ix = 0, iy = 0;

  const startDrag = (e: MouseEvent) => {
    // Don't drag from buttons
    const t = e.target as HTMLElement;
    if (t.closest('button')) return;
    isDragging = true;
    ix = e.clientX - dragOffset.x;
    iy = e.clientY - dragOffset.y;
    e.preventDefault();
  };

  // Header is the drag handle when expanded
  panel.querySelector('.ofl-header')?.addEventListener('mousedown', startDrag);
  // Cube is the drag handle when minimized
  panel.querySelector('.ofl-cube')?.addEventListener('mousedown', startDrag);

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    dragOffset.x = e.clientX - ix;
    dragOffset.y = e.clientY - iy;
    if (panel) panel.style.transform = `translate(${dragOffset.x}px, ${dragOffset.y}px)`;
  });

  document.addEventListener('mouseup', () => { isDragging = false; });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ── Styles ─────────────────────────────────────────────────────────────────

function addStyles(): void {
  if (document.getElementById('offlyn-field-summary-styles')) return;

  const style = document.createElement('style');
  style.id = 'offlyn-field-summary-styles';
  style.textContent = `
    /* ─── Container ─── */
    #offlyn-field-summary {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 280px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      overflow: hidden;
      color: #1a1a1a;
      transition: width .35s cubic-bezier(.4,0,.2,1),
                  height .35s cubic-bezier(.4,0,.2,1),
                  border-radius .35s cubic-bezier(.4,0,.2,1),
                  box-shadow .2s;
    }
    #offlyn-field-summary:hover {
      box-shadow: 0 12px 40px rgba(0,0,0,.22), 0 4px 12px rgba(0,0,0,.10);
    }

    /* ─── Minimized cube state ─── */
    #offlyn-field-summary.ofl-minimized {
      width: 48px;
      height: 48px !important;
      border-radius: 14px;
      cursor: pointer;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.08);
    }
    #offlyn-field-summary.ofl-minimized:hover {
      box-shadow: 0 6px 24px rgba(30, 42, 58, 0.25);
      transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.08);
    }

    /* ─── Cube logo (oval pill, tusk white, gloss, no border) ─── */
    .ofl-cube {
      width: 64px;
      height: 40px;
      /* tusk white base + top-half gloss sheen */
      background:
        linear-gradient(
          180deg,
          rgba(255,255,255,0.55) 0%,
          rgba(255,255,255,0.06) 50%,
          rgba(255,255,255,0.00) 51%
        ),
        #FFFCF0;
      border: none;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 10px;
      cursor: pointer;
      box-shadow:
        0 3px 10px rgba(30, 41, 59, 0.20),
        inset 0 1px 2px rgba(255,255,255,0.90);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      overflow: hidden;
    }
    .ofl-cube:hover {
      transform: scale(1.08);
      box-shadow:
        0 5px 16px rgba(22, 163, 74, 0.30),
        inset 0 1px 2px rgba(255,255,255,0.90);
    }
    .ofl-cube-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      pointer-events: none;
    }

    /* ─── Header ─── */
    .ofl-header {
      background: #0F172A;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: move;
    }
    .ofl-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ofl-logo {
      width: 24px; height: 24px;
      border-radius: 5px;
      object-fit: contain;
    }
    .ofl-title {
      font-weight: 700;
      font-size: 15px;
      color: #fff;
      letter-spacing: .3px;
    }
    .ofl-header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ofl-minimize-btn,
    .ofl-close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,.8);
      font-size: 20px;
      cursor: pointer;
      width: 28px; height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all .15s;
      padding: 0;
      font-family: inherit;
    }
    .ofl-minimize-btn:hover,
    .ofl-close:hover {
      background: rgba(255,255,255,.2);
      color: #fff;
    }

    /* ─── Body ─── */
    .ofl-body { padding: 16px; }

    .ofl-job { margin-bottom: 14px; }
    .ofl-job-title {
      font-weight: 600;
      font-size: 14px;
      color: #1a1a1a;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .ofl-job-company {
      font-size: 12px;
      color: #888;
      margin-top: 2px;
    }

    .ofl-stats {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      padding: 10px 14px;
      background: #f7f7fb;
      border-radius: 10px;
    }
    .ofl-stat { display: flex; align-items: baseline; gap: 5px; }
    .ofl-stat-num {
      font-size: 22px; font-weight: 700; color: #0F172A; line-height: 1;
    }
    .ofl-stat-num.ofl-required { color: #EF4444; }
    .ofl-stat-label { font-size: 12px; color: #64748B; font-weight: 500; }

    .ofl-actions { display: flex; flex-direction: column; gap: 8px; }
    .ofl-btn {
      width: 100%;
      padding: 11px 16px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all .2s;
      color: #fff;
      font-family: inherit;
    }
    .ofl-btn-icon { font-size: 16px; }
    .ofl-btn-fill {
      background: #27E38D;
      color: #0F172A;
    }
    .ofl-btn-fill:hover {
      background: #22CC7A;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(39, 227, 141, 0.3);
    }
    .ofl-btn-fill:active { 
      background: #1EB86B;
      transform: translateY(0); 
    }
    .ofl-btn-cover {
      background: #0F172A;
      color: #FFFFFF;
      border: 2px solid #27E38D;
    }
    .ofl-btn-cover:hover {
      background: #1E293B;
      border-color: #22CC7A;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(39, 227, 141, 0.2);
    }
    .ofl-btn-cover:active { 
      background: #0F172A;
      transform: translateY(0); 
    }

    .ofl-status {
      text-align: center;
      font-size: 12px;
      margin-top: 8px;
      min-height: 18px;
      border-radius: 6px;
      padding: 0 8px;
      transition: all .2s;
    }
    .ofl-status-info  { color: #0F172A; }
    .ofl-status-success { color: #0F172A; background: rgba(39, 227, 141, 0.15); padding: 4px 8px; border: 1px solid #27E38D; }
    .ofl-status-error   { color: #0F172A; background: rgba(239, 68, 68, 0.15); padding: 4px 8px; border: 1px solid #EF4444; }

    .ofl-footer {
      padding: 8px 16px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ofl-link-btn {
      background: none;
      border: none;
      color: #64748B;
      font-size: 12px;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 4px;
      transition: all .15s;
      font-family: inherit;
    }
    .ofl-link-btn:hover { 
      color: #0F172A; 
      background: rgba(39, 227, 141, 0.1); 
    }
    .ofl-link-btn:disabled { opacity: .5; cursor: default; }
    .ofl-sep { flex: 1; }
  `;

  document.head.appendChild(style);
}
