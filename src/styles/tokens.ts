/**
 * VaultString Design System Tokens
 * Based on fintech design requirements with WCAG 2.1 AA compliance
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Colors
  primary: {
    green: '#448a33',
    blue: '#3b5a65',
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  // Neutrals - Grayscale
  neutral: {
    // Near-white to near-black
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Inverted variants for dark mode
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    // System stack for optimal performance + fallback to Inter-like fonts
    sans: 'system-ui, -apple-system, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },

  // Heading hierarchy
  heading: {
    h1: {
      size: '2rem',
      lineHeight: '2.5rem',
      weight: 'bold',
      letterSpacing: '-0.02em',
    },
    h2: {
      size: '1.5rem',
      lineHeight: '2rem',
      weight: 'semibold',
      letterSpacing: '-0.01em',
    },
    h3: {
      size: '1.25rem',
      lineHeight: '1.75rem',
      weight: 'semibold',
      letterSpacing: '-0.01em',
    },
    h4: {
      size: '1.125rem',
      lineHeight: '1.75rem',
      weight: 'semibold',
    },
    h5: {
      size: '1rem',
      lineHeight: '1.5rem',
      weight: 'semibold',
    },
    h6: {
      size: '0.875rem',
      lineHeight: '1.25rem',
      weight: 'semibold',
    },
  },

  // Body text
  body: {
    large: {
      size: '1rem',
      lineHeight: '1.5rem',
      weight: 'normal',
    },
    base: {
      size: '0.9375rem',
      lineHeight: '1.5rem',
      weight: 'normal',
    },
    small: {
      size: '0.875rem',
      lineHeight: '1.25rem',
      weight: 'normal',
    },
  },

  // UI text
  ui: {
    button: {
      size: '0.9375rem',
      lineHeight: '1.25rem',
      weight: 'semibold',
      letterSpacing: '0.005em',
    },
    label: {
      size: '0.875rem',
      lineHeight: '1.25rem',
      weight: 'semibold',
    },
    caption: {
      size: '0.8125rem',
      lineHeight: '1.125rem',
      weight: 'normal',
    },
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

// Base unit: 4px grid
export const spacing = {
  // Semantic spacing tokens
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px

  // Pixel values for reference
  '4': '4px',
  '8': '8px',
  '12': '12px',
  '16': '16px',
  '20': '20px',
  '24': '24px',
  '32': '32px',
  '48': '48px',
  '64': '64px',
} as const;

// ============================================================================
// COMPONENT SPACING
// ============================================================================

export const componentSpacing = {
  // Form spacing
  form: {
    fieldGap: spacing.md, // 16px gap between form fields
    labelMarginBottom: spacing.sm, // 8px below labels
    errorMarginTop: spacing.xs, // 4px above error text
    groupGap: spacing.lg, // 24px between field groups
  },

  // Container padding
  container: {
    mobile: spacing.md, // 16px on mobile
    tablet: spacing.lg, // 24px on tablet
    desktop: spacing.xl, // 32px on desktop
  },

  // Grid & Layout
  layout: {
    sectionGap: spacing['2xl'], // 48px between sections
    gridGap: spacing.lg, // 24px grid gap
  },

  // Card padding
  card: {
    mobile: spacing.lg, // 24px
    desktop: spacing.xl, // 32px
  },

  // Button padding
  button: {
    small: `${spacing.sm} ${spacing.md}`, // 8px 16px
    medium: `${spacing.md} ${spacing.lg}`, // 16px 24px
    large: `${spacing.lg} ${spacing.xl}`, // 24px 32px
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px - subtle
  md: '0.5rem', // 8px - standard
  lg: '0.75rem', // 12px - cards
  xl: '1rem', // 16px - large modals
  full: '9999px', // Pills
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1070',
} as const;
