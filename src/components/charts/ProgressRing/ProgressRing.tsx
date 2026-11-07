import React, { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './ProgressRing.module.css';

export interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  animate?: boolean;
  animationDuration?: number;
  className?: string;
  ariaLabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 80,
  strokeWidth = 6,
  trackColor = 'var(--color-neutral-200)',
  progressColor = 'var(--color-primary-500)',
  showValue = true,
  valueFormat = (v) => `${Math.round(v)}%`,
  animate = true,
  animationDuration = 1000,
  className,
  ariaLabel = 'Progress ring',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const clampedProgress = useMemo(() => Math.max(0, Math.min(100, progress)), [progress]);
  const offset = useMemo(() => circumference * (1 - clampedProgress / 100), [circumference, clampedProgress]);

  useEffect(() => {
    if (!circleRef.current) return;
    const circle = circleRef.current;

    if (animate) {
      circle.style.transition = `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    } else {
      circle.style.transition = 'none';
    }

    circle.style.strokeDashoffset = String(offset);
  }, [offset, animate, animationDuration]);

  const getProgressColor = () => {
    if (clampedProgress < 30) return 'var(--color-danger-500)';
    if (clampedProgress < 70) return 'var(--color-warning-500)';
    return progressColor;
  };

  return (
    <div className={cn(styles.container, className)} style={{ width: size, height: size }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        role="img"
        aria-label={ariaLabel}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          className={styles.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          className={styles.progress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease' }}
        />
      </svg>
      {showValue && (
        <div className={styles.value} style={{ fontSize: size * 0.18 }}>
          {valueFormat(clampedProgress)}
        </div>
      )}
    </div>
  );
};