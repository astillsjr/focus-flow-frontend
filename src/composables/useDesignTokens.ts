import { computed } from 'vue'
import { colors, spacing, typography, borderRadius, shadows, transitions, breakpoints, zIndex } from '@/constants'

/**
 * Composable for converting design tokens to CSS variables
 * Use this in components to get CSS variables from design constants
 */
export function useDesignTokens() {
  const cssVars = computed(() => ({
    // Colors - Primary
    '--color-primary': colors.primary,
    '--color-primary-hover': colors.primaryHover,
    '--color-primary-light': colors.primaryLight,
    '--color-primary-dark': colors.primaryDark,
    '--color-primary-variant': colors.primaryVariant,
    
    // Colors - Secondary
    '--color-secondary': colors.secondary,
    '--color-secondary-hover': colors.secondaryHover,
    '--color-secondary-light': colors.secondaryLight,
    '--color-secondary-dark': colors.secondaryDark,
    
    // Colors - Status
    '--color-pending': colors.pending,
    '--color-pending-light': colors.pendingLight,
    '--color-pending-dark': colors.pendingDark,
    '--color-in-progress': colors.inProgress,
    '--color-in-progress-light': colors.inProgressLight,
    '--color-in-progress-dark': colors.inProgressDark,
    '--color-completed': colors.completed,
    '--color-completed-light': colors.completedLight,
    '--color-completed-dark': colors.completedDark,
    
    // Colors - Semantic
    '--color-error': colors.error,
    '--color-error-hover': colors.errorHover,
    '--color-error-light': colors.errorLight,
    '--color-error-dark': colors.errorDark,
    '--color-warning': colors.warning,
    '--color-warning-light': colors.warningLight,
    '--color-warning-dark': colors.warningDark,
    '--color-info': colors.info,
    '--color-info-light': colors.infoLight,
    '--color-info-dark': colors.infoDark,
    '--color-success': colors.success,
    '--color-success-light': colors.successLight,
    '--color-success-dark': colors.successDark,
    
    // Colors - Theme
    '--color-background': colors.background,
    '--color-on-background': colors.onBackground,
    '--color-surface': colors.surface,
    '--color-on-surface': colors.onSurface,
    '--color-on-primary': colors.onPrimary,
    '--color-on-secondary': colors.onSecondary,
    '--color-on-error': colors.onError,
    
    // Colors - Text
    '--color-text': colors.text,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-muted': colors.textMuted,
    '--color-text-disabled': colors.textDisabled,
    
    // Colors - Borders & Outlines
    '--color-outline': colors.outline,
    '--color-outline-variant': colors.outlineVariant,
    '--color-border': colors.border,
    '--color-border-light': colors.borderLight,
    '--color-border-dark': colors.borderDark,
    
    // Colors - Surfaces
    '--color-surface-variant': colors.surfaceVariant,
    '--color-surface-container': colors.surfaceContainer,
    '--color-surface-container-high': colors.surfaceContainerHigh,
    '--color-surface-container-highest': colors.surfaceContainerHighest,
    '--color-background-light': colors.backgroundLight,
    '--color-background-muted': colors.backgroundMuted,
    '--color-background-dark': colors.backgroundDark,
    
    // Colors - Overlay
    '--color-overlay': colors.overlay,
    '--color-overlay-light': colors.overlayLight,
    '--color-scrim': colors.scrim,
    
    // Spacing
    '--spacing-xs': spacing.xs,
    '--spacing-sm': spacing.sm,
    '--spacing-md': spacing.md,
    '--spacing-lg': spacing.lg,
    '--spacing-xl': spacing.xl,
    '--spacing-xxl': spacing.xxl,
    '--spacing-xxxl': spacing.xxxl,
    
    // Typography - Font Family
    '--font-family-base': typography.fontFamily.base,
    '--font-family-mono': typography.fontFamily.mono,
    
    // Typography - Sizes
    '--font-size-xs': typography.sizes.xs,
    '--font-size-sm': typography.sizes.sm,
    '--font-size-base': typography.sizes.base,
    '--font-size-lg': typography.sizes.lg,
    '--font-size-xl': typography.sizes.xl,
    '--font-size-xxl': typography.sizes.xxl,
    '--font-size-xxxl': typography.sizes.xxxl,
    '--font-size-display': typography.sizes.display,
    
    // Typography - Weights
    '--font-weight-normal': typography.weights.normal.toString(),
    '--font-weight-medium': typography.weights.medium.toString(),
    '--font-weight-semibold': typography.weights.semibold.toString(),
    '--font-weight-bold': typography.weights.bold.toString(),
    
    // Typography - Line Heights
    '--line-height-tight': typography.lineHeights.tight.toString(),
    '--line-height-normal': typography.lineHeights.normal.toString(),
    '--line-height-relaxed': typography.lineHeights.relaxed.toString(),
    
    // Border Radius
    '--radius-none': borderRadius.none,
    '--radius-sm': borderRadius.sm,
    '--radius-md': borderRadius.md,
    '--radius-lg': borderRadius.lg,
    '--radius-xl': borderRadius.xl,
    '--radius-full': borderRadius.full,
    
    // Shadows
    '--shadow-none': shadows.none,
    '--shadow-sm': shadows.sm,
    '--shadow-md': shadows.md,
    '--shadow-lg': shadows.lg,
    '--shadow-xl': shadows.xl,
    
    // Transitions
    '--transition-fast': transitions.fast,
    '--transition-normal': transitions.normal,
    '--transition-slow': transitions.slow,
    
    // Breakpoints
    '--breakpoint-mobile': breakpoints.mobile,
    '--breakpoint-tablet': breakpoints.tablet,
    '--breakpoint-desktop': breakpoints.desktop,
    '--breakpoint-wide': breakpoints.wide,
    
    // Z-Index
    '--z-base': zIndex.base.toString(),
    '--z-dropdown': zIndex.dropdown.toString(),
    '--z-sticky': zIndex.sticky.toString(),
    '--z-modal': zIndex.modal.toString(),
    '--z-popover': zIndex.popover.toString(),
    '--z-tooltip': zIndex.tooltip.toString(),
    '--z-toast': zIndex.toast.toString(),
  }))

  return {
    cssVars,
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    transitions,
    breakpoints,
    zIndex,
  }
}
