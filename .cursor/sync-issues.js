#!/usr/bin/env node

/**
 * Sync Issues from known-issues.md to Dashboard
 * 
 * This script parses known-issues.md and extracts today's issues
 * to populate the dashboard with actual development work.
 */

const fs = require('fs');
const path = require('path');

const CURSOR_DIR = path.join(__dirname);
const KNOWN_ISSUES_FILE = path.join(CURSOR_DIR, 'known-issues.md');
const OUTPUT_FILE = path.join(CURSOR_DIR, 'daily-issues.json');

function parseKnownIssues() {
    if (!fs.existsSync(KNOWN_ISSUES_FILE)) {
        console.log('❌ known-issues.md not found');
        return [];
    }

    const content = fs.readFileSync(KNOWN_ISSUES_FILE, 'utf-8');
    const issues = [];
    
    // Regex to match issue blocks
    const issuePattern = /## (.+?) - (\d{4}-\d{2}-\d{2}|\d{4})\n\*\*Severity\*\*: (.+?)\n\*\*Context\*\*: (.+?)\n\*\*Symptoms\*\*:\s*\n([\s\S]*?)\n\*\*Root Cause\*\*:\s*\n([\s\S]*?)\n\*\*Solution\*\*:\s*\n([\s\S]*?)\n\*\*Prevention\*\*:\s*\n([\s\S]*?)\n\*\*Related Files\*\*:\s*\n([\s\S]*?)(?=\n---|\n##|$)/g;
    
    let match;
    while ((match = issuePattern.exec(content)) !== null) {
        const [_, title, date, severity, context, symptoms, rootCause, solution, prevention, relatedFiles] = match;
        
        // Determine status based on solution content
        let status = 'resolved';
        if (solution.toLowerCase().includes('to be filled') || solution.trim() === '[To be filled]') {
            status = 'in-progress';
        }
        
        issues.push({
            id: Date.now() + Math.random(),
            timestamp: date.match(/\d{4}-\d{2}-\d{2}/) ? new Date(date).toISOString() : new Date().toISOString(),
            title: title.trim(),
            description: context.trim(),
            status: status,
            severity: severity.toLowerCase().trim(),
            fix: solution.trim().replace(/\n/g, ' ').replace(/\s+/g, ' '),
            files: relatedFiles.split('\n').filter(f => f.trim().startsWith('-')).map(f => f.replace('-', '').trim()).join(', '),
            symptoms: symptoms.trim(),
            rootCause: rootCause.trim(),
            prevention: prevention.trim()
        });
    }
    
    return issues;
}

function syncToLocalStorage(issues) {
    // Create a JSON file that can be imported into the dashboard
    const data = {
        date: new Date().toDateString(),
        issues: issues,
        timestamp: new Date().toISOString(),
        source: 'known-issues.md'
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    
    console.log(`✅ Synced ${issues.length} issues to ${OUTPUT_FILE}`);
    console.log('\n📊 Summary:');
    console.log(`   - Resolved: ${issues.filter(i => i.status === 'resolved').length}`);
    console.log(`   - In Progress: ${issues.filter(i => i.status === 'in-progress').length}`);
    console.log(`   - Blocked: ${issues.filter(i => i.status === 'blocked').length}`);
    console.log('\n💡 Open dashboard.html and click "Import from known-issues.md" to load these issues');
}

function main() {
    console.log('🔄 Syncing issues from known-issues.md...\n');
    
    const issues = parseKnownIssues();
    
    if (issues.length === 0) {
        console.log('⚠️  No issues found in known-issues.md');
        return;
    }
    
    syncToLocalStorage(issues);
}

main();
