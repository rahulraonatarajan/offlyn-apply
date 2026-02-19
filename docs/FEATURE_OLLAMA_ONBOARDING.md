# Feature Brief: Ollama Setup & Configuration (Onboarding)

## 🎯 Feature Overview

**Feature Name**: Ollama Setup & Configuration in Onboarding  
**Priority**: High (Blocks AI features if Ollama not installed)  
**Complexity**: Medium  
**Estimated Effort**: 6-8 hours  
**Agent Assignment**: NEW DEV AGENT (Separate Chat)

**Objective**: Add Ollama detection, installation guidance, troubleshooting, and custom endpoint configuration to onboarding flow.

---

## 📋 Project Context (For New Agent)

### What is Offlyn Apply?
- Firefox browser extension for job application automation
- Uses **local AI** (Ollama) for resume parsing, cover letters, and smart suggestions
- **100% privacy-focused** - all AI runs on user's device
- Built with TypeScript

### Why Ollama Matters
Ollama powers:
1. **Resume parsing** - Extract structured data from PDF/DOCX
2. **Cover letter generation** - AI-generated cover letters
3. **Smart field suggestions** - Infer values for unknown fields
4. **Semantic matching** - Match dropdown options using embeddings

**Without Ollama**: Extension works but AI features disabled

---

## 🔍 Current State Analysis

### Current Ollama Configuration (Working Setup)

**Base URL**: `http://localhost:11434`  
**Chat Model**: `llama3.2`  
**Embedding Model**: `nomic-embed-text`

**Files Using Ollama**:
- `src/shared/ollama-client.ts` - Main Ollama client (resume parsing, chat, embeddings)
- `src/shared/ollama-service.ts` - Field analysis, smart matching
- `src/shared/cover-letter-service.ts` - Cover letter generation
- `src/shared/text-transform-service.ts` - Text transformations
- `src/shared/field-validator.ts` - Field validation
- `src/shared/mastra-agent.ts` - Agent workflows

**API Endpoints Used**:
```typescript
// Connection check
GET http://localhost:11434/api/version

// Chat completions (OpenAI-compatible)
POST http://localhost:11434/v1/chat/completions

// Text generation (Ollama native)
POST http://localhost:11434/api/generate

// Embeddings
POST http://localhost:11434/api/embeddings

// List models
GET http://localhost:11434/api/tags
```

**Current Connection Check**:
```typescript
// In ollama-client.ts
async isAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${this.baseUrl}/api/version`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('[Ollama] Connection check failed:', error);
    return false;
  }
}
```

---

### Current Problem

**Onboarding does NOT check for Ollama**:
- User uploads resume → AI parsing fails silently
- No guidance to install Ollama
- No troubleshooting help
- No way to configure custom endpoints (advanced users)
- No retry button if Ollama is offline

**User Experience**:
1. User completes onboarding
2. Clicks "Auto-fill" on job application
3. AI features don't work (Ollama not installed)
4. User frustrated, no guidance

---

## 🎯 Solution: Ollama Setup in Onboarding

### New Onboarding Flow (8 Steps, was 7)

**Updated Step Order**:
1. **Upload Resume** (unchanged)
2. **Ollama Setup** (NEW - check installation, guide setup)
3. **Review & Edit Personal Info** (with split fields)
4. **Professional Links** (unchanged)
5. **Self-Identification** (voluntary self-ID)
6. **Work Authorization** (unchanged)
7. **Cover Letter** (unchanged)
8. **Success** (unchanged)

---

### Step 2: Ollama Setup (NEW STEP)

**Purpose**: 
- Check if Ollama is installed
- Guide user to install if missing
- Test connection
- Provide troubleshooting
- Allow custom endpoint configuration (advanced)

---

#### State 1: Checking Connection (Loading)

```html
<div class="content-card">
  <h2 class="step-title">AI Setup (Ollama)</h2>
  <p class="step-subtitle">Checking for local AI installation...</p>
  
  <div class="connection-check">
    <div class="spinner"></div>
    <p>Testing connection to Ollama...</p>
  </div>
