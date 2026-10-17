// motion-library/scene-cards-chart.tsx
// 场景卡系统 T3：数据可视化场景卡（5 张）。
//   新建（clean-room 自写）：PieCard（SVG 环形图逐段扫出）、KPIGrid（多指标网格）。
//   包装成卡（复用已有原语，不重写）：BarChartCard←AnimatedBarChart、
//   LineChartCard←LineChartAnim、RingCard←ProgressRing。
//
// 许可边界（AGPL-3.0 clean-room）：借鉴"场景卡词表/图表卡"概念（来源项目 calesthio/OpenMontage，
// AGPL-3.0，见 docs/ATTRIBUTION.md）；**未复制其任何源码或资产**，本文件全部从零自写，随本仓 MIT。
//
// 确定性动画：帧驱动 interpolate，禁 Math.random 与浏览器定时器。
// 依赖方向：scene-cards.tsx（SceneRenderer）→ 本文件（运行时单向）；本文件仅 `import type` SceneCardTheme。

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { SceneCardTheme } from "./scene-cards";
import { AnimatedBarChart, AnimatedNumber } from "./data-anim";
import { LineChartAnim, ProgressRing } from "./motion-extras";

type ChartTiming = {
  durationFrames?: number;
  delayFrames?: number;
};

// 确定性默认调色板（slice/bar 未指定 color 时按序取用）
const PALETTE = ["#FF8A3D", "#4FC3F7", "#FFD24A", "#81C784", "#BA68C8", "#F06292"];

