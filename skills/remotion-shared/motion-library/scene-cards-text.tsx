// motion-library/scene-cards-text.tsx
// 场景卡系统 T2：文字 / 要点 / 对比 / 标题类场景卡（6 张）。
//
// 许可边界（AGPL-3.0 clean-room）：clean-room 借鉴"场景卡词表"的**概念**（来源项目
// calesthio/OpenMontage，AGPL-3.0，见 docs/ATTRIBUTION.md）；**未复制其任何源码或资产**，
// 以下实现全部从零自写，随本仓 MIT。
//
// 确定性动画：帧驱动（useCurrentFrame / interpolate / spring），禁 Math.random 与浏览器定时器。
// 复用已有原语：HeroTitle 组合 kinetic-type.tsx 的 KineticText（逐字弹入），不重写。
//
// 依赖方向：scene-cards.tsx（SceneRenderer）→ 本文件（运行时单向）；本文件仅 `import type`
// SceneCardTheme（编译期擦除，不构成运行时循环）。

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SceneCardTheme } from "./scene-cards";
import { KineticText } from "./kinetic-type";

type CardTiming = {
  durationFrames?: number;
  delayFrames?: number;
};

// ---------- 1) TextCard：标题 + 多行正文 ----------
export type TextCut = {
  type: "text";
  heading?: string;
  body: string[];
  align?: "left" | "center";
};

export const TextCard: React.FC<Omit<TextCut, "type"> & SceneCardTheme & CardTiming> = ({
  heading,
  body,
  align = "center",
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 24,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delayFrames, delayFrames + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: align === "center" ? "center" : "flex-start", opacity, padding: 80 }}>
      <div style={{ background: surface, borderRadius: 24, padding: "48px 56px", maxWidth: "84%", display: "flex", flexDirection: "column", gap: 20, borderLeft: `6px solid ${accent}` }}>
        {heading ? (
          <div style={{ fontFamily: labelFont, fontSize: 56, fontWeight: 800, color: textColor }}>{heading}</div>
        ) : null}
        {body.map((line, i) => {
          const start = delayFrames + 6 + i * 6;
          const p = interpolate(frame, [start, start + durationFrames * 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                fontFamily: labelFont,
                fontSize: 42,
                fontWeight: 500,
                lineHeight: 1.5,
                color: textColor,
                opacity: p,
                transform: `translateY(${(1 - p) * 28}px)`,
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

// ---------- 2) CalloutBox：要点框（强调边 + pop-in） ----------
export type CalloutCut = {
  type: "callout";
  title: string;
  body: string;
};

export const CalloutBox: React.FC<Omit<CalloutCut, "type"> & SceneCardTheme & CardTiming> = ({
  title,
  body,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 24,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delayFrames, fps, config: { damping: 12, stiffness: 100, mass: 0.8 } });
  const opacity = interpolate(frame, [delayFrames, delayFrames + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}>
      <div
        style={{
          transform: `scale(${0.85 + 0.15 * pop})`,
          background: surface,
          border: `3px solid ${accent}`,
          borderRadius: 28,
          padding: "44px 52px",
          maxWidth: "84%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ fontFamily: labelFont, fontSize: 52, fontWeight: 800, color: accent }}>❕ {title}</div>
        <div style={{ fontFamily: labelFont, fontSize: 42, fontWeight: 500, lineHeight: 1.5, color: textColor }}>{body}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3) ComparisonCard：左右对比（两侧滑入） ----------
export type ComparisonCut = {
  type: "comparison";
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  vsLabel?: string;
};

export const ComparisonCard: React.FC<Omit<ComparisonCut, "type"> & SceneCardTheme & CardTiming> = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  vsLabel = "VS",
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 24,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const offset = (1 - slide) * 120;
  const opacity = interpolate(frame, [delayFrames, delayFrames + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const Panel: React.FC<{ label: string; value: string; dx: number; highlight?: boolean }> = ({ label, value, dx, highlight }) => (
    <div
      style={{
        transform: `translateX(${dx}px)`,
        background: surface,
        border: `2px solid ${highlight ? accent : "rgba(255,255,255,0.25)"}`,
        borderRadius: 24,
        padding: "36px 40px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ fontFamily: labelFont, fontSize: 40, fontWeight: 700, color: textColor, opacity: 0.85 }}>{label}</div>
      <div style={{ fontFamily: monoFont, fontSize: 72, fontWeight: 800, color: highlight ? accent : textColor }}>{value}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}>
      <div style={{ display: "flex", gap: 28, width: "88%", alignItems: "stretch", position: "relative" }}>
        <Panel label={leftLabel} value={leftValue} dx={-offset} highlight />
        <div style={{ alignSelf: "center", fontFamily: monoFont, fontSize: 44, fontWeight: 800, color: accent }}>{vsLabel}</div>
        <Panel label={rightLabel} value={rightValue} dx={offset} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4) HeroTitle：大字标题（复用 KineticText 逐字弹入） ----------
export type HeroCut = {
  type: "hero";
  title: string;
  subtitle?: string;
};

export const HeroTitle: React.FC<Omit<HeroCut, "type"> & SceneCardTheme & CardTiming> = ({
  title,
  subtitle,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 24,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const subOpacity = interpolate(frame, [delayFrames + 20, delayFrames + 20 + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, maxWidth: "88%" }}>
        <KineticText
          text={title}
          framesPerChar={3}
          durationFrames={durationFrames}
          delayFrames={delayFrames}
          activeColor={textColor}
          inactiveColor={accent}
          style={{ fontFamily: labelFont, fontSize: 96, fontWeight: 900, lineHeight: 1.2, justifyContent: "center", textAlign: "center" }}
        />
        {subtitle ? (
          <div style={{ fontFamily: labelFont, fontSize: 44, fontWeight: 600, color: textColor, opacity: subOpacity * 0.85, textAlign: "center" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5) SectionTitle：章节标题（mono 序号 + 下划线生长） ----------
export type SectionCut = {
  type: "section";
  index?: string;
  title: string;
};

export const SectionTitle: React.FC<Omit<SectionCut, "type"> & SceneCardTheme & CardTiming> = ({
  index,
  title,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 24,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const underline = interpolate(frame, [delayFrames + 6, delayFrames + 6 + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [delayFrames, delayFrames + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", opacity, padding: 100 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {index ? (
          <div style={{ fontFamily: monoFont, fontSize: 48, fontWeight: 700, color: accent }}>{index}</div>
        ) : null}
        <div style={{ fontFamily: labelFont, fontSize: 80, fontWeight: 900, color: textColor }}>{title}</div>
        <div style={{ height: 6, width: `${underline * 40}%`, background: accent, borderRadius: 3 }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6) EndTag：收尾标签（fade + scale settle） ----------
export type EndCut = {
  type: "end";
  tagline: string;
  credit?: string;
};

export const EndTag: React.FC<Omit<EndCut, "type"> & SceneCardTheme & CardTiming> = ({
  tagline,
  credit,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 24,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = spring({ frame: frame - delayFrames, fps, config: { damping: 14, stiffness: 80, mass: 1 } });
  const opacity = interpolate(frame, [delayFrames, delayFrames + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}>
      <div style={{ transform: `scale(${0.92 + 0.08 * settle})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ fontFamily: labelFont, fontSize: 72, fontWeight: 900, color: textColor, textAlign: "center" }}>{tagline}</div>
        <div style={{ height: 4, width: 180, background: accent, borderRadius: 2 }} />
        {credit ? (
          <div style={{ fontFamily: monoFont, fontSize: 40, fontWeight: 600, color: textColor, opacity: 0.7 }}>{credit}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