</div>
```

---

#### State 2: Connected (Success)

```html
<div class="content-card">
  <h2 class="step-title">AI Setup (Ollama)</h2>
  <p class="step-subtitle">Your local AI is ready!</p>
  
  <div class="status-card success">
    <svg><!-- check icon --></svg>
    <div class="status-content">
      <h3>✓ Ollama Connected</h3>
      <p>Version: v0.1.x</p>
      <p>Endpoint: http://localhost:11434</p>
      <p>Model: llama3.2</p>
    </div>
  </div>
  
  <div class="privacy-notice">
    <svg><!-- lock icon --></svg>
    <p><strong>100% Private</strong> - All AI processing happens on your device. No data is sent to external servers.</p>
  </div>
  
  <details class="advanced-config">
    <summary>Advanced Configuration</summary>
    <div class="form-group">
      <label>Custom Ollama Endpoint</label>
      <input type="url" id="customOllamaEndpoint" value="http://localhost:11434" placeholder="http://localhost:11434">
      <small class="form-hint">Change only if you're running Ollama on a custom port or remote server</small>
    </div>
    <button class="btn btn-secondary" id="testCustomEndpointBtn">Test Connection</button>
  </details>
</div>

<div class="button-group" style="margin-top: 24px;">
  <button id="backFromOllamaBtn" class="btn btn-secondary">Back</button>
  <button id="continueWithOllamaBtn" class="btn btn-primary">
    Continue with AI Features
    <svg><!-- arrow icon --></svg>
  </button>
  <button id="skipOllamaBtn" class="btn btn-text">Skip AI Features</button>
</div>
```

**Implementation**:
- Show connection success
- Display Ollama version and endpoint
- Privacy notice emphasizes local processing
- Advanced users can configure custom endpoint
- Two paths: Continue with AI OR Skip (basic mode)

---

#### State 3: Not Installed (Download Prompt)

```html
<div class="content-card">
  <h2 class="step-title">AI Setup (Ollama)</h2>
  <p class="step-subtitle">Local AI not detected</p>
  
  <div class="status-card error">
    <svg><!-- alert icon --></svg>
    <div class="status-content">
      <h3>Ollama Not Installed</h3>
      <p>Ollama enables AI-powered features like resume parsing, cover letter generation, and smart field suggestions.</p>
    </div>
  </div>
  
  <div class="setup-instructions">
    <h3>Quick Setup (5 minutes)</h3>
    
    <div class="step-item">
      <div class="step-number">1</div>
      <div class="step-content">
        <h4>Download Ollama</h4>
        <p>Download and install Ollama for your operating system.</p>
        <a href="https://ollama.com/download" target="_blank" class="btn btn-primary">
          Download Ollama
          <svg><!-- external link icon --></svg>
        </a>
      </div>
    </div>
    
    <div class="step-item">
      <div class="step-number">2</div>
      <div class="step-content">
        <h4>Install the Model</h4>
        <p>After installing Ollama, open your terminal and run:</p>
        <pre class="code-block">ollama pull llama3.2</pre>
        <button class="btn-copy" data-copy="ollama pull llama3.2">Copy</button>
      </div>
    </div>
    
    <div class="step-item">
      <div class="step-number">3</div>
      <div class="step-content">
        <h4>Verify Installation</h4>
        <p>Check that Ollama is running:</p>
        <pre class="code-block">ollama list</pre>
        <button class="btn-copy" data-copy="ollama list">Copy</button>
      </div>
    </div>
    
    <div class="step-item">
      <div class="step-number">4</div>
      <div class="step-content">
        <h4>Retry Connection</h4>
        <p>Once installed, click the button below to test the connection.</p>
        <button class="btn btn-primary" id="retryOllamaConnectionBtn">
          <svg><!-- refresh icon --></svg>
          Test Connection Again
        </button>
      </div>
    </div>
  </div>
  
  <div class="troubleshooting-link">
    <a href="#" id="showTroubleshootingBtn">Having trouble? View troubleshooting guide</a>
  </div>
