/**
 * useAnimation - Framer Motion and GSAP integration hooks
 * Provides animation utilities respecting prefers-reduced-motion
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// GSAP types (avoiding direct import for bundle size)
interface GSAPTween {
  kill(): void;
  pause(): void;
  resume(): void;
  progress(value: number): GSAPTween;
  timeScale(value: number): GSAPTween;
  eventCallback(type: string, callback?: () => void): GSAPTween | (() => void) | undefined;
}

interface GSAPTimeline {
  to(target: any, vars: any, position?: any): GSAPTween;
  from(target: any, vars: any, position?: any): GSAPTween;
  fromTo(target: any, fromVars: any, toVars: any, position?: any): GSAPTween;
  add(tween: GSAPTween, position?: any): GSAPTimeline;
  kill(): void;
  pause(): void;
  resume(): void;
  progress(value: number): GSAPTimeline;
  timeScale(value: number): GSAPTimeline;
  duration(): number;
  totalDuration(): number;
}

interface GSAPStatic {
  to(target: any, vars: any): GSAPTween;
  from(target: any, vars: any): GSAPTween;
  fromTo(target: any, fromVars: any, toVars: any): GSAPTween;
  timeline(vars?: any): GSAPTimeline;
  set(target: any, vars: any): GSAPTween;
  killTweensOf(target: any): void;
  globalTimeline: GSAPTimeline;
  config(vars: any): void;
  registerPlugin(plugin: any): void;
}

let gsap: GSAPStatic | null = null;

/**
 * Lazily load GSAP
 */
async function loadGSAP(): Promise<GSAPStatic | null> {
  if (gsap) return gsap;
  try {
    const module = await import('gsap');
    gsap = module.gsap as GSAPStatic;
    
    // Configure GSAP for performance
    gsap.config({
      autoSleep: 120,
      force3D: 'auto',
      nullTargetWarn: false,
      trialWarn: false,
    });
    
    return gsap;
  } catch {
    return null;
  }
}

/**
 * Options for useAnimation hook
 */
export interface UseAnimationOptions {
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
  /** Default duration for animations (ms) */
  defaultDuration?: number;
  /** Default ease */
  defaultEase?: string;
}

/**
 * Return type for useAnimation hook
 */
export interface UseAnimationReturn {
  /** Whether reduced motion is preferred */
  reducedMotion: boolean;
  /** Animate a value using GSAP */
  animate: (target: any, vars: any, duration?: number, ease?: string) => Promise<GSAPTween | null>;
  /** Create a timeline */
  createTimeline: (vars?: any) => Promise<GSAPTimeline | null>;
  /** Animate from current state */
  animateFrom: (target: any, fromVars: any, toVars: any, duration?: number, ease?: string) => Promise<GSAPTween | null>;
  /** Set values immediately */
  set: (target: any, vars: any) => void;
  /** Kill all animations on target */
  kill: (target: any) => void;
  /** Pause all animations */
  pauseAll: () => void;
  /** Resume all animations */
  resumeAll: () => void;
}

/**
 * Hook for GSAP/Framer Motion animations
 * Respects prefers-reduced-motion automatically
 */
