/**
 * useThreeScene - Three.js scene lifecycle management hook
 * Handles scene creation, resize, animation loop, and cleanup
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import {
  createRenderer,
  createOrthographicCamera,
  createScene,
  createGPUInstancedMesh,
  updateGPUInstancedMesh,
  disposeThreeResources,
  createGPURaycaster,
  GPUCellData,
  InstancedMeshConfig,
  ThreeSceneConfig,
} from '@/lib/three-helpers';

export interface UseThreeSceneOptions {
  /** Canvas ref */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Container dimensions */
  width: number;
  height: number;
  /** GPU cell data */
  cells: GPUCellData[];
  /** Color encoding mode */
  colorMode: 'health' | 'utilization' | 'temperature';
  /** Grid dimensions */
  gridWidth: number;
  gridHeight: number;
  /** Cell size */
  cellSize: number;
  /** Cell gap */
  cellGap: number;
  /** Fisheye enabled */
  fisheyeEnabled: boolean;
  /** Fisheye focus point */
  fisheyeFocus?: { x: number; y: number } | undefined;
  /** Fisheye radius */
  fisheyeRadius?: number | undefined;
  /** Fisheye strength */
  fisheyeStrength?: number | undefined;
  /** Animation frame callback */
  onAnimationFrame?: (delta: number) => void;
  /** Whether to auto-start animation */
  autoStart?: boolean;
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
}

export interface UseThreeSceneReturn {
  /** Three.js scene */
  scene: THREE.Scene | null;
  /** Camera */
  camera: THREE.OrthographicCamera | null;
  /** Renderer */
  renderer: THREE.WebGLRenderer | null;
  /** Instanced mesh */
  mesh: THREE.InstancedMesh | null;
  /** Current FPS */
  fps: number;
  /** Start animation loop */
  start: () => void;
  /** Stop animation loop */
  stop: () => void;
  /** Resize renderer and camera */
  resize: (width: number, height: number) => void;
  /** Update cell data */
  updateCells: (cells: GPUCellData[]) => void;
  /** Update color mode */
  updateColorMode: (mode: 'health' | 'utilization' | 'temperature') => void;
  /** Update fisheye settings */
  updateFisheye: (enabled: boolean, focus?: { x: number; y: number }, radius?: number, strength?: number) => void;
  /** Raycaster for picking */
  raycaster: THREE.Raycaster | null;
}

/**
 * Custom hook for managing Three.js scene lifecycle
 */
