// motion-library/transitions-advanced.tsx
// 进阶转场：curtain / wipe / flip / parallax
// 从 landing.love 的滚动转场翻译成视频帧驱动；确定性动画，只动 transform/opacity

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type AdvTransitionProps = {
  children: React.ReactNode;
  durationFrames?: number;
  direction?: "in" | "out";
};

// 窗帘拉开：左半/右半朝两侧平移，露出下层
export const CurtainTransition: React.FC<AdvTransitionProps> = ({
  children,
  durationFrames = 20,
  direction = "in",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [0, durationFrames],
    direction === "in" ? [0, 1] : [1, 0],
    { extrapolateRight: "clamp" }
  );
  const shift = progress * 50; // 50% 位移
  return (
    <AbsoluteFill>
      {/* 左半 */}
      <AbsoluteFill
        style={{
          width: "50%",
          left: 0,
          transform: `translateX(${-shift}%)`,
          background: "#0a0a0a",
        }}
      />
      {/* 右半 */}
      <AbsoluteFill
        style={{
          width: "50%",
          left: "50%",
          transform: `translateX(${shift}%)`,
          background: "#0a0a0a",
        }}
      />
      <AbsoluteFill style={{ opacity: progress }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// 擦除：从下往上揭示（遮罩上移）
export const WipeTransition: React.FC<AdvTransitionProps> = ({
  children,
  durationFrames = 16,
  direction = "in",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [0, durationFrames],
    direction === "in" ? [1, 0] : [0, 1],
    { extrapolateRight: "clamp" }
  );
  const { height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ clipPath: `inset(${progress * 100}% 0 0 0)` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 翻转：Y 轴 3D 翻转
export const FlipTransition: React.FC<AdvTransitionProps> = ({
  children,
  durationFrames = 20,
  direction = "in",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const progress = interpolate(
    frame,
    [0, durationFrames],
    direction === "in" ? [90, 0] : [0, 90],
    { extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill
      style={{
        width,
        height,
        perspective: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ transform: `rotateY(${progress}deg)`, transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

// 视差：背景平移 + 前景对向平移（层次感）
export const ParallaxTransition: React.FC<
  AdvTransitionProps & { bgChildren?: React.ReactNode; shift?: number }
> = ({ children, bgChildren, durationFrames = 24, shift = 120 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 背景层对向平移（慢） */}
      {bgChildren && (
        <AbsoluteFill style={{ transform: `translateX(${shift * (1 - progress) * -1}px)` }}>
          {bgChildren}
        </AbsoluteFill>
      )}
      {/* 前景层进入（快） */}
      <AbsoluteFill
        style={{
          transform: `translateX(${shift * (1 - progress)}px)`,
          opacity: interpolate(frame, [0, Math.floor(durationFrames * 0.4)], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
