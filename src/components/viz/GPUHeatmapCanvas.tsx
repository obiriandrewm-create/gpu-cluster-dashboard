/**
 * GPUHeatmapCanvas - Three.js/WebGL Canvas Component
 * Renders 100K+ GPU cells at 60fps using instanced rendering
 */

import { useAnimation } from '@/hooks/useAnimation';
import {
  type GPUCellData,
  getNormalizedCoords,
  pickGPUCell,
  useThreeScene,
} from '@/hooks/useThreeScene';
import React, { useRef, useEffect, useCallback, useState, useImperativeHandle } from 'react';
import styles from './GPUHeatmapCanvas.module.css';

export interface GPUHeatmapCanvasProps {
  /** GPU cell data */
  cells: GPUCellData[];
  /** Color encoding mode */
  colorMode: 'health' | 'utilization' | 'temperature';
  /** Grid width */
  gridWidth: number;
  /** Grid height */
  gridHeight: number;
  /** Cell size in world units */
  cellSize?: number;
  /** Gap between cells */
  cellGap?: number;
  /** Enable fisheye focus+context */
  fisheyeEnabled?: boolean;
  /** Fisheye focus point (normalized 0-1) */
  fisheyeFocus?: { x: number; y: number };
  /** Fisheye radius (normalized 0-1) */
  fisheyeRadius?: number;
  /** Fisheye strength */
  fisheyeStrength?: number;
  /** Callback when GPU is hovered */
  onGPUHover?: (gpu: GPUCellData | null, screenPos: { x: number; y: number }) => void;
  /** Callback when GPU is clicked */
  onGPUClick?: (gpu: GPUCellData, screenPos: { x: number; y: number }) => void;
  /** Canvas className */
  className?: string;
  /** Canvas style */
  style?: React.CSSProperties;
  /** Show FPS counter */
  showFPS?: boolean;
  /** Show color legend */
  showLegend?: boolean;
  /** Custom legend labels */
  legendLabels?: {
    health: { min: string; max: string };
    utilization: { min: string; max: string };
    temperature: { min: string; max: string };
  };
  /** Enable zoom/pan */
  enableZoomPan?: boolean;
  /** Min zoom level */
  minZoom?: number;
  /** Max zoom level */
  maxZoom?: number;
}

/**
 * Default legend labels
 */
const DEFAULT_LEGEND_LABELS = {
  health: { min: 'Critical', max: 'Healthy' },
  utilization: { min: '0%', max: '100%' },
  temperature: { min: 'Cool', max: 'Hot' },
};

/**
 * Color stops for gradients
 */
const COLOR_STOPS = {
  health: [
    { offset: 0, color: '#ef4444' }, // Red - critical
    { offset: 0.5, color: '#f59e0b' }, // Yellow - degraded
    { offset: 1, color: '#22c55e' }, // Green - healthy
  ],
  utilization: [
    { offset: 0, color: '#22c55e' }, // Green - idle
    { offset: 0.5, color: '#f59e0b' }, // Yellow - medium
    { offset: 1, color: '#ef4444' }, // Red - high
  ],
  temperature: [
    { offset: 0, color: '#3b82f6' }, // Blue - cool
    { offset: 0.5, color: '#f59e0b' }, // Yellow - warm
    { offset: 1, color: '#ef4444' }, // Red - hot
  ],
};

