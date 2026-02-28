#!/bin/bash

# Documentation Health Check Script
# Run this periodically to ensure docs are being maintained

echo "🔍 Checking Documentation Health..."
echo ""

CURSOR_DIR=".cursor"
WARNINGS=0

# Check if docs exist
echo "📁 Checking required files..."
REQUIRED_FILES=(
    "$CURSOR_DIR/known-issues.md"
    "$CURSOR_DIR/browserextension-bestpractices.mdc"
    "$CURSOR_DIR/architecture-decisions.md"
    "$CURSOR_DIR/CHANGELOG.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing!"
        ((WARNINGS++))
    fi
done
echo ""

# Check last modification dates
echo "📅 Last modified dates:"
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            MOD_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file")
        else
            # Linux
            MOD_DATE=$(stat -c "%y" "$file" | cut -d'.' -f1)
        fi
        echo "  📄 $file: $MOD_DATE"
        
        # Check if file is older than 30 days
        if [[ "$OSTYPE" == "darwin"* ]]; then
            DAYS_OLD=$(( ($(date +%s) - $(stat -f %m "$file")) / 86400 ))
        else
            DAYS_OLD=$(( ($(date +%s) - $(stat -c %Y "$file")) / 86400 ))
        fi
        
        if [ $DAYS_OLD -gt 30 ]; then
            echo "    ⚠️  Warning: Not updated in $DAYS_OLD days"
            ((WARNINGS++))
        fi
    fi
done
echo ""

# Check for TODO/FIXME in learning docs
echo "🚧 Checking for incomplete documentation..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        TODO_COUNT=$(grep -c "TODO\|FIXME\|\[To be filled\]" "$file" 2>/dev/null || echo "0")
        if [ "$TODO_COUNT" -gt 0 ]; then
            echo "  ⚠️  $file has $TODO_COUNT incomplete items"
            ((WARNINGS++))
        fi
    fi
done
echo ""

# Count documented issues
echo "📊 Documentation Stats:"
if [ -f "$CURSOR_DIR/known-issues.md" ]; then
    ISSUE_COUNT=$(grep -c "^## " "$CURSOR_DIR/known-issues.md" 2>/dev/null || echo "0")
    echo "  📝 Known issues documented: $ISSUE_COUNT"
fi

if [ -f "$CURSOR_DIR/architecture-decisions.md" ]; then
    ADR_COUNT=$(grep -c "^## ADR-" "$CURSOR_DIR/architecture-decisions.md" 2>/dev/null || echo "0")
    echo "  🏗️  Architecture decisions: $ADR_COUNT"
fi

if [ -f "$CURSOR_DIR/browserextension-bestpractices.mdc" ]; then
    PATTERN_COUNT=$(grep -c "^## \|^### " "$CURSOR_DIR/browserextension-bestpractices.mdc" 2>/dev/null || echo "0")
    echo "  ✅ Best practice patterns: $PATTERN_COUNT"
fi
echo ""

# Check recent git commits for doc updates
echo "🔄 Recent documentation updates (last 10 commits):"
DOC_COMMITS=$(git log --oneline -10 --all -- "$CURSOR_DIR/*.md" "$CURSOR_DIR/*.mdc" 2>/dev/null | wc -l)
if [ "$DOC_COMMITS" -gt 0 ]; then
    git log --oneline -10 --all -- "$CURSOR_DIR/*.md" "$CURSOR_DIR/*.mdc" 2>/dev/null | sed 's/^/  /'
    echo ""
else
    echo "  ⚠️  No documentation commits in recent history"
    ((WARNINGS++))
    echo ""
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $WARNINGS -eq 0 ]; then
    echo "✅ Documentation health: GOOD"
    echo "   All systems operational!"
else
    echo "⚠️  Documentation health: NEEDS ATTENTION"
    echo "   Found $WARNINGS warning(s)"
    echo ""
    echo "💡 Recommendations:"
    echo "   - Review and update outdated docs"
    echo "   - Fill in incomplete sections"
    echo "   - Document recent fixes/decisions"
    echo "   - Commit documentation updates"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $WARNINGS