</div>

<div class="button-group" style="margin-top: 24px;">
  <button id="backFromOllamaSetupBtn" class="btn btn-secondary">Back</button>
  <button id="skipOllamaSetupBtn" class="btn btn-text">
    Skip AI Features (Use Basic Mode)
  </button>
</div>
```

**Implementation**:
- Clear 4-step setup guide
- Links to official Ollama download page
- Copy buttons for terminal commands
- Retry button to recheck connection
- Option to skip AI features (continue with basic autofill)

---

#### State 4: Troubleshooting Guide (Expandable)

```html
<div class="troubleshooting-modal" id="troubleshootingModal" style="display: none;">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Ollama Troubleshooting Guide</h2>
      <button class="modal-close" id="closeTroubleshootingBtn">&times;</button>
    </div>
    
    <div class="modal-body">
      <div class="troubleshooting-section">
        <h3>🔍 Common Issues</h3>
        
        <div class="issue-item">
          <h4>1. Ollama Not Running</h4>
          <p><strong>Problem</strong>: Ollama is installed but not running.</p>
          <p><strong>Solution</strong>:</p>
          <ul>
            <li><strong>macOS/Linux</strong>: Run <code>ollama serve</code> in terminal</li>
            <li><strong>Windows</strong>: Ollama should start automatically. Check system tray.</li>
            <li>Verify with: <code>ollama list</code></li>
          </ul>
        </div>
        
        <div class="issue-item">
          <h4>2. Port Already in Use</h4>
          <p><strong>Problem</strong>: Port 11434 is already in use by another application.</p>
          <p><strong>Solution</strong>:</p>
          <ul>
            <li>Check what's using port 11434: <code>lsof -i :11434</code> (macOS/Linux)</li>
            <li>Stop the conflicting process or configure Ollama on a different port</li>
            <li>If using custom port, configure it in "Advanced Configuration" above</li>
          </ul>
        </div>
        
        <div class="issue-item">
          <h4>3. Model Not Downloaded</h4>
          <p><strong>Problem</strong>: Ollama is running but model isn't downloaded.</p>
          <p><strong>Solution</strong>:</p>
          <ul>
            <li>Download model: <code>ollama pull llama3.2</code></li>
            <li>Verify: <code>ollama list</code> should show "llama3.2"</li>
            <li>Download embedding model (optional): <code>ollama pull nomic-embed-text</code></li>
          </ul>
        </div>
        
        <div class="issue-item">
          <h4>4. Connection Refused (CORS)</h4>
          <p><strong>Problem</strong>: Browser blocks connection due to CORS policy.</p>
          <p><strong>Solution</strong>:</p>
          <ul>
            <li>Ollama v0.1.29+ has CORS enabled by default</li>
            <li>If using older version, set environment variable:</li>
            <li><code>export OLLAMA_ORIGINS="moz-extension://*"</code> (before running <code>ollama serve</code>)</li>
          </ul>
        </div>
        
        <div class="issue-item">
          <h4>5. Slow Performance</h4>
          <p><strong>Problem</strong>: Ollama responses are very slow.</p>
          <p><strong>Solution</strong>:</p>
          <ul>
            <li>Use smaller model: <code>ollama pull llama3.2:1b</code> (1 billion parameter version)</li>
            <li>Ensure model is loaded: First request loads model into memory (slow), subsequent requests are fast</li>
            <li>Check system resources (RAM/CPU usage)</li>
          </ul>
        </div>
        
        <div class="issue-item">
          <h4>6. Remote Ollama Server</h4>
          <p><strong>Problem</strong>: Want to use Ollama running on a different machine.</p>
          <p><strong>Solution</strong>:</p>
          <ul>
            <li>Use "Advanced Configuration" to set custom endpoint</li>
            <li>Example: <code>http://192.168.1.100:11434</code></li>
            <li>Ensure Ollama server allows remote connections</li>
            <li>Set <code>OLLAMA_HOST=0.0.0.0</code> on server side</li>
          </ul>
        </div>
      </div>
      
      <div class="troubleshooting-section">
        <h3>🧪 Test Commands</h3>
        
        <div class="test-command">
          <p><strong>Test Ollama API directly</strong>:</p>
          <pre class="code-block">curl http://localhost:11434/api/version</pre>
          <button class="btn-copy" data-copy="curl http://localhost:11434/api/version">Copy</button>
          <p class="test-expected">Expected: <code>{"version":"0.1.x"}</code></p>
        </div>
        
        <div class="test-command">
          <p><strong>Test chat completions</strong>:</p>
          <pre class="code-block">curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.2","messages":[{"role":"user","content":"Hi"}],"stream":false}'</pre>
          <button class="btn-copy">Copy</button>
        </div>
        
        <div class="test-command">
          <p><strong>List installed models</strong>:</p>
          <pre class="code-block">ollama list</pre>
          <button class="btn-copy" data-copy="ollama list">Copy</button>
          <p class="test-expected">Expected: Should show "llama3.2" in list</p>
        </div>
      </div>
      
      <div class="troubleshooting-section">
        <h3>📚 Additional Resources</h3>
        <ul class="resource-list">
          <li><a href="https://github.com/ollama/ollama#readme" target="_blank">Ollama Documentation</a></li>
          <li><a href="https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md" target="_blank">Official Troubleshooting Guide</a></li>
          <li><a href="https://github.com/ollama/ollama/issues" target="_blank">Report Issue on GitHub</a></li>
        </ul>
      </div>
      
      <div class="still-stuck">
        <p><strong>Still stuck?</strong> You can continue without AI features and set up Ollama later.</p>
        <button class="btn btn-secondary" id="skipOllamaFromTroubleshootingBtn">Continue Without AI</button>
      </div>
    </div>
  </div>
