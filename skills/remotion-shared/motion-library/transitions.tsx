// motion-library/transitions.tsx
// 转场组件库：cut / fade / slide-up / punch-in
// 确定性动画，时长走 props（默认 10 帧）；只动 transform/opacity

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type TransitionProps = {
  children: React.ReactNode;
  durationFrames?: number; // 转场帧数（默认 10）
  direction?: "in" | "out"; // 入场或出场（供场景级编排用，默认 in）
};

// 硬切（无过渡）——占位，让转场语言显式可读
export const CutTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>{children}</AbsoluteFill>
);

// 淡入淡出
export const FadeTransition: React.FC<TransitionProps> = ({
  children,
  durationFrames = 10,
  direction = "in",
}) => {
  const frame = useCurrentFrame();
  const opacity =
    direction === "in"
      ? interpolate(frame, [0, durationFrames], [0, 1], {
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [0, durationFrames], [1, 0], {
          extrapolateRight: "clamp",
        });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// 上滑入场
export const SlideUpTransition: React.FC<TransitionProps> = ({
  children,
  durationFrames = 10,
  direction = "in",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [0, durationFrames],
    direction === "in" ? [1, 0] : [0, 1],
    { extrapolateRight: "clamp" }
  );
  const translateY = progress * 60; // 60px 上滑距离
  const opacity = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

// 推近（punch-in）：缩放 + 轻微上移，配场景内主体
export const PunchInTransition: React.FC<
  TransitionProps & { maxScale?: number }
> = ({ children, durationFrames = 12, direction = "in", maxScale = 1.08 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = direction === "in" ? 1 + (maxScale - 1) * (1 - progress) : 1 + (maxScale - 1) * progress;
  const translateY = direction === "in" ? -20 * (1 - progress) : -20 * progress;
  return (
    <AbsoluteFill
      style={{
        width,
        height,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transformOrigin: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
