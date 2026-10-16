// motion-library/index.ts — 总动效库统一导出
// 视频项目：import { CaptionLayer, FadeTransition, GridBackground, ... } from "../../_动效库";

// 基础转场
export * from "./transitions";
// 进阶转场（curtain/wipe/flip/parallax）
export * from "./transitions-advanced";
// 更多转场（对角/圆形/百叶窗/快门/毛刺/拉远/旋转/遮罩）
export * from "./transitions-more";
// 入场（spring/fade/scale）
export * from "./entrances";
// 进阶入场（stagger/typewriter/blur-in）
export * from "./entrances-advanced";
// 更多入场（旋转/裁剪/弹跳/翻转/多方向/弹性）
export * from "./entrances-more";
// 数据动画（数字滚动/柱条生长/柱状图）
export * from "./data-anim";
// 字幕（词级/整句）
export * from "./captions-highlight";
// 背景动效（网格/极光/粒子/噪点）
export * from "./backgrounds";
// 文字动效（kinetic type/line reveal）
export * from "./kinetic-type";
// 补充组件（光球/圆点/折线/进度环/字符翻转等）
export * from "./motion-extras";
// 补充转场（柔和擦除/霓虹光带/层叠揭示/透视翻转/摆动/环绕/分裂/色差/光圈/溶解）
export * from "./transitions-extra";
// 补充入场 + 文字动效（摆动/缩放模糊/字距展开/中心展开/升起/数字滚动/渐变字/描边字/波浪/光泽）
export * from "./entrances-extra";
// 补充背景 + 数据动效（雨滴/暗角/透视网格/波浪/彩带/星空/环形图/热度条/趋势线/仪表盘）
export * from "./backgrounds-extra";
// Web 扒源码适配背景（WebGL 程序化地形/霓虹等高线 + CSS 网格/radial 渐变光斑）
export * from "./backgrounds-web";
// 场景卡系统（数据驱动 cut.type 分发 SceneRenderer + StatCard；T1 tracer，契约见 scene-cards-contract.md）
export * from "./scene-cards";
// 场景卡系统 T2：文字/要点/对比/标题类场景卡（TextCard/CalloutBox/ComparisonCard/HeroTitle/SectionTitle/EndTag）
export * from "./scene-cards-text";

export type { HighlightMode, CaptionTheme, CaptionLayout } from "./captions-highlight";
export type { SceneCut, StatCut, SceneCardTheme } from "./scene-cards";
