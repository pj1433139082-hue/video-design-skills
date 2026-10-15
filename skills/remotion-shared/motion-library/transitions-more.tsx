// motion-library/transitions-more.tsx
// 补充转场：对角擦除/圆形揭示/百叶窗/快门/毛刺/拉远/旋转/遮罩滑动
// 确定性动画，帧驱动

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type P = { children: React.ReactNode; durationFrames?: number; direction?: "in" | "out" };

// 对角擦除（clip-path 斜切）
export const DiagonalWipe: React.FC<P> = ({ children, durationFrames = 18 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [100, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ clipPath: `polygon(0 0, 100% 0, ${100 - progress}% 100%, 0 100%)` }}>
      {children}
    </AbsoluteFill>
  );
};

// 圆形揭示（从中心扩散）
export const CircleReveal: React.FC<P> = ({ children, durationFrames = 24 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const progress = interpolate(frame, [0, durationFrames], [0, 100], { extrapolateRight: "clamp" });
  const radius = Math.hypot(width, height) / 2 * (progress / 100);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${radius}px at 50% 50%)` }}>{children}</AbsoluteFill>
  );
};

// 百叶窗（多条横条依次展开）
export const BlindsTransition: React.FC<P> = ({ children, durationFrames = 20 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: "clamp" });
  const bars = 8;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - progress * 0.5 }}>{children}</AbsoluteFill>
      {Array.from({ length: bars }, (_, i) => {
        const barH = 100 / bars;
        const barProgress = Math.max(0, Math.min(1, (progress * bars - i) / 1.5));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${i * barH}%`,
              height: `${barH}%`,
              width: `${barProgress * 100}%`,
              left: 0,
              background: "#0a0a0a",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 快门（上下两条夹合）
export const ShutterTransition: React.FC<P> = ({ children, durationFrames = 16 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [0, 50], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: progress / 50 * 0.8 }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${progress}%`, background: "#0a0a0a" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${progress}%`, background: "#0a0a0a" }} />
    </AbsoluteFill>
  );
};

// 毛刺（RGB 分离抖动，快节奏用）
export const GlitchTransition: React.FC<P> = ({ children, durationFrames = 12 }) => {
  const frame = useCurrentFrame();
  const active = frame < durationFrames;
  const offset = active ? Math.sin(frame * 3.7) * 12 : 0;
  return (
    <AbsoluteFill style={{ opacity: active ? 1 : 0.6 }}>
      <AbsoluteFill style={{ transform: `translateX(${offset}px)`, filter: "hue-rotate(0deg)" }}>
        <div style={{ width: "100%", height: "100%", background: "rgba(255,0,0,0.15)" }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 拉远（从放大状态缩回，配合淡入）
export const ZoomOutTransition: React.FC<P & { maxScale?: number }> = ({
  children, durationFrames = 20, maxScale = 1.15,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [1, 0], { extrapolateRight: "clamp" });
  const scale = 1 + (maxScale - 1) * progress;
  const opacity = 1 - progress * 0.4;
  return <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>{children}</AbsoluteFill>;
};

// 旋转入场（带旋转 + 缩放）
export const RotateTransition: React.FC<P & { maxDeg?: number }> = ({
  children, durationFrames = 20, maxDeg = 8,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `rotate(${maxDeg * progress}deg) scale(${1 + 0.05 * progress})` }}>
      {children}
    </AbsoluteFill>
  );
};

// 遮罩滑动（clip-path 从一侧展开）
export const MaskSlide: React.FC<P & { from?: "left" | "right" | "top" | "bottom" }> = ({
  children, durationFrames = 18, from = "left",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [0, 100], { extrapolateRight: "clamp" });
  const inset = `${100 - progress}%`;
  const clip =
    from === "left" ? `inset(0 ${inset} 0 0)` :
    from === "right" ? `inset(0 0 0 ${inset})` :
    from === "top" ? `inset(${inset} 0 0 0)` :
    `inset(0 0 ${inset} 0)`;
  return <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>;
};
