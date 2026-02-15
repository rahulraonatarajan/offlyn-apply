/**
 * Job Applications Dashboard - Kanban Board
 * Displays applications in status columns with edit/delete functionality
 */

import {
  getAllApplications,
  getApplicationStats,
  getApplicationTrends,
  updateApplicationStatus,
  deleteApplication,
  type ApplicationStats,
  type DailyTrend,
} from '../shared/storage';
import type { JobApplication } from '../shared/types';

// Chart.js type (loaded via CDN)
declare const Chart: any;

let allApplications: JobApplication[] = [];
let filteredApplications: JobApplication[] = [];
let trendChart: any = null;
let statusChart: any = null;
let currentEditingApp: JobApplication | null = null;

/**
 * Initialize dashboard on page load
 */
async function init() {
  console.log('Dashboard initializing...');
  
  // Load data
  await loadDashboardData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initial render
  renderDashboard();
  
  console.log('Dashboard initialized with', allApplications.length, 'applications');
}

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
  try {
    allApplications = await getAllApplications();
    filteredApplications = [...allApplications];
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    showError('Failed to load applications data');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  searchInput?.addEventListener('input', handleSearch);
  
  // Export button
  const exportBtn = document.getElementById('exportBtn');
  exportBtn?.addEventListener('click', handleExport);
  
  // Edit form
  const editForm = document.getElementById('editForm');
  editForm?.addEventListener('submit', handleEditSubmit);
}

/**
 * Main render function
 */
async function renderDashboard() {
  await renderStats();
  renderKanbanBoard();
  await renderCharts();
}

/**
 * Render statistics cards
 */
async function renderStats() {
  try {
    const stats = await getApplicationStats();
    
    // Update stat cards
    setElementText('statTotal', stats.total.toString());
    setElementText('statSubmitted', stats.submitted.toString());
    setElementText('statInterviewing', stats.interviewing.toString());
    setElementText('statAccepted', stats.accepted.toString());
    setElementText('statRejected', stats.rejected.toString());
    setElementText('statRate', `${stats.responseRate}%`);
    
    // Update date range
    if (stats.dateRange.earliest && stats.dateRange.latest) {
      const dateText = stats.dateRange.earliest === stats.dateRange.latest
        ? formatDate(stats.dateRange.earliest)
        : `${formatDate(stats.dateRange.earliest)} - ${formatDate(stats.dateRange.latest)}`;
      setElementText('dateRange', dateText);
    } else {
      setElementText('dateRange', 'No applications yet');
    }
  } catch (err) {
    console.error('Failed to render stats:', err);
  }
}

/**
 * Render Kanban board with status columns
 */
