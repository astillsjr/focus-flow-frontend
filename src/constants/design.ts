/**
 * Design System Constants
 * Central source of truth for colors, spacing, typography, and other design tokens
 */

export const colors = {
  // Primary palette 
  primary: '#BB86FC',
  primaryHover: '#C693FC',
  primaryLight: '#3700B3',
  primaryDark: '#3700B3',
  primaryVariant: '#3700B3',
  
  // Secondary palette
  secondary: '#03DAC6',
  secondaryHover: '#26E0D1',
  secondaryLight: '#00BFA5',
  secondaryDark: '#00BFA5',
  
  // Status colors 
  pending: '#FFB74D',
  pendingLight: '#FF9800',
  pendingDark: '#F57C00',
  
  inProgress: '#42A5F5',
  inProgressLight: '#2196F3',
  inProgressDark: '#1976D2',
  
  completed: '#66BB6A',
  completedLight: '#4CAF50',
  completedDark: '#388E3C',
  
  // Semantic colors
  error: '#CF6679',
  errorHover: '#D17A8A',
  errorLight: '#B71C1C',
  errorDark: '#B71C1C',
  
  warning: '#FFB74D',
  warningLight: '#FF9800',
  warningDark: '#F57C00',
  
  info: '#42A5F5',
  infoLight: '#2196F3',
  infoDark: '#1976D2',
  
  success: '#66BB6A',
  successLight: '#4CAF50',
  successDark: '#388E3C',
  
  // Theme Colors
  background: '#121212',
  onBackground: '#FFFFFF',
  surface: '#121212',
  onSurface: '#FFFFFF',
  onPrimary: '#000000',
  onSecondary: '#000000',
  onError: '#000000',
  
  // Text colors (derived from on-surface)
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#808080',
  textDisabled: '#4D4D4D',
  
  // Outline and borders
  outline: '#B3B3B3',
  outlineVariant: '#4D4D4D',
  border: '#4D4D4D',
  borderLight: '#333333',
  borderDark: '#666666',
  
  // Surface variants for elevation
  surfaceVariant: '#1E1E1E',
  surfaceContainer: '#1E1E1E',
  surfaceContainerHigh: '#2A2A2A',
  surfaceContainerHighest: '#363636',
  
  // Background variants
  backgroundLight: '#1E1E1E',
  backgroundMuted: '#0F0F0F',
  backgroundDark: '#000000',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  scrim: 'rgba(0, 0, 0, 0.4)',
} as const

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
  xxxl: '4rem',     // 64px
} as const

export const typography = {
  fontFamily: {
    base: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    mono: 'Monaco, Courier, monospace',
  },
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    xxl: '1.5rem',    // 24px
    xxxl: '2rem',     // 32px
    display: '3rem',  // 48px
  },
  
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.12)',
} as const

export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
} as const

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 100,
  modal: 1000,
  popover: 1100,
  tooltip: 1200,
  toast: 1300,
} as const

