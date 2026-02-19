# Offlyn Apply - Complete Design System Structure

## Overview
Comprehensive design system following UX best practices for job application automation.

**Principles**:
- Speed
- Clarity  
- Trust
- Low cognitive load
- Zero visual noise
- High confidence automation

---

## File Structure

```
apps/extension-firefox/src/design-system/
├── colors.ts              - Color palette
├── spacing.ts             - 8px grid spacing system
├── typography.ts          - Font system
├── radius.ts              - Border radius tokens
├── shadows.ts             - Shadow system
├── animations.ts          - Animation durations & easings
├── buttons.ts             - Button component styles
├── index.ts               - Exports all tokens
└── README.md              - Usage guide
```

---

## 1. Colors (`colors.ts`)

```typescript
/**
 * Offlyn Apply - Color System
 * Based on Navy (#0F172A) + Green (#27E38D)
 */

export const colors = {
  // Primary Brand
  navy: '#0F172A',
  green: '#27E38D',
  white: '#FFFFFF',
  
  // Neutrals (Gray scale)
  gray50: '#F8FAFC',
  gray100: '#F5F7FA',
  gray200: '#E5E7EB',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  
  // Semantic Colors
  success: '#27E38D',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Status Colors (Dashboard)
  statusSubmitted: '#3B82F6',
  statusInterviewing: '#F59E0B',
  statusRejected: '#EF4444',
  statusAccepted: '#27E38D',
  statusWithdrawn: '#64748B',
  
  // Confidence Indicators (NEW)
  confidenceHigh: '#27E38D',
  confidenceMedium: '#F59E0B',
  confidenceLow: '#EF4444',
} as const;

// Computed Colors
export const computed = {
  // Green variants
  greenHover: '#22CC7A',      // -8% luminosity
  greenActive: '#1EB86B',     // -15% luminosity
  greenLight: '#E6FAF3',      // Very light tint
  
  // Navy variants
  navyLight: '#1E293B',
  navyDark: '#020617',
  
  // Alpha (Transparency)
  navyAlpha10: 'rgba(15, 23, 42, 0.1)',
  navyAlpha20: 'rgba(15, 23, 42, 0.2)',
  navyAlpha50: 'rgba(15, 23, 42, 0.5)',
  navyAlpha90: 'rgba(15, 23, 42, 0.9)',
  
  greenAlpha10: 'rgba(39, 227, 141, 0.1)',
  greenAlpha20: 'rgba(39, 227, 141, 0.2)',
  greenAlpha30: 'rgba(39, 227, 141, 0.3)',
  greenAlpha50: 'rgba(39, 227, 141, 0.5)',
} as const;

// Text colors (semantic)
export const text = {
  primary: colors.navy,
  secondary: colors.gray500,
  tertiary: colors.gray400,
  disabled: colors.gray300,
  inverse: colors.white,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
} as const;

// Background colors (semantic)
export const backgrounds = {
  primary: colors.white,
  secondary: colors.gray100,
  tertiary: colors.gray50,
  dark: colors.navy,
  overlay: computed.navyAlpha50,
  success: computed.greenAlpha10,
  error: 'rgba(239, 68, 68, 0.1)',
  warning: 'rgba(245, 158, 11, 0.1)',
} as const;

// Border colors (semantic)
export const borders = {
  light: colors.gray200,
  medium: colors.gray300,
  dark: colors.gray400,
  accent: colors.green,
  focus: colors.green,
} as const;
```

---

## 2. Spacing (`spacing.ts`)