const Shell: React.FC<{
  surface: string;
  accent: string;
  opacity: number;
  children: React.ReactNode;
}> = ({ surface, accent, opacity, children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}>
    <div
      style={{
        background: surface,
        border: `2px solid ${accent}`,
        borderRadius: 28,
        padding: "44px 52px",
        maxWidth: "88%",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        alignItems: "center",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

const useEnter = (delayFrames: number, span = 10) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delayFrames, delayFrames + span], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// ---------- 1) PieCard：环形图逐段扫出（新建） ----------
export type PieCut = {
  type: "pie";
  title?: string;
  slices: { label: string; value: number; color?: string }[];
};

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
};

export const PieCard: React.FC<Omit<PieCut, "type"> & SceneCardTheme & ChartTiming> = ({
  title,
  slices,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 36,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = useEnter(delayFrames);
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const sweep = 360 * interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  let acc = 0;
  const R = 150;
  return (
    <Shell surface={surface} accent={accent} opacity={opacity}>
      {title ? (
        <div style={{ fontFamily: labelFont, fontSize: 48, fontWeight: 800, color: textColor }}>{title}</div>
      ) : null}
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <svg width={R * 2 + 20} height={R * 2 + 20} viewBox={`0 0 ${R * 2 + 20} ${R * 2 + 20}`}>
          {slices.map((s, i) => {
            const a0 = acc;
            const a1 = acc + (s.value / total) * 360;
            acc = a1;
            const drawn = Math.min(sweep, a1);
            if (drawn <= a0) return null;
            return (
              <path
                key={i}
                d={arcPath(R + 10, R + 10, R, a0, Math.max(a0 + 0.1, drawn))}
                fill={s.color ?? PALETTE[i % PALETTE.length]}
              />
            );
          })}
          <circle cx={R + 10} cy={R + 10} r={R * 0.55} fill={surface} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: labelFont, fontSize: 36, color: textColor }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: s.color ?? PALETTE[i % PALETTE.length] }} />
              <span>{s.label}</span>
              <span style={{ fontFamily: monoFont, color: textColor, opacity: 0.8 }}>
                {Math.round((s.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ---------- 2) KPIGrid：多指标网格（新建，复用 AnimatedNumber） ----------
export type KpiCut = {
  type: "kpi";
  title?: string;
  items: { label: string; value: number; prefix?: string; suffix?: string; decimals?: number }[];
};

export const KPIGrid: React.FC<Omit<KpiCut, "type"> & SceneCardTheme & ChartTiming> = ({
  title,
  items,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 30,
  delayFrames = 0,
}) => {
  const opacity = useEnter(delayFrames);
  const frame = useCurrentFrame();
  return (
    <Shell surface={surface} accent={accent} opacity={opacity}>
      {title ? (
        <div style={{ fontFamily: labelFont, fontSize: 48, fontWeight: 800, color: textColor }}>{title}</div>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", maxWidth: 860 }}>
        {items.map((it, i) => {
          const p = interpolate(frame, [delayFrames + i * 5, delayFrames + i * 5 + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity: p,
                transform: `translateY(${(1 - p) * 24}px)`,
                border: `1px solid ${accent}`,
                borderRadius: 20,
                padding: "24px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "center",
                minWidth: 240,
              }}
            >
              <div style={{ fontFamily: labelFont, fontSize: 36, fontWeight: 600, color: textColor, opacity: 0.85 }}>{it.label}</div>
              <div style={{ fontFamily: monoFont, fontSize: 64, fontWeight: 800, color: accent }}>
                <AnimatedNumber
                  value={it.value}
                  prefix={it.prefix ?? ""}
                  suffix={it.suffix ?? ""}
                  decimals={it.decimals ?? 0}
                  durationFrames={durationFrames}
                  delayFrames={delayFrames + i * 5}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// ---------- 3) BarChartCard：包装已有 AnimatedBarChart ----------
export type BarCut = {
  type: "bar";
  title?: string;
  bars: { label: string; value: number; color?: string }[]; // value 0-100
  valueSuffix?: string;
};

export const BarChartCard: React.FC<Omit<BarCut, "type"> & SceneCardTheme & ChartTiming> = ({
  title,
  bars,
  valueSuffix = "%",
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 30,
  delayFrames = 0,
}) => {
  const opacity = useEnter(delayFrames);
  return (
    <Shell surface={surface} accent={accent} opacity={opacity}>
      {title ? (
        <div style={{ fontFamily: labelFont, fontSize: 48, fontWeight: 800, color: textColor }}>{title}</div>
      ) : null}
      <div style={{ width: 760, height: bars.length * 52 + 20 }}>
        <AnimatedBarChart
          data={bars.map((b, i) => ({ label: b.label, value: b.value, color: b.color ?? PALETTE[i % PALETTE.length] }))}
          barWidth={560}
          barHeight={34}
          gap={16}
          durationFrames={durationFrames}
          valueSuffix={valueSuffix}
        />
      </div>
    </Shell>
  );
};

// ---------- 4) LineChartCard：包装已有 LineChartAnim ----------
export type LineCut = {
  type: "line";
  title?: string;
  points: number[];
};

export const LineChartCard: React.FC<Omit<LineCut, "type"> & SceneCardTheme & ChartTiming> = ({
  title,
  points,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 30,
  delayFrames = 0,
}) => {
  const opacity = useEnter(delayFrames);
  return (
    <Shell surface={surface} accent={accent} opacity={opacity}>
      {title ? (
        <div style={{ fontFamily: labelFont, fontSize: 48, fontWeight: 800, color: textColor }}>{title}</div>
      ) : null}
      <LineChartAnim data={points} color={accent} width={720} height={320} />
    </Shell>
  );
};

// ---------- 5) RingCard：包装已有 ProgressRing ----------
export type RingCut = {
  type: "ring";
  label?: string;
  progress: number; // 0-1
};

export const RingCard: React.FC<Omit<RingCut, "type"> & SceneCardTheme & ChartTiming> = ({
  label,
  progress,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 30,
  delayFrames = 0,
}) => {
  const opacity = useEnter(delayFrames);
  return (
    <Shell surface={surface} accent={accent} opacity={opacity}>
      <ProgressRing progress={progress} size={300} color={accent} bgColor="rgba(255,255,255,0.12)" />
      <div style={{ fontFamily: monoFont, fontSize: 56, fontWeight: 800, color: accent }}>
        <AnimatedNumber value={progress * 100} suffix="%" decimals={0} durationFrames={durationFrames} delayFrames={delayFrames} />
      </div>
      {label ? (
        <div style={{ fontFamily: labelFont, fontSize: 40, fontWeight: 600, color: textColor, opacity: 0.85 }}>{label}</div>
      ) : null}
    </Shell>
  );
};
