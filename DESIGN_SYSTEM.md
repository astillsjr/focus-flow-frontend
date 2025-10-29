# Focus Flow Design System

This document outlines the design system and style guidelines for the Focus Flow application.

## 📁 File Structure

- **`src/constants/design.ts`** - Design tokens and constants
- **`src/style.css`** - Global styles and base CSS
- **`src/components/layout/`** - Layout components (Navigation, DashboardLayout)

---

## 🎨 Design Tokens

All design tokens are centralized in `src/constants/design.ts` and can be imported throughout the application.

### Colors

```typescript
import { colors } from '@/constants'

// Primary palette
colors.primary          // #4CAF50
colors.primaryHover     // #45a049
colors.primaryLight     // #e8f5e9

// Status colors
colors.pending          // #FF9800
colors.inProgress       // #2196F3
colors.completed        // #4CAF50
colors.error            // #f44336

// Neutrals
colors.text             // #333333
colors.textSecondary    // #666666
colors.textMuted        // #757575
colors.border           // #e0e0e0
colors.background       // #ffffff
```

### Spacing

```typescript
import { spacing } from '@/constants'

spacing.xs    // 0.25rem (4px)
spacing.sm    // 0.5rem (8px)
spacing.md    // 1rem (16px)
spacing.lg    // 1.5rem (24px)
spacing.xl    // 2rem (32px)
spacing.xxl   // 3rem (48px)
```

### Typography

```typescript
import { typography } from '@/constants'

// Font family
typography.fontFamily.base    // Inter, system-ui, ...
typography.fontFamily.mono    // Monaco, Courier, ...

// Font sizes
typography.sizes.xs           // 0.75rem (12px)
typography.sizes.base         // 1rem (16px)
typography.sizes.xl           // 1.25rem (20px)
typography.sizes.xxxl         // 2rem (32px)

// Font weights
typography.weights.normal     // 400
typography.weights.medium     // 500
typography.weights.semibold   // 600
typography.weights.bold       // 700
```

### Other Tokens

```typescript
import { borderRadius, shadows, transitions } from '@/constants'

// Border radius
borderRadius.sm    // 4px
borderRadius.md    // 8px
borderRadius.lg    // 12px
borderRadius.full  // 9999px

// Shadows
shadows.sm         // 0 1px 3px rgba(0, 0, 0, 0.1)
shadows.md         // 0 2px 8px rgba(0, 0, 0, 0.1)
shadows.lg         // 0 4px 16px rgba(0, 0, 0, 0.1)

// Transitions
transitions.fast   // 0.15s ease
transitions.normal // 0.2s ease
transitions.slow   // 0.3s ease
```

---

## 🧩 Using Design Tokens in Components

### In Vue Component Styles

You can reference design tokens directly in your `<style scoped>` sections:

```vue
<style scoped>
.my-component {
  /* Use the exact values from design.ts */
  color: #333333;              /* colors.text */
  padding: 1rem;               /* spacing.md */
  border-radius: 8px;          /* borderRadius.md */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  /* shadows.md */
  transition: all 0.2s ease;   /* transitions.normal */
}

.my-button {
  background-color: #4CAF50;   /* colors.primary */
  padding: 0.5rem 1rem;        /* spacing.sm spacing.md */
  border-radius: 8px;          /* borderRadius.md */
}

.my-button:hover {
  background-color: #45a049;   /* colors.primaryHover */
}
</style>
```

### In JavaScript/TypeScript

For dynamic styling or computed values:

```typescript
import { colors, spacing } from '@/constants'

const buttonStyle = {
  backgroundColor: colors.primary,
  padding: `${spacing.sm} ${spacing.md}`,
}
```

---

## 📐 Layout Components

### DashboardLayout

Wraps all authenticated dashboard pages with consistent navigation and structure:

```vue
<template>
  <DashboardLayout>
    <!-- Your dashboard content here -->
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
</script>
```

**Features:**
- Includes AppNavigation automatically
- Max-width container (1200px)
- Consistent padding
- Responsive behavior

