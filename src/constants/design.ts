/**
 * Design System Constants
 * Central source of truth for colors, spacing, typography, and other design tokens
 */

export const colors = {
  // Primary palette
  primary: '#4CAF50',
  primaryHover: '#45a049',
  primaryLight: '#e8f5e9',
  primaryDark: '#388e3c',
  
  // Secondary palette
  secondary: '#2196F3',
  secondaryHover: '#1976D2',
  secondaryLight: '#e3f2fd',
  
  // Status colors
  pending: '#FF9800',
  pendingLight: '#fff3e0',
  pendingDark: '#f57c00',
  
  inProgress: '#2196F3',
  inProgressLight: '#e3f2fd',
  inProgressDark: '#1976d2',
  
  completed: '#4CAF50',
  completedLight: '#e8f5e9',
  completedDark: '#388e3c',
  
  // Semantic colors
  error: '#f44336',
  errorHover: '#d32f2f',
  errorLight: '#ffebee',
  
  warning: '#FF9800',
  warningLight: '#fff3e0',
  
  info: '#2196F3',
  infoLight: '#e3f2fd',
  
  success: '#4CAF50',
  successLight: '#e8f5e9',
  
  // Neutrals
  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#757575',
  textDisabled: '#9e9e9e',
  
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  borderDark: '#cccccc',
  
  background: '#ffffff',
  backgroundLight: '#f9f9f9',
  backgroundMuted: '#f5f5f5',
  backgroundDark: '#e0e0e0',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
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