export function useAnimation(options: UseAnimationOptions = {}): UseAnimationReturn {
  const {
    respectReducedMotion = true,
    defaultDuration = 300,
    defaultEase = 'power2.out',
  } = options;

  const reducedMotion = useReducedMotion();
  const shouldReduceMotion = Boolean(respectReducedMotion && reducedMotion);
  const animationRefs = useRef<Map<any, GSAPTween>>(new Map());

  // Animate using GSAP
  const animate = useCallback(async (
    target: any,
    vars: any,
    duration = defaultDuration,
    ease = defaultEase
  ): Promise<GSAPTween | null> => {
    if (shouldReduceMotion) {
      // Apply final values immediately
      Object.assign(target, vars);
      return null;
    }

    const gsapInstance = await loadGSAP();
    if (!gsapInstance) return null;

    const tween = gsapInstance.to(target, {
      ...vars,
      duration: duration / 1000,
      ease,
    });

    // Track for cleanup
    animationRefs.current.set(target, tween);

    // Clean up on complete
    tween.eventCallback('onComplete', () => {
      animationRefs.current.delete(target);
    });

    return tween;
  }, [shouldReduceMotion, defaultDuration, defaultEase]);

  // Animate from specific values
  const animateFrom = useCallback(async (
    target: any,
    fromVars: any,
    toVars: any,
    duration = defaultDuration,
    ease = defaultEase
  ): Promise<GSAPTween | null> => {
    if (shouldReduceMotion) {
      Object.assign(target, toVars);
      return null;
    }

    const gsapInstance = await loadGSAP();
    if (!gsapInstance) return null;

    const tween = gsapInstance.fromTo(target, fromVars, {
      ...toVars,
      duration: duration / 1000,
      ease,
    });

    animationRefs.current.set(target, tween);
    tween.eventCallback('onComplete', () => {
      animationRefs.current.delete(target);
    });

    return tween;
  }, [shouldReduceMotion, defaultDuration, defaultEase]);

  // Create timeline
  const createTimeline = useCallback(async (vars?: any): Promise<GSAPTimeline | null> => {
    if (shouldReduceMotion) return null;

    const gsapInstance = await loadGSAP();
    if (!gsapInstance) return null;

    return gsapInstance.timeline(vars);
  }, [shouldReduceMotion]);

  // Set values immediately
  const set = useCallback((target: any, vars: any) => {
    Object.assign(target, vars);
  }, []);

  // Kill animations on target
  const kill = useCallback((target: any) => {
    const tween = animationRefs.current.get(target);
    if (tween) {
      tween.kill();
      animationRefs.current.delete(target);
    }
  }, []);

  // Pause all tracked animations
  const pauseAll = useCallback(() => {
    animationRefs.current.forEach((tween) => {
      tween.pause();
    });
  }, []);

  // Resume all tracked animations
  const resumeAll = useCallback(() => {
    animationRefs.current.forEach((tween) => {
      tween.resume();
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRefs.current.forEach((tween) => {
        tween.kill();
      });
      animationRefs.current.clear();
    };
  }, []);

  return {
    reducedMotion: shouldReduceMotion,
    animate,
    createTimeline,
    animateFrom,
    set,
    kill,
    pauseAll,
    resumeAll,
  };
}

/**
 * Hook for scroll-triggered animations using GSAP ScrollTrigger
 */
export interface UseScrollAnimationOptions {
  /** Trigger element */
  trigger: Element | string;
  /** Start position */
  start?: string;
  /** End position */
  end?: string;
  /** Scrub value */
  scrub?: number | boolean;
  /** Pin element */
  pin?: boolean;
  /** Animation to trigger */
  animation?: GSAPTimeline | (() => GSAPTimeline);
  /** Respect reduced motion */
  respectReducedMotion?: boolean;
}

export interface UseScrollAnimationReturn {
  /** Refresh ScrollTrigger */
  refresh: () => void;
  /** Kill ScrollTrigger */
  kill: () => void;
  /** Enable/disable */
  enable: (enabled: boolean) => void;
}

let ScrollTrigger: any = null;

async function loadScrollTrigger(): Promise<any> {
  if (ScrollTrigger) return ScrollTrigger;
  try {
    const gsapInstance = await loadGSAP();
    if (!gsapInstance) return null;
    
    const module = await import('gsap/ScrollTrigger');
    ScrollTrigger = module.ScrollTrigger;
    gsapInstance.registerPlugin(ScrollTrigger);
    return ScrollTrigger;
  } catch {
    return null;
  }
}

export function useScrollAnimation(
  options: UseScrollAnimationOptions
): UseScrollAnimationReturn {
  const {
    trigger,
    start = 'top bottom',
    end = 'bottom top',
    scrub = 1,
    pin = false,
    animation,
    respectReducedMotion = true,
  } = options;

  const reducedMotion = useReducedMotion();
  const shouldReduceMotion = Boolean(respectReducedMotion && reducedMotion);
  const scrollTriggerRef = useRef<any>(null);

  const refresh = useCallback(async () => {
    const st = await loadScrollTrigger();
    if (st && scrollTriggerRef.current) {
      scrollTriggerRef.current.refresh();
    }
  }, []);

  const kill = useCallback(async () => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }
  }, []);

  const enable = useCallback(async (enabled: boolean) => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.enable(enabled);
    }
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const setup = async () => {
      const st = await loadScrollTrigger();
      if (!st) return;

      const triggerEl = typeof trigger === 'string' 
        ? document.querySelector(trigger) 
        : trigger;
      
      if (!triggerEl) return;

      let tl: GSAPTimeline | null = null;
      if (typeof animation === 'function') {
        tl = animation();
      } else {
        tl = animation ?? null;
      }

      scrollTriggerRef.current = st.create({
        trigger: triggerEl,
        start,
        end,
        scrub,
        pin,
        animation: tl ?? undefined,
      });
    };

    setup();

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [trigger, start, end, scrub, pin, animation, shouldReduceMotion]);

  return { refresh, kill, enable };
}