```typescript
/**
 * Offlyn Apply - Spacing System
 * Based on 8px grid for consistency
 */

// Base unit: 8px
const BASE = 8;

export const spacing = {
  // Absolute values
  0: '0',
  1: `${BASE * 0.5}px`,   // 4px - micro
  2: `${BASE}px`,         // 8px - base
  3: `${BASE * 1.5}px`,   // 12px
  4: `${BASE * 2}px`,     // 16px - section
  5: `${BASE * 2.5}px`,   // 20px
  6: `${BASE * 3}px`,     // 24px - container
  8: `${BASE * 4}px`,     // 32px - major separation
  10: `${BASE * 5}px`,    // 40px
  12: `${BASE * 6}px`,    // 48px
  16: `${BASE * 8}px`,    // 64px
} as const;

// Semantic spacing (use these in components)
export const semanticSpacing = {
  micro: spacing[1],      // 4px - between icon and text
  tight: spacing[2],      // 8px - between related elements
  base: spacing[4],       // 16px - standard gap
  comfortable: spacing[6], // 24px - section spacing
  spacious: spacing[8],   // 32px - major sections
  loose: spacing[10],     // 40px - page-level spacing
} as const;

// Component-specific spacing
export const componentSpacing = {
  button: {
    paddingX: spacing[4],  // 16px
    paddingY: spacing[3],  // 12px
    gap: spacing[2],       // 8px (icon to text)
  },
  card: {
    padding: spacing[6],   // 24px
    gap: spacing[4],       // 16px
  },
  panel: {
    padding: spacing[4],   // 16px
    gap: spacing[3],       // 12px
  },
  input: {
    paddingX: spacing[3],  // 12px
    paddingY: spacing[2],  // 8px
  },
} as const;
```

---

## 3. Typography (`typography.ts`)

```typescript
/**
 * Offlyn Apply - Typography System
 */

// Font families
export const fontFamily = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace",
} as const;

// Font sizes (8px grid aligned)
export const fontSize = {
  xs: '11px',     // Small labels
  sm: '12px',     // Secondary text
  base: '14px',   // Body text (default)
  lg: '16px',     // Subheaders
  xl: '18px',     // Small headers
  '2xl': '24px',  // Section headers
  '3xl': '28px',  // Page headers
  '4xl': '32px',  // Display headers
} as const;

// Font weights
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// Line heights
export const lineHeight = {
  tight: 1.2,
  base: 1.5,
  relaxed: 1.75,
} as const;

// Letter spacing
export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.02em',
  wider: '0.05em',
} as const;

// Semantic typography (use these in components)
export const semanticTypography = {
  // Headers
  h1: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  h2: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.base,
  },
  
  // Body text
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.base,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.base,
  },
  
  // UI text
  button: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.base,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.base,
  },
} as const;
```

---

## 4. Border Radius (`radius.ts`)

```typescript
/**
 * Offlyn Apply - Border Radius System
 */

export const radius = {
  none: '0',
  sm: '6px',
  base: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

// Semantic radius (use these in components)
export const semanticRadius = {
  button: radius.base,      // 8px
  input: radius.base,       // 8px
  card: radius.lg,          // 12px
  panel: radius.lg,         // 12px
  modal: radius.xl,         // 16px
  badge: radius.full,       // Pill shape
} as const;
```

---

## 5. Shadows (`shadows.ts`)

```typescript
/**
 * Offlyn Apply - Shadow System
 * Limited to essential elevations only
 */

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.18)',
  '2xl': '0 20px 40px rgba(0, 0, 0, 0.2)',
  
  // Focus rings
  focusGreen: '0 0 0 3px rgba(39, 227, 141, 0.2)',
  focusRed: '0 0 0 3px rgba(239, 68, 68, 0.2)',
  
  // Green glow (for green buttons/accents)
  greenGlow: '0 4px 12px rgba(39, 227, 141, 0.3)',
  
  // Inner shadows
  inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
} as const;

// Semantic shadows (use these in components)
export const semanticShadows = {
  button: shadows.sm,
  buttonHover: shadows.md,
  card: shadows.base,
  cardHover: shadows.md,
  panel: shadows.lg,
  modal: shadows.xl,
  dropdown: shadows.md,
} as const;
```

---

## 6. Animations (`animations.ts`)

