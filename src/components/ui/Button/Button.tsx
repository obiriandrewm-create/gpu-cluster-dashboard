import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonLoadingPosition = 'left' | 'right' | 'center';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingPosition?: ButtonLoadingPosition;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingPosition = 'left',
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      style,
      whileHover,
      whileTap,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          loading && styles.loading,
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        style={style ?? {}}
        whileHover={whileHover ?? { scale: isDisabled ? 1 : 1.02 }}
        whileTap={whileTap ?? { scale: isDisabled ? 1 : 0.98 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        {...props}
      >
        {loading && (
          <span
            className={cn(styles.spinner, styles[`spinner-${loadingPosition}`])}
            aria-hidden="true"
          >
            <svg
              className={styles.spinnerSvg}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                className={styles.spinnerCircle}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </span>
        )}
        {!loading && leftIcon && <span className={styles.leftIcon} aria-hidden="true">{leftIcon}</span>}
        <span className={cn(styles.content, loading && styles.contentLoading)}>
          {children}
        </span>
        {!loading && rightIcon && <span className={styles.rightIcon} aria-hidden="true">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

/* ============================================
   Compound Components
   ============================================ */

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ariaLabel?: string;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, ariaLabel, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className={cn(styles.group, className)}
      {...props}
    >
      {children}
    </div>
  )
);

ButtonGroup.displayName = 'ButtonGroup';

export interface ButtonToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ariaLabel?: string;
}

export const ButtonToolbar = forwardRef<HTMLDivElement, ButtonToolbarProps>(
  ({ children, className, ariaLabel, ...props }, ref) => (
    <div
      ref={ref}
      role="toolbar"
      aria-label={ariaLabel}
      className={cn(styles.toolbar, className)}
      {...props}
    >
      {children}
    </div>
  )
);

ButtonToolbar.displayName = 'ButtonToolbar';