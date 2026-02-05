/**
 * Onboarding page logic
 */

import type { UserProfile } from '../shared/profile';
import { saveUserProfile } from '../shared/profile';

// PDF.js is loaded via CDN in the HTML
declare const pdfjsLib: any;

let uploadedFile: File | null = null;
let extractedProfile: UserProfile | null = null;
let isConnected = false;

/**
 * Show a specific step
 */
function showStep(stepId: string): void {
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('active');
  });
  const targetStep = document.getElementById(stepId);
  if (targetStep) {
    targetStep.classList.add('active');
  }
}

/**
 * Show status message
 */
function showStatus(type: 'info' | 'success' | 'error', message: string): void {
  const statusEl = document.getElementById('uploadStatus');
  if (!statusEl) return;
  
  statusEl.className = `status visible ${type}`;
  statusEl.textContent = message;
}

/**
 * Update progress bar
 */
function updateProgress(stage: 'read' | 'extract' | 'parse' | 'done', percent: number, message: string): void {
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  if (progressContainer && progressFill && progressText) {
    progressContainer.classList.add('visible');
    progressFill.style.width = `${percent}%`;
    progressText.textContent = message;
    
    // Update stage indicators
    const stages = ['read', 'extract', 'parse', 'done'];
    const currentIndex = stages.indexOf(stage);
    
    stages.forEach((s, index) => {
      const stageEl = document.getElementById(`stage-${s}`);
      if (stageEl) {
        stageEl.classList.remove('active', 'completed');
        if (index < currentIndex) {
          stageEl.classList.add('completed');
        } else if (index === currentIndex) {
          stageEl.classList.add('active');
        }
      }
    });
  }
}

/**
 * Hide progress bar
 */
function hideProgress(): void {
  const progressContainer = document.getElementById('progressContainer');
  if (progressContainer) {
    progressContainer.classList.remove('visible');
  }
}

/**
 * Show detailed error information
 */
function showErrorDetails(error: string, details?: any): void {
  const errorDetailsEl = document.getElementById('errorDetails');
  if (!errorDetailsEl) return;
  
  let html = '<div class="error-details">';
  html += '<h4>Error Details</h4>';
  html += `<p><strong>Error:</strong> ${error}</p>`;
  
  if (!isConnected) {
    html += '<p><strong>Issue:</strong> Native host is not connected</p>';
    html += '<p><strong>Solution:</strong></p>';
    html += '<ul>';
    html += '<li>Install the native host: <pre>cd native-host && node install-manifest.js</pre></li>';
    html += '<li>Restart Firefox after installation</li>';
    html += '<li>Reload this extension from <code>about:debugging</code></li>';
    html += '</ul>';
  } else {
    html += '<p><strong>Debugging Steps:</strong></p>';
    html += '<ul>';
    html += '<li>Open browser console (F12) and check for errors</li>';
    html += '<li>Check native host logs: <pre>tail -f native-host/native-host.log</pre></li>';
    html += '<li>Verify Ollama is running: <pre>ollama ps</pre></li>';
    html += '<li>Test Ollama directly: <pre>curl http://localhost:11434/v1/chat/completions ...</pre></li>';
    html += '</ul>';
  }
  
  if (details) {
    html += '<p><strong>Technical Details:</strong></p>';
    html += `<pre>${JSON.stringify(details, null, 2)}</pre>`;
  }
  
  html += '</div>';
  
  errorDetailsEl.innerHTML = html;
}

/**
 * Hide error details
 */
function hideErrorDetails(): void {
  const errorDetailsEl = document.getElementById('errorDetails');
  if (errorDetailsEl) {
    errorDetailsEl.innerHTML = '';
  }
}

/**
 * Update connection status display
 */
