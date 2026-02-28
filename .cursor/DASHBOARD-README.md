# 📊 Daily Issues Dashboard

A real-time, locally-accessible issue tracking dashboard for your browser extension development.

## 🚀 Quick Start

### Open the Dashboard

```bash
# Option 1: Open in default browser
open .cursor/dashboard.html

# Option 2: With specific browser
open -a "Google Chrome" .cursor/dashboard.html

# Option 3: Direct path
open file:///Users/nishanthreddy/Documents/SideQuests/axesimplify/.cursor/dashboard.html
```

The dashboard will be accessible at:
```
file:///Users/nishanthreddy/Documents/SideQuests/axesimplify/.cursor/dashboard.html
```

## ✨ Features

### Real-Time Updates
- ⏱️ Auto-refreshes every 5 seconds
- 💾 Data persists in browser localStorage
- 📅 Automatically starts fresh each day (archives previous day)

### Visual Status Tracking
- 🟢 **Resolved** - Issue fixed and verified
- 🟡 **In Progress** - Currently working on it  
- 🔴 **Blocked** - Waiting on dependency or stuck

### Severity Levels
- 🔴 **Critical** - System broken, immediate fix needed
- 🟠 **High** - Major feature broken, fix ASAP
- 🟡 **Medium** - Feature degraded, fix soon
- 🔵 **Low** - Minor issue, fix when convenient

### Dashboard Columns
| Column | Description |
|--------|-------------|
| **Time** | When the issue was logged |
| **Issue** | Title and description |
| **Status** | Current state (resolved/in-progress/blocked) |
| **Severity** | Impact level (critical/high/medium/low) |
| **Fix Applied** | Solution or workaround implemented |
| **Files Affected** | List of files modified |
| **Actions** | Delete button |

### Statistics Cards
- ✅ Total resolved issues
- 🔄 Issues in progress
- 🚫 Blocked issues
- 📊 Total issues today

## 📝 Adding Issues

### Method 1: Dashboard UI (Recommended)
1. Click **"➕ Add Issue"** button
2. Fill in the form:
   - Issue Title (required)
   - Description
   - Status (in-progress/resolved/blocked)
   - Severity (low/medium/high/critical)
   - Fix Applied
   - Files Affected
3. Click **"Add Issue"**

### Method 2: Ask Cursor AI
```
"Add to dashboard: React input bug - resolved - high severity - 
Fixed using native property descriptors in react-input.ts"
```

AI will parse and add it for you!

### Method 3: Quick Command Line (Future)
```bash
./.cursor/quick-add-issue.sh "Bug title" "resolved" "high"
```

## 🔍 Search & Filter

Use the search box to filter issues by:
- Issue title
- Description
- Fix applied
- Files affected

Example searches:
- `react` - Find all React-related issues
- `autofill` - Find autofill problems
- `content.ts` - Find issues in specific file

## 💾 Export & Backup

### Export to JSON
Click **"💾 Export JSON"** to download all today's issues as JSON file.

File format:
```json
{
  "date": "Tuesday, February 11, 2026",
  "exported": "2026-02-11T19:30:00.000Z",
  "issues": [
    {
      "id": 1707678000000,
      "timestamp": "2026-02-11T14:30:00.000Z",
      "title": "React input values not persisting",
      "status": "resolved",
      "severity": "critical",
      "fix": "Used native property descriptors",
      "files": "src/shared/react-input.ts"
    }
  ]
}
```

### Archive System
- Old issues automatically archived when new day starts
- Last 30 days kept in localStorage
- Can be exported before archiving

## 🔄 Sync with known-issues.md

### Import Historical Issues
```bash
# Run sync script (if Node.js available)
node .cursor/sync-issues.js

# Or ask Cursor AI
"Import issues from known-issues.md to dashboard"
```

This will:
1. Parse `known-issues.md`
2. Extract all documented issues
3. Create `daily-issues.json`
4. Can be imported into dashboard

## 🎨 Customization

### Change Colors
Edit the CSS in `dashboard.html`:

```css
/* Status colors */
.status-resolved { background: #c6f6d5; color: #22543d; }
.status-in-progress { background: #feebc8; color: #7c2d12; }
.status-blocked { background: #fed7d7; color: #742a2a; }

/* Severity colors */
.severity-critical { background: #fc8181; }
.severity-high { background: #f6ad55; }
```

