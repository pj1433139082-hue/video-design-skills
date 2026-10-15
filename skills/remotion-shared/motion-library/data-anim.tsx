// motion-library/data-anim.tsx
// 数据驱动动画：数字滚动 / 柱条生长（数据可视化类视频用）
// 确定性动画，帧驱动；禁止随机

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type NumberProps = {
  value: number;
  durationFrames?: number; // 滚动完成帧数（默认 30）
  delayFrames?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: React.CSSProperties;
};

// 数字从 0 滚动到 value
export const AnimatedNumber: React.FC<NumberProps> = ({
  value,
  durationFrames = 30,
  delayFrames = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [delayFrames, delayFrames + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const current = value * progress;
  return (
    <span style={style}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
};

type BarProps = {
  width: number; // 目标宽度 px
  height?: number;
  color: string;
  durationFrames?: number;
  delayFrames?: number;
  style?: React.CSSProperties;
};

// 柱条从 0 生长到 width
export const BarGrowth: React.FC<BarProps> = ({
  width,
  height = 36,
  color,
  durationFrames = 30,
  delayFrames = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [delayFrames, delayFrames + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <div
      style={{
        width: width * progress,
        height,
        background: color,
        borderRadius: 8,
        ...style,
      }}
    />
  );
};

type ChartBar = {
  label: string;
  value: number; // 0-100
  color: string;
};

type BarChartProps = {
  data: ChartBar[];
  barWidth?: number; // 最大柱宽
  barHeight?: number;
  durationFrames?: number;
  gap?: number;
  labelWidth?: number;
  valueSuffix?: string;
};

// 数据驱动柱状图：逐条出现 + 生长
export const AnimatedBarChart: React.FC<BarChartProps> = ({
  data,
  barWidth = 600,
  barHeight = 36,
  durationFrames = 30,
  gap = 16,
  labelWidth = 120,
  valueSuffix = "%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap,
      }}
    >
      {data.map((item, i) => {
        const delay = i * Math.round(fps * 0.3); // 每条延迟 0.3s
        const progress = interpolate(
          frame,
          [delay, delay + durationFrames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: barWidth + labelWidth + 80,
            }}
          >
            <span
              style={{
                width: labelWidth,
                textAlign: "right",
                color: "#fff",
                fontSize: 20,
              }}
            >
              {item.label}
            </span>
            <div
              style={{
                height: barHeight,
                width: barWidth * progress * (item.value / 100),
                background: item.color,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                paddingLeft: 12,
              }}
            >
              <span style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                {item.value}
                {valueSuffix}
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
