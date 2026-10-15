// motion-library/backgrounds.tsx
// 背景动效：网格 / 极光渐变 / 粒子 / 噪点
// 从 landing.love 的科技/3D 类背景翻译成帧驱动；确定性动画（无随机）

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// 科技网格背景（细线网格，可呼吸/移动）
export const GridBackground: React.FC<{
  size?: number;
  lineColor?: string;
  opacity?: number;
  move?: number; // 每帧移动 px（0 = 静态）
  color?: string;
}> = ({ size = 60, lineColor = "rgba(120,120,140,0.15)", opacity = 1, move = 0, color = "#0a0a0a" }) => {
  const frame = useCurrentFrame();
  const offset = (frame * move) % size;
  return (
    <AbsoluteFill style={{ background: color, opacity }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
          transform: `translate(${offset}px, ${offset * 0.5}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// 极光渐变背景（多层径向渐变慢速漂移）
export const AuroraBackground: React.FC<{
  colors?: string[]; // 渐变主色
  speed?: number;
  opacity?: number;
  baseColor?: string;
}> = ({
  colors = ["rgba(59,130,246,0.35)", "rgba(167,139,250,0.25)", "rgba(16,185,129,0.18)"],
  speed = 0.02,
  opacity = 1,
  baseColor = "#0a0a0a",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame * speed;
  const [c1, c2, c3] = colors;

  return (
    <AbsoluteFill style={{ background: baseColor, opacity }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + 15 * Math.sin(t)}% ${25 + 10 * Math.cos(t * 1.3)}%, ${c1} 0%, transparent 50%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${70 + 12 * Math.cos(t * 0.8)}% ${65 + 12 * Math.sin(t * 1.1)}%, ${c2} 0%, transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50}% ${85}%, ${c3} 0%, transparent 45%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

// 粒子场（确定性伪随机：基于索引 + 帧相位，非 Math.random）
export const ParticleField: React.FC<{
  count?: number;
  size?: number;
  color?: string;
  opacity?: number;
  drift?: number;
  baseColor?: string;
}> = ({ count = 40, size = 3, color = "rgba(120,180,255,0.5)", opacity = 1, drift = 2, baseColor = "#0a0a0a" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = Array.from({ length: count }, (_, i) => {
    // 确定性伪随机：用 i 的数学函数生成固定分布，避免 Math.random（渲染不一致）
    const px = ((i * 7919) % 97) / 97; // 0-1 分布
    const py = ((i * 104729) % 89) / 89;
    const phase = ((i * 137) % 360) / 360;
    return {
      x: px * width,
      y: (py * height + frame * drift * (0.5 + px)) % height,
      r: size * (0.6 + 0.4 * ((i % 5) / 5)),
      phase,
    };
  });

  return (
    <AbsoluteFill style={{ background: baseColor, opacity }}>
      {particles.map((p, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.08 + p.phase * Math.PI * 2);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.r,
              height: p.r,
              borderRadius: "50%",
              background: color,
              opacity: pulse,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 噪点颗粒（film grain，氛围感）
export const NoiseOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // 确定性噪点：用帧号驱动多个色块位置
  const cells = Array.from({ length: 64 }, (_, i) => {
    const seed = (i * 31 + frame * 3) % 100;
    return { x: (seed * 13) % width, y: (seed * 7) % height, o: (seed % 20) / 100 };
  });
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.x,
            top: c.y,
            width: 2,
            height: 2,
            background: "rgba(255,255,255,0.6)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