</div>
```

**Implementation**:
- Modal overlay for troubleshooting
- Covers 6 common issues with solutions
- Test commands with copy buttons
- Links to official docs
- Option to skip AI features if stuck

---

### Advanced Configuration (For Power Users)

**Custom Endpoint Input**:
```html
<details class="advanced-config">
  <summary>Advanced Configuration</summary>
  
  <div class="config-form">
    <div class="form-group">
      <label>Ollama Endpoint URL</label>
      <input 
        type="url" 
        id="customOllamaEndpoint" 
        value="http://localhost:11434" 
        placeholder="http://localhost:11434"
      >
      <small class="form-hint">
        Change if running Ollama on a custom port or remote server.<br>
        Examples: <code>http://192.168.1.100:11434</code>, <code>http://localhost:8080</code>
      </small>
    </div>
    
    <div class="form-group">
      <label>Chat Model (Optional)</label>
      <input 
        type="text" 
        id="customChatModel" 
        value="llama3.2" 
        placeholder="llama3.2"
      >
      <small class="form-hint">
        Default: <code>llama3.2</code>. Other options: <code>llama3.2:1b</code> (smaller/faster), <code>mistral</code>
      </small>
    </div>
    
    <div class="form-group">
      <label>Embedding Model (Optional)</label>
      <input 
        type="text" 
        id="customEmbeddingModel" 
        value="nomic-embed-text" 
        placeholder="nomic-embed-text"
      >
      <small class="form-hint">
        Default: <code>nomic-embed-text</code>. Used for semantic search and smart matching.
      </small>
    </div>
    
    <button class="btn btn-secondary" id="testCustomEndpointBtn">
      <svg><!-- refresh icon --></svg>
      Test Custom Configuration
    </button>
    
    <button class="btn btn-text" id="resetToDefaultBtn">Reset to Default</button>
  </div>
