import React, { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import styles from './TimelineChart.module.css';

export interface TimelineDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineChartProps {
  data: TimelineDataPoint[];
  xAccessor: (d: TimelineDataPoint) => Date;
  yAccessor: (d: TimelineDataPoint) => number;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  lineColor?: string;
  areaColor?: string;
  showArea?: boolean;
  showPoints?: boolean;
  pointColor?: string;
  xAxisFormat?: string;
  yAxisFormat?: (value: number) => string;
  onPointClick?: (point: TimelineDataPoint) => void;
  onPointHover?: (point: TimelineDataPoint | null) => void;
  className?: string;
  ariaLabel?: string;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({
  data,
  xAccessor,
  yAccessor,
  width = 600,
  height = 200,
  margin = { top: 8, right: 12, bottom: 24, left: 50 },
  lineColor = 'var(--color-primary-500)',
  areaColor = 'var(--color-primary-100)',
  showArea = true,
  showPoints = false,
  pointColor = 'var(--color-primary-500)',
  xAxisFormat = '%H:%M',
  yAxisFormat,
  onPointClick,
  onPointHover,
  className,
  ariaLabel = 'Timeline chart',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    const dates = data.map(xAccessor);
    return d3.scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, innerWidth])
      .nice();
  }, [data, xAccessor, innerWidth]);

  const yScale = useMemo(() => {
    const values = data.map(yAccessor);
    const minVal = d3.min(values) ?? 0;
    const maxVal = d3.max(values) ?? 1;
    return d3.scaleLinear()
      .domain([minVal * 0.95, maxVal * 1.05])
      .range([innerHeight, 0])
      .nice();
  }, [data, yAccessor, innerHeight]);

  const lineGenerator = useMemo(() =>
    d3.line<TimelineDataPoint>()
      .x(d => xScale(xAccessor(d)))
      .y(d => yScale(yAccessor(d)))
      .curve(d3.curveMonotoneX),
    [xScale, yScale, xAccessor, yAccessor]
  );

  const areaGenerator = useMemo(() =>
    d3.area<TimelineDataPoint>()
      .x(d => xScale(xAccessor(d)))
      .y0(innerHeight)
      .y1(d => yScale(yAccessor(d)))
      .curve(d3.curveMonotoneX),
    [xScale, yScale, xAccessor, yAccessor, innerHeight]
  );

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const container = d3.select(containerRef.current);
    container.selectAll('svg').remove();

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img')
      .attr('aria-label', ariaLabel);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .attr('class', styles.grid)
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-width', 0.5);

    // Area
    if (showArea) {
      g.append('path')
        .datum(data)
        .attr('class', styles.area)
        .attr('d', areaGenerator as any)
        .attr('fill', areaColor)
        .attr('fill-opacity', 0.3);
    }

    // Line
    g.append('path')
      .datum(data)
      .attr('class', styles.line)
      .attr('d', lineGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    // Points
    if (showPoints) {
      g.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', styles.point)
        .attr('cx', d => xScale(xAccessor(d)))
        .attr('cy', d => yScale(yAccessor(d)))
        .attr('r', 4)
        .attr('fill', pointColor)
        .attr('stroke', 'var(--color-surface)')
        .attr('stroke-width', 2)
        .style('cursor', onPointClick ? 'pointer' : 'default')
        .on('click', (event, d) => onPointClick?.(d))
        .on('mouseenter', (event, d) => {
          onPointHover?.(d);
          showTooltip(d, event);
        })
        .on('mouseleave', () => {
          onPointHover?.(null);
          hideTooltip();
        });
    }

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(innerWidth / 80)
      .tickFormat(d3.timeFormat(xAxisFormat))
      .tickSize(-innerHeight)
      .tickPadding(8);

    g.append('g')
      .attr('class', styles.xAxis)
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'var(--color-neutral-500)')
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-family-mono)');

    g.select(`.${styles.xAxis} .domain`).remove();
    g.selectAll(`.${styles.xAxis} line`).attr('stroke', 'var(--color-border)');

    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(yAxisFormat ?? d3.format('.2s'))
      .tickSize(-innerWidth)
      .tickPadding(8);

    g.append('g')
      .attr('class', styles.yAxis)
      .call(yAxis)
      .selectAll('text')
      .attr('fill', 'var(--color-neutral-500)')
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-family-mono)');

    g.select(`.${styles.yAxis} .domain`).remove();
    g.selectAll(`.${styles.yAxis} line`).attr('stroke', 'var(--color-border)');

    svgRef.current = svg.node() as SVGSVGElement;
  }, [data, width, height, margin, innerWidth, innerHeight, xScale, yScale, lineGenerator, areaGenerator, showArea, showPoints, xAxisFormat, yAxisFormat, lineColor, areaColor, pointColor, onPointClick, onPointHover, ariaLabel]);

  const showTooltip = (point: TimelineDataPoint, event: MouseEvent) => {
    if (!tooltipRef.current) return;
    const x = xScale(xAccessor(point)) + margin.left;
    const y = yScale(yAccessor(point)) + margin.top;
    const content = `
      <div><strong>${point.label ?? formatTime(xAccessor(point))}</strong></div>
      <div>${yAxisFormat ? yAxisFormat(yAccessor(point)) : yAccessor(point).toFixed(2)}</div>
    `;
    tooltipRef.current.innerHTML = content;
    tooltipRef.current.style.left = `${x + 10}px`;
    tooltipRef.current.style.top = `${y - 10}px`;
    tooltipRef.current.style.opacity = '1';
  };

  const hideTooltip = () => {
    if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
  };

  const formatTime = (date: Date) => d3.timeFormat(xAxisFormat)(date);

  return (
    <div className={cn(styles.container, className)} ref={containerRef}>
      <div ref={tooltipRef} className={styles.tooltip} />
    </div>
  );
};