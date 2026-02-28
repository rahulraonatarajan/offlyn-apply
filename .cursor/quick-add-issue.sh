#!/bin/bash

# Quick Add Issue Script
# Usage: ./quick-add-issue.sh "Issue title" "status" "severity"

ISSUE_TITLE="${1:-Unnamed Issue}"
STATUS="${2:-in-progress}"
SEVERITY="${3:-medium}"

# Create a JSON payload
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
CURRENT_TIME=$(date +"%I:%M %p")

echo "📝 Adding issue to dashboard..."
echo ""
echo "  Title: $ISSUE_TITLE"
echo "  Status: $STATUS"
echo "  Severity: $SEVERITY"
echo "  Time: $CURRENT_TIME"
echo ""

# Create HTML file with JavaScript to add issue
cat > /tmp/add-issue-temp.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Add Issue</title></head>
<body>
<script>
const issue = {
    id: Date.now(),
    timestamp: "TIMESTAMP_PLACEHOLDER",
    title: "TITLE_PLACEHOLDER",
    description: "",
    status: "STATUS_PLACEHOLDER",
    severity: "SEVERITY_PLACEHOLDER",
    fix: "",
    files: ""
};

const STORAGE_KEY = 'axesimplify-daily-issues';
let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"date": "", "issues": []}');

const today = new Date().toDateString();
if (data.date !== today) {
    data = {
        date: today,
        issues: [],
        timestamp: new Date().toISOString()
    };
}

data.issues.unshift(issue);
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

document.body.innerHTML = '<h2 style="font-family: sans-serif; color: green;">✅ Issue added successfully!</h2><p>Close this window and refresh the dashboard.</p>';
</script>
</body>
</html>
EOF

# Replace placeholders
sed -i.bak "s|TIMESTAMP_PLACEHOLDER|$TIMESTAMP|g" /tmp/add-issue-temp.html
sed -i.bak "s|TITLE_PLACEHOLDER|$ISSUE_TITLE|g" /tmp/add-issue-temp.html
sed -i.bak "s|STATUS_PLACEHOLDER|$STATUS|g" /tmp/add-issue-temp.html
sed -i.bak "s|SEVERITY_PLACEHOLDER|$SEVERITY|g" /tmp/add-issue-temp.html

echo "✅ Issue added! Open dashboard.html to see it."
echo ""
echo "💡 TIP: You can also add issues directly in the dashboard UI"

rm /tmp/add-issue-temp.html.bak
