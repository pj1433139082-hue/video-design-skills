// motion-library/kinetic-type.tsx
// 文字动效：逐字弹入（品牌动效类核心，从 landing.love Typography 类翻译）
// 确定性动画：逐字用 frame 相位控制，禁随机

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type KineticTextProps = {
  text: string;
  framesPerChar?: number; // 每字间隔帧数
  durationFrames?: number; // 单字入场帧数
  delayFrames?: number;
  style?: React.CSSProperties;
  activeColor?: string;
  inactiveColor?: string;
};

// 逐字弹入（大标题用，品牌动效）
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  framesPerChar = 4,
  durationFrames = 16,
  delayFrames = 0,
  style,
  activeColor = "#ffffff",
  inactiveColor = "rgba(255,255,255,0.25)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Array.from(text);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...style }}>
      {chars.map((ch, i) => {
        const start = delayFrames + i * framesPerChar;
        const p = spring({
          frame: frame - start,
          fps,
          config: { damping: 12, stiffness: 100, mass: 0.6 },
        });
        const opacity = interpolate(frame, [start, start + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const done = frame >= start + durationFrames;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: done ? activeColor : inactiveColor,
              opacity,
              transform: `translateY(${(1 - p) * 40}px) rotate(${(1 - p) * 6}deg)`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </div>
  );
};

// 逐行揭示（多行文字，每行一次滑入）
export const LineReveal: React.FC<{
  lines: string[];
  framesPerLine?: number;
  style?: React.CSSProperties;
}> = ({ lines, framesPerLine = 20, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...style }}>
        {lines.map((line, i) => {
          const start = i * framesPerLine;
          const p = spring({
            frame: frame - start,
            fps,
            config: { damping: 14, stiffness: 90, mass: 0.8 },
          });
          return (
            <div
              key={i}
              style={{
                opacity: interpolate(frame, [start, start + 10], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                transform: `translateX(${(1 - p) * 60}px)`,
                marginBottom: 16,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
