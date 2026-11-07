import { z } from 'zod';

export const AlertSchema = z.object({
  id: z.string().uuid(),
  severity: z.enum(['info', 'warning', 'critical']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  source: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  acknowledged: z.boolean(),
  acknowledgedBy: z.string().optional(),
  acknowledgedAt: z.string().datetime().optional(),
});

export const AlertAcknowledgeSchema = z.object({
  alertId: z.string().uuid(),
  acknowledgedBy: z.string().min(1).max(100),
});

export const AlertsResponseSchema = z.object({
  alerts: z.array(AlertSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const SSEEventSchema = z.object({
  type: z.enum(['alert_created', 'alert_updated', 'alert_acknowledged', 'heartbeat']),
  payload: z.unknown(),
  timestamp: z.string().datetime(),
});

export type Alert = z.infer<typeof AlertSchema>;
export type AlertAcknowledge = z.infer<typeof AlertAcknowledgeSchema>;
export type AlertsResponse = z.infer<typeof AlertsResponseSchema>;
export type SSEEvent = z.infer<typeof SSEEventSchema>;

export interface SSEConnectionConfig {
  endpoint: string;
  reconnectInterval: number;
  maxReconnectInterval: number;
  maxReconnectAttempts: number;
  onMessage: (event: SSEEvent) => void;
  onError: (error: Error) => void;
  onOpen: () => void;
  onClose: () => void;
}

export interface AlertFilters {
  severity?: Alert['severity'][];
  acknowledged?: boolean;
  source?: string[];
  timeRange?: { start: string; end: string };
  search?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface AlertsQueryParams extends AlertFilters, PaginationParams {}
