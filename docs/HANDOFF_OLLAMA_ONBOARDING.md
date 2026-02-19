# Quick Handoff: Ollama Setup & Configuration (Onboarding)

**For User** - How to hand off this feature to a new DEV agent

---

## 🎯 What This Feature Does

Adds Ollama detection and setup to onboarding:
1. **Check if Ollama installed** → Show connection status
2. **Installation guidance** → Link to download, setup steps
3. **Troubleshooting** → Help for common issues
4. **Custom endpoint** → Advanced users can configure remote Ollama
5. **Refresh button** → Retry connection if offline
6. **Skip option** → Continue without AI features (basic mode)

---

## 📄 Feature Brief Location

**File**: `docs/FEATURE_OLLAMA_ONBOARDING.md`

This is a **complete, standalone feature brief** with:
- Full project context
- User's current working Ollama config
- 4 UI states (Loading, Connected, Not Installed, Troubleshooting)
- Complete HTML/CSS mockups
- Config storage system
- Step-by-step implementation plan
- Edge case handling
- Testing checklist

---

## 🚀 How to Hand Off to DEV Agent

### Step 1: Open New Chat with DEV Agent
In Cursor, start a fresh chat with a new agent.

### Step 2: Share the Feature Brief
Say to the new DEV agent:
```
Please implement the feature described in: docs/FEATURE_OLLAMA_ONBOARDING.md

This is a complete feature brief with all context, requirements, and implementation plan.
```

### Step 3: Let DEV Agent Work Independently
The feature brief contains:
- What files to create/modify
- Complete UI mockups
- Config system implementation
- Testing instructions
- User's working Ollama config

---

## 📊 Feature Summary

### User's Working Config (Don't Change These!)

```typescript
endpoint: 'http://localhost:11434'
chatModel: 'llama3.2'
embeddingModel: 'nomic-embed-text'
```

This should be the **default configuration** in the new config system.

---

### New Onboarding Flow (8 Steps, was 7)

1. Upload Resume
2. **Ollama Setup** (NEW)
3. Review & Edit Personal Info
4. Professional Links
5. Self-Identification
6. Work Authorization
7. Cover Letter
8. Success

---

### 4 UI States (Step 2 - Ollama Setup)

#### State 1: Loading (Checking...)
```
🔄 Checking for local AI installation...
```

#### State 2: Connected (Success)
```
✓ Ollama Connected
Version: v0.1.x
Endpoint: http://localhost:11434
Model: llama3.2

🔒 100% Private - All AI processing happens on your device.

[Advanced Configuration] (collapsed)
[Continue with AI Features] [Skip AI Features]
```

#### State 3: Not Installed (Setup Guide)
```
⚠️ Ollama Not Installed

Quick Setup (5 minutes):
1. Download Ollama → [Download Ollama] (https://ollama.com/download)
2. Install model: ollama pull llama3.2 [Copy]
3. Verify: ollama list [Copy]
4. [Test Connection Again]

[Having trouble? View troubleshooting guide]
[Skip AI Features (Use Basic Mode)]
```

#### State 4: Troubleshooting (Modal)
```
Ollama Troubleshooting Guide

🔍 Common Issues:
1. Ollama Not Running
2. Port Already in Use
3. Model Not Downloaded
4. Connection Refused (CORS)
5. Slow Performance
6. Remote Ollama Server

🧪 Test Commands
📚 Additional Resources
```

---

### Custom Endpoint (Advanced Config)

```
Advanced Configuration (collapsed by default)

Ollama Endpoint URL: [http://localhost:11434]
Chat Model: [llama3.2]
Embedding Model: [nomic-embed-text]

[Test Connection] [Reset to Default]
```

---

## ⏱️ Time Estimate

**Total**: 6-8 hours (up to 10 hours with polish)

**Breakdown**:
- Phase 1 (Config System): 2-3 hours
- Phase 2 (Onboarding UI): 3-4 hours
- Phase 3 (Settings Integration): 1-2 hours
- Phase 4 (Testing): 1-2 hours

---

## 🎯 Success Metrics

**Ollama Setup is complete when**:

1. **Detection**: Onboarding automatically checks for Ollama
2. **Guidance**: Clear setup instructions with link to https://ollama.com/download
3. **Troubleshooting**: Modal with 6 common issues and solutions
4. **Custom Config**: Advanced users can configure remote Ollama servers
5. **Retry**: "Test Connection Again" button works
6. **Skip**: Users can continue without AI features (basic mode)
7. **Storage**: All Ollama clients use stored config (not hardcoded)
8. **Settings**: Users can reconfigure Ollama in settings page

---

## ✅ Acceptance Criteria Quick Check

**Onboarding Step 2**:
- [ ] Checks for Ollama connection on load
- [ ] Shows "Connected" state with version/endpoint
- [ ] Shows "Not Installed" state with setup guide
- [ ] Link to https://ollama.com/download opens in new tab
- [ ] Copy buttons work for terminal commands
- [ ] "Test Connection Again" button retries