function renderKanbanBoard() {
  const container = document.getElementById('kanbanContent');
  if (!container) return;
  
  if (filteredApplications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No applications found</h3>
        <p>${allApplications.length === 0 ? 'Start submitting applications and they will appear here' : 'Try adjusting your search'}</p>
      </div>
    `;
    return;
  }
  
  // Group applications by status
  const columns = {
    submitted: filteredApplications.filter(a => a.status === 'submitted'),
    interviewing: filteredApplications.filter(a => a.status === 'interviewing'),
    rejected: filteredApplications.filter(a => a.status === 'rejected'),
    accepted: filteredApplications.filter(a => a.status === 'accepted'),
    withdrawn: filteredApplications.filter(a => a.status === 'withdrawn'),
  };
  
  // Create Kanban board HTML
  const boardHTML = `
    <div class="kanban-board">
      ${createKanbanColumn('submitted', 'Submitted', columns.submitted)}
      ${createKanbanColumn('interviewing', 'Interviewing', columns.interviewing)}
      ${createKanbanColumn('rejected', 'Rejected', columns.rejected)}
      ${createKanbanColumn('accepted', 'Accepted', columns.accepted)}
      ${createKanbanColumn('withdrawn', 'Withdrawn', columns.withdrawn)}
    </div>
  `;
  
  container.innerHTML = boardHTML;
  
  // Attach event listeners to cards
  attachCardListeners();
}

/**
 * Create a Kanban column (drop zone)
 */
function createKanbanColumn(status: string, title: string, apps: JobApplication[]): string {
  const cardsHTML = apps.map(app => createApplicationCard(app)).join('');
  
  return `
    <div class="kanban-column" data-status="${status}">
      <div class="column-header ${status}">
        <span>${title}</span>
        <span class="count">${apps.length}</span>
      </div>
      <div class="column-cards" data-status="${status}">
        ${cardsHTML || '<div class="empty-state"><p>No applications</p></div>'}
      </div>
    </div>
  `;
}

/**
 * Create application card HTML
 */
function createApplicationCard(app: JobApplication): string {
  const date = new Date(app.timestamp);
  const dateStr = formatDate(date.toISOString().split('T')[0]);
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  return `
    <div class="app-card" data-app-id="${app.id}" draggable="true">
      <div class="app-card-header">
        <div class="app-card-title">${escapeHtml(app.jobTitle)}</div>
        <div class="app-card-company">${escapeHtml(app.company)}</div>
      </div>
      ${app.atsHint ? `<div class="ats-badge">${escapeHtml(app.atsHint)}</div>` : ''}
      ${app.notes ? `<div class="app-card-meta"><div style="color: #4a5568;">${escapeHtml(app.notes)}</div></div>` : ''}
      <div class="app-card-meta">
        <div>${dateStr} at ${timeStr}</div>
      </div>
      <div class="app-card-actions">
        <button class="btn-edit" data-action="edit">Edit</button>
        <button class="btn-delete" data-action="delete">Delete</button>
      </div>
    </div>
  `;
}

/**
 * Attach event listeners to card buttons and drag-and-drop
 */
function attachCardListeners() {
  // --- Card button listeners ---
  document.querySelectorAll('.app-card').forEach(card => {
    const appId = card.getAttribute('data-app-id');
    if (!appId) return;
    
    // Edit button
    const editBtn = card.querySelector('[data-action="edit"]');
    editBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEdit(appId);
    });
    
    // Delete button
    const deleteBtn = card.querySelector('[data-action="delete"]');
    deleteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(appId);
    });
    
    // Click card to open URL (only if not a drag)
    let didDrag = false;
    card.addEventListener('mousedown', () => { didDrag = false; });
    card.addEventListener('mousemove', () => { didDrag = true; });
    card.addEventListener('click', () => {
      if (didDrag) return;
      const app = allApplications.find(a => a.id === appId);
      if (app) {
        browser.tabs.create({ url: app.url });
      }
    });
    
    // --- Drag start ---
    card.addEventListener('dragstart', (e) => {
      const de = e as DragEvent;
      card.classList.add('dragging');
      de.dataTransfer?.setData('text/plain', appId);
      if (de.dataTransfer) {
        de.dataTransfer.effectAllowed = 'move';
      }
    });
    
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });
  
  // --- Column drop zone listeners ---
  document.querySelectorAll('.kanban-column').forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      (e as DragEvent).dataTransfer!.dropEffect = 'move';
      column.classList.add('drag-over');
    });
    
    column.addEventListener('dragleave', (e) => {
      // Only remove highlight if we actually left the column, not just entered a child
      const related = (e as MouseEvent).relatedTarget as Node | null;
      if (related && column.contains(related)) return;
      column.classList.remove('drag-over');
    });
    
    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');
      
      const appId = (e as DragEvent).dataTransfer?.getData('text/plain');
      const newStatus = column.getAttribute('data-status') as JobApplication['status'];
      
      if (!appId || !newStatus) return;
      
      // Find the app's current status to avoid no-op updates
      const app = allApplications.find(a => a.id === appId);
      if (!app || app.status === newStatus) return;
      
      // Persist the status change
      const success = await updateApplicationStatus(appId, newStatus);
      if (success) {
        await loadDashboardData();
        renderDashboard();
      }
    });
  });
}

/**
 * Handle edit button click
 */
function handleEdit(appId: string) {
  const app = allApplications.find(a => a.id === appId);
  if (!app) return;
  
  currentEditingApp = app;
  
  // Populate edit form
  const companyInput = document.getElementById('editCompany') as HTMLInputElement;
  const positionInput = document.getElementById('editPosition') as HTMLInputElement;
  const statusSelect = document.getElementById('editStatus') as HTMLSelectElement;
  const notesTextarea = document.getElementById('editNotes') as HTMLTextAreaElement;
  
  if (companyInput) companyInput.value = app.company;
  if (positionInput) positionInput.value = app.jobTitle;
  if (statusSelect) statusSelect.value = app.status;
  if (notesTextarea) notesTextarea.value = app.notes || '';
  
  // Show modal
  const modal = document.getElementById('editModal');
  modal?.classList.add('active');
}

/**
 * Handle edit form submit
 */
async function handleEditSubmit(e: Event) {
  e.preventDefault();
  
  if (!currentEditingApp) return;
  
  const statusSelect = document.getElementById('editStatus') as HTMLSelectElement;
  const notesTextarea = document.getElementById('editNotes') as HTMLTextAreaElement;
  
  const newStatus = statusSelect.value as JobApplication['status'];
  const newNotes = notesTextarea.value;
  
  // Update application
  const success = await updateApplicationStatus(currentEditingApp.id!, newStatus, newNotes);
  
  if (success) {
    // Reload data and re-render
    await loadDashboardData();
    renderDashboard();
    closeEditModal();
  } else {
    alert('Failed to update application. Please try again.');
  }
}

/**
 * Close edit modal
 */
function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal?.classList.remove('active');
  currentEditingApp = null;
}

// Expose to global scope for HTML onclick
(window as any).closeEditModal = closeEditModal;

/**
 * Handle delete button click
 */
async function handleDelete(appId: string) {
  const app = allApplications.find(a => a.id === appId);
  if (!app) return;
  
  const confirmed = confirm(`Delete application for ${app.jobTitle} at ${app.company}?`);
  
  if (confirmed) {
    const success = await deleteApplication(appId);
    
    if (success) {
      // Reload data and re-render
      await loadDashboardData();
      renderDashboard();
    } else {
      alert('Failed to delete application. Please try again.');
    }
  }
}

/**
 * Handle search
 */
function handleSearch() {
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const searchTerm = searchInput?.value.toLowerCase() || '';
  
  if (searchTerm) {
    filteredApplications = allApplications.filter(app => {
      const matchesTitle = app.jobTitle.toLowerCase().includes(searchTerm);
      const matchesCompany = app.company.toLowerCase().includes(searchTerm);
      const matchesNotes = app.notes?.toLowerCase().includes(searchTerm) || false;
      
      return matchesTitle || matchesCompany || matchesNotes;
    });
  } else {
    filteredApplications = [...allApplications];
  }
  
  renderKanbanBoard();
}

/**
 * Render Chart.js charts
 */
async function renderCharts() {
  try {
    const trends = await getApplicationTrends();
    
    // Destroy existing charts if any
    if (trendChart) {
      trendChart.destroy();
    }
    if (statusChart) {
      statusChart.destroy();
    }
    
    // Render charts
    renderTrendChart(trends);
    renderStatusChart();
  } catch (err) {
    console.error('Failed to render charts:', err);
  }
}

/**
 * Render applications over time chart
 */
function renderTrendChart(trends: DailyTrend[]) {
  const canvas = document.getElementById('trendChart') as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trends.map(t => formatDate(t.date)),
      datasets: [
        {
          label: 'Total',
          data: trends.map(t => t.total),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Submitted',
          data: trends.map(t => t.submitted),
          borderColor: '#4299e1',
          backgroundColor: 'rgba(66, 153, 225, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Interviewing',
          data: trends.map(t => t.interviewing),
          borderColor: '#ed8936',
          backgroundColor: 'rgba(237, 137, 54, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

/**
 * Render status distribution chart
 */
function renderStatusChart() {
  const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const submitted = allApplications.filter(a => a.status === 'submitted').length;
  const interviewing = allApplications.filter(a => a.status === 'interviewing').length;
  const rejected = allApplications.filter(a => a.status === 'rejected').length;
  const accepted = allApplications.filter(a => a.status === 'accepted').length;
  const withdrawn = allApplications.filter(a => a.status === 'withdrawn').length;
  
  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Submitted', 'Interviewing', 'Rejected', 'Accepted', 'Withdrawn'],
      datasets: [{
        data: [submitted, interviewing, rejected, accepted, withdrawn],
        backgroundColor: [
          'rgba(66, 153, 225, 0.8)',
          'rgba(237, 137, 54, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(72, 187, 120, 0.8)',
          'rgba(160, 174, 192, 0.8)',
        ],
        borderColor: [
          '#4299e1',
          '#ed8936',
          '#f56565',
          '#48bb78',
          '#a0aec0',
        ],
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
    },
  });
}

/**
 * Handle CSV export
 */
function handleExport() {
  try {
    const csv = generateCSV(filteredApplications);
    downloadCSV(csv, `job-applications-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (err) {
    console.error('Failed to export CSV:', err);
    alert('Failed to export applications. Check console for details.');
  }
}

/**
 * Generate CSV from applications
 */
function generateCSV(apps: JobApplication[]): string {
  const headers = ['Date', 'Time', 'Job Title', 'Company', 'Status', 'ATS', 'Notes', 'URL'];
  const rows = apps.map(app => {
    const date = new Date(app.timestamp);
    return [
      date.toISOString().split('T')[0],
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      app.jobTitle,
      app.company,
      app.status,
      app.atsHint || '',
      app.notes || '',
      app.url,
    ].map(escapeCSV);
  });
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Utility: Set element text content
 */
function setElementText(id: string, text: string) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

/**
 * Utility: Format date (YYYY-MM-DD to readable format)
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Utility: Escape CSV field
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Show error message
 */
function showError(message: string) {
  const container = document.getElementById('kanbanContent');
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
