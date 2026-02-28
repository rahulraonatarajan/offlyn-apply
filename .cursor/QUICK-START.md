# 🚀 Quick Start: Daily Issues Dashboard

## Open Your Dashboard

**Method 1: Click the URL**
```
file:///Users/nishanthreddy/Documents/SideQuests/axesimplify/.cursor/dashboard.html
```

**Method 2: Command Line**
```bash
open .cursor/dashboard.html
```

**Method 3: Bookmark it!**
Add the file:// URL to your browser bookmarks for quick access.

## First Time Setup

1. **Open Demo Setup Page**
   ```
   file:///Users/nishanthreddy/Documents/SideQuests/axesimplify/.cursor/demo-issue.html
   ```
   
2. **Click "Add Demo Issues"** to see 4 sample issues

3. **Dashboard will open automatically** showing the demo data

## Daily Usage

### Adding Issues

**In Dashboard UI:**
1. Click "➕ Add Issue" button
2. Fill in:
   - Title (e.g., "React dropdown not working")
   - Status: In Progress / Resolved / Blocked
   - Severity: Low / Medium / High / Critical
   - Fix Applied (what you did to solve it)
   - Files Affected (comma-separated)
3. Click "Add Issue"

**Ask Cursor AI:**
```
"Add to dashboard: [issue title] - [status] - [severity] - [fix description]"
```

Example:
```
"Add to dashboard: React input bug - resolved - critical - 
Used native property descriptors in react-input.ts"
```

### Features

✨ **Real-time Updates**: Auto-refreshes every 5 seconds  
🔍 **Search**: Type in search box to filter issues  
📊 **Statistics**: See resolved/in-progress/blocked counts  
💾 **Export**: Download issues as JSON  
🎨 **Beautiful UI**: Modern, responsive design  

### Status Colors

- 🟢 **Resolved** - Fixed and verified
- 🟡 **In Progress** - Currently working on it
- 🔴 **Blocked** - Stuck, need help or dependency

### Severity Colors

- 🔴 **Critical** - System broken
- 🟠 **High** - Major feature broken
- 🟡 **Medium** - Feature degraded
- 🔵 **Low** - Minor issue

## Privacy

✅ **100% Local** - All data stored in browser localStorage  
✅ **Git Ignored** - Dashboard files NOT tracked in git  
✅ **No Server** - Runs entirely in your browser  
✅ **No Tracking** - No analytics or external requests  

## Integration with Learning System

```
During Development:
  Track issues in Dashboard (real-time, quick)
      ↓
End of Day:
  Document important ones in known-issues.md (permanent)
      ↓
Weekly:
  Patterns emerge → Add to best-practices.mdc
      ↓
Monthly:
  Architectural decisions → Record in ADRs
```

## Daily Workflow

**Morning:**
- Open dashboard (starts fresh each day)
- Pin browser tab for easy access

**During Development:**
- Encounter bug → Add to dashboard (status: in-progress)
- Working on it → Update status
- Fixed it → Change to resolved, add fix description

**End of Day:**
- Review resolved issues (celebrate wins! 🎉)
- Note blocked issues for tomorrow
- Export JSON if you want records
- Significant bugs → Document in known-issues.md

## Keyboard Shortcuts

- Just start typing in search box to filter
- Click away from modal to close it

## Tips

1. **Be Specific**: "React input values disappear" vs "Bug in form"
2. **Document Fixes**: Future you will thank present you
3. **Track Files**: Helps remember what changed
4. **Use Severity**: Helps prioritize work
5. **Update Status**: Keep it current for accurate stats

## Troubleshooting

**Dashboard blank?**
- Check if browser allows localStorage for file:// URLs
- Try the demo setup page first

**Issues not saving?**
- Check browser console (F12) for errors
- Make sure you're not in private/incognito mode

**Need to reset?**
- F12 → Application → Local Storage → Delete "axesimplify-daily-issues"

## Advanced

**View Archive:**
- F12 → Application → Local Storage
- Look for "axesimplify-daily-issues-archive"
- Last 30 days saved automatically

**Customize:**
- Edit `.cursor/dashboard.html`
- Change colors, refresh rate, columns, etc.
- See DASHBOARD-README.md for details

## Questions?

Ask Cursor AI:
- "How do I use the dashboard?"
- "Add this bug to dashboard"
- "Show me dashboard statistics"
- "Export dashboard to known-issues.md"

---

**Remember**: This is YOUR tool. Use it however helps YOUR workflow. No rules, just track what helps you learn and improve! 🚀
