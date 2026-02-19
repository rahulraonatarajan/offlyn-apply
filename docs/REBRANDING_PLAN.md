# Offlyn Apply Rebranding - Implementation Plan

## Overview
Rebrand the extension from "Offlyn" to "Offlyn Apply" with updated visual identity.

**Brand**: Offlyn Apply (parent: Offlyn.ai)  
**Monogram**: OA  
**Color Scheme**: Dark blue (#1e2a3a) to green (#7cb342) gradient  
**Replaces**: Purple gradient (#667eea → #764ba2)

---

## Assets Needed from You

Before DEV can start, please provide:

### 1. Icon Exports (REQUIRED)
Export the OA monogram from your logo in these sizes:

- **48x48 pixels** - PNG with transparent background
- **96x96 pixels** - PNG with transparent background  
- **128x128 pixels** - PNG with transparent background (optional but recommended)

**Requirements**:
- Format: PNG
- Background: Transparent
- Style: OA letters clearly visible
- Color: Either white text on dark background, or dark text on transparent (we can adjust)

**Where to place**: 
```
apps/extension-firefox/public/icons/icon-48.png
apps/extension-firefox/public/icons/icon-96.png
apps/extension-firefox/public/icons/icon-128.png
```

### 2. Full Logo (REQUIRED)
Export the full "Offlyn Apply" logo with robot:

- **400x200 pixels** (or similar aspect ratio) - PNG with transparent background
- **SVG format** (if available) - Vector version for best quality

**Where to place**:
```
apps/extension-firefox/public/icons/logo-full.png
apps/extension-firefox/public/icons/logo-full.svg (if available)
```

### 3. Favicon (Optional but recommended)
- **32x32 pixels** - PNG or ICO format
- For dashboard and onboarding pages

**Where to place**:
```
apps/extension-firefox/public/icons/favicon.ico
```

---

## Color Palette Confirmation

I extracted these colors from your logo. Please confirm:

### Primary Colors
```
Dark Blue (robot body):     #1e2a3a
Green (checkmark/pen):      #7cb342
Light Green (highlight):    #9ccc65
Antenna Green:              #b4d96d
```

### Usage
- **Gradients**: Dark blue → Green (`linear-gradient(135deg, #1e2a3a 0%, #7cb342 100%)`)
- **Primary buttons**: Green background
- **Headers**: Dark blue text on light backgrounds
- **Accents**: Green for interactive elements

**Question**: Are these the correct brand colors, or should we use different shades?

---

## Text/Messaging Updates

### Extension Name
- **Old**: "Offlyn - Offline Job Application Assistant"
- **New**: "Offlyn Apply - Job Application Assistant"

### Tagline Options (Pick one or suggest your own)
1. "Automate Your Job Applications"
2. "AI-Powered Job Application Assistant"
3. "Smart Autofill for Job Applications"
4. "Apply Faster with AI"

**Question**: Which tagline should we use, or what's your preferred description?

### Onboarding Welcome
- **Suggested**: "Welcome to Offlyn Apply"
- **Suggested subtext**: "Set up your profile to start automating job applications"

**Question**: Any specific messaging for the onboarding flow?

---

## Typography Confirmation

**Current**: Using system fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)

**Question**: 
- Is the system font stack acceptable, or do you have a specific brand font?
- If custom font, please provide font files or CDN link

---

## Implementation Phases

### Phase 1: Assets (REQUIRED FIRST)
**You provide**:
- OA monogram PNGs (48, 96, 128)
- Full logo PNG (400x200)
- Confirm colors and messaging

**DEV will**:
- Place assets in correct directories
- Update manifest.json with new name

### Phase 2: Core UI (Popup + Dashboard)
**DEV will**:
- Replace purple gradient with dark-blue-to-green
- Update popup header with OA icon
- Update dashboard branding
- Replace all color references

### Phase 3: Onboarding
**DEV will**:
- Add full logo to onboarding header
- Update welcome messaging
- Apply new color scheme

### Phase 4: In-Page Components
**DEV will**:
- Update field summary panel (minimized cube shows OA)
- Update cover letter panel branding
- Update all notification colors
- Update progress indicators

### Phase 5: Testing & Polish
**DEV will**:
- Verify all "Offlyn" text updated to "Offlyn Apply"
- Check all purple colors replaced
- Test icon visibility in browser
- Test all UI surfaces

---

## Deliverables Summary

### What You Need to Provide
1. ✅ Logo images provided (already in assets folder)
2. ⏳ Export OA monogram as PNG (48x48, 96x96, 128x128)
3. ⏳ Export full logo as PNG (400x200)
4. ⏳ Confirm color palette is correct
5. ⏳ Choose tagline/description text
6. ⏳ Confirm typography (system fonts OK?)

### What DEV Will Deliver
1. Updated extension with "Offlyn Apply" branding
2. All purple colors replaced with dark-blue/green
3. OA monogram in browser toolbar
4. Full logo on onboarding page
5. Consistent branding across all UI surfaces
6. Updated manifest with new name/description

---

## File Summary

**Total files affected**: ~21-23 files

**Categories**:
- Manifest & metadata: 2 files
- Icons & assets: 6-8 files
- Popup UI: 2 files
- Dashboard: 2 files
- Onboarding: 2 files
- In-page components: 6 files
- Shared utilities: 1 new file

**See detailed checklist**: `BRANDING_FILES_CHECKLIST.md`

---

## Next Steps

1. **You**: Export logo assets in required sizes and confirm details above
2. **You**: Place PNG files in `apps/extension-firefox/public/icons/`
3. **DEV**: Implement rebranding across all files
4. **You**: Review and approve final result
5. **DEV**: Fix any issues, polish, and finalize

---

## Questions Before Starting

Please answer these before DEV begins:

1. **Colors**: Are #1e2a3a and #7cb342 the correct brand colors?
2. **Tagline**: Which description/tagline should we use?
3. **Typography**: Are system fonts OK, or do you have a brand font?
4. **Messaging**: Any specific onboarding welcome text?
5. **Assets Ready**: Can you export the OA monogram PNGs this week?

---

## Estimated Effort

- **Asset creation** (by you): 30-60 minutes (export logos in different sizes)
- **Implementation** (by DEV): 3-4 hours
- **Testing & polish** (by DEV): 1-2 hours

**Total**: 4-6 hours of DEV time after assets provided

---

## Reference Documents

- Full branding guide: `BRANDING_GUIDE.md`
- Detailed file checklist: `BRANDING_FILES_CHECKLIST.md`
- Logo images: `.cursor/projects/.../assets/image-*.png`
