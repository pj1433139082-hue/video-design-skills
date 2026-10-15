// motion-library/backgrounds-web.tsx
// 背景动效（Web 扒源码适配）：ShaderBackground（WebGL 程序化地形/霓虹等高线）
//   + GradientMeshBackground（CSS 网格 + radial 渐变光斑，帧驱动漂移）
// 来源：
//   - 21st.dev @ashishrajwaniai01/components/animated-pattern-cloud（WebGL fragment shader）
//   - 21st.dev @meghtrix/components/gradient-blur-bg（CSS 渐变背景，3 变体）
// 适配：把 web 组件（requestAnimationFrame + window 尺寸 + useEffect([])）
//   重构为 Remotion 帧驱动；确定性动画：无 Math.random / 无 RAF / 无浏览器定时器。
// 说明：ShaderBackground 的 GLSL 数学（hash/noise/topoLine/depth）保持原样，
//   仅把硬编码颜色改为 uniform（颜色 props 可覆盖）；canvas 固定到 composition 尺寸。

import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// ============ WebGL 片段着色器（原样保留噪声/等高线数学） ============

export const SHADER_BACKGROUND_VERTEX = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const SHADER_BACKGROUND_GLSL = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_baseColor;
  uniform vec3 u_accentColor;
  uniform vec3 u_neonColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    // Ground Perspective Simulation
    float depth = 1.0 / (uv.y + 1.15);
    vec2 gridUv = vec2(uv.x * depth, depth + u_time * 0.15);

    // Layered Procedural Noise for Terrain
    float n = noise(gridUv * 3.5);
    float ripples = sin(gridUv.y * 18.0 + n * 8.0 + u_time * 0.5);

    // Neon Topographic Lines
    float topoLine = smoothstep(0.03, 0.0, abs(ripples));

    // Color Palette (uniform，默认沿用原 shader 深空蓝紫)
    vec3 baseColor = u_baseColor;
    vec3 accentColor = u_accentColor;
    vec3 neonColor = u_neonColor;

    // Composite
    vec3 finalColor = mix(baseColor, accentColor, n * 0.6);
    finalColor += topoLine * neonColor * depth * 0.4;

    // Horizon Fog / Fade
    float fade = smoothstep(0.1, -1.0, uv.y);
    finalColor *= (1.0 - length(uv) * 0.45) * (1.0 - fade);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// 默认配色（深空蓝紫，对应原 shader 的 base/accent/neon）
export const SHADER_BACKGROUND_DEFAULT_COLORS = {
  base: "#0a081f", // Deep Space 0.04,0.03,0.12
  accent: "#1a4dcc", // Electric Blue 0.1,0.3,0.8
  neon: "#9933ff", // Neon Purple 0.6,0.2,1.0
} as const;

export type ShaderColors = { base: string; accent: string; neon: string };

// hex (#rrggbb / #rgb) → [0-1]³，用于 uniform3f
const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// WebGL 初始化状态（setup 后存 ref，逐帧只更新 uniform + draw）
type GLState = {
  gl: WebGLRenderingContext;
  timeLoc: WebGLUniformLocation | null;
  resLoc: WebGLUniformLocation | null;
  baseLoc: WebGLUniformLocation | null;
  accentLoc: WebGLUniformLocation | null;
  neonLoc: WebGLUniformLocation | null;
};

const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

const initGL = (canvas: HTMLCanvasElement): GLState | null => {
  const gl = canvas.getContext("webgl");
  if (!gl) return null;

  const vs = createShader(gl, gl.VERTEX_SHADER, SHADER_BACKGROUND_VERTEX);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, SHADER_BACKGROUND_GLSL);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const posAttrib = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(posAttrib);
  gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    timeLoc: gl.getUniformLocation(program, "u_time"),
    resLoc: gl.getUniformLocation(program, "u_resolution"),
    baseLoc: gl.getUniformLocation(program, "u_baseColor"),
    accentLoc: gl.getUniformLocation(program, "u_accentColor"),
    neonLoc: gl.getUniformLocation(program, "u_neonColor"),
  };
};

// WebGL 程序化背景：地形霓虹等高线 + 沙波纹（确定性逐帧重绘）
// 来源：21st.dev @ashishrajwaniai01/components/animated-pattern-cloud
export const ShaderBackground: React.FC<{
  colors?: ShaderColors;
  speed?: number; // u_time 流速倍率（默认 1 = 实时秒速）
  opacity?: number;
  filter?: string; // canvas CSS filter（原组件 contrast/brightness 风格）
  baseColor?: string; // WebGL 不可用时的降级纯色
}> = ({
  colors = SHADER_BACKGROUND_DEFAULT_COLORS,
  speed = 1,
  opacity = 1,
  filter = "contrast(1.1) brightness(0.9)",
  baseColor = "#0a081f",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<GLState | null>(null);
  const time = (frame / fps) * speed;

  // 初始化 WebGL（composition 尺寸固定，通常只跑一次；宽高变化时重建）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      glRef.current = null;
      return;
    }
    glRef.current = initGL(canvas);
  }, [width, height]);

  // 逐帧重绘：只更新 uniform + drawArrays（无 RAF 循环，逐帧确定性）
  useEffect(() => {
    const state = glRef.current;
    const canvas = canvasRef.current;
    if (!state || !canvas) return;
    const { gl, timeLoc, resLoc, baseLoc, accentLoc, neonLoc } = state;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    gl.uniform1f(timeLoc, time);
    gl.uniform2f(resLoc, width, height);
    gl.uniform3f(baseLoc, ...hexToRgb(colors.base));
    gl.uniform3f(accentLoc, ...hexToRgb(colors.accent));
    gl.uniform3f(neonLoc, ...hexToRgb(colors.neon));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [frame, width, height, time, colors.base, colors.accent, colors.neon]);

  return (
    <AbsoluteFill style={{ background: baseColor, opacity }}>
      {/* WebGL 不可用（getContext 返回 null）时 canvas 空白 → 透出降级纯色 */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter }}
      />
    </AbsoluteFill>
  );
};