**Troubleshooting**:
- [ ] "Having trouble?" link opens modal
- [ ] Modal covers 6 common issues
- [ ] Test commands with copy buttons
- [ ] Links to official Ollama docs

**Custom Endpoint**:
- [ ] "Advanced Configuration" section (collapsed)
- [ ] Custom endpoint input works
- [ ] Custom model inputs work
- [ ] "Test Connection" validates config
- [ ] "Reset to Default" restores defaults
- [ ] Config saves to storage

**Skip AI Features**:
- [ ] "Skip AI Features" button continues without Ollama
- [ ] Extension works in basic mode (autofill only)
- [ ] Can re-enable AI in settings later

**Integration**:
- [ ] All Ollama clients load config from storage
- [ ] Popup shows connection status
- [ ] Settings page has Ollama configuration section

**Testing**:
- [ ] Build succeeds
- [ ] Test with Ollama installed and running
- [ ] Test without Ollama installed
- [ ] Test custom endpoint
- [ ] Test skip AI features
- [ ] No console errors

---

## 🔍 Quick Commands for Testing

```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Should return: {"version":"0.1.x"}

# List installed models
ollama list

# Should show: llama3.2

# Pull model (if not installed)
ollama pull llama3.2

# Start Ollama (if not running)
ollama serve

# View stored config (in browser console)
await browser.storage.local.get('ollamaConfig')

# Should show: { endpoint, chatModel, embeddingModel, enabled }
```

---

## 📚 Key Files

**Create**:
1. `src/shared/ollama-config.ts` (NEW, ~100-120 lines)

**Modify**:
2. `public/onboarding/onboarding.html` (~300-400 lines)
3. `src/onboarding/onboarding.ts` (~200-250 lines)
4. `src/shared/ollama-client.ts` (~30-50 lines)
5. `src/shared/ollama-service.ts` (~20-30 lines)
6. `public/settings/settings.html` (~50-60 lines)
7. `src/settings/settings.ts` (~40-50 lines)
8. `public/popup/popup.html` (~20-30 lines)
9. `src/popup/popup.ts` (~30-40 lines)

---

## 🚨 Important Notes

1. **Use user's working config as default** - Don't change these values:
   - `endpoint: 'http://localhost:11434'`
   - `chatModel: 'llama3.2'`
   - `embeddingModel: 'nomic-embed-text'`

2. **Start with Phase 1 (Config System)** - Foundation for everything

3. **Backwards compatibility** - Extension works without Ollama (basic mode)

4. **Privacy emphasis** - Highlight "100% local" in UI

5. **Test thoroughly** - With and without Ollama, custom endpoints, skip flow

---

## 🎯 Expected User Flow (After Implementation)

### Scenario A: Ollama Installed (Happy Path)

**Step 1**: Upload resume  
**Step 2**: Ollama Setup
- Auto-checks connection
- Shows "✓ Ollama Connected"
- Displays version: v0.1.32
- Endpoint: http://localhost:11434
- [Continue with AI Features] → Next step

**Result**: AI features enabled, resume parsing works

---

### Scenario B: Ollama Not Installed

**Step 1**: Upload resume  
**Step 2**: Ollama Setup
- Auto-checks connection
- Shows "⚠️ Ollama Not Installed"
- Displays 4-step setup guide
- User clicks [Download Ollama]
- Opens https://ollama.com/download in new tab
- User follows setup steps
- User clicks [Test Connection Again]
- Shows "✓ Ollama Connected"
- [Continue with AI Features] → Next step

**Result**: User successfully set up Ollama, AI features enabled

---

### Scenario C: User Skips Ollama

**Step 1**: Upload resume  
**Step 2**: Ollama Setup
- Auto-checks connection
- Shows "⚠️ Ollama Not Installed"
- User clicks [Skip AI Features (Use Basic Mode)]
- Skips to next step

**Result**: Extension works in basic mode (autofill only, no AI)

---

### Scenario D: Advanced User (Custom Endpoint)

**Step 1**: Upload resume  
**Step 2**: Ollama Setup
- Auto-checks connection
- Shows "✓ Ollama Connected" (local)
- User expands [Advanced Configuration]
- Changes endpoint to `http://192.168.1.100:11434`
- Clicks [Test Connection]
- Shows "✓ Connection Successful"
- [Continue with AI Features] → Next step

**Result**: Extension uses remote Ollama server

---

## 🔧 Troubleshooting Common Issues (For DEV Agent)

### Issue: Connection Check Takes Too Long

**Solution**: Add 5-second timeout to fetch request

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(`${endpoint}/api/version`, {
    signal: controller.signal
  });
  // ...
} finally {
  clearTimeout(timeout);
}
```

---

### Issue: CORS Error

**Cause**: Ollama < v0.1.29 doesn't allow browser extensions  
**Solution**: Show clear error message + solution in troubleshooting guide

---

### Issue: Model Not Found

**Detection**: Connection succeeds but model missing  
**Solution**: Show "Download model" instruction with `ollama pull llama3.2` command

---

**Ready to hand off!** The DEV agent has everything needed in `docs/FEATURE_OLLAMA_ONBOARDING.md`. 🚀
