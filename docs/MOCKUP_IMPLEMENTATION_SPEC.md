# Offlyn Apply - Mockup Implementation Specification

## Overview
This document provides exact specifications to match the provided UI mockups for:
1. Browser Popup
2. Dashboard (Kanban)
3. Onboarding

**Goal**: Pixel-perfect implementation matching the mockup designs.

---

## 🎨 MOCKUP 1: Browser Popup

### Design Analysis

**Dimensions**: ~584px width (mockup shows wider than current 300px)  
**Background**: Dark navy/slate (#2D3748 or similar)  
**Layout**: Clean, spacious, modern card-based design

---

### Header Section

**Specs**:
- Background: Dark navy (#2D3748)
- Height: ~64px
- Padding: 16px horizontal
- Layout: Flex (space-between)

**Left Side**:
- Logo icon: 32x32px, white "OA" monogram in green circle
- Title: "Offlyn Apply" - White, 16px, semibold
- Vertical alignment: center

**Right Side**:
- Toggle switch (enable/disable)
- Switch dimensions: 48x24px
- Switch color (on): Green (#27E38D)
- Switch color (off): Gray (#64748B)

**CSS**:
```css
.header {
  background: #2D3748;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  width: 32px;
  height: 32px;
  background: #27E38D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.toggle-switch {
  width: 48px;
  height: 24px;
  background: #64748B;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-switch.active {
  background: #27E38D;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-switch.active::after {
  transform: translateX(24px);
}
```

---

### Job Detection Card

**Specs**:
- Background: Lighter navy/slate (#3A4556)
- Border-radius: 12px
- Padding: 16px
- Margin: 16px (from header and buttons)
- Green status dot (8px diameter)

**Content**:
- Status label: "Job Page Detected" - White, 16px, medium weight
- Job details: "Senior Frontend Developer • TechCorp" - Gray (#94A3B8), 14px

**CSS**:
```css
.job-detection-card {
  background: #3A4556;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #27E38D;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.job-info h3 {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.job-info p {
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
}
```

---

### Primary Action Button (Auto-Fill)

**Specs**:
- Background: Green (#27E38D)
- Color: Dark navy (#0F172A)
- Width: Full width minus 32px margin (16px each side)
- Height: 48px
- Border-radius: 12px
- Font: 16px, semibold
- Icon: Sparkle/magic wand icon (left)
- Hover: Slightly lighter green (#2EF39B)
- Shadow: 0 4px 12px rgba(39, 227, 141, 0.3)

**CSS**:
```css
.btn-primary-auto-fill {
  background: #27E38D;
  color: #0F172A;
  width: calc(100% - 32px);
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(39, 227, 141, 0.3);
}

.btn-primary-auto-fill:hover {
  background: #2EF39B;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(39, 227, 141, 0.4);
}

.btn-primary-auto-fill:active {
  transform: translateY(0);
}

.btn-primary-auto-fill svg {
  width: 20px;
  height: 20px;
}
```

---

### Secondary Action Button (Generate Cover Letter)

**Specs**:
- Background: Transparent
- Border: 2px solid #475569
- Color: White
- Width: Full width minus 32px margin
- Height: 48px
- Border-radius: 12px
- Font: 15px, medium weight
- Icon: Document icon (left)
- Hover: Border color becomes lighter (#64748B)
- Margin-top: 12px

**CSS**:
```css
.btn-secondary {
  background: transparent;
  border: 2px solid #475569;
  color: white;
  width: calc(100% - 32px);
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  margin: 12px 16px 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: #64748B;
  background: rgba(255, 255, 255, 0.05);
}

.btn-secondary svg {
  width: 20px;
  height: 20px;
}
```

---

### Navigation Links Section

**Specs**:
- Margin-top: 24px
- Padding: 0 16px
- Gap: 16px between items

**Link Style**:
- Color: #CBD5E1
- Font: 14px, medium weight
- Icon: Left-aligned, 18px
- Hover: Color becomes white
- No background, no border

**Items**:
1. Manage Profile (person icon)
2. View Dashboard (grid icon)

**CSS**:
```css
.nav-links {
  margin-top: 24px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #CBD5E1;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  background: none;
  border: none;
  text-align: left;
}

.nav-link:hover {
  color: white;
}

.nav-link svg {
  width: 18px;
  height: 18px;
}
```

---

### Stats Section

**Specs**:
- Background: Transparent
- Border-top: 1px solid #475569
- Padding: 16px
- Margin-top: 24px
- Display: Grid (2 columns)

**Stat Item**:
- Label: "Total Applications" / "Interviewing"
- Label color: #94A3B8, 12px
- Value: Large number (24, 5)
- Value color: White (total), Green (interviewing)
- Value font: 32px, bold

**CSS**:
```css
.stats-section {
  border-top: 1px solid #475569;
  padding: 16px;
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #94A3B8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.stat-value.interviewing {
  color: #27E38D;
}
```

---

### Advanced Section (Collapsible)

**Specs**:
- Background: Transparent
- Border-top: 1px solid #475569
- Padding: 16px
- Collapsed by default

**Header**:
- "Advanced" label - White, 14px, medium
- Chevron icon (down/up)

**Expanded Content**:
- Ollama status indicator
- "Connected" text in green
- WiFi icon

**CSS**:
```css
.advanced-section {
  border-top: 1px solid #475569;
  padding: 16px;
}

.advanced-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.advanced-content {
  margin-top: 16px;
  display: none;
}

.advanced-content.expanded {
  display: block;
}

.ollama-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  color: #CBD5E1;
  font-size: 14px;
}

.ollama-status .status-text {
  color: #27E38D;
  font-weight: 500;
}
```

---

### Footer Link

**Specs**:
- Background: Semi-transparent yellow (#FEF3C7 with opacity)
- Text: "← Back to all mockups" (brown/amber color)
- Padding: 12px
- Text-align: center
- Border-radius: 0 (full width)

---

## 🎨 MOCKUP 2: Dashboard (Kanban)

### Design Analysis

**Layout**: Full-page application dashboard  
**Background**: Light gray (#F7F9FC)  
**Max-width**: ~1600px container

---

### Header Section

**Specs**:
- Background: White
- Padding: 24px 32px
- Border-radius: 12px
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
- Margin-bottom: 24px

**Left Side**:
- Logo: 32x32px, green circle with "OA" monogram
- Title: "Application Dashboard" - #1A202C, 24px, bold
- Subtitle: Optional (not shown in mockup)

**Right Side**:
- "Back to Mockups" link with arrow icon

**CSS**:
```css
.dashboard-header {
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dashboard-logo {
  width: 32px;
  height: 32px;
  background: #27E38D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 14px;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #1A202C;
  margin: 0;
}
```

---

### Stats Cards Row

**Specs**:
- Display: Grid (6 columns)
- Gap: 16px
- Margin-bottom: 24px

**Card Specs**:
- Background: White
- Border-radius: 12px
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
- Padding: 20px
- Text-align: center

**Card Structure**:
1. **Total Applications** - Number in black (#1A202C)
2. **Submitted** - Number in blue (#3B82F6)
3. **Interviewing** - Number in green (#27E38D)
4. **Rejected** - Number in red (#EF4444)
5. **Accepted** - Number in purple (#8B5CF6)
6. **Response Rate** - Percentage in black

**CSS**:
```css
.stats-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  text-align: center;
}

.stat-card .number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-card .number.total { color: #1A202C; }
.stat-card .number.submitted { color: #3B82F6; }
.stat-card .number.interviewing { color: #27E38D; }
.stat-card .number.rejected { color: #EF4444; }
.stat-card .number.accepted { color: #8B5CF6; }
.stat-card .number.rate { color: #1A202C; }

.stat-card .label {
  font-size: 13px;
  color: #64748B;
  text-transform: capitalize;
}
```

---

### Charts Section

**Specs**:
- Display: Grid (2 columns)
- Gap: 24px
- Margin-bottom: 24px

**Chart Container**:
- Background: White
- Border-radius: 12px
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
- Padding: 24px

**Left Chart**: "Applications Over Time" (Line chart)
**Right Chart**: "Status Breakdown" (Doughnut chart)

**CSS**:
```css
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.chart-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1A202C;
  margin-bottom: 16px;
}

.chart-container {
  height: 280px;
}
```

---

### Search & Filter Bar

**Specs**:
- Background: White
- Border-radius: 12px
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
- Padding: 16px 24px
- Margin-bottom: 16px
- Display: Flex (space-between)

**Search Input**:
- Background: #F7F9FC
- Border: 1px solid #E5E7EB
- Border-radius: 8px
- Padding: 10px 16px
- Width: 400px
- Placeholder: "Search by company, position, or notes..."
- Icon: Search icon (left)

**Filter Controls**:
- "All Status" dropdown with filter icon
- "Export CSV" button (green)

**CSS**:
```css
.search-filter-bar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-input-wrapper {
  position: relative;
  width: 400px;
}

.search-input {
  width: 100%;
  background: #F7F9FC;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 10px 16px 10px 40px;
  font-size: 14px;
  color: #1A202C;
}

.search-input::placeholder {
  color: #94A3B8;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #64748B;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-dropdown {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: #1A202C;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-btn {
  background: #27E38D;
  color: #0F172A;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-btn:hover {
  background: #2EF39B;
}
```

---

### Kanban Board

**Specs**:
- Display: Grid (5 columns)
- Gap: 16px
- Padding: 0

**Column Structure**:
- Background: White
- Border-radius: 12px
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
- Min-height: 400px

**Column Header**:
- Padding: 16px
- Border-bottom: 1px solid #E5E7EB
- Font: 14px, semibold
- Badge: Shows count (e.g., "3")

**Column Colors**:
1. **Submitted**: Blue (#3B82F6)
2. **Interviewing**: Green (#27E38D)
3. **Rejected**: Red (#EF4444)
4. **Accepted**: Purple (#8B5CF6)
5. **Withdrawn**: Gray (#64748B)

**CSS**:
```css
.kanban-board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.kanban-column {
  background: #F7F9FC;
  border-radius: 12px;
  min-height: 400px;
}

.column-header {
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: #1A202C;
}

.column-badge {
  background: #E5E7EB;
  color: #64748B;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.column-header.submitted .column-badge { background: #DBEAFE; color: #3B82F6; }
.column-header.interviewing .column-badge { background: #E6FAF3; color: #27E38D; }
.column-header.rejected .column-badge { background: #FEE2E2; color: #EF4444; }
.column-header.accepted .column-badge { background: #EDE9FE; color: #8B5CF6; }
.column-header.withdrawn .column-badge { background: #F1F5F9; color: #64748B; }

.column-cards {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

---

### Application Card

**Specs**:
- Background: White
- Border-radius: 8px
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Padding: 16px
- Cursor: pointer (click to open URL)
- Hover: Shadow becomes stronger

**Card Structure**:
- Checkbox (top-left)
- Company name: 14px, bold, #1A202C
- Position title: 13px, regular, #64748B
- Date: 12px, #94A3B8
- ATS badge: Small pill badge (e.g., "Lever", "Greenhouse")
- Edit button (pencil icon)
- Delete button (trash icon)

**CSS**:
```css
.application-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.application-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.application-card.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.card-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 18px;
  height: 18px;
  border: 2px solid #CBD5E1;
  border-radius: 4px;
  cursor: pointer;
}

.card-content {
  margin-left: 28px;
}

.card-company {
  font-size: 14px;
  font-weight: 600;
  color: #1A202C;
  margin-bottom: 4px;
}

.card-position {
  font-size: 13px;
  color: #64748B;
  margin-bottom: 8px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-date {
  font-size: 12px;
  color: #94A3B8;
}

.card-ats-badge {
  background: #F1F5F9;
  color: #64748B;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.card-btn {
  flex: 1;
  background: transparent;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  padding: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
}

.card-btn:hover {
  background: #F7F9FC;
  border-color: #CBD5E1;
}

.card-btn svg {
  width: 14px;
  height: 14px;
}
```

---

### Empty Column State

**Specs**:
- Text: "No applications"
- Color: #94A3B8
- Font: 13px, italic
- Text-align: center
- Padding: 32px

---

## 🎨 MOCKUP 3: Onboarding

### Design Analysis

**Layout**: Full-page wizard  
**Background**: Navy (#0F172A) full-screen  
**Container**: White card, max-width 600px, centered

---

### Header Section

**Specs**:
- Background: Navy (#0F172A)
- Padding: 32px
- Text-align: center
- Border-radius: 12px 12px 0 0

**Logo Container**:
- Background: White
- Padding: 16px 24px
- Border-radius: 12px
- Display: inline-block
- Margin-bottom: 16px
- Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

**Logo**:
- Height: 48px
- Full color logo (horizontal)

**Title**: "Setup Your Profile"
- Color: White
- Font: 24px, bold
- Margin-bottom: 8px

**Subtitle**: "Step 1 of 6"
- Color: White (80% opacity)
- Font: 14px

**Exit Button**:
- Position: Top-right
- Text: "Exit"
- Color: White
- Font: 14px
- Background: Transparent
- Hover: background rgba(255,255,255,0.1)

**CSS**:
```css
.onboarding-container {
  background: #0F172A;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.onboarding-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  overflow: hidden;
}

.onboarding-header {
  background: #0F172A;
  padding: 32px;
  text-align: center;
  position: relative;
}

.logo-container {
  display: inline-block;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.onboarding-logo {
  height: 48px;
  object-fit: contain;
}

.onboarding-header h1 {
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.onboarding-header .subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.exit-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.2s;
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

---

### Progress Indicator

**Specs**:
- Display: Flex (horizontal)
- Gap: 16px
- Padding: 32px
- Justify: center
- Background: White

**Step Icon**:
- Circle with icon (document, person, link, briefcase, email, checkmark)
- Size: 48px diameter
- Active: Green (#27E38D) background, white icon
- Inactive: Light gray (#E5E7EB) background, gray icon
- Completed: Green with checkmark

**Step Label**:
- Font: 12px
- Color: #64748B (inactive), #27E38D (active)
- Text-align: center
- Margin-top: 8px

**CSS**:
```css
.progress-indicator {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 32px;
  background: white;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.step-icon.active {
  background: #27E38D;
}

.step-icon.completed {
  background: #27E38D;
}

.step-icon svg {
  width: 24px;
  height: 24px;
  color: #94A3B8;
}

.step-icon.active svg,
.step-icon.completed svg {
  color: white;
}

.step-label {
  font-size: 12px;
  color: #64748B;
}

.step-label.active {
  color: #27E38D;
  font-weight: 500;
}
```

---

### Content Area (Resume Upload Step)

**Specs**:
- Padding: 40px
- Background: White

**Title**: "Upload Your Resume"
- Font: 24px, bold
- Color: #1A202C
- Text-align: center
- Margin-bottom: 8px

**Subtitle**: "We'll auto-extract your information to save time (optional)"
- Font: 14px
- Color: #64748B
- Text-align: center
- Margin-bottom: 32px

**Upload Area**:
- Border: 2px dashed #CBD5E1
- Border-radius: 12px
- Padding: 64px 32px
- Background: #F7F9FC (on hover)
- Text-align: center

**Upload Icon**:
- Upload cloud icon
- Color: #CBD5E1
- Size: 48px
- Margin-bottom: 16px

**Upload Text**: "Drag and drop your resume here"
- Font: 16px
- Color: #1A202C
- Margin-bottom: 8px

**Or Text**: "or click to browse"
- Font: 14px
- Color: #64748B
- Margin-bottom: 16px

**Select File Button**:
- Background: #27E38D
- Color: white
- Border: none
- Padding: 12px 24px
- Border-radius: 8px
- Font: 14px, semibold
- Cursor: pointer

**Support Text**: "Supports PDF, DOCX, TXT (max 5MB)"
- Font: 12px
- Color: #94A3B8
- Margin-top: 16px

**CSS**:
```css
.onboarding-content {
  padding: 40px;
  background: white;
}

.content-title {
  font-size: 24px;
  font-weight: bold;
  color: #1A202C;
  text-align: center;
  margin-bottom: 8px;
}

.content-subtitle {
  font-size: 14px;
  color: #64748B;
  text-align: center;
  margin-bottom: 32px;
}

.upload-area {
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover,
.upload-area.dragging {
  background: #F7F9FC;
  border-color: #27E38D;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #CBD5E1;
  margin: 0 auto 16px;
}

.upload-text {
  font-size: 16px;
  color: #1A202C;
  margin-bottom: 8px;
}

.upload-or {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 16px;
}

.select-file-btn {
  background: #27E38D;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.select-file-btn:hover {
  background: #2EF39B;
}

.upload-support-text {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 16px;
}

.skip-link {
  display: block;
  text-align: center;
  margin-top: 24px;
  color: #64748B;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.skip-link:hover {
  color: #1A202C;
  text-decoration: underline;
}
```

---

### Footer / Navigation

**Specs**:
- Background: White
- Padding: 24px 40px
- Border-top: 1px solid #E5E7EB
- Display: Flex (space-between)

**Back Button**:
- Background: Transparent
- Border: 1px solid #E5E7EB
- Color: #64748B
- Padding: 12px 24px
- Border-radius: 8px
- Font: 14px, medium
- Icon: Left arrow

**Next Button**:
- Background: #27E38D
- Color: #0F172A
- Border: none
- Padding: 12px 32px
- Border-radius: 8px
- Font: 14px, semibold
- Icon: Right arrow

**Privacy Note**:
- Text: "🔒 All your data is stored locally on your device and never uploaded to any server"
- Font: 12px
- Color: #94A3B8
- Text-align: center
- Position: Below navigation buttons
- Icon: Lock emoji or icon

**CSS**:
```css
.onboarding-footer {
  background: white;
  padding: 24px 40px;
  border-top: 1px solid #E5E7EB;
}

.footer-nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.back-btn {
  background: transparent;
  border: 1px solid #E5E7EB;
  color: #64748B;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #F7F9FC;
  border-color: #CBD5E1;
}

.next-btn {
  background: #27E38D;
  color: #0F172A;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.next-btn:hover {
  background: #2EF39B;
}

.privacy-note {
  text-align: center;
  font-size: 12px;
  color: #94A3B8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.privacy-note svg {
  width: 14px;
  height: 14px;
}
```

---

## 🎯 Implementation Priority

### Phase 1: Popup (High Impact)
1. Update dimensions (300px → 584px)
2. Redesign header with new toggle
3. Implement job detection card
4. Restyle primary/secondary buttons
5. Update navigation links
6. Redesign stats section
7. Update advanced section

### Phase 2: Dashboard (Medium Impact)
1. Update stats cards layout
2. Implement new search/filter bar
3. Refine Kanban column styling
4. Update application card design
5. Add empty states
6. Polish hover/drag states

### Phase 3: Onboarding (Medium Impact)
1. Update header with logo container
2. Implement progress indicator
3. Redesign upload area
4. Update footer navigation
5. Add privacy note

---

## 📐 Key Design Tokens from Mockups

### Colors
- **Navy Dark**: #0F172A (backgrounds, text)
- **Navy Medium**: #2D3748 (popup header)
- **Navy Light**: #3A4556 (cards)
- **Green**: #27E38D (primary actions, accents)
- **Blue**: #3B82F6 (submitted status)
- **Red**: #EF4444 (rejected status)
- **Purple**: #8B5CF6 (accepted status)
- **Gray**: #64748B (secondary text, borders)

### Spacing
- Container padding: 16px, 24px, 32px
- Card padding: 16px, 20px, 24px
- Gaps: 8px, 12px, 16px, 24px
- Button height: 48px (large), 40px (medium)

### Border Radius
- Cards: 12px
- Buttons: 8px-12px
- Inputs: 8px
- Badges: 4px-12px

### Shadows
- Card: 0 2px 8px rgba(0, 0, 0, 0.08)
- Card hover: 0 4px 12px rgba(0, 0, 0, 0.15)
- Button: 0 4px 12px rgba(39, 227, 141, 0.3)

---

## ✅ Mockup Compliance Checklist

### Popup
- [ ] Width increased to ~584px
- [ ] Dark navy background (#2D3748)
- [ ] Green circular logo with "OA"
- [ ] Toggle switch redesigned (green when on)
- [ ] Job detection card with status dot
- [ ] Primary button (green, full width, sparkle icon)
- [ ] Secondary button (transparent, bordered)
- [ ] Navigation links (no background)
- [ ] Stats section (2 columns, border-top)
- [ ] Advanced section (collapsible, ollama status)

### Dashboard
- [ ] Header with logo and back link
- [ ] 6 stats cards (colored numbers)
- [ ] 2 charts (line + doughnut)
- [ ] Search bar with filter icon
- [ ] Export CSV button (green)
- [ ] 5 Kanban columns (proper colors)
- [ ] Application cards (checkbox, company, position, date, ATS)
- [ ] Edit/delete buttons on cards
- [ ] Empty state messaging
- [ ] Drag-and-drop visual feedback

### Onboarding
- [ ] Navy background (full screen)
- [ ] White card container (max 600px)
- [ ] Logo in white container
- [ ] Exit button (top-right)
- [ ] Progress indicator (6 steps, circles)
- [ ] Upload area (dashed border)
- [ ] Green "Select File" button
- [ ] Skip link
- [ ] Back/Next buttons in footer
- [ ] Privacy note (lock icon + text)

---

**Next Step**: Begin implementation with Phase 1 (Popup), using exact specs from this document.