```typescript
/**
 * Offlyn Apply - Animation System
 * Consistent timing and easing for polish
 */

// Durations
export const duration = {
  instant: '100ms',
  fast: '150ms',
  base: '200ms',
  medium: '300ms',
  slow: '400ms',
  slower: '600ms',
} as const;

// Easing functions
export const easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy
} as const;

// Semantic animations (use these in components)
export const transitions = {
  button: `all ${duration.fast} ${easing.easeOut}`,
  hover: `all ${duration.base} ${easing.easeOut}`,
  fade: `opacity ${duration.medium} ${easing.easeInOut}`,
  slideUp: `transform ${duration.medium} ${easing.easeOut}`,
  expand: `all ${duration.medium} ${easing.spring}`,
} as const;

// Keyframe animations
export const keyframes = {
  fadeIn: {
    name: 'fadeIn',
    definition: `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
  },
  slideIn: {
    name: 'slideIn',
    definition: `
      @keyframes slideIn {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
    `,
  },
  checkmark: {
    name: 'checkmark',
    definition: `
      @keyframes checkmark {
        0% { transform: scale(0) rotate(45deg); }
        50% { transform: scale(1.2) rotate(45deg); }
        100% { transform: scale(1) rotate(45deg); }
      }
    `,
  },
  pulse: {
    name: 'pulse',
    definition: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
  },
  spin: {
    name: 'spin',
    definition: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
  },
} as const;
```

---

## 7. Buttons (`buttons.ts`)

```typescript
/**
 * Offlyn Apply - Button Component System
 */

import { colors, computed } from './colors';
import { spacing, componentSpacing } from './spacing';
import { radius } from './radius';
import { shadows, semanticShadows } from './shadows';
import { transitions } from './animations';

export const buttonStyles = {
  // Primary: Green background, navy text
  primary: `
    background: ${colors.green};
    color: ${colors.navy};
    border: none;
    padding: ${componentSpacing.button.paddingY} ${componentSpacing.button.paddingX};
    border-radius: ${radius.base};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: ${transitions.button};
    box-shadow: ${semanticShadows.button};
    
    &:hover {
      background: ${computed.greenHover};
      box-shadow: ${semanticShadows.buttonHover};
      transform: translateY(-1px);
    }
    
    &:active {
      background: ${computed.greenActive};
      transform: translateY(0);
    }
    
    &:disabled {
      background: ${colors.gray300};
      color: ${colors.gray500};
      cursor: not-allowed;
      box-shadow: none;
    }
  `,
  
  // Secondary: Transparent, navy border
  secondary: `
    background: transparent;
    color: ${colors.navy};
    border: 2px solid ${colors.navy};
    padding: ${componentSpacing.button.paddingY} ${componentSpacing.button.paddingX};
    border-radius: ${radius.base};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: ${transitions.button};
    
    &:hover {
      background: ${backgrounds.secondary};
      border-color: ${computed.navyLight};
    }
    
    &:active {
      background: ${colors.gray200};
    }
    
    &:disabled {
      border-color: ${colors.gray300};
      color: ${colors.gray400};
      cursor: not-allowed;
    }
  `,
  
  // Tertiary: Ghost button
  tertiary: `
    background: transparent;
    color: ${colors.gray600};
    border: none;
    padding: ${spacing[2]} ${spacing[3]};
    border-radius: ${radius.sm};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: ${transitions.hover};
    
    &:hover {
      background: ${backgrounds.secondary};
      color: ${colors.navy};
    }
    
    &:disabled {
      color: ${colors.gray400};
      cursor: not-allowed;
    }
  `,
  
  // Destructive: Red accent
  destructive: `
    background: rgba(239, 68, 68, 0.1);
    color: ${colors.error};
    border: 1px solid ${colors.error};
    padding: ${componentSpacing.button.paddingY} ${componentSpacing.button.paddingX};
    border-radius: ${radius.base};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: ${transitions.button};
    
    &:hover {
      background: rgba(239, 68, 68, 0.15);
    }
    
    &:active {
      background: rgba(239, 68, 68, 0.2);
    }
  `,
} as const;

