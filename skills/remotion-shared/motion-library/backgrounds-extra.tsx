// motion-library/backgrounds-extra.tsx
// 补充背景 + 数据动效：雨滴 / 暗角 / 透视网格 / 波浪 / 彩带 / 星空 / 环形图 / 热度条 / 迷你趋势线 / 仪表盘
// 确定性动画：伪随机用 index 数学函数（无 Math.random），帧驱动

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// ============ 背景补充 ============

// 雨滴背景：斜向雨丝持续下落（氛围背景）
export const RainBackground: React.FC<{
  count?: number;
  color?: string;
  speed?: number;
  angle?: number;
  baseColor?: string;
}> = ({ count = 60, color = "rgba(160,190,255,0.35)", speed = 6, angle = 18, baseColor = "#0a0a0a" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drops = Array.from({ length: count }, (_, i) => {
    const px = ((i * 7919) % 97) / 97;
    const py = ((i * 104729) % 89) / 89;
    const len = 60 + ((i * 37) % 50);
    const drift = ((i * 61) % 20) / 100;
    return { x: px * width, y: py, len, drift };
  });
  return (
    <AbsoluteFill style={{ background: baseColor, overflow: "hidden" }}>
      {drops.map((d, i) => {
        const travel = (frame * speed * (0.6 + d.drift)) % (height + d.len);
        const y = (d.y * height + travel) % (height + d.len);
        const x = (d.x * width - y * Math.tan((angle * Math.PI) / 180)) % (width + 200);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 2,
              height: d.len,
              background: `linear-gradient(180deg, transparent, ${color})`,
              transform: `rotate(${angle}deg)`,
              opacity: 0.4 + 0.4 * ((i % 3) / 3),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 暗角叠层：四角径向渐变压暗，随帧轻微呼吸（聚焦感）
export const VignetteOverlay: React.FC<{ intensity?: number; breathe?: number }> = ({
  intensity = 0.55,
  breathe = 0.04,
}) => {
  const frame = useCurrentFrame();
  const level = intensity * (1 + breathe * Math.sin(frame * 0.05));
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${level}) 100%)`,
      }}
    />
  );
};

// 透视网格：带 3D perspective 的地平线网格（科幻 HUD 感）
export const GridPerspective: React.FC<{
  rows?: number;
  lineColor?: string;
  speed?: number;
  baseColor?: string;
}> = ({ rows = 10, lineColor = "rgba(80,160,255,0.35)", speed = 2, baseColor = "#0a0a0a" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const offset = (frame * speed) % 40;
  return (
    <AbsoluteFill style={{ background: baseColor, overflow: "hidden", perspective: 600 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * 0.45,
          height: height * 0.7,
          transformStyle: "preserve-3d",
          transform: "rotateX(55deg)",
          transformOrigin: "top center",
        }}
      >
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={`h${i}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: (i / rows) * 100 * 0.8 + offset * (i / rows) * 0.1,
              height: 2,
              background: lineColor,
              opacity: 1 - (i / rows) * 0.7,
            }}
          />
        ))}
        {/* 纵向汇聚线 */}
        {[-3, -2, -1, 0, 1, 2, 3].map((col) => (
          <div
            key={`v${col}`}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${50 + col * 12 + offset * 0.1 * col}%`,
              width: 2,
              background: lineColor,
              opacity: 0.7,
            }}
          />
        ))}
        {/* 地平线亮线 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 3,
            background: lineColor,
            boxShadow: `0 0 30px 4px ${lineColor}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// 波浪背景：多层正弦波浪左右推移（轻量水波/信号感）
export const WaveBackground: React.FC<{
  colors?: string[];
  amplitude?: number;
  speed?: number;
  baseColor?: string;
}> = ({ colors = ["rgba(59,130,246,0.4)", "rgba(139,92,246,0.3)", "rgba(236,72,153,0.2)"], amplitude = 40, speed = 0.06, baseColor = "#0a0a0a" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const phases = [0, 2.1, 4.2];
  return (
    <AbsoluteFill style={{ background: baseColor, overflow: "hidden" }}>
      {colors.map((c, i) => {
        const phase = phases[i];
        const yBase = height * (0.55 + i * 0.14);
        const pts = Array.from({ length: 13 }, (_, j) => {
          const x = (j / 12) * width;
          const y = yBase + amplitude * Math.sin(x * 0.012 + frame * speed + phase);
          return `${x},${y}`;
        });
        return (
          <svg key={i} width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <polygon points={`0,${height} ${pts.join(" ")} ${width},${height}`} fill={c} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

// 彩带：多彩纸片飘落（庆祝场景）
export const Confetti: React.FC<{
  count?: number;
  colors?: string[];
  speed?: number;
}> = ({ count = 50, colors = ["#3b82f6", "#ec4899", "#f59e0b", "#22d3ee", "#a855f7"], speed = 3 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pieces = Array.from({ length: count }, (_, i) => {
    const px = ((i * 1299721) % 101) / 101;
    const py = ((i * 104729) % 97) / 97;
    const w = 6 + ((i * 23) % 8);
    const h = 10 + ((i * 47) % 12);
    const phase = ((i * 137) % 360) / 360;
    return { x: px, y: py, w, h, phase, color: colors[i % colors.length], rotSpeed: 4 + ((i * 13) % 8) };
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((p, i) => {
        const fall = (frame * speed * (0.6 + p.phase * 0.8)) % (height + 60);
        const y = (p.y * height + fall) % (height + 60) - 30;
        const x = (p.x * width + Math.sin(frame * 0.05 + p.phase * 6) * 40 + fall * 0.15) % width;
        const rot = frame * p.rotSpeed * (p.phase > 0.5 ? 1 : -1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: 2,
              transform: `rotate(${rot}deg)`,
              opacity: 0.85,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 星空背景：闪烁星点 + 少量大星（夜空氛围）
export const StarfieldBackground: React.FC<{
  count?: number;
  baseColor?: string;
  twinkle?: number;
}> = ({ count = 80, baseColor = "#05060a", twinkle = 0.08 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const stars = Array.from({ length: count }, (_, i) => {
    const px = ((i * 7919) % 97) / 97;
    const py = ((i * 104729) % 89) / 89;
    const r = 0.5 + ((i * 31) % 30) / 10; // 0.5 - 3.5px
    const phase = ((i * 137) % 360) / 360;
    return { x: px * width, y: py * height, r, phase };
  });
  return (
    <AbsoluteFill style={{ background: baseColor }}>
      {stars.map((s, i) => {
        const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame * twinkle + s.phase * Math.PI * 2));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.r,
              height: s.r,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              opacity: pulse,
              boxShadow: s.r > 2 ? `0 0 ${s.r * 3}px rgba(180,200,255,0.8)` : "none",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============ 数据补充 ============

// 环形图：多段数据圆环依次生长（占比可视化）
export const DonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  durationFrames?: number;
}> = ({ data, size = 240, thickness = 28, durationFrames = 40 }) => {
  const frame = useCurrentFrame();
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const progress = Math.min(1, frame / durationFrames);
  let acc = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} />
      {data.map((d, i) => {
        const frac = d.value / total;
        const start = acc;
        acc += frac;
        const dash = circ * frac * progress;
        const offset = -circ * start;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
    </svg>
  );
};

// 热度条：渐变分段横向生长（完成度/热度）
export const HeatBar: React.FC<{
  progress?: number;
  colors?: string[];
  height?: number;
  width?: number;
  durationFrames?: number;
}> = ({ progress = 0.7, colors = ["#22c55e", "#eab308", "#ef4444"], height = 22, width = 600, durationFrames = 36 }) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, progress * (frame / durationFrames));
  const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(", ");
  return (
    <div
      style={{
        width: width * p,
        height,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${stops})`,
        boxShadow: `0 0 20px 2px ${colors[colors.length - 1]}66`,
      }}
    />
  );
};

// 迷你趋势线：SVG 折线从左到右描绘 + 末端光点
export const Sparkline: React.FC<{
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  durationFrames?: number;
}> = ({ data, width = 320, height = 90, color = "#22d3ee", durationFrames = 30 }) => {
  const frame = useCurrentFrame();
  const maxV = Math.max(...data);
  const minV = Math.min(...data);
  const range = maxV - minV || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - minV) / range) * (height - 12) - 6;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const visible = Math.max(2, Math.floor((frame / durationFrames) * data.length));
  const last = pts[Math.min(visible, data.length) - 1].split(",");
  return (
    <svg width={width} height={height}>
      <polyline
        points={pts.slice(0, visible).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={parseFloat(last[0])} cy={parseFloat(last[1])} r={4} fill={color}>
        <animate attributeName="opacity" values="1;0.4;1" dur="0.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

// 仪表盘：半圆刻度 + 指针转动 + 数值（KPI 大屏）
export const GaugeMeter: React.FC<{
  value?: number; // 0-100
  size?: number;
  color?: string;
  label?: string;
  suffix?: string;
  durationFrames?: number;
}> = ({ value = 72, size = 220, color = "#3b82f6", label = "", suffix = "", durationFrames = 40 }) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, value / 100 * (frame / durationFrames));
  const angle = -180 + p * 180; // -180 → 0 度（指针起点在左）
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - 24) / 2;
  const arcLen = Math.PI * r; // 半圆弧长
  const needleLen = r - 14;
  const nx = cx + needleLen * Math.cos(((angle - 90) * Math.PI) / 180);
  const ny = cy + needleLen * Math.sin(((angle - 90) * Math.PI) / 180);
  const current = Math.round(value * (frame / durationFrames));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size * 0.62}>
        {/* 底弧 */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* 进度弧 */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${arcLen * p} ${arcLen}`}
        />
        {/* 刻度 */}
        {Array.from({ length: 21 }, (_, i) => {
          const a = Math.PI + (i / 20) * Math.PI;
          const x1 = cx + (r - 14) * Math.cos(a);
          const y1 = cy + (r - 14) * Math.sin(a);
          const x2 = cx + r * Math.cos(a);
          const y2 = cy + r * Math.sin(a);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.35)" strokeWidth={i % 5 === 0 ? 2 : 1} />
          );
        })}
        {/* 指针 */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={4} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={7} fill={color} />
      </svg>
      <div style={{ color: "#fff", fontSize: 34, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
        {current}
        {suffix}
      </div>
      {label && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>{label}</div>}
    </div>
  );
};
