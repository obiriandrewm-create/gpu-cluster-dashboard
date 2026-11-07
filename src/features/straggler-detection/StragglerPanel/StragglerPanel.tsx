import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TimelineChart } from '@/components/charts/TimelineChart';
import { ProgressRing } from '@/components/charts/ProgressRing';

import styles from './StragglerPanel.module.css';

export interface StragglerPanelProps {
  straggler: {
    gpuId: string;
    nodeId: string;
    score: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    firstDetected: string;
    lastUpdate: string;
    metrics: {
      utilization: number;
      memoryUtilization: number;
      temperature: number;
      powerDraw: number;
      clockThrottle: number;
    };
    timeline: Array<{
      timestamp: string;
      score: number;
      eventType: 'detected' | 'escalated' | 'resolved' | 'updated';
      details: string;
    }>;
  };
  onDrillDown?: (gpuId: string) => void;
  className?: string;
}

const severityColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

const severityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const StragglerPanel: React.FC<StragglerPanelProps> = ({
  straggler,
  onDrillDown,
  className,
}) => {
  const timelineData = useMemo(() => straggler.timeline.map((event, _index) => ({
    timestamp: event.timestamp,
    value: event.score,
    label: `${event.eventType}: ${event.details}`,
    metadata: { eventType: event.eventType, details: event.details },
  })), [straggler.timeline]);

  const getSeverityColor = (score: number) => {
    if (score >= 80) return 'var(--color-danger-500)';
    if (score >= 60) return 'var(--color-warning-500)';
    if (score >= 40) return 'var(--color-info-500)';
    return 'var(--color-success-500)';
  };

  return (
    <div className={styles.container}>
      <Card variant="elevated" padding="lg" className={className}>
        <CardHeader>
          <div className={styles.header}>
            <div className={styles.gpuInfo}>
              <h3 className={styles.gpuId}>{straggler.gpuId}</h3>
              <span className={styles.nodeId}>Node: {straggler.nodeId}</span>
            </div>
            <div className={styles.severity}>
              <Badge variant={severityColors[straggler.severity] ?? 'info'} dot size="md">
                {severityLabels[straggler.severity] ?? 'Unknown'}
              </Badge>
              <ProgressRing
                progress={straggler.score}
                size={56}
                strokeWidth={5}
                showValue
                valueFormat={(v) => `${Math.round(v)}`}
                progressColor={getSeverityColor(straggler.score)}
                trackColor="var(--color-neutral-200)"
                ariaLabel={`Straggler score ${Math.round(straggler.score)} out of 100`}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className={styles.reason}>
            <span className={styles.reasonLabel}>Primary Reason:</span>
            <span className={styles.reasonText}>{straggler.reason}</span>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Utilization</span>
              <span className={styles.metricValue}>{straggler.metrics.utilization.toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Memory</span>
              <span className={styles.metricValue}>{straggler.metrics.memoryUtilization.toFixed(1)}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Temperature</span>
              <span className={styles.metricValue}>{straggler.metrics.temperature.toFixed(0)}°C</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Power Draw</span>
              <span className={styles.metricValue}>{straggler.metrics.powerDraw.toFixed(0)}W</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Clock Throttle</span>
              <span className={styles.metricValue}>{straggler.metrics.clockThrottle.toFixed(1)}%</span>
            </div>
          </div>

          <div className={styles.timeline}>
            <h4 className={styles.sectionTitle}>Score Timeline</h4>
            <TimelineChart
              data={timelineData}
              xAccessor={(d) => new Date(d.timestamp)}
              yAccessor={(d) => d.value}
              height={150}
              showArea
              showPoints
              lineColor={getSeverityColor(straggler.score)}
              areaColor={getSeverityColor(straggler.score)}
              pointColor={getSeverityColor(straggler.score)}
              yAxisFormat={(v) => `${v}`}
              ariaLabel={`Straggler score timeline for ${straggler.gpuId}`}
            />
          </div>

          <div className={styles.events}>
            <h4 className={styles.sectionTitle}>Recent Events</h4>
            <div className={styles.eventList}>
              {straggler.timeline.slice(-5).reverse().map((event, index) => (
                <div key={index} className={styles.event}>
                  <span className={styles.eventTime}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={styles.eventType}>{event.eventType}</span>
                  <span className={styles.eventDetails}>{event.details}</span>
                </div>
              ))}
            </div>
          </div>

          {onDrillDown && (
            <button
              className={styles.drillDownBtn}
              onClick={() => onDrillDown(straggler.gpuId)}
            >
              Drill Down →
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};