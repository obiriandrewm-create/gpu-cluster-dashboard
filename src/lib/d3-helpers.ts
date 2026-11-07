import { scaleLinear, scaleTime, scaleOrdinal, scaleQuantize, scaleSequential, interpolateRdYlGn, interpolateViridis, interpolateInferno, easeCubic, easeQuad, transition } from 'd3';
import type { ScaleLinear, ScaleTime, ScaleOrdinal, ScaleQuantize, ScaleSequential, Transition } from 'd3';

export const HEALTH_COLORS = {
  healthy: '#10B981',
  degraded: '#F59E0B',
  critical: '#EF4444',
  unknown: '#6B7280',
  congested: '#F97316',
} as const;

export const HEALTH_COLOR_DOMAIN = ['healthy', 'degraded', 'critical', 'unknown'] as const;

export const LINK_TYPE_COLORS = {
  IB: '#3B82F6',
  RoCE: '#8B5CF6',
  Ethernet: '#06B6D4',
  NVLink: '#F59E0B',
} as const;

export const SEVERITY_COLORS = {
  info: '#3B82F6',
  warning: '#F59E0B',
  critical: '#EF4444',
} as const;

export function createHealthColorScale(): ScaleOrdinal<string, string, never> {
  return scaleOrdinal<string, string>()
    .domain(HEALTH_COLOR_DOMAIN)
    .range(Object.values(HEALTH_COLORS));
}

export function createLinkTypeColorScale(): ScaleOrdinal<string, string, never> {
  return scaleOrdinal<string, string>()
    .domain(Object.keys(LINK_TYPE_COLORS))
    .range(Object.values(LINK_TYPE_COLORS));
}

export function createSeverityColorScale(): ScaleOrdinal<string, string, never> {
  return scaleOrdinal<string, string>()
    .domain(Object.keys(SEVERITY_COLORS))
    .range(Object.values(SEVERITY_COLORS));
}

export function createUtilizationColorScale(): ScaleSequential<string, never> {
  return scaleSequential(interpolateRdYlGn).domain([1, 0]);
}

export function createTemperatureColorScale(): ScaleSequential<string, never> {
  return scaleSequential(interpolateInferno).domain([30, 90]);
}

export function createPowerColorScale(): ScaleSequential<string, never> {
  return scaleSequential(interpolateViridis).domain([0, 1]);
}

export function createCongestionColorScale(maxValue: number): ScaleQuantize<number, string, never> {
  return scaleQuantize<number, string>()
    .domain([0, maxValue])
    .range([
      '#F0FDF4',
      '#DCFCE7',
      '#BBF7D0',
      '#86EFAC',
      '#4ADE80',
      '#22C55E',
      '#16A34A',
      '#15803D',
      '#166534',
      '#14532D',
    ]);
}

export function createLinearScale(
  domain: [number, number],
  range: [number, number]
): ScaleLinear<number, number, never> {
  return scaleLinear().domain(domain).range(range).clamp(true);
}

export function createTimeScale(
  domain: [Date, Date],
  range: [number, number]
): ScaleTime<number, number, never> {
  return scaleTime().domain(domain).range(range).clamp(true);
}

export function createTransition(
  duration = 300,
  ease = easeCubic
): Transition<unknown, unknown, unknown, unknown> {
  return transition().duration(duration).ease(ease);
}

export function createStaggeredTransition(
  baseDelay = 50,
  duration = 300,
  ease = easeCubic
): Transition<unknown, unknown, unknown, unknown> {
  return transition().duration(duration).ease(ease).delay((_, i) => i * baseDelay);
}

export const CHART_MARGINS = {
  default: { top: 8, right: 12, bottom: 24, left: 40 },
  sparkline: { top: 4, right: 4, bottom: 4, left: 4 },
  heatmap: { top: 24, right: 12, bottom: 8, left: 40 },
  network: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

export const EASING_FUNCTIONS = {
  cubic: easeCubic,
  quad: easeQuad,
  linear: (t: number) => t,
} as const;

export function formatSI(value: number, precision = 2): string {
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  const tier = Math.max(0, Math.min(Math.floor(Math.log10(Math.abs(value)) / 3), units.length - 1));
  const scaled = value / Math.pow(1000, tier);
  return `${scaled.toFixed(precision)}${units[tier]}`;
}

export function formatBytesSI(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const tier = Math.max(0, Math.min(Math.floor(Math.log2(bytes) / 10), units.length - 1));
  return `${(bytes / Math.pow(1024, tier)).toFixed(1)} ${units[tier]}`;
}

export function formatBps(bps: number): string {
  if (bps === 0) return '0 bps';
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
  const tier = Math.max(0, Math.min(Math.floor(Math.log10(bps) / 3), units.length - 1));
  return `${(bps / Math.pow(1000, tier)).toFixed(1)} ${units[tier]}`;
}

export function formatLatency(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)} µs`;
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function interpolateColor(
  color1: string,
  color2: string,
  t: number
): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}