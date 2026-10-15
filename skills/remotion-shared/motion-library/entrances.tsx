// motion-library/entrances.tsx
// 入场动画组件：spring 弹性 / fade / scale
// 确定性动画，spring 配置走 props；只动 transform/opacity

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type EntranceProps = {
  children: React.ReactNode;
  durationFrames?: number; // 入场帧数（默认 20）
  delayFrames?: number; // 延迟帧数（默认 0）
  springConfig?: { damping?: number; stiffness?: number; mass?: number };
};

// spring 弹性入场（上移 + 淡入）
export const SpringEntrance: React.FC<EntranceProps> = ({
  children,
  durationFrames = 20,
  delayFrames = 0,
  springConfig = { damping: 10, stiffness: 80, mass: 1 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delayFrames,
    fps,
    config: springConfig,
  });
  const translateY = (1 - progress) * 60;
  const opacity = interpolate(frame, [delayFrames, delayFrames + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

// 纯淡入
export const FadeEntrance: React.FC<EntranceProps> = ({
  children,
  durationFrames = 20,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [delayFrames, delayFrames + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// 缩放入场（从 0.92 → 1）
export const ScaleEntrance: React.FC<EntranceProps> = ({
  children,
  durationFrames = 20,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [delayFrames, delayFrames + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = 0.92 + progress * 0.08;
  const opacity = progress;
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};