</details>
```

**Stored Configuration**:
```typescript
interface OllamaConfig {
  endpoint: string;         // e.g., "http://localhost:11434"
  chatModel: string;        // e.g., "llama3.2"
  embeddingModel: string;   // e.g., "nomic-embed-text"
  lastChecked: number;      // timestamp of last successful connection
  enabled: boolean;         // whether AI features are enabled
}

// Default config (user's working setup)
const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  endpoint: 'http://localhost:11434',
  chatModel: 'llama3.2',
  embeddingModel: 'nomic-embed-text',
  lastChecked: 0,
  enabled: false,
};

// Storage key
await browser.storage.local.set({ 'ollamaConfig': config });
```

---

## 📂 Files to Create/Modify

### HIGH PRIORITY (Core Implementation)

1. **`public/onboarding/onboarding.html`** (~300-400 lines)
   - Add NEW Step 2 for Ollama setup
   - 4 states: Loading, Connected, Not Installed, Troubleshooting
   - Update step wizard to show 8 steps (was 7)
   - Add CSS for connection status cards, modal, code blocks

2. **`src/onboarding/onboarding.ts`** (~200-250 lines)
   - Update `STEP_ORDER` to include `'step-ollama'`
   - Add `checkOllamaConnection()` function
   - Add `retryConnection()` handler
   - Add `testCustomEndpoint()` handler
   - Add `skipAIFeatures()` handler (set config enabled=false)
   - Save Ollama config to storage

3. **`src/shared/ollama-config.ts`** (NEW FILE, ~100-120 lines)
   - Define `OllamaConfig` interface
   - Export `DEFAULT_OLLAMA_CONFIG`
   - `getOllamaConfig()` - Load from storage
   - `saveOllamaConfig()` - Save to storage
   - `testConnection()` - Test given endpoint
   - `isOllamaEnabled()` - Check if AI features enabled

4. **`src/shared/ollama-client.ts`** (~30-50 lines modified)
   - Update constructor to load config from storage
   - Use stored endpoint instead of hardcoded `http://localhost:11434`
   - Use stored models instead of hardcoded `llama3.2`, `nomic-embed-text`

5. **`src/shared/ollama-service.ts`** (~20-30 lines modified)
   - Load config from storage
   - Use configured endpoint

---

### MEDIUM PRIORITY (UX Improvements)

6. **`public/popup/popup.html`** (~20-30 lines)
   - Show Ollama connection status indicator
   - "Offline" indicator if Ollama not connected
   - Click to retry connection

7. **`src/popup/popup.ts`** (~30-40 lines)
   - Add Ollama status check on popup open
   - Show/hide AI features based on connection status
   - Add retry button handler

8. **`public/settings/settings.html`** (~50-60 lines)
   - Add "Ollama Configuration" section
   - Allow users to reconfigure endpoint/models
   - Test connection button
   - Toggle AI features on/off

9. **`src/settings/settings.ts`** (~40-50 lines)
   - Load Ollama config
   - Save updated config
   - Test connection handler

---

## ✅ Acceptance Criteria

