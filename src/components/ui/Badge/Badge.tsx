import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
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
    className={cn(
      styles.badge,
      styles[variant],
      styles[size],
      dot && styles.dot,
      className
    )}
    {...props}
  >
    {dot && <span className={styles.dotIndicator} aria-hidden="true" />}
    {children}
  </span>
);