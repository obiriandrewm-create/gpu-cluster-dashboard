import { cn } from '@/lib/utils';
import type React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => (
  <span
    className={cn(styles.badge, styles[variant], styles[size], dot && styles.dot, className)}
    {...props}
  >
    {dot && <span className={styles.dotIndicator} aria-hidden='true' />}
    {children}
  </span>
);
