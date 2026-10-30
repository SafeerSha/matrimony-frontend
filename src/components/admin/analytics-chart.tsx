'use client';

import React, { useId, useState } from 'react';
import type { TimeSeriesPoint } from '@/types/analytics';

interface AnalyticsChartProps {
  data: TimeSeriesPoint[];
  color?: string;
  gradientId?: string;
  metricName: string;
  height?: number;
  showAxes?: boolean;
}

export function AnalyticsChart({
  data,
  color = '#8A1538',
  gradientId,
  metricName,
  height = 160,
  showAxes = true,
}: AnalyticsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const fallbackId = useId();
  const actualGradientId = gradientId || `grad-${fallbackId.replace(/:/g, '')}`;

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-[var(--surface-muted)] text-xs text-[var(--muted)]"
        style={{ height }}
      >
        No trend data available for this range
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const width = 600;
  const paddingX = showAxes ? 40 : 10;
  const paddingY = showAxes ? 24 : 10;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.value - minValue) / range) * chartHeight;
    return { x, y, date: d.date, value: d.value };
  });

  const pathData = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    // Smooth bezier or straight line
    const prev = points[index - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const areaData = `${pathData} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="relative w-full overflow-hidden select-none" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        role="img"
        aria-label={`${metricName} trend chart. Minimum value is ${minValue}, maximum value is ${maxValue}.`}
      >
        <defs>
          <linearGradient id={actualGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showAxes && (
          <>
            <line
              x1={paddingX}
              y1={paddingY}
              x2={width - paddingX}
              y2={paddingY}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <line
              x1={paddingX}
              y1={paddingY + chartHeight / 2}
              x2={width - paddingX}
              y2={paddingY + chartHeight / 2}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="var(--border)"
              strokeWidth="1"
            />
            {/* Axis Labels */}
            <text
              x={paddingX - 6}
              y={paddingY + 4}
              textAnchor="end"
              className="text-[10px] fill-[var(--muted)] font-mono"
            >
              {maxValue}
            </text>
            <text
              x={paddingX - 6}
              y={height - paddingY}
              textAnchor="end"
              className="text-[10px] fill-[var(--muted)] font-mono"
            >
              {minValue}
            </text>
            <text
              x={paddingX}
              y={height - 6}
              textAnchor="start"
              className="text-[10px] fill-[var(--muted)] font-mono"
            >
              {data[0]?.date.slice(5)}
            </text>
            <text
              x={width - paddingX}
              y={height - 6}
              textAnchor="end"
              className="text-[10px] fill-[var(--muted)] font-mono"
            >
              {data[data.length - 1]?.date.slice(5)}
            </text>
          </>
        )}

        {/* Shaded Area */}
        <path d={areaData} fill={`url(#${actualGradientId})`} />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Hover Point & Guideline */}
        {hoveredPoint && (
          <>
            <line
              x1={hoveredPoint.x}
              y1={paddingY}
              x2={hoveredPoint.x}
              y2={height - paddingY}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.6"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="4.5"
              fill={color}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </>
        )}

        {/* Invisible hit targets for mouse interaction */}
        {points.map((p, idx) => (
          <rect
            key={idx}
            x={p.x - chartWidth / (points.length * 2)}
            y={0}
            width={chartWidth / points.length}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-crosshair"
          />
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-[#2A0711] px-2.5 py-1.5 text-xs text-white shadow-lg border border-[#5E142E] transition-all"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${Math.max(hoveredPoint.y - 8, 16)}px`,
          }}
        >
          <div className="font-semibold text-white/90">
            {hoveredPoint.value.toLocaleString()} {metricName}
          </div>
          <div className="text-[10px] text-white/60">{hoveredPoint.date}</div>
        </div>
      )}

      {/* Hidden text summary for assistive technologies */}
      <div className="sr-only">
        <table>
          <caption>{metricName} time series data table</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.date}</td>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
