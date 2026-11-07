/**
 * Design Tokens - TypeScript Types and Utilities
 * Type-safe access to design tokens
 * Merged with existing tokens for compatibility
 */

import type { CSSProperties } from 'react';

/* ============================================
   COLOR TOKENS
   ============================================ */

export const colors = {
  // Brand colors
  brand: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  // Semantic colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  // Neutral colors
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  // Chart colors
  chart: {
    categorical: [
      '#3b82f6', // blue
      '#22c55e', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#f97316', // orange
      '#ec4899', // pink
      '#14b8a6', // teal
      '#84cc16', // lime
    ],
    sequential: [
      '#eff6ff',
      '#dbeafe',
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a',
    ],
    diverging: [
      '#7f1d1d',
      '#991b1b',
      '#b91c1c',
      '#dc2626',
      '#ef4444',
      '#fca5a5',
      '#fecaca',
      '#fee2e2',
      '#fef2f2',
      '#fafafa',
      '#f0fdf4',
      '#dcfce7',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d',
    ],
  },
  // GPU/Cluster specific
  gpu: {
    idle: '#22c55e',
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f87171',
    critical: '#dc2626',
    offline: '#a3a3a3',
    unknown: '#737373',
  },
  network: {
    healthy: '#22c55e',
    congested: '#f59e0b',
    saturated: '#ef4444',
    down: '#b91c1c',
  },
} as const;

/* ============================================
   SPACING TOKENS
   ============================================ */

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  component: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  layout: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
} as const;

/* ============================================
   TYPOGRAPHY TOKENS
   ============================================ */

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, monospace",
    display: "'Cal Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
  text: {
    display: {
      xl: '3rem',
      lg: '2.25rem',
      md: '1.875rem',
      sm: '1.5rem',
    },
    heading: {
      xl: '1.875rem',
      lg: '1.5rem',
      md: '1.25rem',
      sm: '1.125rem',
      xs: '1rem',
    },
    body: {
      lg: '1.125rem',
      md: '1rem',
      sm: '0.875rem',
      xs: '0.75rem',
    },
    label: {
      lg: '1rem',
      md: '0.875rem',
      sm: '0.75rem',
    },
    code: {
      sm: '0.875rem',
      md: '1rem',
    },
  },
} as const;

/* ============================================
   BORDER RADIUS TOKENS
   ============================================ */

export const borderRadius = {
  none: '0',
  xs: '0.125rem',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
  button: '0.375rem',
  card: '0.5rem',
  input: '0.375rem',
  badge: '9999px',
  tooltip: '0.25rem',
} as const;

/* ============================================
   SHADOW TOKENS
   ============================================ */

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  focus: '0 0 0 3px #c7d2fe',
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  cardHover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  cardElevated: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  tooltip: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

/* ============================================
   MOTION TOKENS
   ============================================ */

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const motion = {
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    reduced: '0.01ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  component: {
    button: '100ms cubic-bezier(0, 0, 0.2, 1)',
    card: '200ms cubic-bezier(0, 0, 0.2, 1)',
    tooltip: '100ms cubic-bezier(0, 0, 0.2, 1)',
    dropdown: '200ms cubic-bezier(0, 0, 0.2, 1)',
    modal: '300ms cubic-bezier(0, 0, 0.2, 1)',
    sidebar: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    page: '500ms cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;

/* ============================================
   BREAKPOINT TOKENS
   ============================================ */

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const container = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/* ============================================
   Z-INDEX TOKENS
   ============================================ */

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
} as const;

/* ============================================
   LAYOUT TOKENS
   ============================================ */

export const layout = {
  headerHeight: '4rem',
  headerHeightCompact: '3rem',
  sidebarWidth: '16rem',
  sidebarWidthCollapsed: '4rem',
  footerHeight: '3rem',
  bentoGap: '1rem',
  bentoGapSm: '0.75rem',
  bentoGapLg: '1.5rem',
  bentoMinWidth: '280px',
} as const;

/* ============================================
   OPACITY TOKENS
   ============================================ */

export const opacity = {
  disabled: 0.5,
  hover: 0.8,
  active: 0.6,
  overlay: 0.5,
  backdrop: 0.8,
} as const;

/* ============================================
   COMPOSITE TOKENS OBJECT
   ============================================ */

export const tokens = {
  color: colors,
  spacing,
  typography,
  borderRadius,
  shadow: shadows,
  motion,
  transitions,
  zIndex,
  breakpoint: breakpoints,
  container,
  layout,
  opacity,
} as const;

/* ============================================
   TYPE EXPORTS
   ============================================ */