### Ollama Detection
- [ ] Onboarding checks for Ollama during Step 2
- [ ] Shows "Connected" if Ollama available
- [ ] Shows "Not Installed" if Ollama unavailable
- [ ] Displays Ollama version when connected
- [ ] Displays endpoint URL (http://localhost:11434)

### Installation Guidance
- [ ] Clear 4-step setup guide
- [ ] Link to https://ollama.com/download opens in new tab
- [ ] Terminal commands shown with copy buttons
- [ ] "Test Connection Again" button retries check

### Troubleshooting
- [ ] "Having trouble?" link opens troubleshooting modal
- [ ] Modal covers 6 common issues with solutions
- [ ] Test commands provided with copy buttons
- [ ] Links to official Ollama docs
- [ ] Option to skip AI features from troubleshooting

### Custom Endpoint
- [ ] "Advanced Configuration" section (collapsed by default)
- [ ] Custom endpoint input (default: http://localhost:11434)
- [ ] Custom model inputs (chat model, embedding model)
- [ ] "Test Connection" button validates custom config
- [ ] "Reset to Default" button restores defaults
- [ ] Config saved to storage

### Skip AI Features
- [ ] "Skip AI Features" button allows continuing without Ollama
- [ ] Extension works in "Basic Mode" (autofill only, no AI)
- [ ] User can re-enable AI features in settings later

### Integration
- [ ] All Ollama clients use stored config (not hardcoded)
- [ ] Popup shows connection status
- [ ] Settings page allows reconfiguring Ollama
- [ ] Connection status persists across sessions

### Overall
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Test onboarding with Ollama installed
- [ ] Test onboarding with Ollama NOT installed
- [ ] Test custom endpoint configuration
- [ ] Test skip AI features flow
- [ ] No console errors

---

## 🔧 Implementation Plan

### Phase 1: Ollama Config System (2-3 hours)

**Step 1: Create `src/shared/ollama-config.ts`**
- Define `OllamaConfig` interface
- Default config (user's working setup)
- Storage functions (get, save, test)

```typescript
export interface OllamaConfig {
  endpoint: string;
  chatModel: string;
  embeddingModel: string;
  lastChecked: number;
  enabled: boolean;
}

export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  endpoint: 'http://localhost:11434',
  chatModel: 'llama3.2',
  embeddingModel: 'nomic-embed-text',
  lastChecked: 0,
  enabled: false,
};

export async function getOllamaConfig(): Promise<OllamaConfig> {
  const result = await browser.storage.local.get('ollamaConfig');
  return result.ollamaConfig || DEFAULT_OLLAMA_CONFIG;
}

export async function saveOllamaConfig(config: OllamaConfig): Promise<void> {
  await browser.storage.local.set({ 'ollamaConfig': config });
}

export async function testConnection(endpoint: string): Promise<{
  success: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${endpoint}/api/version`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    return { success: true, version: data.version };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}
```

**Step 2: Update `src/shared/ollama-client.ts`**
- Load config on initialization
- Use configured endpoint/models

```typescript
import { getOllamaConfig } from './ollama-config';

export class OllamaClient {
  private baseUrl: string;
  private model: string;
  private embeddingModel: string;

  constructor(baseUrl?: string, model?: string) {
    // Allow override in constructor (for testing)
    this.baseUrl = baseUrl || 'http://localhost:11434';
    this.model = model || 'llama3.2';
    this.embeddingModel = 'nomic-embed-text';
    
    // Load from storage
    this.loadConfig();
  }
  
  private async loadConfig() {
    try {
      const config = await getOllamaConfig();
      if (config.enabled) {
        this.baseUrl = config.endpoint;
        this.model = config.chatModel;
        this.embeddingModel = config.embeddingModel;
      }
    } catch (err) {
      console.warn('[Ollama] Failed to load config, using defaults');
    }
  }
  
  // ... rest of existing code
}
```

---

### Phase 2: Onboarding UI (3-4 hours)

**Step 3: Add Step 2 to `public/onboarding/onboarding.html`**
- Insert after Step 1 (Upload Resume)
- 4 states: Loading, Connected, Not Installed, Troubleshooting
- Update step wizard

**Step 4: Update `src/onboarding/onboarding.ts`**
- Update `STEP_ORDER` = `['step-upload', 'step-ollama', 'step-review', ...]`
- Add connection check logic
- Add retry handler
- Add skip handler
- Save config

```typescript
async function checkOllamaConnection(): Promise<void> {
  showOllamaState('loading');
  
  const config = await getOllamaConfig();
  const result = await testConnection(config.endpoint);
  
  if (result.success) {
    showOllamaState('connected', { version: result.version, endpoint: config.endpoint });
  } else {
    showOllamaState('not-installed', { error: result.error });
  }
}

function showOllamaState(state: 'loading' | 'connected' | 'not-installed' | 'troubleshooting', data?: any) {
  // Update UI based on state
  document.getElementById('ollamaLoading')?.classList.toggle('active', state === 'loading');
  document.getElementById('ollamaConnected')?.classList.toggle('active', state === 'connected');
  document.getElementById('ollamaNotInstalled')?.classList.toggle('active', state === 'not-installed');
  
  if (state === 'connected' && data) {
    document.getElementById('ollamaVersion')!.textContent = data.version;
    document.getElementById('ollamaEndpoint')!.textContent = data.endpoint;
  }
}

// Retry button
document.getElementById('retryOllamaConnectionBtn')?.addEventListener('click', async () => {
  await checkOllamaConnection();
});

// Skip button
document.getElementById('skipOllamaBtn')?.addEventListener('click', async () => {
  const config = await getOllamaConfig();
  config.enabled = false;
  await saveOllamaConfig(config);
  showStep('step-review'); // Move to next step
});

// Continue button
document.getElementById('continueWithOllamaBtn')?.addEventListener('click', async () => {
  const config = await getOllamaConfig();
  config.enabled = true;
  config.lastChecked = Date.now();
  await saveOllamaConfig(config);
  showStep('step-review'); // Move to next step
});
```

---

### Phase 3: Settings Integration (1-2 hours)

**Step 5: Add Ollama Config to `public/settings/settings.html`**
- Add section for Ollama configuration
- Endpoint, models, test button

**Step 6: Update `src/settings/settings.ts`**
- Load/save config
- Test connection

---

### Phase 4: Testing (1-2 hours)

**Step 7: Test All Scenarios**
- Ollama installed and running → Connected state
- Ollama not installed → Not Installed state, setup guide
- Custom endpoint → Advanced config works
- Skip AI features → Basic mode works
- Retry connection → Recheck works
- Troubleshooting modal → Opens and closes

---

## 🚨 Edge Cases to Handle

### Connection Edge Cases

1. **Ollama Installed but Not Running**
   - Detect: Connection fails but Ollama binary exists
   - Solution: Show "Please start Ollama" message

2. **Port Conflict**
   - Detect: Connection refused on default port
   - Solution: Suggest checking port availability, provide custom endpoint option

3. **Model Not Downloaded**
   - Detect: Connection succeeds but model not found
   - Solution: Show "Download model" instruction

4. **Slow First Request**
   - Problem: First request loads model into memory (slow)
   - Solution: Show "Loading model..." message, set longer timeout

5. **CORS Issues**
   - Detect: Fetch fails with CORS error
   - Solution: Suggest updating Ollama to v0.1.29+

---

### Configuration Edge Cases

1. **Invalid Endpoint URL**
   - Validate URL format before saving
   - Show error: "Invalid URL format"

2. **Remote Server Not Reachable**
   - Test connection before saving
   - Show error: "Cannot reach server at [URL]"

3. **Non-existent Model**
   - Model name typo (e.g., "llama3" instead of "llama3.2")
   - Solution: Test by calling `/api/tags` and validate model exists

---

## 📊 Expected Outcomes

### Scenario A: Ollama Installed & Running (Happy Path)

**Console Output**:
```
[Ollama Setup] Checking connection...
[Ollama Setup] ✓ Connected to Ollama v0.1.32
[Ollama Setup] Endpoint: http://localhost:11434
[Ollama Setup] Model: llama3.2
[Ollama Setup] AI features enabled
```

**UI**:
- Shows "✓ Ollama Connected"
- Displays version, endpoint, model
- Privacy notice visible
- "Continue with AI Features" button enabled

---

### Scenario B: Ollama Not Installed

**Console Output**:
```
[Ollama Setup] Checking connection...
[Ollama Setup] ✗ Connection failed: Failed to fetch
[Ollama Setup] Showing installation guide
```

**UI**:
- Shows "Ollama Not Installed"
- 4-step setup guide visible
- Link to https://ollama.com/download
- "Test Connection Again" button
- "Skip AI Features" button

---

### Scenario C: Custom Endpoint (Advanced User)

**User Action**:
1. Expand "Advanced Configuration"
2. Change endpoint to `http://192.168.1.100:11434`
3. Click "Test Connection"

**Console Output**:
```
[Ollama Setup] Testing custom endpoint: http://192.168.1.100:11434
[Ollama Setup] ✓ Connection successful
[Ollama Setup] Saving custom config
```

**UI**:
- Shows "✓ Connection Successful"
- Config saved
- "Continue with AI Features" enabled

---

## 📚 Reference Materials

### Ollama Documentation
- **Installation**: https://ollama.com/download
- **Models**: https://ollama.com/library
- **API Docs**: https://github.com/ollama/ollama/blob/main/docs/api.md
- **Troubleshooting**: https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md

### Current Working Config (User's Setup)
```typescript
{
  endpoint: 'http://localhost:11434',
  chatModel: 'llama3.2',
  embeddingModel: 'nomic-embed-text'
}
```

---

## 🔄 Handoff Instructions for DEV Agent

### When You Start Your New Chat:

1. **Read This Document First** - Complete Ollama setup plan

2. **Understand User's Current Setup**:
   - Ollama runs on `http://localhost:11434`
   - Chat model: `llama3.2`
   - Embedding model: `nomic-embed-text`
   - This configuration works perfectly for the user

3. **Start with Phase 1 (Config System)**:
   - Create `src/shared/ollama-config.ts`
   - Add storage functions
   - Update `ollama-client.ts` to use stored config

4. **Then Phase 2 (Onboarding UI)**:
   - Add Step 2 to onboarding
   - Implement 4 states (Loading, Connected, Not Installed, Troubleshooting)
   - Add retry and skip handlers

5. **Then Phase 3 (Settings)**:
   - Add Ollama section to settings page
   - Allow reconfiguring endpoint/models

6. **Finally Phase 4 (Testing)**:
   - Test with Ollama installed
   - Test without Ollama
   - Test custom endpoint
   - Test skip AI features

7. **Initial Setup**:
   ```bash
   cd /Users/nishanthreddy/Documents/SideQuests/axesimplify/apps/extension-firefox
   npm run build
   npm run run:firefox
   # Test onboarding flow
   # Check Ollama connection
   ```

---

## ⏱️ Time Estimates

- **Phase 1** (Config System): 2-3 hours
- **Phase 2** (Onboarding UI): 3-4 hours
- **Phase 3** (Settings Integration): 1-2 hours
- **Phase 4** (Testing): 1-2 hours

**Total**: 6-8 hours (could stretch to 10 hours with polish)

---

## 🎯 Success Metrics

**Ollama Setup is complete when**:

1. **Detection Works**: Onboarding checks for Ollama automatically
2. **Guidance Works**: Clear setup instructions for users without Ollama
3. **Config Works**: Users can configure custom endpoints
4. **Troubleshooting Works**: Comprehensive guide helps stuck users
5. **Skip Works**: Users can continue without AI features
6. **Integration Works**: All Ollama clients use stored config
7. **UX Works**: Clear feedback at every step

---

## 🚀 Quick Commands

```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# List installed models
ollama list

# Pull model
ollama pull llama3.2

# Start Ollama
ollama serve

# View storage (in browser console)
await browser.storage.local.get('ollamaConfig')
```

---

**Ready to implement!** Start with Phase 1 (config system) to centralize Ollama configuration. 🚀