/**
 * Hook for FLIP animations (First, Last, Invert, Play)
 * Uses GSAP Flip plugin
 */
export interface UseFlipOptions {
  /** Target elements */
  targets: Element | Element[];
  /** Respect reduced motion */
  respectReducedMotion?: boolean;
}

export interface UseFlipReturn {
  /** Record initial state */
  record: () => void;
  /** Play FLIP animation */
  play: (vars?: any) => Promise<GSAPTween | null>;
  /** Kill FLIP */
  kill: () => void;
}

let Flip: any = null;

async function loadFlip(): Promise<any> {
  if (Flip) return Flip;
  try {
    const gsapInstance = await loadGSAP();
    if (!gsapInstance) return null;
    
    const module = await import('gsap/Flip');
    Flip = module.Flip;
    gsapInstance.registerPlugin(Flip);
    return Flip;
  } catch {
    return null;
  }
}

export function useFlip(options: UseFlipOptions): UseFlipReturn {
  const { targets, respectReducedMotion = true } = options;
  const reducedMotion = useReducedMotion();
  const shouldReduceMotion = Boolean(respectReducedMotion && reducedMotion);
  const flipStateRef = useRef<any>(null);

  const record = useCallback(async () => {
    if (shouldReduceMotion) return;
    
    const flip = await loadFlip();
    if (!flip) return;

    flipStateRef.current = flip.getState(targets);
  }, [targets, shouldReduceMotion]);

  const play = useCallback(async (vars: any = {}): Promise<GSAPTween | null> => {
    if (shouldReduceMotion || !flipStateRef.current) return null;

    const flip = await loadFlip();
    if (!flip) return null;

    return flip.from(flipStateRef.current, {
      duration: (vars.duration ?? 300) / 1000,
      ease: vars.ease ?? 'power2.inOut',
      ...vars,
    });
  }, [shouldReduceMotion]);

  const kill = useCallback(() => {
    flipStateRef.current = null;
  }, []);

  return { record, play, kill };
}

/**
 * Spring animation hook using GSAP
 */
export interface UseSpringOptions {
  /** Initial value */
  initialValue: number;
  /** Target value */
  targetValue: number;
  /** Spring stiffness */
  stiffness?: number;
  /** Spring damping */
  damping?: number;
  /** Mass */
  mass?: number;
  /** Respect reduced motion */
  respectReducedMotion?: boolean;
  /** Callback on update */
  onUpdate?: (value: number) => void;
}

export function useSpring(options: UseSpringOptions): { value: number; setTarget: (value: number) => void } {
  const {
    initialValue,
    targetValue,
    stiffness: _stiffness = 100,
    damping: _damping = 10,
    mass: _mass = 1,
    respectReducedMotion = true,
    onUpdate,
  } = options;

  const reducedMotion = useReducedMotion();
  const shouldReduceMotion = Boolean(respectReducedMotion && reducedMotion);
  const [value, setValue] = useState(initialValue);
  const animationRef = useRef<GSAPTween | null>(null);
  const targetRef = useRef(targetValue);

  // Update target
  const setTarget = useCallback((newTarget: number) => {
    targetRef.current = newTarget;
    
    if (shouldReduceMotion) {
      setValue(newTarget);
      onUpdate?.(newTarget);
      return;
    }

    // Animate to new target using GSAP
    loadGSAP().then((gsapInstance) => {
      if (!gsapInstance) return;
      
      if (animationRef.current) {
        animationRef.current.kill();
      }

      const obj = { value };
      animationRef.current = gsapInstance.to(obj, {
        value: newTarget,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        onUpdate: () => {
          setValue(obj.value);
          onUpdate?.(obj.value);
        },
      });
    });
  }, [shouldReduceMotion, onUpdate]);

  // Update when targetValue prop changes
  useEffect(() => {
    if (targetValue !== targetRef.current) {
      setTarget(targetValue);
    }
  }, [targetValue, setTarget]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  return { value, setTarget };
}