function updateConnectionStatus(connected: boolean): void {
  isConnected = connected;
  const statusEl = document.getElementById('connectionStatus');
  if (!statusEl) return;
  
  if (connected) {
    statusEl.className = 'connection-status connected';
    statusEl.innerHTML = '<span class="status-indicator connected"></span><span>Native Host Connected</span>';
  } else {
    statusEl.className = 'connection-status disconnected';
    statusEl.innerHTML = '<span class="status-indicator disconnected"></span><span>Native Host Not Connected - Install required</span>';
  }
}

/**
 * Check connection status
 */
async function checkConnection(): Promise<boolean> {
  try {
    const response = await browser.runtime.sendMessage({ kind: 'GET_CONNECTION_STATUS' });
    return response?.connected || false;
  } catch (err) {
    console.error('Failed to check connection:', err);
    return false;
  }
}

/**
 * Hide status message
 */
function hideStatus(): void {
  const statusEl = document.getElementById('uploadStatus');
  if (statusEl) {
    statusEl.classList.remove('visible');
  }
}

/**
 * Read file as text
 */
async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Extract text from PDF using PDF.js
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Configure PDF.js worker if not already set
    if (typeof pdfjsLib !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    updateProgress('extract', 30, 'Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const progress = 30 + Math.floor((pageNum / totalPages) * 20);
      updateProgress('extract', progress, `Extracting text from page ${pageNum}/${totalPages}...`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (err) {
    console.error('PDF extraction failed:', err);
    throw new Error('Failed to extract text from PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
}

/**
 * Extract text from file based on type
 */
async function extractTextFromFile(file: File): Promise<string> {
  console.log('Extracting text from file:', file.name, 'Type:', file.type);
  
  if (file.type === 'text/plain') {
    return readFileAsText(file);
  }
  
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return extractTextFromPDF(file);
  }
  
  // For DOC/DOCX or unknown types, try plain text
  try {
    const text = await readFileAsText(file);
    
    // Check if it looks like PDF markup (starts with %PDF or has xref)
    if (text.includes('%PDF') || text.includes('xref')) {
      throw new Error('This appears to be a PDF file. Please save as .pdf or use a plain text resume.');
    }
    
    return text;
  } catch (err) {
    throw new Error('Failed to read file. Please use a PDF (.pdf) or plain text (.txt) resume.');
  }
}

/**
 * Parse resume using Ollama via background script
 */
async function parseResume(resumeText: string): Promise<UserProfile> {
  updateProgress('parse', 60, 'Sending to AI for parsing...');
  hideErrorDetails();
  
  try {
    console.log('Sending resume to background script, length:', resumeText.length);
    
    // Check connection first
    updateProgress('parse', 65, 'Checking Ollama connection...');
    const connected = await checkConnection();
    if (!connected) {
      throw new Error('Ollama not connected. Please ensure Ollama is running.');
    }
    
    // Send to background script which calls Ollama
    updateProgress('parse', 70, 'AI is analyzing your resume...');
    const response = await browser.runtime.sendMessage({
      kind: 'PARSE_RESUME',
      resumeText,
    });
    
    console.log('Received response:', response);
    
    if (response && response.kind === 'RESUME_PARSED' && response.profile) {
      console.log('Successfully parsed profile:', response.profile);
      updateProgress('done', 100, 'Parsing complete!');
      hideErrorDetails();
      return response.profile;
    } else if (response && response.kind === 'ERROR') {
      console.error('Parser error:', response.message);
      showErrorDetails(response.message || 'Failed to parse resume', response);
      throw new Error(response.message || 'Failed to parse resume');
    } else {
      console.error('Invalid response structure:', response);
      showErrorDetails('Invalid response from parser', response);
      throw new Error('Invalid response from parser. See details below.');
    }
  } catch (err) {
    console.error('Parse error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to parse resume';
    if (!document.getElementById('errorDetails')?.innerHTML) {
      showErrorDetails(errorMessage);
    }
    throw new Error(errorMessage);
  }
}

/**
 * Handle file selection
 */
function handleFileSelect(file: File): void {
  if (file.size > 5 * 1024 * 1024) {
    showStatus('error', 'File too large. Please upload a file under 5MB.');
    return;
  }
  
  uploadedFile = file;
  
  // Show file info
  const fileInfo = document.getElementById('fileInfo');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const parseBtn = document.getElementById('parseBtn') as HTMLButtonElement;
  
  if (fileInfo && fileName && fileSize && parseBtn) {
    fileInfo.classList.add('visible');
    fileName.textContent = file.name;
    fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    parseBtn.disabled = false;
  }
  
  hideStatus();
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Render profile preview with editable fields
 */
function renderProfilePreview(profile: UserProfile): void {
  const preview = document.getElementById('profilePreview');
  if (!preview) return;
  
  let html = '<form id="profileForm">';
  
  // Personal info
  html += '<div class="profile-section">';
  html += '<h3>Personal Information</h3>';
  html += `<div class="profile-field"><label class="profile-label">First Name: <span class="required">*</span></label><input type="text" class="profile-input" name="firstName" value="${escapeHtml(profile.personal.firstName || '')}" required /></div>`;
  html += `<div class="profile-field"><label class="profile-label">Last Name: <span class="required">*</span></label><input type="text" class="profile-input" name="lastName" value="${escapeHtml(profile.personal.lastName || '')}" required /></div>`;
  html += `<div class="profile-field"><label class="profile-label">Email: <span class="required">*</span></label><input type="email" class="profile-input" name="email" value="${escapeHtml(profile.personal.email || '')}" required /></div>`;
  html += `<div class="profile-field"><label class="profile-label">Phone:</label><input type="tel" class="profile-input" name="phone" value="${escapeHtml(profile.personal.phone || '')}" /></div>`;
  html += `<div class="profile-field"><label class="profile-label">Location:</label><input type="text" class="profile-input" name="location" value="${escapeHtml(profile.personal.location || '')}" /></div>`;
  html += '</div>';
  
  // Professional links
  html += '<div class="profile-section">';
  html += '<h3>Professional Links</h3>';
  html += `<div class="profile-field"><label class="profile-label">LinkedIn:</label><input type="url" class="profile-input" name="linkedin" value="${escapeHtml(profile.professional.linkedin || '')}" placeholder="https://linkedin.com/in/..." /></div>`;
  html += `<div class="profile-field"><label class="profile-label">GitHub:</label><input type="url" class="profile-input" name="github" value="${escapeHtml(profile.professional.github || '')}" placeholder="https://github.com/..." /></div>`;
  html += `<div class="profile-field"><label class="profile-label">Portfolio:</label><input type="url" class="profile-input" name="portfolio" value="${escapeHtml(profile.professional.portfolio || '')}" placeholder="https://..." /></div>`;
  html += `<div class="profile-field"><label class="profile-label">Years of Exp:</label><input type="number" class="profile-input" name="yearsOfExperience" value="${profile.professional.yearsOfExperience || 0}" min="0" /></div>`;
  html += '</div>';
  
  // Skills (editable list)
  html += '<div class="profile-section">';
  html += '<h3>Skills</h3>';
  html += '<div class="profile-field"><label class="profile-label">Skills:</label><div class="editable-list" id="skillsList">';
  if (profile.skills && profile.skills.length > 0) {
    profile.skills.forEach((skill, index) => {
      html += `<div class="editable-list-item" data-skill-index="${index}">`;
      html += `<input type="text" value="${escapeHtml(skill)}" />`;
      html += `<button type="button" class="remove-skill-btn">Remove</button>`;
      html += `</div>`;
    });
  }
  html += '</div></div>';
  html += '<button type="button" class="add-item-btn" id="addSkillBtn">Add Skill</button>';
  html += '</div>';
  
  // Work Experience (simplified display - work/education are complex, keep as read-only for now)
  if (profile.work && profile.work.length > 0) {
    html += '<div class="profile-section">';
    html += '<h3>Work Experience</h3>';
    profile.work.forEach(job => {
      html += `<div class="profile-value" style="margin-bottom: 12px; padding: 12px; background: #f9f9f9; border-radius: 4px;">`;
      html += `<strong>${escapeHtml(job.title)}</strong> at ${escapeHtml(job.company)}<br/>`;
      html += `<small style="color: #666;">${escapeHtml(job.startDate)} - ${job.current ? 'Present' : escapeHtml(job.endDate)}</small>`;
      if (job.description) {
        html += `<p style="margin-top: 8px; font-size: 13px; color: #666;">${escapeHtml(job.description)}</p>`;
      }
      html += '</div>';
    });
    html += '<p style="font-size: 12px; color: #999; margin-top: 8px;">Note: Work experience editing coming soon</p>';
    html += '</div>';
  }
  
  // Education (read-only for now)
  if (profile.education && profile.education.length > 0) {
    html += '<div class="profile-section">';
    html += '<h3>Education</h3>';
    profile.education.forEach(edu => {
      html += `<div class="profile-value" style="margin-bottom: 12px; padding: 12px; background: #f9f9f9; border-radius: 4px;">`;
      html += `<strong>${escapeHtml(edu.degree)}</strong> in ${escapeHtml(edu.field || 'N/A')}<br/>`;
      html += `<small style="color: #666;">${escapeHtml(edu.school)} - ${escapeHtml(edu.graduationYear)}</small>`;
      html += '</div>';
    });
    html += '<p style="font-size: 12px; color: #999; margin-top: 8px;">Note: Education editing coming soon</p>';
    html += '</div>';
  }
  
  // Summary
  html += '<div class="profile-section">';
  html += '<h3>Professional Summary</h3>';
  html += `<div class="profile-field"><label class="profile-label">Summary:</label><textarea class="profile-textarea" name="summary" placeholder="Brief professional summary...">${escapeHtml(profile.summary || '')}</textarea></div>`;
  html += '</div>';
  
  html += '</form>';
  
  preview.innerHTML = html;
  
  // Setup event listeners for skills
  setupSkillsEventListeners();
  
  // Populate raw JSON data
  const rawDataJson = document.getElementById('rawDataJson');
  if (rawDataJson) {
    // Create a clean copy without resumeText for display
    const displayProfile = { ...profile };
    delete displayProfile.resumeText;
    rawDataJson.textContent = JSON.stringify(displayProfile, null, 2);
  }
}

/**
 * Setup event listeners for skills management
 */
function setupSkillsEventListeners(): void {
  // Add skill button
  const addSkillBtn = document.getElementById('addSkillBtn');
  if (addSkillBtn) {
    addSkillBtn.addEventListener('click', () => {
      const skillsList = document.getElementById('skillsList');
      if (!skillsList) return;
      
      const index = skillsList.querySelectorAll('.editable-list-item').length;
      const div = document.createElement('div');
      div.className = 'editable-list-item';
      div.setAttribute('data-skill-index', String(index));
      div.innerHTML = `<input type="text" placeholder="Enter skill..." /><button type="button" class="remove-skill-btn">Remove</button>`;
      
      // Add event listener to the new remove button
      const removeBtn = div.querySelector('.remove-skill-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          div.remove();
        });
      }
      
      skillsList.appendChild(div);
    });
  }
  
  // Remove skill buttons (use event delegation for existing items)
  const skillsList = document.getElementById('skillsList');
  if (skillsList) {
    skillsList.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('remove-skill-btn')) {
        const item = target.closest('.editable-list-item');
        if (item) {
          item.remove();
        }
      }
    });
  }
}

