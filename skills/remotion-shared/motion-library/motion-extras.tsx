// motion-library/motion-extras.tsx — 补充：背景 4 / 数据 3 / 文字 4

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// ============ 背景补充 ============

// 光球背景（几个漂浮发光球）
export const OrbBackground: React.FC<{ colors?: string[]; baseColor?: string }> = ({
  colors = ["rgba(59,130,246,0.4)", "rgba(139,92,246,0.35)", "rgba(236,72,153,0.3)"],
  baseColor = "#0a0a0a",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: baseColor }}>
      {colors.map((c, i) => {
        const cx = width * (0.25 + 0.5 * (i / colors.length) + 0.15 * Math.sin(frame * 0.02 + i * 2));
        const cy = height * (0.3 + 0.2 * Math.cos(frame * 0.015 + i * 1.5));
        const r = height * 0.35 * (0.8 + 0.2 * Math.sin(frame * 0.01 + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - r / 2,
              top: cy - r / 2,
              width: r,
              height: r,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 圆点网格（小圆点阵列）
export const DotGridBackground: React.FC<{ size?: number; dotColor?: string; baseColor?: string }> = ({
  size = 48, dotColor = "rgba(120,140,200,0.25)", baseColor = "#0a0a0a",
}) => {
  const { width, height } = useVideoConfig();
  const dots = [];
  for (let x = 0; x < width; x += size) {
    for (let y = 0; y < height; y += size) {
      dots.push({ x, y });
    }
  }
  return (
    <AbsoluteFill style={{ background: baseColor }}>
      {dots.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: 3, height: 3, borderRadius: "50%", background: dotColor }} />
      ))}
    </AbsoluteFill>
  );
};

// 渐变网格（Mesh 渐变块）
export const GradientMeshBackground: React.FC<{ baseColor?: string }> = ({ baseColor = "#0a0a0a" }) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame * 0.005;
  return (
    <AbsoluteFill style={{ background: baseColor }}>
      <AbsoluteFill style={{
        background: `radial-gradient(circle at ${30 + 20 * Math.sin(t)}% 30%, rgba(59,130,246,0.3) 0%, transparent 40%),
          radial-gradient(circle at ${70 + 15 * Math.cos(t * 1.3)}% 60%, rgba(139,92,246,0.25) 0%, transparent 45%),
          radial-gradient(circle at 50% 85%, rgba(236,72,153,0.2) 0%, transparent 40%)`,
      }} />
    </AbsoluteFill>
  );
};

// 光斑扫描（横向光带扫过）
export const ScanlineBackground: React.FC<{ color?: string; baseColor?: string; speed?: number }> = ({
  color = "rgba(120,180,255,0.08)", baseColor = "#0a0a0a", speed = 2,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const x = (frame * speed * 10) % (width + 400) - 200;
  return (
    <AbsoluteFill style={{ background: baseColor }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 400, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </AbsoluteFill>
  );
};

// ============ 数据补充 ============

// 折线图生长（SVG polyline 逐点揭示）
export const LineChartAnim: React.FC<{ data: number[]; color?: string; width?: number; height?: number }> = ({
  data, color = "#3b82f6", width = 600, height = 240,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxV = Math.max(...data);
  const minV = Math.min(...data);
  const range = maxV - minV || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - minV) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });
  const visible = Math.max(2, Math.floor((frame / fps) * 2) + 2);
  return (
    <svg width={width} height={height}>
      <polyline points={pts.slice(0, visible).join(" ")} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <circle cx={parseFloat(pts[visible - 1].split(",")[0])} cy={parseFloat(pts[visible - 1].split(",")[1])} r={5} fill={color} />
    </svg>
  );
};

// 进度环（圆环填充）
export const ProgressRing: React.FC<{ progress?: number; size?: number; color?: string; bgColor?: string }> = ({
  progress = 0.75, size = 120, color = "#3b82f6", bgColor = "rgba(255,255,255,0.1)",
}) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, progress * (frame / 30));
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={bgColor} strokeWidth={8} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={8} fill="none"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - p)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

// 计数徽章（数字 + 圆角徽章）
export const CounterBadge: React.FC<{ value: number; suffix?: string; color?: string; style?: React.CSSProperties }> = ({
  value, suffix = "", color = "#3b82f6", style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const current = Math.min(value, Math.floor(value * (frame / fps)));
  return (
    <div
      style={{
        background: color,
        color: "#fff",
        borderRadius: 999,
        padding: "8px 24px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 40,
        fontWeight: 700,
        display: "inline-block",
        ...style,
      }}
    >
      {current}
      {suffix}
    </div>
  );
};

// ============ 文字补充 ============

// 字符翻转（每个字符 Y 翻转登场）
export const CharFlipText: React.FC<{ text: string; perChar?: number; style?: React.CSSProperties; color?: string }> = ({
  text, perChar = 4, style, color = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  return (
    <div style={{ display: "flex", ...style }}>
      {chars.map((ch, i) => {
        const start = i * perChar;
        const p = Math.min(1, (frame - start) / 12);
        return (
          <span key={i} style={{
            display: "inline-block",
            transform: `rotateX(${(1 - p) * 90}deg)`,
            opacity: p,
            color,
          }}>
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </div>
  );
};

// 词擦除（从右往左逐词揭示）
export const WordWipeText: React.FC<{ words: string[]; perWord?: number; style?: React.CSSProperties; color?: string }> = ({
  words, perWord = 15, style, color = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const visible = Math.max(1, Math.floor(frame / perWord) + 1);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, ...style }}>
      {words.slice(0, visible).map((w, i) => (
        <span key={i} style={{ color, opacity: (frame - i * perWord) / 8 }}>{w}</span>
      ))}
    </div>
  );
};

// 文字抖动（glitch 抖动强调）
export const GlitchText: React.FC<{ text: string; style?: React.CSSProperties; color?: string }> = ({
  text, style, color = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const intensity = Math.sin(frame * 2.5) > 0.6 ? 3 : 0;
  return (
    <span style={{ color, ...style }}>
      <span style={{ position: "relative", display: "inline-block" }}>
        <span style={{ position: "absolute", left: intensity, top: 0, color: "rgba(255,0,60,0.6)" }}>{text}</span>
        <span style={{ position: "absolute", left: -intensity, top: 0, color: "rgba(0,180,255,0.6)" }}>{text}</span>
        <span style={{ position: "relative" }}>{text}</span>
      </span>
    </span>
  );
};

// 数字脉冲（数字呼吸放大）
export const PulseText: React.FC<{ text: string; style?: React.CSSProperties; color?: string }> = ({
  text, style, color = "#3b82f6",
}) => {
  const frame = useCurrentFrame();
  const scale = 1 + 0.06 * Math.sin(frame * 0.12);
  return <span style={{ color, display: "inline-block", transform: `scale(${scale})`, ...style }}>{text}</span>;
};
