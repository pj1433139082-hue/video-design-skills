// motion-library/scene-cards.tsx
// 场景卡系统 T1（tracer）：数据驱动 cut.type → 场景组件分发 + 首张 StatCard。
//
// 许可边界（AGPL-3.0 clean-room）：本文件 clean-room 借鉴"数据驱动 cut.type → 场景组件分发"
// 的**架构思路**（来源项目 calesthio/OpenMontage，AGPL-3.0，见 docs/ATTRIBUTION.md）；
// **未复制其任何源码或资产**，以下实现全部从零自写，随本仓 MIT 许可。
//
// 确定性动画：帧驱动（useCurrentFrame / interpolate / spring），禁 Math.random 与浏览器定时器。

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedNumber } from "./data-anim";
import {
  CalloutBox,
  ComparisonCard,
  EndTag,
  HeroTitle,
  SectionTitle,
  TextCard,
  type CalloutCut,
  type ComparisonCut,
  type EndCut,
  type HeroCut,
  type SectionCut,
  type TextCut,
} from "./scene-cards-text";
import {
  BarChartCard,
  KPIGrid,
  LineChartCard,
  PieCard,
  RingCard,
  type BarCut,
  type KpiCut,
  type LineCut,
  type PieCut,
  type RingCut,
} from "./scene-cards-chart";

// ---------- 数据契约：SceneCut ----------
// 每句/每段口播对应一个 cut；build 按 cut.type 分发到对应场景卡，而非每帧手写。
// T1 只含 "stat"；T2/T3 按同一模式扩 union（text / callout / comparison / chart…），
// 每加一种 type = 在 SceneCut union 加一支 + 在 SceneRenderer 加一个 case + 写一张卡。

export type StatCut = {
  type: "stat";
  label: string; // 数据说明，如 "蓝光散射强度 / 红光"
  value: number; // 数值
  prefix?: string; // 前缀，如 "≈"
  suffix?: string; // 后缀 / 单位，如 "×"
  decimals?: number; // 小数位
  caption?: string; // 可选补充句
};

// T2 起 union 扩到文字/要点/对比/标题类；T3 扩图表类（pie/kpi/bar/line/ring）。
// 每加一种 type = 在 SceneCut union 加一支 + 在 SceneRenderer 加一个 case + 写一张卡。
export type SceneCut =
  | StatCut
  | TextCut
  | CalloutCut
  | ComparisonCut
  | HeroCut
  | SectionCut
  | EndCut
  | PieCut
  | KpiCut
  | BarCut
  | LineCut
  | RingCut;

// ---------- 场景卡主题（token 注入接口，走项目 tokens.ts） ----------
export type SceneCardTheme = {
  accent?: string; // 强调色（tokens.colors.accent）
  surface?: string; // 卡底（tokens.colors.surface，半透明）
  textColor?: string; // 主文字色
  monoFont?: string; // 数据字体（tokens.fonts.mono.family）
  labelFont?: string; // 说明/补充字体（tokens.fonts.caption/title.family）
};

// ---------- StatCard：数据卡（组合已有 AnimatedNumber，不重写数字滚动） ----------
type StatCardProps = Omit<StatCut, "type"> &
  SceneCardTheme & {
    durationFrames?: number; // 数字滚动 + 下划线生长帧数
    delayFrames?: number; // 入场延迟
  };

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  caption,
  accent = "#e94560",
  surface = "rgba(26,26,46,0.92)",
  textColor = "#ffffff",
  monoFont = "JetBrains Mono, monospace",
  labelFont = "Noto Sans SC, sans-serif",
  durationFrames = 30,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 卡片入场：spring 缩放 + 淡入（确定性，帧驱动）
  const enter = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 12, stiffness: 90, mass: 0.8 },
  });
  const opacity = interpolate(
    frame,
    [delayFrames, delayFrames + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = 0.9 + 0.1 * enter;

  // 强调色下划线随数字滚动生长
  const underline = interpolate(
    frame,
    [delayFrames + 8, delayFrames + 8 + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          background: surface,
          border: `2px solid ${accent}`,
          borderRadius: 28,
          padding: "56px 72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          maxWidth: "80%",
        }}
      >
        <div
          style={{
            fontFamily: labelFont,
            fontSize: 48,
            fontWeight: 700,
            color: textColor,
            opacity: 0.92,
            textAlign: "center",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 120,
            fontWeight: 800,
            color: accent,
            lineHeight: 1,
          }}
        >
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            durationFrames={durationFrames}
            delayFrames={delayFrames}
          />
        </div>
        <div
          style={{
            height: 6,
            width: `${underline * 60}%`,
            background: accent,
            borderRadius: 3,
          }}
        />
        {caption ? (
          <div
            style={{
              fontFamily: labelFont,
              fontSize: 42,
              fontWeight: 600,
              color: textColor,
              opacity: 0.78,
              textAlign: "center",
            }}
          >
            {caption}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- SceneRenderer：数据驱动分发（cut.type → 场景卡） ----------
// theme：项目 tokens 注入（转发给场景卡，不写死颜色/字体）。
// 未知 type 显式抛错，绝不静默渲染空白（守 anti-slop：不静默降级）。
export const SceneRenderer: React.FC<{
  cut: SceneCut;
  theme?: SceneCardTheme;
  durationFrames?: number;
  delayFrames?: number;
}> = ({ cut, theme, durationFrames, delayFrames }) => {
  switch (cut.type) {
    case "stat": {
      const { type, ...rest } = cut;
      return (
        <StatCard
          {...rest}
          {...theme}
          durationFrames={durationFrames}
          delayFrames={delayFrames}
        />
      );
    }
    case "text": {
      const { type, ...rest } = cut;
      return <TextCard {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "callout": {
      const { type, ...rest } = cut;
      return <CalloutBox {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "comparison": {
      const { type, ...rest } = cut;
      return <ComparisonCard {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "hero": {
      const { type, ...rest } = cut;
      return <HeroTitle {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "section": {
      const { type, ...rest } = cut;
      return <SectionTitle {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "end": {
      const { type, ...rest } = cut;
      return <EndTag {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "pie": {
      const { type, ...rest } = cut;
      return <PieCard {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "kpi": {
      const { type, ...rest } = cut;
      return <KPIGrid {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "bar": {
      const { type, ...rest } = cut;
      return <BarChartCard {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "line": {
      const { type, ...rest } = cut;
      return <LineChartCard {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    case "ring": {
      const { type, ...rest } = cut;
      return <RingCard {...rest} {...theme} durationFrames={durationFrames} delayFrames={delayFrames} />;
    }
    default: {
      const badType = (cut as { type: string }).type;
      throw new Error(
        `SceneRenderer: 未知 cut.type "${badType}"（当前支持 stat/text/callout/comparison/hero/section/end/pie/kpi/bar/line/ring；扩充见 scene-cards-contract.md）`
      );
    }
  }
};
