// motion-library/entrances-extra.tsx
// 补充入场 + 文字动效：摆动 / 缩放模糊 / 字距展开 / 中心展开 / 升起 / 数字滚动 / 渐变字 / 描边字 / 波浪逐字 / 光泽扫过
// 确定性动画，帧驱动；只动 transform/opacity/filter/background-position

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// 摆动入场：绕底边小幅摆动并淡入（悬挂标牌感）
export const SwingIn: React.FC<{ children: React.ReactNode; durationFrames?: number; maxDeg?: number }> = ({
  children,
  durationFrames = 26,
  maxDeg = 12,
}) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / durationFrames);
  const deg = maxDeg * Math.exp(-4 * t) * Math.cos(t * 7);
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        transform: `rotate(${deg}deg)`,
        transformOrigin: "center top",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 缩放模糊入场：从放大 + 模糊状态收拢清晰（电影感标题）
export const ZoomBlurIn: React.FC<{ children: React.ReactNode; durationFrames?: number; delayFrames?: number }> = ({
  children,
  durationFrames = 26,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = 1.12 - 0.12 * p;
  const blur = 10 * (1 - p);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: p,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 字距展开：letter-spacing 由宽收窄 + 淡入（高级感大标题）
export const LetterSpacingIn: React.FC<{
  text: string;
  durationFrames?: number;
  delayFrames?: number;
  fromEm?: number;
  style?: React.CSSProperties;
}> = ({ text, durationFrames = 30, delayFrames = 0, fromEm = 0.5, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spacing = fromEm * (1 - p);
  return (
    <span
      style={{
        display: "inline-block",
        opacity: interpolate(frame, [delayFrames, delayFrames + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        letterSpacing: `${spacing}em`,
        ...style,
      }}
    >
      {text}
    </span>
  );
};

// 中心展开：X/Y 从中心同时展开（像纸门打开）
export const RevealFromCenter: React.FC<{ children: React.ReactNode; durationFrames?: number }> = ({
  children,
  durationFrames = 24,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: "clamp" });
  const scaleX = 0.1 + 0.9 * p;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: p,
        transform: `scaleX(${scaleX})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 升起：spring 弹性从下方升起 + 淡入
export const RiseIn: React.FC<{ children: React.ReactNode; distance?: number; delayFrames?: number }> = ({
  children,
  distance = 80,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const opacity = interpolate(frame, [delayFrames, delayFrames + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        transform: `translateY(${(1 - p) * distance}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 数字滚动：从 0 滚到目标值（带千分位格式，数据大字报）
export const CountUpText: React.FC<{
  value: number;
  durationFrames?: number;
  delayFrames?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  style?: React.CSSProperties;
}> = ({ value, durationFrames = 40, delayFrames = 0, decimals = 0, prefix = "", suffix = "", locale = "zh-CN", style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const current = value * p;
  const formatted = current.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

// 渐变文字：背景渐变位移动画（流光文字）
export const GradientText: React.FC<{
  text: string;
  colors?: string[];
  speed?: number;
  style?: React.CSSProperties;
}> = ({ text, colors = ["#3b82f6", "#a855f7", "#ec4899", "#3b82f6"], speed = 0.02, style }) => {
  const frame = useCurrentFrame();
  const pos = (frame * speed * 100) % 100;
  const bg = `linear-gradient(90deg, ${colors.join(", ")})`;
  return (
    <span
      style={{
        display: "inline-block",
        backgroundImage: bg,
        backgroundSize: "300% 100%",
        backgroundPosition: `${pos}% 0`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        ...style,
      }}
    >
      {text}
    </span>
  );
};

// 描边字：透明填充 + 描边，随帧轻微呼吸（标题骨架感）
export const TextStroke: React.FC<{
  text: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}> = ({ text, strokeColor = "rgba(255,255,255,0.9)", strokeWidth = 2, style }) => {
  const frame = useCurrentFrame();
  const opacity = 0.75 + 0.25 * Math.sin(frame * 0.08);
  return (
    <span
      style={{
        display: "inline-block",
        color: "transparent",
        WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
        opacity,
        ...style,
      }}
    >
      {text}
    </span>
  );
};

// 波浪逐字：每个字符按正弦波依次弹起（活泼感）
export const WaveReveal: React.FC<{
  text: string;
  perChar?: number;
  durationFrames?: number;
  wave?: number;
  style?: React.CSSProperties;
}> = ({ text, perChar = 3, durationFrames = 14, wave = 8, style }) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...style }}>
      {chars.map((ch, i) => {
        const start = i * perChar;
        const p = interpolate(frame, [start, start + durationFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        // 入场后保持轻微正弦浮动，形成波浪
        const float = Math.sin(frame * 0.15 + i * 0.7) * wave * 0.4;
        const rise = (1 - p) * wave;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${rise + float}px)`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </div>
  );
};

// 光泽扫过：白色高光条从左到右扫过文字（广告标题常用）
export const ShineText: React.FC<{
  text: string;
  durationFrames?: number;
  delayFrames?: number;
  shineColor?: string;
  style?: React.CSSProperties;
}> = ({ text, durationFrames = 36, delayFrames = 0, shineColor = "rgba(255,255,255,0.85)", style }) => {
  const frame = useCurrentFrame();
  const cycle = 18; // 单次扫过帧数
  const local = (frame - delayFrames) % cycle;
  const pos = interpolate(local, [0, cycle], [-150, 150], { extrapolateRight: "clamp" });
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        ...style,
      }}
    >
      {text}
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "30%",
          transform: `translateX(${pos}%)`,
          background: `linear-gradient(100deg, transparent, ${shineColor}, transparent)`,
          pointerEvents: "none",
        }}
      />
    </span>
  );
};
