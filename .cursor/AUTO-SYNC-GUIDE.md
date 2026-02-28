# 🤖 Dashboard Auto-Sync Guide

## How It Works

When Cursor AI works on your project, it **automatically** updates these files:

### 1. Current AI Work (`.cursor/ai-current-work.json`)
Shows what AI is actively working on RIGHT NOW:
```json
{
  "timestamp": "2024-02-11T13:10:00.000Z",
  "active": true,
  "tasks": [
    {
      "title": "Implementing dashboard auto-update",
      "description": "What AI is doing",
      "status": "in-progress",
      "files": "dashboard.html, dashboard-bridge.js"
    }
  ]
}
```

### 2. Issues Queue (`.cursor/ai-issues-queue.json`)
Queued issues ready to add to dashboard:
```json
[
  {
    "title": "Bug fixed",
    "status": "resolved",
    "severity": "high",
    "fix": "Solution applied"
  }
]
```

## Syncing to Dashboard

### Automatic Sync (2 Steps)

**Step 1: AI Updates JSON Files**
When AI starts/finishes work, it automatically writes to:
- `ai-current-work.json` - Current initiatives
- `ai-issues-queue.json` - Completed/new issues

**Step 2: You Run Sync**
```bash
# Generate sync page
node .cursor/dashboard-bridge.js

# This opens a page with sync instructions
```

Then:
1. Open the generated `dashboard-sync.html`
2. Click "Copy to Clipboard"
3. Open dashboard in browser (F12 console)
4. Paste and press Enter
5. Dashboard updates instantly! ✨

### What You'll See

After syncing, the dashboard shows:

#### 🤖 Current AI Initiatives Section
```
┌─────────────────────────────────────────┐
│ 🤖 Current AI Initiatives               │
├─────────────────────────────────────────┤
│ 🔄 Implementing Dashboard Auto-Update   │
│    Creating bridge between AI work...   │
│    Started: 12:50 PM                    │
│    📄 dashboard.html, bridge.js         │
└─────────────────────────────────────────┘
```

This section:
- Shows what AI is working on NOW
- Updates in real-time (every 5 seconds)
- Auto-hides after 10 minutes of inactivity
- Pulses to show it's live

#### 📊 Issues Table
All your tracked issues with the new ones AI added:
- ✅ Resolved issues (green)
- 🔄 In progress (yellow)
- 🚫 Blocked (red)

## When Dashboard Updates Automatically

The cursor rules now **mandate** that AI updates the dashboard when:

1. **Starting work** on any task
   - AI writes to `ai-current-work.json`
   - Shows in "Current AI Initiatives"

2. **Encountering errors**
   - AI adds to `ai-issues-queue.json`
   - Status: "in-progress" or "blocked"

3. **Fixing bugs**
   - AI updates queue with fix description
   - Status: "resolved"

4. **Completing tasks**
   - AI marks resolved
   - Clears from current work

5. **Getting blocked**
   - AI adds with reason
   - Status: "blocked"

## Real-Time Workflow

```
┌──────────────────────────┐
│ You: "Fix React bug"     │
└──────────┬───────────────┘
           ↓
┌──────────────────────────────────────────┐
│ AI: Automatically updates                │
│   • ai-current-work.json (task started)  │
│   • Tells you: "Dashboard updated"       │
└──────────┬───────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│ You: Run sync command            │
│   node .cursor/dashboard-bridge  │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ You: Copy code to dashboard      │
│   (F12 → paste → Enter)          │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ Dashboard: Shows AI is working!  │
│   🤖 Current AI Initiatives      │
│   🔄 Fixing React input bug      │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ AI: Finishes fix                 │
│   • Updates ai-issues-queue.json │
│   • Marks task as resolved       │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ You: Run sync again              │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ Dashboard: Issue appears!        │
│   ✅ React input bug - RESOLVED  │
│   Fix: Used native property...  │
└──────────────────────────────────┘
```

## Quick Commands

```bash
# Check what AI is working on
cat .cursor/ai-current-work.json

# Check queued issues
cat .cursor/ai-issues-queue.json

# Generate sync page
node .cursor/dashboard-bridge.js

# Open dashboard
open .cursor/dashboard.html

# Open sync page (after generating)
open .cursor/dashboard-sync.html
```

## Frequency

**How often to sync?**
- After AI completes a major task
- When you want to see current AI work
- End of coding session to log all work
- Anytime you see "Dashboard updated" message

**Auto-refresh:**
- Dashboard auto-refreshes every 5 seconds
- Current work auto-hides after 10 minutes
- No need to manually refresh after syncing

## Tips

1. **Keep dashboard open**
   - Pin the browser tab
   - See updates in real-time

2. **Sync after AI work**
   - When AI says "Dashboard updated"
   - Run the sync command immediately

3. **Use Current Initiatives**
   - See what AI is doing RIGHT NOW
   - Know if AI is stuck or progressing
   - Track time spent on tasks

4. **Review end of day**
   - See all AI-assisted fixes
   - Export to JSON for records
   - Document important ones in known-issues.md

## Troubleshooting

### "Nothing to sync"
- AI hasn't worked on anything yet
- Or you already synced (queue cleared)
- Check the JSON files manually

### Current work not showing
- Check if more than 10 minutes old (auto-hides)
- Check `ai-current-work.json` has `"active": true`
- Refresh dashboard after syncing

### Sync code not working
- Make sure you're in dashboard.html (not sync page)
- Open browser console (F12)
- Paste the ENTIRE code block
- Check for any error messages

## Privacy

✅ All dashboard sync files are **git-ignored**  
✅ Your AI work tracking stays **local only**  
✅ No external services or tracking  
✅ Complete privacy

## Future Enhancements

Potential improvements:
- [ ] Watch mode (auto-sync without manual command)
- [ ] Browser extension for one-click sync
- [ ] Native app integration
- [ ] Team sync (if needed later)
- [ ] Voice notifications when AI completes work

---

**Remember**: The system is now **self-documenting**. AI automatically tracks its own work, and you just need to sync it to the dashboard to visualize everything!