export const GPUHeatmapCanvas = React.forwardRef<HTMLDivElement, GPUHeatmapCanvasProps>(
  (
    {
      cells,
      colorMode,
      gridWidth,
      gridHeight,
      cellSize = 1,
      cellGap = 0.1,
      fisheyeEnabled = false,
      fisheyeFocus,
      fisheyeRadius = 0.3,
      fisheyeStrength = 2.0,
      onGPUHover,
      onGPUClick,
      className = '',
      style,
      showFPS = false,
      showLegend = true,
      legendLabels = DEFAULT_LEGEND_LABELS,
      enableZoomPan = true,
      minZoom = 0.5,
      maxZoom = 10,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const legendCanvasRef = useRef<HTMLCanvasElement>(null);

    // Expose container element via forwarded ref
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, []);

    const [hoveredGPU, setHoveredGPU] = useState<GPUCellData | null>(null);
    const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Animation hook for zoom/pan transitions
    const { reducedMotion } = useAnimation({ respectReducedMotion: true });

    // Calculate grid dimensions to fit container
    const { width: containerWidth, height: containerHeight } = containerSize;
    
    // Use fallback dimensions immediately so Three.js initializes
    const effectiveWidth = containerWidth > 0 ? containerWidth : 800;
    const effectiveHeight = containerHeight > 0 ? containerHeight : 600;

    // Use Three.js scene hook with effective dimensions
    const threeScene = useThreeScene({
      canvasRef,
      width: effectiveWidth,
      height: effectiveHeight,
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
      autoStart: true,
      respectReducedMotion: true,
    });

    // Update container size on resize
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const updateSize = () => {
        const rect = container.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      };

      // Force initial size
      updateSize();

      const observer = new ResizeObserver(updateSize);
      observer.observe(container);

      return () => observer.disconnect();
    }, []);

    // Update Three.js scene when container size changes
    useEffect(() => {
      if (threeScene && containerWidth > 0 && containerHeight > 0) {
        threeScene.resize(containerWidth, containerHeight);
      }
    }, [containerWidth, containerHeight, threeScene]);

    // Handle mouse move for hover/tooltip
    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas || !threeScene || !threeScene.raycaster || !threeScene.camera || !threeScene.mesh) return;

        const clientX = event.clientX;
        const clientY = event.clientY;

        setHoverScreenPos({ x: clientX, y: clientY });

        const ndc = getNormalizedCoords(clientX, clientY, canvas);
        const picked = pickGPUCell(threeScene.raycaster, threeScene.camera, threeScene.mesh, ndc);

        if (picked && picked.index >= 0 && picked.index < cells.length) {
          const gpu = cells[picked.index] as GPUCellData;
          setHoveredGPU(gpu);
          onGPUHover?.(gpu, { x: clientX, y: clientY });
        } else {
          setHoveredGPU(null);
          onGPUHover?.(null, { x: clientX, y: clientY });
        }
      },
      [cells, threeScene, onGPUHover]
    );

    // Handle mouse leave
    const handleMouseLeave = useCallback(() => {
      setHoveredGPU(null);
      onGPUHover?.(null, hoverScreenPos);
    }, [onGPUHover, hoverScreenPos]);

    // Handle click
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas || !threeScene || !threeScene.raycaster || !threeScene.camera || !threeScene.mesh) return;

        const ndc = getNormalizedCoords(event.clientX, event.clientY, canvas);
        const picked = pickGPUCell(threeScene.raycaster, threeScene.camera, threeScene.mesh, ndc);

        if (picked && picked.index >= 0 && picked.index < cells.length) {
          const gpu = cells[picked.index] as GPUCellData;
          onGPUClick?.(gpu, { x: event.clientX, y: event.clientY });
        }
      },
      [cells, threeScene, onGPUClick]
    );

    // Handle wheel for zoom
    const handleWheel = useCallback(
      (event: React.WheelEvent<HTMLDivElement>) => {
        if (!enableZoomPan) return;
        event.preventDefault();

        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(minZoom, Math.max(maxZoom, zoom * zoomFactor));
        setZoom(newZoom);
      },
      [enableZoomPan, zoom, minZoom, maxZoom]
    );

    // Handle pan start
    const handlePanStart = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (!enableZoomPan) return;
        if (event.button !== 1 && event.button !== 0) return; // Middle or left click

        setIsPanning(true);
        setPanStart({ x: event.clientX, y: event.clientY });
        event.preventDefault();
      },
      [enableZoomPan]
    );

    // Handle pan move (native event for window listeners)
    const handlePanMoveNative = useCallback(
      (event: MouseEvent) => {
        if (!isPanning || !enableZoomPan) return;

        const dx = ((event.clientX - panStart.x) / containerWidth) * zoom;
        const dy = ((event.clientY - panStart.y) / containerHeight) * zoom;

        setPan((prev) => ({
          x: prev.x - dx,
          y: prev.y - dy,
        }));
      },
      [isPanning, enableZoomPan, containerWidth, containerHeight, zoom, panStart]
    );

    // Handle pan move (React event for onMouseMove)
    const handlePanMove = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        handlePanMoveNative(event.nativeEvent);
      },
      [handlePanMoveNative]
    );

    // Handle pan end (native event for window listeners)
    const handlePanEndNative = useCallback(() => {
      setIsPanning(false);
    }, []);

    // Handle pan end (React event for onMouseUp/onMouseLeave)
    const handlePanEnd = useCallback(() => {
      handlePanEndNative();
    }, [handlePanEndNative]);

    // Attach pan listeners
    useEffect(() => {
      if (isPanning) {
        window.addEventListener('mousemove', handlePanMoveNative);
        window.addEventListener('mouseup', handlePanEndNative);
        return () => {
          window.removeEventListener('mousemove', handlePanMoveNative);
          window.removeEventListener('mouseup', handlePanEndNative);
        };
      }
    }, [isPanning, handlePanMoveNative, handlePanEndNative]);

    // Draw legend on canvas
    useEffect(() => {
      const canvas = legendCanvasRef.current;
      if (!canvas || !showLegend) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = 200;
      const height = 30;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      const stops = COLOR_STOPS[colorMode];
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      stops.forEach((stop) => {
        gradient.addColorStop(stop.offset, stop.color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(legendLabels[colorMode].min, 0, height + 14);
      ctx.textAlign = 'right';
      ctx.fillText(legendLabels[colorMode].max, width, height + 14);
    }, [colorMode, showLegend, legendLabels]);

    // Get color mode display name
    const getColorModeLabel = () => {
      switch (colorMode) {
        case 'health':
          return 'Health';
        case 'utilization':
          return 'Utilization';
        case 'temperature':
          return 'Temperature';
      }
    };

    return (
      <div
        ref={containerRef}
        className={`${styles.container} ${className}`}
        style={style}
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
      >
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: reducedMotion ? 'none' : 'transform 0.1s ease-out',
          }}
          aria-label={`GPU Heatmap - ${getColorModeLabel()} view`}
          role='img'
        />

        {/* Tooltip */}
        {hoveredGPU && tooltipRef.current && (
          <div
            ref={tooltipRef}
            className={styles.tooltip}
            style={{
              left: hoverScreenPos.x + 16,
              top: hoverScreenPos.y + 16,
            }}
            role='tooltip'
          >
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>GPU:</span>
              <span className={styles.tooltipValue}>{hoveredGPU.gpuId}</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Node:</span>
              <span className={styles.tooltipValue}>{hoveredGPU.nodeId}</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Health:</span>
              <span className={styles.tooltipValue}>{(hoveredGPU.health * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Utilization:</span>
              <span className={styles.tooltipValue}>
                {(hoveredGPU.utilization * 100).toFixed(1)}%
              </span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Temperature:</span>
              <span className={styles.tooltipValue}>
                {(hoveredGPU.temperature * 100).toFixed(1)}%
              </span>
            </div>
            {hoveredGPU.isStraggler && (
              <div className={`${styles.tooltipRow} ${styles.tooltipStraggler}`}>
                <span className={styles.tooltipLabel}>⚠ Straggler:</span>
                <span className={styles.tooltipValue}>
                  {(hoveredGPU.stragglerSeverity * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        {showLegend && (
          <div className={styles.legend}>
            <canvas ref={legendCanvasRef} className={styles.legendCanvas} />
            <div className={styles.legendLabel}>{getColorModeLabel()}</div>
          </div>
        )}

        {/* FPS Counter */}
        {showFPS && threeScene && <div className={styles.fps}>{threeScene.fps} FPS</div>}

        {/* Zoom indicator */}
        {enableZoomPan && zoom !== 1 && (
          <div className={styles.zoomIndicator}>
            {Math.round(zoom * 100)}%
            <button className={styles.zoomReset} onClick={() => setZoom(1)} aria-label='Reset zoom'>
              ✕
            </button>
          </div>
        )}

        {/* Straggler indicator */}
        {cells.some((c) => c.isStraggler) && (
          <div className={styles.stragglerIndicator} aria-live='polite'>
            ⚠ {cells.filter((c) => c.isStraggler).length} straggler(s) detected
          </div>
        )}
      </div>
    );
  }
);

GPUHeatmapCanvas.displayName = 'GPUHeatmapCanvas';

export default GPUHeatmapCanvas;