### Change Refresh Rate
Edit JavaScript in `dashboard.html`:

```javascript
// Change from 5000ms (5 seconds) to your preference
setInterval(() => {
    loadIssues();
    renderIssues();
}, 5000); // ← Change this number
```

## 📱 Mobile Access

The dashboard is responsive! Access from your phone:
1. Start a local server in the `.cursor` directory:
   ```bash
   cd .cursor
   python3 -m http.server 8080
   ```
2. Access from phone: `http://[your-computer-ip]:8080/dashboard.html`

## 🔐 Privacy & Git

### Not Tracked in Git
Dashboard files are **excluded** from git via `.gitignore`:
- `dashboard.html` - The dashboard itself
- `daily-issues.json` - Exported issues
- `sync-issues.js` - Sync script

Your issue tracking data stays **local only**.

### Why Not Track?
- Contains work-in-progress notes
- Personal development workflow
- Constantly changing during development
- Not relevant to other team members

## 🛠️ Troubleshooting

### Dashboard not loading?
1. Make sure you're opening as `file://` URL
2. Check browser console for errors (F12)
3. Try clearing localStorage: F12 → Application → Local Storage → Clear

### Issues not persisting?
1. Check if browser allows localStorage for file:// URLs
2. Try opening with a local server instead
3. Check browser privacy settings

### Data lost when changing browsers?
- localStorage is browser-specific
- Export JSON before switching browsers
- Or use a local server and access same URL

### Auto-refresh not working?
- Check browser console for JavaScript errors
- Make sure tab is active (some browsers pause inactive tabs)
- Try refreshing manually with 🔄 button

## 📊 Daily Workflow

### Morning
1. Open dashboard in browser tab
2. Pin the tab for easy access
3. Dashboard shows 0 issues (fresh start)

### During Development
When you encounter an issue:
1. Click "Add Issue" or tell Cursor AI
2. Set status to "in-progress"
3. Continue working

When you fix it:
1. Click the issue row (future feature) or re-add with status "resolved"
2. Add the fix description
3. Note which files changed

### End of Day
1. Review resolved issues (green)
2. Note any blocked issues (red) for tomorrow
3. Export JSON for records
4. Close dashboard - tomorrow starts fresh!

## 🎯 Integration with Learning System

This dashboard complements the recursive learning system:

```
Dashboard          → Quick, real-time tracking
  ↓
known-issues.md    → Permanent documentation
  ↓
best-practices.mdc → Patterns that emerge
  ↓
ADRs               → Architectural decisions
```

**Workflow:**
1. Track issues in **dashboard** during development
2. Document significant ones in **known-issues.md** at day end
3. Patterns emerge → promote to **best-practices.mdc**
4. Major decisions → record in **ADRs**

## 🚀 Tips & Tricks

### Keyboard Shortcuts
- Type in search box and start typing to filter
- Press ESC in modal to close (future feature)

### Status Best Practices
- **In Progress**: You're actively working on it NOW
- **Resolved**: Fixed AND verified working
- **Blocked**: Can't proceed (waiting on something/someone)

### Severity Guidelines
- **Critical**: Can't ship without fixing
- **High**: Blocks major functionality
- **Medium**: Degrades experience
- **Low**: Nice to fix but not urgent

### Descriptive Fixes
Good: "Used native property descriptors + dispatched input events"
Bad: "Fixed it"

Good: "Added waitForStability() before autofill"
Bad: "Added delay"

## 📈 Future Enhancements

Potential features:
- [ ] Click to edit issues
- [ ] Drag to reorder
- [ ] Time tracking per issue
- [ ] Tags/categories
- [ ] Multi-day view
- [ ] Charts and trends
- [ ] Import from git commits
- [ ] Export to Markdown
- [ ] Team sync (if needed)

## 🤝 Ask Cursor AI

You can ask me to:
- "Add this bug to the dashboard"
- "Mark issue as resolved in dashboard"
- "Export dashboard issues to known-issues.md"
- "Show me dashboard statistics"
- "Sync recent fixes to dashboard"

I understand the dashboard format and can help maintain it!

---

**Remember**: This is YOUR development companion. Use it however works best for your workflow. No rules, just track what helps you learn and improve!