/**
 * Collect self-ID data from form
 */
function collectSelfIdData(): any {
  const form = document.getElementById('selfIdForm') as HTMLFormElement;
  if (!form) return null;

  const formData = new FormData(form);
  
  // Collect multi-select checkboxes
  const gender: string[] = [];
  const race: string[] = [];
  const orientation: string[] = [];
  
  form.querySelectorAll('input[name="gender"]:checked').forEach((input: any) => {
    gender.push(input.value);
  });
  
  form.querySelectorAll('input[name="race"]:checked').forEach((input: any) => {
    race.push(input.value);
  });
  
  form.querySelectorAll('input[name="orientation"]:checked').forEach((input: any) => {
    orientation.push(input.value);
  });
  
  return {
    gender,
    race,
    orientation,
    veteran: formData.get('veteran') as string || '',
    transgender: formData.get('transgender') as string || '',
    disability: formData.get('disability') as string || '',
  };
}

/**
 * Collect work authorization data from form
 */
function collectWorkAuthData(): any {
  const form = document.getElementById('workAuthForm') as HTMLFormElement;
  if (!form) return null;

  const formData = new FormData(form);
  
  const legallyAuthorizedValue = formData.get('legallyAuthorized') as string;
  const requiresSponsorshipValue = formData.get('requiresSponsorship') as string;
  
  return {
    legallyAuthorized: legallyAuthorizedValue === 'yes',
    requiresSponsorship: requiresSponsorshipValue === 'yes',
    currentStatus: formData.get('currentStatus') as string || undefined,
    visaType: formData.get('visaType') as string || undefined,
    sponsorshipTimeline: formData.get('sponsorshipTimeline') as string || undefined,
  };
}

