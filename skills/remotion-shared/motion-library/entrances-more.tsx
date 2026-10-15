// motion-library/entrances-more.tsx
// 补充入场：旋转入场/裁剪揭示/弹跳/翻转/多方向滑入/弹性过冲

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// 旋转入场（带缩放淡入）
export const RotateIn: React.FC<{ children: React.ReactNode; durationFrames?: number; delayFrames?: number }> = ({
  children, durationFrames = 24, delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: p, transform: `rotate(${(1 - p) * 15}deg) scale(${1.2 - 0.2 * p})` }}>
      {children}
    </AbsoluteFill>
  );
};

// 裁剪揭示（从上方 clip 展开）
export const ClipReveal: React.FC<{ children: React.ReactNode; durationFrames?: number }> = ({
  children, durationFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationFrames], [0, 100], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ clipPath: `inset(0 0 ${100 - p}% 0)` }}>{children}</AbsoluteFill>;
};

// 弹跳入场（spring 过冲）
export const BounceIn: React.FC<{ children: React.ReactNode; durationFrames?: number }> = ({
  children, durationFrames = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 5, stiffness: 110, mass: 1 } });
  const scale = 0.6 + p * 0.4 + Math.sin(frame * 0.9) * (1 - p) * 0.08;
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

// 翻转入场（X 轴 3D）
export const FlipIn: React.FC<{ children: React.ReactNode; durationFrames?: number }> = ({
  children, durationFrames = 26,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: "clamp" });
  const rotateX = (1 - p) * 90;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: 1000 }}>
      <div style={{ transform: `rotateX(${rotateX}deg)`, transformStyle: "preserve-3d" }}>{children}</div>
    </AbsoluteFill>
  );
};

// 多方向滑入（从指定方向）
export const SlideInDirection: React.FC<{
  children: React.ReactNode; from?: "left" | "right" | "top" | "bottom"; durationFrames?: number;
}> = ({ children, from = "left", durationFrames = 22 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationFrames], [1, 0], { extrapolateRight: "clamp" });
  const d = 120;
  const tr =
    from === "left" ? `translateX(-${d * p}px)` :
    from === "right" ? `translateX(${d * p}px)` :
    from === "top" ? `translateY(-${d * p}px)` : `translateY(${d * p}px)`;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: tr, opacity: 1 - p * 0.6 }}>
      {children}
    </AbsoluteFill>
  );
};

// 弹性过冲（scale 冲到 1.1 再回落）
export const ElasticIn: React.FC<{ children: React.ReactNode; durationFrames?: number }> = ({
  children, durationFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / durationFrames);
  const scale = t < 0.7 ? 0.5 + 0.7 * t * t * t : 1.1 - 0.1 * Math.sin((t - 0.7) / 0.3 * Math.PI);
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};
