/**
 * Data Explorer page — renders profile, graph memory, and RL patterns
 * directly from browser.storage.local (no background message passing needed).
 */

import type { UserProfile } from '../shared/profile';
import type { GraphNode, GraphEdge, AnswerPayload, CorrectionPayload, ApplicationPayload } from '../shared/graph/types';
import type { LearnedPattern, CorrectionEvent } from '../shared/learning-types';
import { formatPhone, formatLocation } from '../shared/profile';

// ── Storage keys (mirrored to avoid importing service layer) ─────────────────
const STORAGE = {
  profile: 'userProfile',
  graphNodes: 'graph_nodes',
  graphEdges: 'graph_edges',
  graphMeta: 'graph_meta',
  rlPatterns: 'rl_learned_patterns',
  rlCorrections: 'rl_correction_events',
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeAgo(ts: number): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function confColor(c: number): string {
  if (c >= 0.75) return 'conf-high';
  if (c >= 0.5) return 'conf-mid';
  return 'conf-low';
}

function confLabel(c: number): string {
  const pct = Math.round(c * 100);
  return `${pct}%`;
}

function sourceBadgeClass(source: string): string {
  if (source === 'profile') return 'badge-profile';
  if (source === 'llm') return 'badge-llm';
  if (source === 'user') return 'badge-user';
  return 'badge-learned';
}

// ── Tab switching ─────────────────────────────────────────────────────────────

function initTabs(): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.tab');
  const contents = document.querySelectorAll<HTMLElement>('.content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab!;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
      contents.forEach(c => {
        c.classList.toggle('active', c.id === `tab-${target}`);
      });
    });
  });
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function renderProfile(profile: UserProfile): void {
  const loading = document.getElementById('profile-loading')!;
  const empty   = document.getElementById('profile-empty')!;
  const content = document.getElementById('profile-content')!;

  loading.style.display = 'none';

  if (!profile) {
    empty.style.display = 'flex';
    return;
  }

  content.style.display = 'block';

  // Personal info grid
  const personalGrid = document.getElementById('personal-grid')!;
  const p = profile.personal;
  const pro = profile.professional ?? {};
  const phoneStr = p.phone ? formatPhone(p.phone) : null;
  const locationStr = p.location ? formatLocation(p.location) : null;

  const personalItems: Array<[string, string | null | undefined]> = [
    ['First Name', p.firstName],
    ['Last Name', p.lastName],
    ['Email', p.email],
    ['Phone', phoneStr],
    ['Location', locationStr],
    ['LinkedIn', pro.linkedin],
    ['GitHub', pro.github],
    ['Portfolio', pro.portfolio],
    ['Years of Exp.', pro.yearsOfExperience != null ? String(pro.yearsOfExperience) : null],
  ];

  personalGrid.innerHTML = personalItems
    .filter(([, v]) => v)
    .map(([label, val]) => {
      const isUrl = String(val).startsWith('http') || String(val).includes('.com');
      const display = isUrl
        ? `<a href="${esc(val!)}" target="_blank" rel="noopener">${esc(val!)}</a>`
        : esc(val!);
      return `<div class="info-item">
        <div class="info-label">${esc(label)}</div>
        <div class="info-value">${display}</div>
      </div>`;
    })
    .join('');

  // Summary
  if (profile.summary) {
    const sec = document.getElementById('summary-section')!;
    sec.style.display = 'block';
    document.getElementById('summary-text')!.textContent = profile.summary;
  }

  // Work auth
  if (profile.workAuth) {
    const sec = document.getElementById('workauth-section')!;
    sec.style.display = 'block';
    const wa = profile.workAuth;
    const badges: string[] = [];
    if (wa.legallyAuthorized) {
      badges.push(`<span class="auth-badge authorized">✓ Legally authorized to work</span>`);
    }
    if (wa.requiresSponsorship) {
      badges.push(`<span class="auth-badge sponsorship">⚠ Requires sponsorship</span>`);
    } else {
      badges.push(`<span class="auth-badge authorized">✓ No sponsorship needed</span>`);
    }
    if (wa.currentStatus) {
      badges.push(`<span class="auth-badge authorized">🪪 ${esc(wa.currentStatus)}</span>`);
    }
    document.getElementById('workauth-badges')!.innerHTML = badges.join('');
  }

  // Work history
  if (profile.work?.length) {
    const sec = document.getElementById('work-section')!;
    sec.style.display = 'block';
    const timeline = document.getElementById('work-timeline')!;
    timeline.innerHTML = profile.work.map((job, i) => {
      const isLast = i === profile.work.length - 1;
      const dateRange = job.current
        ? `${esc(job.startDate)} – Present`
        : `${esc(job.startDate)} – ${esc(job.endDate)}`;
      return `<div class="timeline-item">
        <div class="timeline-dot-col">
          <div class="timeline-dot"></div>
          ${!isLast ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-body">
          <div class="timeline-header">
            <div>
              <div class="timeline-title">${esc(job.title)}${job.current ? '<span class="badge-current">Current</span>' : ''}</div>
              <div class="timeline-company">${esc(job.company)}</div>
            </div>
            <div class="timeline-date">${dateRange}</div>
          </div>
          ${job.description ? `<div class="timeline-desc">${esc(job.description)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  // Education
  if (profile.education?.length) {
    const sec = document.getElementById('edu-section')!;
    sec.style.display = 'block';
    const grid = document.getElementById('edu-grid')!;
    grid.innerHTML = profile.education.map(edu => `
      <div class="edu-item">
        <div class="edu-icon">🎓</div>
        <div class="edu-body">
          <div class="edu-school">${esc(edu.school)}</div>
          <div class="edu-degree">${esc(edu.degree)}${edu.field ? ` · ${esc(edu.field)}` : ''}</div>
          ${edu.graduationYear ? `<div class="edu-year">Class of ${esc(edu.graduationYear)}</div>` : ''}
        </div>
      </div>`).join('');
  }

  // Skills
  if (profile.skills?.length) {
    const sec = document.getElementById('skills-section')!;
    sec.style.display = 'block';
    const list = document.getElementById('skills-list')!;
    list.innerHTML = profile.skills
      .map(s => `<span class="skill-tag">${esc(s)}</span>`)
      .join('');
  }
}

// ── Graph Memory tab ──────────────────────────────────────────────────────────

function renderGraph(
  nodes: Record<string, GraphNode>,
  edges: Record<string, GraphEdge>
): void {
  const loading = document.getElementById('graph-loading')!;
  const empty   = document.getElementById('graph-empty')!;
  const content = document.getElementById('graph-content')!;
  loading.style.display = 'none';

  const allNodes = Object.values(nodes);
  const allEdges = Object.values(edges);

  if (!allNodes.length) {
    empty.style.display = 'flex';
    return;
  }

  content.style.display = 'block';

  // Count by type
  const counts: Record<string, number> = {};
  for (const n of allNodes) counts[n.type] = (counts[n.type] ?? 0) + 1;

  // Stats row
  const statsRow = document.getElementById('graph-stats-row')!;
  const statItems: Array<[string, number, string]> = [
    ['Total Nodes', allNodes.length, ''],
    ['Questions', counts['question'] ?? 0, '#1d4ed8'],
    ['Answers', counts['answer'] ?? 0, '#16a34a'],
    ['Fields', counts['field'] ?? 0, '#7c3aed'],
    ['Corrections', counts['correction'] ?? 0, '#c2410c'],
    ['Applications', counts['application'] ?? 0, ''],
    ['Edges', allEdges.length, ''],
  ];
  statsRow.innerHTML = statItems.map(([label, num, color]) => `
    <div class="stat-pill">
      <div class="stat-num" style="${color ? `color:${color}` : ''}">${num}</div>
      <div class="stat-label">${esc(label)}</div>
    </div>`).join('');

  // Update tab badge
  const badge = document.getElementById('tab-badge-graph')!;
  badge.textContent = String(allNodes.length);

  // Top answers — sort by usageCount descending, take top 30
  const answerNodes = allNodes
    .filter(n => n.type === 'answer')
    .sort((a, b) => {
      const pa = a.payload as AnswerPayload;
      const pb = b.payload as AnswerPayload;
      return (pb.usageCount ?? 0) - (pa.usageCount ?? 0);
    })
    .slice(0, 30);

  // Build question lookup for context
  const questionById: Record<string, GraphNode> = {};
  for (const n of allNodes) {
    if (n.type === 'question') questionById[n.id] = n;
  }

  // Build edge index: answer -> question (DERIVED_FROM edges)
  const answerToQuestion: Record<string, string> = {};
  for (const e of allEdges) {
    if (e.type === 'DERIVED_FROM') {
      answerToQuestion[e.from] = e.to;
    }
  }
  // Also ANSWERED_BY edges: question -> answer
  const questionForAnswer: Record<string, string> = {};
  for (const e of allEdges) {
    if (e.type === 'ANSWERED_BY') {
      questionForAnswer[e.to] = e.from;
    }
  }

  if (answerNodes.length) {
    const sec = document.getElementById('graph-answers-section')!;
    sec.style.display = 'block';
    const list = document.getElementById('graph-answers-list')!;
    list.innerHTML = answerNodes.map(n => {
      const p = n.payload as AnswerPayload;
      const qId = answerToQuestion[n.id] ?? questionForAnswer[n.id];
      const qNode = qId ? questionById[qId] : null;
      const questionLabel = qNode
        ? (qNode.payload as any).rawText ?? (qNode.payload as any).normalizedText ?? ''
        : '';
      return `<div class="answer-row">
        <div class="answer-meta">
          ${questionLabel ? `<div class="answer-question">${esc(questionLabel.slice(0, 80))}${questionLabel.length > 80 ? '…' : ''}</div>` : ''}
          <div class="answer-value">${esc(String(p.value ?? '').slice(0, 200))}${String(p.value ?? '').length > 200 ? '…' : ''}</div>
          <div class="answer-source-row">
            <span class="badge ${sourceBadgeClass(p.source ?? '')}">${esc(p.source ?? 'unknown')}</span>
            ${p.confidence != null ? `<span style="font-size:11px;color:var(--text-faint)">conf ${Math.round(p.confidence * 100)}%</span>` : ''}
            <span style="font-size:11px;color:var(--text-faint)">${timeAgo(p.lastUsedAt)}</span>
          </div>
        </div>
        <div class="answer-usage">${p.usageCount ?? 0}×</div>
      </div>`;
    }).join('');
  }

  // Corrections
  const correctionNodes = allNodes.filter(n => n.type === 'correction');
  if (correctionNodes.length) {
    const sec = document.getElementById('graph-corrections-section')!;
    sec.style.display = 'block';
    const list = document.getElementById('graph-corrections-list')!;
    list.innerHTML = correctionNodes.map(n => {
      const p = n.payload as CorrectionPayload;
      return `<div class="correction-row">
        <div class="correction-arrow">✏</div>
        <div class="correction-body">
          <div class="correction-old">${esc(String(p.originalValue ?? '').slice(0, 100))}</div>
          <div class="correction-new">${esc(String(p.correctedValue ?? '').slice(0, 120))}</div>
          ${p.context?.company ? `<div class="correction-field">@ ${esc(p.context.company)}${p.context.jobTitle ? ` · ${esc(p.context.jobTitle)}` : ''}</div>` : ''}
          <div class="correction-field">${timeAgo(n.updatedAt)}</div>
        </div>
      </div>`;
    }).join('');
  }

  // Applications
  const appNodes = allNodes.filter(n => n.type === 'application');
  if (appNodes.length) {
    const sec = document.getElementById('graph-apps-section')!;
    sec.style.display = 'block';
    const list = document.getElementById('graph-apps-list')!;
    list.innerHTML = appNodes
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 15)
      .map(n => {
        const p = n.payload as ApplicationPayload;
        return `<div class="answer-row">
          <div class="answer-meta">
            <div class="answer-value">${esc(p.company ?? 'Unknown company')}</div>
            <div class="answer-source-row">
              ${p.jobTitle ? `<span style="font-size:12px;color:var(--text-muted)">${esc(p.jobTitle)}</span>` : ''}
              ${p.platform ? `<span class="badge badge-profile">${esc(p.platform)}</span>` : ''}
              <span style="font-size:11px;color:var(--text-faint)">${timeAgo(n.updatedAt)}</span>
            </div>
          </div>
        </div>`;
      }).join('');
  }
}

// ── RL Patterns tab ───────────────────────────────────────────────────────────

function renderRL(patterns: LearnedPattern[], corrections: CorrectionEvent[]): void {
  const loading = document.getElementById('rl-loading')!;
  const empty   = document.getElementById('rl-empty')!;
  const content = document.getElementById('rl-content')!;
  loading.style.display = 'none';

  if (!patterns.length && !corrections.length) {
    empty.style.display = 'flex';
    return;
  }

  content.style.display = 'block';

  const highConf = patterns.filter(p => p.confidence >= 0.75).length;
  const midConf  = patterns.filter(p => p.confidence >= 0.5 && p.confidence < 0.75).length;
  const lowConf  = patterns.filter(p => p.confidence < 0.5).length;

  // Stats
  const statsRow = document.getElementById('rl-stats-row')!;
  statsRow.innerHTML = [
    ['Total Patterns', patterns.length, ''],
    ['High Confidence', highConf, '#16a34a'],
    ['Medium Conf.', midConf, '#f59e0b'],
    ['Low Confidence', lowConf, '#ef4444'],
    ['Corrections', corrections.length, '#7c3aed'],
  ].map(([label, num, color]) => `
    <div class="stat-pill">
      <div class="stat-num" style="${color ? `color:${color}` : ''}">${num}</div>
      <div class="stat-label">${esc(label as string)}</div>
    </div>`).join('');

  // Update tab badge
  const badge = document.getElementById('tab-badge-rl')!;
  badge.textContent = String(patterns.length);

  // Patterns sorted by confidence desc
  if (patterns.length) {
    const sec = document.getElementById('rl-patterns-section')!;
    sec.style.display = 'block';
    const list = document.getElementById('rl-patterns-list')!;
    const sorted = [...patterns].sort((a, b) => b.confidence - a.confidence);
    list.innerHTML = sorted.map(p => {
      const barClass = confColor(p.confidence);
      const learned = String(p.learnedValue ?? '');
      return `<div class="rl-row">
        <div class="rl-row-header">
          <div class="rl-field">${esc(p.fieldLabel || 'Unknown field')}</div>
          <div class="rl-conf" style="color:${p.confidence >= 0.75 ? '#16a34a' : p.confidence >= 0.5 ? '#f59e0b' : '#ef4444'}">${confLabel(p.confidence)}</div>
        </div>
        <div class="conf-bar-wrap"><div class="conf-bar ${barClass}" style="width:${Math.round(p.confidence * 100)}%"></div></div>
        <div class="rl-value">→ <strong>${esc(learned.slice(0, 120))}${learned.length > 120 ? '…' : ''}</strong></div>
        <div class="rl-meta">
          type: ${esc(p.fieldType || 'text')}
          · success ${p.successCount ?? 0}× / fail ${p.failureCount ?? 0}×
          ${p.lastUsed ? ` · ${timeAgo(p.lastUsed)}` : ''}
        </div>
      </div>`;
    }).join('');
  }

  // Correction events
  if (corrections.length) {
    const sec = document.getElementById('rl-corr-section')!;
    sec.style.display = 'block';
    const list = document.getElementById('rl-corr-list')!;
    const sorted = [...corrections].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    list.innerHTML = sorted.slice(0, 30).map(c => `
      <div class="correction-row">
        <div class="correction-arrow">✏</div>
        <div class="correction-body">
          <div class="correction-old">${esc(String(c.autoFilledValue ?? '').slice(0, 100))}</div>
          <div class="correction-new">${esc(String(c.userCorrectedValue ?? '').slice(0, 120))}</div>
          <div class="correction-field">
            ${esc(c.fieldLabel || 'unknown field')}
            ${c.timestamp ? ` · ${timeAgo(c.timestamp)}` : ''}
          </div>
        </div>
      </div>`).join('');
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function loadAll(): Promise<void> {
  const stored = await browser.storage.local.get([
    STORAGE.profile,
    STORAGE.graphNodes,
    STORAGE.graphEdges,
    STORAGE.rlPatterns,
    STORAGE.rlCorrections,
  ]);

  const profile   = stored[STORAGE.profile] as UserProfile | null;
  const nodes     = (stored[STORAGE.graphNodes] ?? {}) as Record<string, GraphNode>;
  const edges     = (stored[STORAGE.graphEdges] ?? {}) as Record<string, GraphEdge>;
  const patterns  = (stored[STORAGE.rlPatterns] ?? []) as LearnedPattern[];
  const corrections = (stored[STORAGE.rlCorrections] ?? []) as CorrectionEvent[];

  renderProfile(profile!);
  renderGraph(nodes, edges);
  renderRL(patterns, corrections);
}

function init(): void {
  initTabs();

  document.getElementById('back-btn')?.addEventListener('click', () => {
    window.close();
  });

  const refreshBtn = document.getElementById('refresh-btn')!;
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.classList.add('spinning');
    // Reset all panels to loading state
    ['profile', 'graph', 'rl'].forEach(tab => {
      const loading = document.getElementById(`${tab}-loading`);
      const empty   = document.getElementById(`${tab}-empty`);
      const content = document.getElementById(`${tab}-content`);
      if (loading) loading.style.display = 'flex';
      if (empty)   empty.style.display = 'none';
      if (content) content.style.display = 'none';
    });
    await loadAll();
    setTimeout(() => refreshBtn.classList.remove('spinning'), 400);
  });

  loadAll();
}

document.addEventListener('DOMContentLoaded', init);