/**
 * Save profile with self-ID and move to work auth step
 */
async function saveSelfIdAndContinue(includeSelfId: boolean): Promise<void> {
  if (!extractedProfile) return;
  
  try {
    // Add self-ID data if requested
    if (includeSelfId) {
      const selfIdData = collectSelfIdData();
      if (selfIdData) {
        extractedProfile.selfId = selfIdData;
      }
    }
    
    // Move to work authorization step
    showStep('step-workauth');
  } catch (err) {
    alert('Failed to proceed: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
}

/**
 * Save final profile with all data
 */
async function saveFinalProfile(includeWorkAuth: boolean): Promise<void> {
  if (!extractedProfile) return;
  
  try {
    // Add work auth data if requested
    if (includeWorkAuth) {
      const workAuthData = collectWorkAuthData();
      if (workAuthData) {
        extractedProfile.workAuth = workAuthData;
      }
    }
    
    // Save the profile
    await saveUserProfile(extractedProfile);
    
    // Save resume file for auto-upload
    if (uploadedFile) {
      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        await browser.storage.local.set({
          resumeFile: {
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            data: Array.from(new Uint8Array(arrayBuffer)),
            lastUpdated: Date.now(),
          }
        });
        console.log('Resume file saved for auto-upload:', uploadedFile.name);
      } catch (err) {
        console.warn('Failed to save resume file:', err);
      }
    }
    
    showStep('step-success');
  } catch (err) {
    alert('Failed to save profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
}

/**
 * Collect edited profile data from form
 */
function collectProfileFromForm(): UserProfile | null {
  const form = document.getElementById('profileForm') as HTMLFormElement;
  if (!form) return null;
  
  // Get form data
  const formData = new FormData(form);
  
  // Collect skills from skill inputs
  const skillsList = document.getElementById('skillsList');
  const skills: string[] = [];
  if (skillsList) {
    skillsList.querySelectorAll('.editable-list-item input').forEach((input: any) => {
      const value = input.value.trim();
      if (value) skills.push(value);
    });
  }
  
  const profile: UserProfile = {
    personal: {
      firstName: (formData.get('firstName') as string) || '',
      lastName: (formData.get('lastName') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      location: (formData.get('location') as string) || '',
    },
    professional: {
      linkedin: (formData.get('linkedin') as string) || '',
      github: (formData.get('github') as string) || '',
      portfolio: (formData.get('portfolio') as string) || '',
      yearsOfExperience: parseInt((formData.get('yearsOfExperience') as string) || '0', 10),
    },
    skills: skills,
    work: extractedProfile?.work || [],
    education: extractedProfile?.education || [],
    summary: (formData.get('summary') as string) || '',
    resumeText: extractedProfile?.resumeText || '',
  };
  
  return profile;
}

/**
 * Create an empty profile template for manual entry
 */
function createEmptyProfile(): UserProfile {
  return {
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: ''
    },
    professional: {
      linkedin: '',
      github: '',
      portfolio: '',
      yearsOfExperience: 0
    },
    work: [],
    education: [],
    skills: [],
    summary: '',
    lastUpdated: Date.now()
  };
}

/**
 * Setup conditional field visibility for work authorization form
 */
function setupWorkAuthConditionalFields(): void {
  const legallyAuthorizedInputs = document.querySelectorAll('input[name="legallyAuthorized"]');
  const requiresSponsorshipInputs = document.querySelectorAll('input[name="requiresSponsorship"]');
  
  const currentStatusGroup = document.getElementById('currentStatusGroup');
  const visaTypeGroup = document.getElementById('visaTypeGroup');
  const sponsorshipTimelineGroup = document.getElementById('sponsorshipTimelineGroup');

  // Show/hide current status based on authorization
  legallyAuthorizedInputs.forEach((input: any) => {
    input.addEventListener('change', () => {
      if (input.checked && input.value === 'yes') {
        if (currentStatusGroup) currentStatusGroup.style.display = 'block';
      } else if (input.checked) {
        if (currentStatusGroup) currentStatusGroup.style.display = 'none';
      }
    });
  });

  // Show/hide visa fields based on sponsorship requirement
  requiresSponsorshipInputs.forEach((input: any) => {
    input.addEventListener('change', () => {
      if (input.checked && input.value === 'yes') {
        if (visaTypeGroup) visaTypeGroup.style.display = 'block';
        if (sponsorshipTimelineGroup) sponsorshipTimelineGroup.style.display = 'block';
      } else if (input.checked) {
        if (visaTypeGroup) visaTypeGroup.style.display = 'none';
        if (sponsorshipTimelineGroup) sponsorshipTimelineGroup.style.display = 'none';
      }
    });
  });
}

/**
 * Initialize onboarding
 */
async function init(): Promise<void> {
  // Check connection status on load
  const connected = await checkConnection();
  updateConnectionStatus(connected);
  
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const parseBtn = document.getElementById('parseBtn') as HTMLButtonElement;
  const skipUploadBtn = document.getElementById('skipUploadBtn');
  const backBtn = document.getElementById('backBtn');
  const saveBtn = document.getElementById('saveBtn');
  const doneBtn = document.getElementById('doneBtn');
  
  // Upload area click
  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragging');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragging');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragging');
      
      const file = e.dataTransfer?.files[0];
      if (file) {
        handleFileSelect(file);
      }
    });
  }
  
  // Skip upload button - go directly to manual entry
  if (skipUploadBtn) {
    skipUploadBtn.addEventListener('click', () => {
      extractedProfile = createEmptyProfile();
      renderProfilePreview(extractedProfile);
      showStep('step-review');
    });
  }
  
  // Parse button
  if (parseBtn) {
    parseBtn.addEventListener('click', async () => {
      if (!uploadedFile) return;
      
      parseBtn.disabled = true;
      const originalText = parseBtn.textContent;
      parseBtn.innerHTML = '<span class="spinner"></span>Parsing...';
      hideStatus();
      
      try {
        // Stage 1: Reading file
        updateProgress('read', 10, 'Reading file...');
        
        // Stage 2: Extract text from file
        const resumeText = await extractTextFromFile(uploadedFile);
        updateProgress('extract', 50, 'Text extraction complete');
        
        // Stage 3: Parse with AI
        const profile = await parseResume(resumeText);
        profile.resumeText = resumeText;
        
        extractedProfile = profile;
        
        // Stage 4: Complete
        updateProgress('done', 100, 'All done!');
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause to show completion
        
        // Show review step
        hideProgress();
        renderProfilePreview(profile);
        showStep('step-review');
      } catch (err) {
        hideProgress();
        showStatus('error', err instanceof Error ? err.message : 'Failed to parse resume');
        parseBtn.disabled = false;
        parseBtn.textContent = originalText;
      }
    });
  }
  
  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showStep('step-upload');
    });
  }
  
  // Save button (review step) - go to self-ID
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!extractedProfile) return;
      
      try {
        // Collect edited profile data from form
        const editedProfile = collectProfileFromForm();
        if (!editedProfile) {
          alert('Failed to collect profile data from form');
          return;
        }
        
        // Validate required fields
        if (!editedProfile.personal.firstName || !editedProfile.personal.lastName || !editedProfile.personal.email) {
          alert('Please fill in all required fields (First Name, Last Name, Email)');
          return;
        }
        
        // Store the profile temporarily (will save with self-ID data)
        extractedProfile = editedProfile;
        
        console.log('[Onboarding] Moving to self-ID step');
        
        // Move to self-ID step
        showStep('step-selfid');
        
        console.log('[Onboarding] Self-ID step should now be visible');
      } catch (err) {
        alert('Failed to proceed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    });
  }

  // Self-ID buttons - move to work auth instead of saving
  const saveSelfIdBtn = document.getElementById('saveSelfIdBtn');
  const skipSelfIdBtn = document.getElementById('skipSelfIdBtn');
  
  console.log('[Onboarding] Self-ID buttons:', { saveSelfIdBtn: !!saveSelfIdBtn, skipSelfIdBtn: !!skipSelfIdBtn });
  
  if (saveSelfIdBtn) {
    saveSelfIdBtn.addEventListener('click', async () => {
      console.log('[Onboarding] Save Self-ID clicked');
      await saveSelfIdAndContinue(true);
    });
  } else {
    console.warn('[Onboarding] saveSelfIdBtn not found in DOM');
  }
  
  if (skipSelfIdBtn) {
    skipSelfIdBtn.addEventListener('click', async () => {
      console.log('[Onboarding] Skip Self-ID clicked');
      await saveSelfIdAndContinue(false);
    });
  } else {
    console.warn('[Onboarding] skipSelfIdBtn not found in DOM');
  }

  // Work Authorization buttons
  const saveWorkAuthBtn = document.getElementById('saveWorkAuthBtn');
  const skipWorkAuthBtn = document.getElementById('skipWorkAuthBtn');
  
  if (saveWorkAuthBtn) {
    saveWorkAuthBtn.addEventListener('click', async () => {
      console.log('[Onboarding] Save Work Auth clicked');
      await saveFinalProfile(true);
    });
  }
  
  if (skipWorkAuthBtn) {
    skipWorkAuthBtn.addEventListener('click', async () => {
      console.log('[Onboarding] Skip Work Auth clicked');
      await saveFinalProfile(false);
    });
  }

  // Work Auth form conditional logic
  setupWorkAuthConditionalFields();
  
  // Done button
  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      window.close();
    });
  }
  
  // Raw data toggle
  const rawDataToggle = document.getElementById('rawDataToggle');
  const rawDataContent = document.getElementById('rawDataContent');
  if (rawDataToggle && rawDataContent) {
    rawDataToggle.addEventListener('click', () => {
      const isExpanded = rawDataContent.classList.contains('expanded');
      rawDataContent.classList.toggle('expanded');
      
      const toggleIcon = rawDataToggle.querySelector('.raw-data-toggle');
      if (toggleIcon) {
        toggleIcon.textContent = isExpanded ? '[+] Show' : '[-] Hide';
      }
    });
  }
}

init();