export type ColorToken = keyof typeof colors;
export type ColorScaleToken<T extends ColorToken> = keyof typeof colors[T];
export type SpacingToken = keyof typeof spacing & string;
export type FontSizeToken = keyof typeof typography.fontSize;
export type FontWeightToken = keyof typeof typography.fontWeight;
export type LineHeightToken = keyof typeof typography.lineHeight;
export type BorderRadiusToken = keyof typeof borderRadius;
export type ShadowToken = keyof typeof shadows;
export type DurationToken = keyof typeof motion.duration;
export type EasingToken = keyof typeof motion.easing;
export type ZIndexToken = keyof typeof zIndex;
export type BreakpointToken = keyof typeof breakpoints;

/* ============================================
   CSS VARIABLE HELPERS
   ============================================ */

export const cssVars = {
  color: {
    brand: (scale: ColorScaleToken<'brand'>) => `var(--color-brand-${scale})`,
    primary: (scale: ColorScaleToken<'primary'>) => `var(--color-brand-${scale})`,
    neutral: (scale: ColorScaleToken<'neutral'>) => `var(--color-neutral-${scale})`,
    success: (scale: ColorScaleToken<'success'>) => `var(--color-success-${scale})`,
    warning: (scale: ColorScaleToken<'warning'>) => `var(--color-warning-${scale})`,
    danger: (scale: ColorScaleToken<'danger'>) => `var(--color-error-${scale})`,
    info: (scale: ColorScaleToken<'info'>) => `var(--color-info-${scale})`,
    surface: (variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'hover' | 'active' | 'disabled') =>
      `var(--color-surface-${variant})`,
    text: (variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'link-hover' | 'disabled') =>
      `var(--color-text-${variant})`,
    border: (variant: 'primary' | 'secondary' | 'focus' | 'error' | 'success' | 'warning') =>
      `var(--color-border-${variant})`,
    gpu: (status: 'idle' | 'low' | 'medium' | 'high' | 'critical' | 'offline' | 'unknown') =>
      `var(--color-gpu-${status})`,
    network: (status: 'healthy' | 'congested' | 'saturated' | 'down') =>
      `var(--color-network-${status})`,
  },
  spacing: (token: SpacingToken) => `var(--space-${token})`,
  spacingComponent: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => `var(--space-component-${size})`,
  spacingLayout: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => `var(--space-layout-${size})`,
  fontSize: (token: FontSizeToken) => `var(--font-size-${token})`,
  fontWeight: (token: FontWeightToken) => `var(--font-weight-${token})`,
  lineHeight: (token: LineHeightToken) => `var(--line-height-${token})`,
  borderRadius: (token: BorderRadiusToken) => `var(--radius-${token})`,
  shadow: (token: ShadowToken) => `var(--shadow-${token})`,
  duration: (token: DurationToken) => `var(--duration-${token})`,
  easing: (token: EasingToken) => `var(--ease-${token})`,
  zIndex: (token: ZIndexToken) => `var(--z-index-${token})`,
  breakpoint: (token: BreakpointToken) => `var(--breakpoint-${token})`,
} as const;

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

export function getColorToken(
  category: ColorToken,
  scale: ColorScaleToken<ColorToken>
): string {
  const categoryTokens = colors[category] as Record<string, string>;
  return categoryTokens[scale] ?? '';
}

export function getSpacingToken(token: SpacingToken): string {
  const value = spacing[token];
  return typeof value === 'string' ? value : '';
}

export function getFontSizeToken(token: FontSizeToken): string {
  return typography.fontSize[token] ?? '';
}

export function getShadowToken(token: ShadowToken): string {
  return shadows[token] ?? '';
}

export function getDurationToken(token: DurationToken): string {
  return motion.duration[token] ?? '';
}

export function getEasingToken(token: EasingToken): string {
  return motion.easing[token] ?? '';
}

/* ============================================
   THEME TYPES
   ============================================ */

export type Theme = 'light' | 'dark' | 'high-contrast' | 'auto';

export interface ThemeConfig {
  theme: Theme;
  respectSystemPreference: boolean;
  storageKey: string;
}

export const defaultThemeConfig: ThemeConfig = {
  theme: 'auto',
  respectSystemPreference: true,
  storageKey: 'gpu-dashboard-theme',
};

/* ============================================
   CSS-IN-JS HELPERS (for Framer Motion)
   ============================================ */

export function createMotionVariants<TVariants extends Record<string, CSSProperties>>(
  variants: TVariants
): TVariants {
  return variants;
}

export const commonTransitions = {
  fast: { duration: 0.1, ease: 'easeOut' },
  normal: { duration: 0.2, ease: 'easeOut' },
  slow: { duration: 0.3, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 500, damping: 20 },
} as const;

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: commonTransitions.normal },
  exit: { opacity: 0, transition: commonTransitions.fast },
} as const;

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: commonTransitions.normal },
  exit: { opacity: 0, y: -20, transition: commonTransitions.fast },
} as const;

export const slideDownVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: commonTransitions.normal },
  exit: { opacity: 0, y: 20, transition: commonTransitions.fast },
} as const;

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: commonTransitions.normal },
  exit: { opacity: 0, scale: 0.95, transition: commonTransitions.fast },
} as const;