export function useThreeScene(options: UseThreeSceneOptions): UseThreeSceneReturn {
  const {
    canvasRef,
    width,
    height,
    cells,
    colorMode,
    gridWidth,
    gridHeight,
    cellSize,
    cellGap,
    fisheyeEnabled,
    fisheyeFocus,
    fisheyeRadius,
    fisheyeStrength,
    onAnimationFrame,
    autoStart = true,
    respectReducedMotion = true,
  } = options;

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsUpdateTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const reducedMotionRef = useRef<boolean>(false);

  // State for FPS display
  const [fps, setFps] = useState(0);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (!respectReducedMotion) return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mediaQuery.matches;
    
    const handler = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches && isRunningRef.current) {
        stop();
      } else if (!event.matches && autoStart && !isRunningRef.current) {
        start();
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [respectReducedMotion, autoStart]);

  // Initialize Three.js scene
  const initialize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create renderer
    const rendererConfig: ThreeSceneConfig = {
      canvas,
      width,
      height,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      backgroundColor: 0x0a0a0a,
      shadows: false,
    };
    const renderer = createRenderer(rendererConfig);
    rendererRef.current = renderer;

    // Create scene
    const scene = createScene(0x0a0a0a);
    sceneRef.current = scene;

    // Create camera
    const aspect = width / height;
    const camera = createOrthographicCamera({
      aspect,
      position: new THREE.Vector3(0, 0, 100),
      target: new THREE.Vector3(0, 0, 0),
    });
    cameraRef.current = camera;

    // Create instanced mesh
    const meshConfig: InstancedMeshConfig = {
      count: cells.length,
      cellSize,
      cellGap,
      gridWidth,
      gridHeight,
      colorMode,
      fisheyeEnabled,
      fisheyeFocus: fisheyeFocus ?? { x: 0.5, y: 0.5 },
      fisheyeRadius: fisheyeRadius ?? 0.3,
      fisheyeStrength: fisheyeStrength ?? 2.0,
    };
    const mesh = createGPUInstancedMesh(meshConfig);
    scene.add(mesh);
    meshRef.current = mesh;

    // Create raycaster
    const raycaster = createGPURaycaster(camera, canvas);
    raycasterRef.current = raycaster;

    // Initial cell update
    if (cells.length > 0) {
      updateGPUInstancedMesh(mesh, cells, colorMode, gridWidth, gridHeight, cellSize, cellGap);
    }

    // Initial render
    renderer.render(scene, camera);
  }, [
    canvasRef,
    width,
    height,
    cells,
    colorMode,
    gridWidth,
    gridHeight,
    cellSize,
    cellGap,
    fisheyeEnabled,
    fisheyeFocus,
    fisheyeRadius,
    fisheyeStrength,
  ]);

  // Animation loop
  const animate = useCallback((time: number) => {
    if (!isRunningRef.current) return;
    
    // Check reduced motion
    if (reducedMotionRef.current) {
      stop();
      return;
    }

    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Update FPS counter
    frameCountRef.current++;
    if (time - fpsUpdateTimeRef.current >= 1000) {
      fpsRef.current = frameCountRef.current;
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      fpsUpdateTimeRef.current = time;
    }

    // Update shader time uniform
    const mesh = meshRef.current;
    if (mesh && mesh.material) {
      const material = mesh.material as THREE.ShaderMaterial;
      if (material.uniforms.uTime) {
        material.uniforms.uTime.value = time * 0.001;
      }
      if (material.uniforms.uStragglerHighlight) {
        material.uniforms.uStragglerHighlight.value = time * 0.001;
      }
    }

    // Call custom animation callback
    if (onAnimationFrame) {
      onAnimationFrame(delta);
    }

    // Render
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }

    // Continue animation loop
    animationIdRef.current = requestAnimationFrame(animate);
  }, [onAnimationFrame]);

  // Start animation loop
  const start = useCallback(() => {
    if (isRunningRef.current || reducedMotionRef.current) return;
    isRunningRef.current = true;
    lastTimeRef.current = performance.now();
    fpsUpdateTimeRef.current = performance.now();
    animationIdRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // Stop animation loop
  const stop = useCallback(() => {
    if (!isRunningRef.current) return;
    isRunningRef.current = false;
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  // Resize handler
  const resize = useCallback((newWidth: number, newHeight: number) => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    
    if (renderer && camera) {
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      const aspect = newWidth / newHeight;
      const frustumSize = 100;
      
      camera.left = (-frustumSize * aspect) / 2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
    }
  }, []);

  // Update cells
  const updateCells = useCallback((newCells: GPUCellData[]) => {
    const mesh = meshRef.current;
    if (mesh) {
      updateGPUInstancedMesh(
        mesh,
        newCells,
        colorMode,
        gridWidth,
        gridHeight,
        cellSize,
        cellGap
      );
    }
  }, [colorMode, gridWidth, gridHeight, cellSize, cellGap]);

  // Update color mode
  const updateColorMode = useCallback((mode: 'health' | 'utilization' | 'temperature') => {
    const mesh = meshRef.current;
    if (mesh && mesh.material) {
      const material = mesh.material as THREE.ShaderMaterial;
      if (material.uniforms.uColorMode) {
        // 0 = health, 1 = utilization, 2 = temperature
        const modeIndex = mode === 'health' ? 0 : mode === 'utilization' ? 1 : 2;
        material.uniforms.uColorMode.value = modeIndex;
      }
    }
  }, []);

  // Update fisheye settings
  const updateFisheye = useCallback((
    enabled: boolean,
    focus?: { x: number; y: number },
    radius?: number,
    strength?: number
  ) => {
    const mesh = meshRef.current;
    if (mesh && mesh.material) {
      const material = mesh.material as THREE.ShaderMaterial;
      if (material.uniforms.uFisheyeEnabled) {
        material.uniforms.uFisheyeEnabled.value = enabled ? 1.0 : 0.0;
      }
      if (focus && material.uniforms.uFisheyeFocus) {
        material.uniforms.uFisheyeFocus.value.set(focus.x, focus.y);
      }
      if (radius !== undefined && material.uniforms.uFisheyeRadius) {
        material.uniforms.uFisheyeRadius.value = radius;
      }
      if (strength !== undefined && material.uniforms.uFisheyeStrength) {
        material.uniforms.uFisheyeStrength.value = strength;
      }
    }
  }, []);

  // Initialize on mount and when key dependencies change
  useEffect(() => {
    initialize();
    
    return () => {
      stop();
      disposeThreeResources(
        rendererRef.current,
        sceneRef.current,
        meshRef.current,
        cameraRef.current
      );
      rendererRef.current = null;
      sceneRef.current = null;
      meshRef.current = null;
      cameraRef.current = null;
      raycasterRef.current = null;
    };
  }, [initialize, stop]);

  // Auto-start animation
  useEffect(() => {
    if (autoStart && !reducedMotionRef.current) {
      start();
    }
    return () => stop();
  }, [autoStart, start, stop]);

  // Update cells when they change
  useEffect(() => {
    if (cells.length > 0) {
      updateCells(cells);
    }
  }, [cells, updateCells]);

  // Update color mode when it changes
  useEffect(() => {
    updateColorMode(colorMode);
  }, [colorMode, updateColorMode]);

  // Update fisheye when settings change
  useEffect(() => {
    updateFisheye(fisheyeEnabled, fisheyeFocus, fisheyeRadius, fisheyeStrength);
  }, [fisheyeEnabled, fisheyeFocus, fisheyeRadius, fisheyeStrength, updateFisheye]);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    mesh: meshRef.current,
    fps,
    start,
    stop,
    resize,
    updateCells,
    updateColorMode,
    updateFisheye,
    raycaster: raycasterRef.current,
  };
}

// Re-export utilities for consumers
export type { GPUCellData } from '@/lib/three-helpers';
export { createGPURaycaster, getNormalizedCoords, pickGPUCell } from '@/lib/three-helpers';