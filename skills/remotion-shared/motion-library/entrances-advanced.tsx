// motion-library/entrances-advanced.tsx
// 进阶入场：Stagger 交错 / Typewriter 打字机 / BlurIn 模糊入场
// 从 landing.love 的滚动入场翻译成帧驱动；确定性动画

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type BaseProps = {
  children?: React.ReactNode;
  durationFrames?: number;
  delayFrames?: number;
};

// 交错入场：每个子元素依次弹入（用于列表/卡片组）
export const StaggerEntrance: React.FC<
  BaseProps & { staggerFrames?: number; from?: "up" | "down" | "left" | "right" }
> = ({ children, durationFrames = 20, delayFrames = 0, staggerFrames = 6, from = "up" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = React.Children.toArray(children);

  const offsets: Record<string, string> = {
    up: "translateY(48px)",
    down: "translateY(-48px)",
    left: "translateX(48px)",
    right: "translateX(-48px)",
  };

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 24 }}>
        {items.map((child, i) => {
          const p = spring({
            frame: frame - delayFrames - i * staggerFrames,
            fps,
            config: { damping: 12, stiffness: 90, mass: 1 },
          });
          const opacity = interpolate(frame, [delayFrames + i * staggerFrames, delayFrames + i * staggerFrames + 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translate(${0}px, ${0}px) ${offsets[from]} scale(${0.94 + p * 0.06})`,
              }}
            >
              {child}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 打字机：逐字显示（用于标题/强调句）
export const TypewriterText: React.FC<
  { text: string; framesPerChar?: number; delayFrames?: number; style?: React.CSSProperties }
> = ({ text, framesPerChar = 3, delayFrames = 0, style }) => {
  const frame = useCurrentFrame();
  const visibleChars = Math.max(
    0,
    Math.min(text.length, Math.floor((frame - delayFrames) / framesPerChar))
  );
  return (
    <span style={style}>
      {text.slice(0, visibleChars)}
      <span style={{ opacity: 0.6 }}>▌</span>
    </span>
  );
};

// 模糊入场：blur + 淡入（高级感，适合标题）
export const BlurIn: React.FC<BaseProps & { style?: React.CSSProperties }> = ({
  children,
  durationFrames = 24,
  delayFrames = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blur = 12 * (1 - progress);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: progress,
        filter: `blur(${blur}px)`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
