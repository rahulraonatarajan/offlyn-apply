#!/usr/bin/env node

/**
 * Dashboard Bridge - Sync between Cursor AI work and Dashboard
 * 
 * This script monitors ai-current-work.json and syncs it to the dashboard
 * via localStorage injection.
 */

const fs = require('fs');
const path = require('path');

const CURSOR_DIR = __dirname;
const CURRENT_WORK_FILE = path.join(CURSOR_DIR, 'ai-current-work.json');
const ISSUES_QUEUE_FILE = path.join(CURSOR_DIR, 'ai-issues-queue.json');

function loadCurrentWork() {
    if (!fs.existsSync(CURRENT_WORK_FILE)) {
        return { timestamp: new Date().toISOString(), active: false, tasks: [] };
    }
    
    try {
        return JSON.parse(fs.readFileSync(CURRENT_WORK_FILE, 'utf-8'));
    } catch (error) {
        console.error('Error reading current work:', error);
        return { timestamp: new Date().toISOString(), active: false, tasks: [] };
    }
}

function loadIssuesQueue() {
    if (!fs.existsSync(ISSUES_QUEUE_FILE)) {
        return [];
    }
    
    try {
        const queue = JSON.parse(fs.readFileSync(ISSUES_QUEUE_FILE, 'utf-8'));
        return queue;
    } catch (error) {
        console.error('Error reading issues queue:', error);
        return [];
    }
}

function clearIssuesQueue() {
    fs.writeFileSync(ISSUES_QUEUE_FILE, JSON.stringify([], null, 2));
}

function generateSyncScript() {
    const currentWork = loadCurrentWork();
    const issuesQueue = loadIssuesQueue();
    
    console.log('\n📊 Dashboard Sync Status:');
    console.log(`   Active AI Work: ${currentWork.active ? 'Yes' : 'No'}`);
    console.log(`   Current Tasks: ${currentWork.tasks.length}`);
    console.log(`   Queued Issues: ${issuesQueue.length}`);
    console.log('\n');
    
    if (!currentWork.active && issuesQueue.length === 0) {
        console.log('✅ Nothing to sync - AI is idle');
        return;
    }
    
    // Generate localStorage injection script
    let script = `
<!-- Copy and paste this into browser console (F12) while dashboard.html is open -->
<script>
`;
    
    if (currentWork.active) {
        script += `
// Update current AI work
localStorage.setItem('axesimplify-current-work', JSON.stringify(${JSON.stringify(currentWork)}));
console.log('✅ Current AI work updated');
`;
    }
    
    if (issuesQueue.length > 0) {
        script += `
// Add queued issues
const STORAGE_KEY = 'axesimplify-daily-issues';
let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"date": "", "issues": []}');

const today = new Date().toDateString();
if (data.date !== today) {
    data = { date: today, issues: [], timestamp: new Date().toISOString() };
}

const newIssues = ${JSON.stringify(issuesQueue)};
newIssues.forEach(issue => {
    data.issues.unshift({
        id: Date.now() + Math.random(),
        ...issue
    });
});

localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
console.log('✅ Added ' + newIssues.length + ' issues to dashboard');

// Refresh the page
location.reload();
</script>
`;
    }
    
    script += `\n<\/script>\n`;
    
    const syncFile = path.join(CURSOR_DIR, 'dashboard-sync.html');
    const fullScript = `<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Sync</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            max-width: 800px;
            margin: 0 auto;
        }
        h1 { color: #2d3748; margin-bottom: 20px; }
        .info { background: #ebf8ff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #4299e1; }
        .code { background: #2d3748; color: #68d391; padding: 20px; border-radius: 10px; overflow-x: auto; font-family: monospace; font-size: 14px; }
        button { background: #667eea; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 16px; cursor: pointer; font-weight: 600; margin-top: 20px; }
        button:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 Dashboard Sync</h1>
        
        <div class="info">
            <strong>📊 Status:</strong><br>
            ${currentWork.active ? `✅ AI is working on ${currentWork.tasks.length} task(s)` : '⚪ AI is idle'}<br>
            ${issuesQueue.length > 0 ? `📝 ${issuesQueue.length} issue(s) ready to sync` : '✅ No queued issues'}
        </div>
        
        <h3>Instructions:</h3>
        <ol>
            <li>Open dashboard.html in your browser</li>
            <li>Press F12 to open developer console</li>
            <li>Copy the code below and paste into console</li>
            <li>Press Enter</li>
            <li>Dashboard will update automatically!</li>
        </ol>
        
        <h3>Code to copy:</h3>
        <div class="code" id="code">${script.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        
        <button onclick="copyCode()">📋 Copy to Clipboard</button>
        <button onclick="window.location.href='dashboard.html'" style="background: #48bb78;">📊 Open Dashboard</button>
    </div>
    
    <script>
        function copyCode() {
            const code = document.getElementById('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                alert('✅ Code copied! Now paste it in the dashboard console (F12)');
            });
        }
    </script>
</body>
</html>`;
    
    fs.writeFileSync(syncFile, fullScript);
    console.log(`\n✅ Sync file created: ${syncFile}`);
    console.log(`\n💡 Open this file and follow instructions to sync:\n   file://${syncFile}\n`);
    
    // Clear the queue after generating sync
    if (issuesQueue.length > 0) {
        clearIssuesQueue();
        console.log('✅ Issues queue cleared\n');
    }
}

// Main
console.log('🔄 Generating dashboard sync...\n');
generateSyncScript();