// Button sizes
export const buttonSizes = {
  sm: `
    padding: ${spacing[2]} ${spacing[3]};
    font-size: 12px;
  `,
  base: `
    padding: ${spacing[3]} ${spacing[4]};
    font-size: 14px;
  `,
  lg: `
    padding: ${spacing[4]} ${spacing[6]};
    font-size: 16px;
  `,
} as const;
```

---

## 8. Index (`index.ts`)

```typescript
/**
 * Offlyn Apply - Design System
 * Import all tokens from this file
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './radius';
export * from './shadows';
export * from './animations';
export * from './buttons';

// Helper to generate CSS custom properties
export function generateCSSVariables(): string {
  return `
    :root {
      /* Colors */
      --color-navy: #0F172A;
      --color-green: #27E38D;
      --color-white: #FFFFFF;
      
      --color-green-hover: #22CC7A;
      --color-green-active: #1EB86B;
      
      /* Spacing */
      --spacing-micro: 4px;
      --spacing-tight: 8px;
      --spacing-base: 16px;
      --spacing-comfortable: 24px;
      --spacing-spacious: 32px;
      
      /* Typography */
      --font-sans: ${fontFamily.sans};
      --text-base: 14px;
      --text-lg: 16px;
      --text-xl: 18px;
      
      /* Radius */
      --radius-base: 8px;
      --radius-lg: 12px;
      
      /* Shadows */
      --shadow-base: 0 2px 4px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
      --shadow-focus: 0 0 0 3px rgba(39, 227, 141, 0.2);
    }
  `;
}
```

---

## Usage Examples

### In TypeScript Components

```typescript
import { colors, spacing, shadows } from '../design-system';

const styles = `
  .my-button {
    background: ${colors.green};
    color: ${colors.navy};
    padding: ${spacing[3]} ${spacing[4]};
    border-radius: ${radius.base};
    box-shadow: ${shadows.base};
  }
  
  .my-button:hover {
    background: ${computed.greenHover};
  }
`;
```

### In HTML Files

```html
<style>
  @import '../design-system/variables.css';
  
  .button {
    background: var(--color-green);
    color: var(--color-navy);
    padding: var(--spacing-base);
    border-radius: var(--radius-base);
  }
</style>
```

---

## Implementation Checklist

### Phase 1: Create Design System Files
- [ ] Create `src/design-system/` directory
- [ ] Create `colors.ts`
- [ ] Create `spacing.ts`
- [ ] Create `typography.ts`
- [ ] Create `radius.ts`
- [ ] Create `shadows.ts`
- [ ] Create `animations.ts`
- [ ] Create `buttons.ts`
- [ ] Create `index.ts`
- [ ] Create `README.md` with usage guide

### Phase 2: Refactor Existing Files
- [ ] Update all components to import from design-system
- [ ] Remove all inline hex values
- [ ] Replace hardcoded spacing with tokens
- [ ] Standardize button styles
- [ ] Remove inconsistent shadows

### Phase 3: Validation
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Visual regression test
- [ ] All components use tokens

---

## Benefits

1. **Consistency**: All UI surfaces use same tokens
2. **Maintainability**: Change colors in one place
3. **Scalability**: Easy to add dark mode, themes
4. **Developer Experience**: Clear system, no guessing
5. **Professional**: Eliminates visual inconsistencies
6. **Performance**: No runtime style calculations

---

## Next Steps

1. Create all design system files in `src/design-system/`
2. Deprecate old `src/shared/theme.ts` (move logic to design-system)
3. Refactor all 16 components to use new system
4. Test thoroughly
5. Document usage in README

**Estimated Effort**: 6-8 hours to create system + 8-10 hours to refactor all components = **14-18 hours total**