// ============ CSS 网格 + 径向渐变光斑背景（帧驱动漂移） ============
// 来源：21st.dev @meghtrix/components/gradient-blur-bg（3 变体）

export type GradientMeshLayout = "diagonal" | "corners";

export type GradientMeshProps = {
  gridColor?: string;
  gridSize?: number; // 网格边长 px（方网格）
  radialColors?: string[]; // 1-2 个径向光斑色（末尾 transparent）
  radialSize?: number; // 径向渐变圆半径 px
  speed?: number; // 光斑漂移速度
  gridOpacity?: number;
  opacity?: number;
  baseColor?: string;
  layout?: GradientMeshLayout; // diagonal = 对角双光斑；corners = 四角互换
};

export const GradientMeshBackground: React.FC<GradientMeshProps> = ({
  gridColor = "rgba(229,231,235,0.8)",
  gridSize = 48,
  radialColors = ["rgba(139,92,246,0.3)", "rgba(59,130,246,0.3)"],
  radialSize = 500,
  speed = 0.02,
  gridOpacity = 1,
  opacity = 1,
  baseColor = "#ffffff",
  layout = "diagonal",
}) => {
  const frame = useCurrentFrame();
  const t = frame * speed;
  const [c1, c2] = radialColors;

  // 光斑锚点：diagonal = (20,80)+(80,20)；corners = (20,20)+(80,80)，再叠加缓慢漂移
  const ax = layout === "corners" ? 20 : 20;
  const ay = layout === "corners" ? 20 : 80;
  const bx = layout === "corners" ? 80 : 80;
  const by = layout === "corners" ? 80 : 20;
  const x1 = ax + 6 * Math.sin(t * 1.1);
  const y1 = ay + 5 * Math.cos(t * 0.8);
  const x2 = bx + 6 * Math.cos(t * 0.9);
  const y2 = by + 5 * Math.sin(t * 1.2);

  // 组装 radial 层（1-2 个，空则忽略）
  const radialLayers: string[] = [
    `radial-gradient(circle ${radialSize}px at ${x1}% ${y1}%, ${c1}, transparent)`,
  ];
  if (c2) radialLayers.push(`radial-gradient(circle ${radialSize}px at ${x2}% ${y2}%, ${c2}, transparent)`);
  const radialBg = radialLayers.join(", ");
  const radialBgSize = radialLayers.map(() => "100% 100%").join(", ");

  return (
    <AbsoluteFill style={{ background: baseColor, opacity }}>
      {/* 网格层（静态细线网格） */}
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px`,
        }}
      />
      {/* 径向光斑层（帧驱动缓慢漂移） */}
      <AbsoluteFill
        style={{
          backgroundImage: radialBg,
          backgroundSize: radialBgSize,
        }}
      />
    </AbsoluteFill>
  );
};

// —— 预设变体（对应原 3 变体）——

// 变体 1：紫色网格渐变（左发单光斑）
export const GradientMeshGridLeft: React.FC<Partial<GradientMeshProps>> = (props) => (
  <GradientMeshBackground
    gridColor="#f0f0f0"
    gridSize={96}
    radialColors={["#d5c5ff"]}
    radialSize={800}
    baseColor="#ffffff"
    {...props}
  />
);

// 变体 2：Dual Gradient Overlay（网格 + 双 radial 对角）
export const DualGradientOverlay: React.FC<Partial<GradientMeshProps>> = (props) => (
  <GradientMeshBackground
    gridColor="rgba(229,231,235,0.8)"
    gridSize={48}
    radialColors={["rgba(139,92,246,0.3)", "rgba(59,130,246,0.3)"]}
    baseColor="#ffffff"
    {...props}
  />
);

// 变体 3：Dual Gradient Overlay Swapped（对角互换 → corners）
export const DualGradientOverlaySwapped: React.FC<Partial<GradientMeshProps>> = (props) => (
  <GradientMeshBackground
    layout="corners"
    gridColor="rgba(229,231,235,0.8)"
    gridSize={48}
    radialColors={["rgba(139,92,246,0.3)", "rgba(59,130,246,0.3)"]}
    baseColor="#ffffff"
    {...props}
  />
);