### AppNavigation

The main navigation bar for authenticated users:

**Features:**
- Sticky positioning
- Responsive design (mobile, tablet, desktop)
- Active route highlighting
- Brand logo/name
- Logout functionality

---

## 🎯 Design Principles

### 1. Consistency

Always use design tokens instead of hard-coded values. This ensures:
- Visual consistency across the app
- Easy theme updates
- Predictable spacing and sizing

### 2. Spacing System

Use the 8px-based spacing scale:
- `xs` (4px) - Tight spacing within elements
- `sm` (8px) - Default gap between related items
- `md` (16px) - Standard padding/margin
- `lg` (24px) - Section spacing
- `xl` (32px) - Large section spacing
- `xxl` (48px) - Page-level spacing

### 3. Color Usage

**Text:**
- Primary text: `colors.text` (#333)
- Secondary text: `colors.textSecondary` (#666)
- Muted text: `colors.textMuted` (#757575)

**Backgrounds:**
- Cards/panels: `colors.background` (#fff)
- Page background: `colors.backgroundMuted` (#f5f5f5)
- Hover states: `colors.backgroundLight` (#f9f9f9)

**Status:**
- Pending: `colors.pending` (orange)
- In Progress: `colors.inProgress` (blue)
- Completed: `colors.completed` (green)
- Error: `colors.error` (red)

### 4. Typography Scale

Use semantic heading levels:
- `h1`: Page titles (2rem)
- `h2`: Section headings (1.5rem)
- `h3`: Subsection headings (1.25rem)
- Body text: 1rem
- Small text: 0.875rem

### 5. Responsive Design

Follow mobile-first approach with breakpoints:
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px
- Wide: > 1024px

---

## ✅ Best Practices

### DO:
- ✅ Use design tokens for all colors, spacing, and typography
- ✅ Use semantic color names (e.g., `colors.error` not `colors.red`)
- ✅ Include hover, focus, and disabled states for interactive elements
- ✅ Test responsive behavior on mobile and desktop
- ✅ Use consistent border radius (8px for most elements)
- ✅ Add transitions for interactive elements (0.2s ease)

### DON'T:
- ❌ Hard-code colors, spacing, or font sizes
- ❌ Create one-off spacing values (use the spacing scale)
- ❌ Forget to add focus states for accessibility
- ❌ Use inconsistent shadows (stick to sm, md, lg)
- ❌ Override global styles without good reason
- ❌ Mix design tokens with arbitrary values

---

## 🔄 Migration Guide

When updating existing components to use the design system:

1. **Identify hard-coded values** in your component's styles
2. **Replace with design tokens** from `design.ts`
3. **Use consistent spacing** from the spacing scale
4. **Apply standard shadows** instead of custom ones
5. **Test responsive behavior** at different screen sizes
6. **Ensure accessibility** (focus states, contrast ratios)

### Example Migration

**Before:**
```vue
<style scoped>
.my-card {
  padding: 15px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  color: #444;
}
</style>
```

**After:**
```vue
<style scoped>
.my-card {
  padding: 1rem;                  /* spacing.md (16px is close to 15px) */
  background: #ffffff;            /* colors.background */
  border-radius: 8px;             /* borderRadius.md (standardized) */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  /* shadows.md */
  color: #333333;                 /* colors.text */
}
</style>
```

---

## 🚀 Next Steps

As the design system evolves, consider:

1. **CSS Variables** - Convert design tokens to CSS custom properties
2. **Component Library** - Build reusable UI components (Button, Card, Input)
3. **Dark Mode** - Add dark theme support
4. **Theme Variants** - Allow customization for different brands/use cases
5. **Documentation Site** - Create visual documentation with examples

---

## 📚 Resources

- **Figma Design** (if available)
- **Component Examples**: See `src/components/layout/AppNavigation.vue`
- **Design Tokens**: `src/constants/design.ts`
- **Global Styles**: `src/style.css`

