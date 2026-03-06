"use client";

import { useId, type ReactNode } from "react";
import { useTheme } from "@/contexts/theme-context";
import type { HubBgTheme, PlatformPosition } from "@/components/ui/hub-figures";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface HubPlatformConfig {
  position: PlatformPosition;
  label: string;
  sublabel: string;
  colorScheme: "indigo" | "cyan";
  /**
   * SVG children rendered on the platform top face.
   * Origin (0,0) = platform equator centre.
   * Top face spans roughly y ∈ [−54, 0] and x ∈ [−108, 108].
   */
  figure?: ReactNode;
}

export interface HubIllustrationProps {
  /** 1 – 4 satellite platforms; only specified positions are rendered */
  platforms: HubPlatformConfig[];
  /** Background / hub colour theme (default: "indigo") */
  bgTheme?: HubBgTheme;
  /** Section title rendered as HTML above the illustration */
  title?: string;
  /** Section subtitle rendered as HTML above the illustration */
  subtitle?: string;
  /** Text on the central hub front face */
  hubLabel?: string;
  /** Sub-text on the central hub front face */
  hubSublabel?: string;
  /** Accessible SVG title */
  ariaTitle?: string;
  /** Accessible SVG description */
  ariaDesc?: string;
  className?: string;
}

// ─── Isometric geometry ───────────────────────────────────────────────────────
// cx/cy = equator centre, hw = half-width, qh = iso half-depth, d = extrusion

const PLAT: Record<PlatformPosition, { cx: number; cy: number; hw: number; qh: number; d: number }> = {
  "top-left":     { cx: 285, cy: 242, hw: 108, qh: 54, d: 22 },
  "top-right":    { cx: 915, cy: 242, hw: 108, qh: 54, d: 22 },
  "bottom-left":  { cx: 215, cy: 532, hw: 108, qh: 54, d: 22 },
  "bottom-right": { cx: 985, cy: 532, hw: 108, qh: 54, d: 22 },
};

const HUB = { cx: 600, cy: 390, hw: 158, qh: 79, d: 32 };

// Connection lines: platform corner → hub edge
const CONN: Record<PlatformPosition, { x1: number; y1: number; x2: number; y2: number; scheme: "indigo" | "cyan"; delay: string }> = {
  "top-left":     { x1: 390, y1: 248, x2: 450, y2: 385, scheme: "indigo", delay: "0s" },
  "top-right":    { x1: 810, y1: 248, x2: 750, y2: 385, scheme: "cyan",   delay: "-0.45s" },
  "bottom-left":  { x1: 322, y1: 528, x2: 450, y2: 400, scheme: "indigo", delay: "-0.9s" },
  "bottom-right": { x1: 878, y1: 528, x2: 750, y2: 400, scheme: "cyan",   delay: "-1.35s" },
};

// Blinking mid-point nodes
const NODES: Record<PlatformPosition, { cx: number; cy: number; scheme: "indigo" | "cyan"; delay: string }> = {
  "top-left":     { cx: 420, cy: 316, scheme: "indigo", delay: "0s" },
  "top-right":    { cx: 780, cy: 316, scheme: "cyan",   delay: "-0.5s" },
  "bottom-left":  { cx: 386, cy: 464, scheme: "indigo", delay: "-1s" },
  "bottom-right": { cx: 814, cy: 464, scheme: "cyan",   delay: "-1.5s" },
};

// Float animation per position
const FLOAT_ANIM: Record<PlatformPosition, string> = {
  "top-left":     "hub-flt1 3.6s ease-in-out infinite",
  "top-right":    "hub-flt2 4.0s ease-in-out infinite",
  "bottom-left":  "hub-flt3 4.3s ease-in-out infinite",
  "bottom-right": "hub-flt4 3.8s ease-in-out infinite",
};

// ─── Colour tokens ────────────────────────────────────────────────────────────

const SCHEME = {
  indigo: {
    leftLight: "#C7D2FE", rightLight: "#A5B4FC",
    leftDark:  "#312E81", rightDark:  "#252060",
    lineColor: "#818CF8", particleColor: "#4F46E5",
    labelTitleLight: "#3730A3", labelTitleDark: "#C7D2FE",
    labelSubLight:   "#6366F1", labelSubDark:   "#818CF8",
    cardBorderDark:  "#4F46E5",
  },
  cyan: {
    leftLight: "#BAE6FD", rightLight: "#7DD3FC",
    leftDark:  "#0C3B5E", rightDark:  "#082640",
    lineColor: "#38BDF8", particleColor: "#0EA5E9",
    labelTitleLight: "#075985", labelTitleDark: "#BAE6FD",
    labelSubLight:   "#0EA5E9", labelSubDark:   "#38BDF8",
    cardBorderDark:  "#0EA5E9",
  },
};

const BG_THEME: Record<HubBgTheme, {
  bgFromLight: string; bgToLight: string;
  bgFromDark:  string; bgToDark:  string;
  ringLight:   string; ringDark:  string;
  dotLight:    string; dotDark:   string;
  glowColor:   string; pulseColor: string;
  hubLeft0: string; hubLeft1: string;
  hubRight0: string; hubRight1: string;
  hubTopFromLight: string; hubTopToLight: string;
  hubTopFromDark:  string; hubTopToDark:  string;
  titleLight: string; titleDark: string;
  subtitleLight: string; subtitleDark: string;
  wordmarkFill: string; wordmarkSub: string;
}> = {
  indigo: {
    bgFromLight: "#EEF2FF", bgToLight: "#DBEAFE",
    bgFromDark:  "#0F172A", bgToDark:  "#1E1B4B",
    ringLight:   "#C7D2FE", ringDark:  "#1E2D5A",
    dotLight:    "#C7D2FE", dotDark:   "#1E2D5A",
    glowColor: "#4F46E5", pulseColor: "#4F46E5",
    hubLeft0: "#6366F1", hubLeft1: "#4338CA",
    hubRight0: "#4F46E5", hubRight1: "#3730A3",
    hubTopFromLight: "#F5F3FF", hubTopToLight: "#EEF2FF",
    hubTopFromDark:  "#312E81", hubTopToDark:  "#1E1B4B",
    titleLight: "#1E1B4B", titleDark: "#E0E7FF",
    subtitleLight: "#4F46E5", subtitleDark: "#A5B4FC",
    wordmarkFill: "white", wordmarkSub: "#C7D2FE",
  },
  green: {
    bgFromLight: "#F0FDF4", bgToLight: "#DCFCE7",
    bgFromDark:  "#0A1E0A", bgToDark:  "#0D2B0D",
    ringLight:   "#BBF7D0", ringDark:  "#14532D",
    dotLight:    "#A7F3D0", dotDark:   "#14532D",
    glowColor: "#1F8A0D", pulseColor: "#1F8A0D",
    hubLeft0: "#1F8A0D", hubLeft1: "#0d6e0c",
    hubRight0: "#0f8a0d", hubRight1: "#0A4D08",
    hubTopFromLight: "#F0FDF4", hubTopToLight: "#ECFDF5",
    hubTopFromDark:  "#0d3b0d", hubTopToDark:  "#082208",
    titleLight: "#0d4d0c", titleDark: "#D1FAE5",
    subtitleLight: "#1F8A0D", subtitleDark: "#3FBD6F",
    wordmarkFill: "white", wordmarkSub: "#3FBD6F",
  },
  cyan: {
    bgFromLight: "#ECFEFF", bgToLight: "#CFFAFE",
    bgFromDark:  "#0A1F2A", bgToDark:  "#0C2837",
    ringLight:   "#A5F3FC", ringDark:  "#0C3B5E",
    dotLight:    "#A5F3FC", dotDark:   "#0C3B5E",
    glowColor: "#06B6D4", pulseColor: "#06B6D4",
    hubLeft0: "#06B6D4", hubLeft1: "#0891B2",
    hubRight0: "#0EA5E9", hubRight1: "#0284C7",
    hubTopFromLight: "#ECFEFF", hubTopToLight: "#E0F7FA",
    hubTopFromDark:  "#0C3B5E", hubTopToDark:  "#082640",
    titleLight: "#164E63", titleDark: "#CFFAFE",
    subtitleLight: "#0891B2", subtitleDark: "#67E8F9",
    wordmarkFill: "white", wordmarkSub: "#BAE6FD",
  },
  purple: {
    bgFromLight: "#FAF5FF", bgToLight: "#EDE9FE",
    bgFromDark:  "#1A0F2E", bgToDark:  "#200F3A",
    ringLight:   "#DDD6FE", ringDark:  "#2E1065",
    dotLight:    "#DDD6FE", dotDark:   "#2E1065",
    glowColor: "#7C3AED", pulseColor: "#7C3AED",
    hubLeft0: "#8B5CF6", hubLeft1: "#6D28D9",
    hubRight0: "#7C3AED", hubRight1: "#5B21B6",
    hubTopFromLight: "#FAF5FF", hubTopToLight: "#F5F3FF",
    hubTopFromDark:  "#2E1065", hubTopToDark:  "#1A0F2E",
    titleLight: "#2E1065", titleDark: "#EDE9FE",
    subtitleLight: "#7C3AED", subtitleDark: "#C4B5FD",
    wordmarkFill: "white", wordmarkSub: "#DDD6FE",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function faces(p: { cx: number; cy: number; hw: number; qh: number; d: number }) {
  const { cx, cy, hw, qh, d } = p;
  return {
    top:   `${cx},${cy - qh} ${cx + hw},${cy} ${cx},${cy + qh} ${cx - hw},${cy}`,
    left:  `${cx - hw},${cy} ${cx},${cy + qh} ${cx},${cy + qh + d} ${cx - hw},${cy + d}`,
    right: `${cx + hw},${cy} ${cx},${cy + qh} ${cx},${cy + qh + d} ${cx + hw},${cy + d}`,
  };
}

// ─── Platform sub-component ───────────────────────────────────────────────────

interface PlatformProps {
  position: PlatformPosition;
  cfg: HubPlatformConfig;
  isDark: boolean;
  filterId: string;
  uid: string;
}

function Platform({ position, cfg, isDark, filterId, uid }: PlatformProps) {
  const p = PLAT[position];
  const s = SCHEME[cfg.colorScheme];
  const f = faces(p);
  // Place label card 26px above the top diamond point (cy - qh)
  const cardX = p.cx - 78;
  const cardY = p.cy - p.qh - 26;

  return (
    <g
      filter={filterId}
      style={{
        transformBox: "fill-box",
        transformOrigin: "center",
        animation: FLOAT_ANIM[position],
      }}
    >
      {/* Isometric faces */}
      <polygon points={f.left}  fill={isDark ? s.leftDark  : s.leftLight} />
      <polygon points={f.right} fill={isDark ? s.rightDark : s.rightLight} />
      <polygon
        points={f.top}
        fill={isDark ? `url(#${uid}-ptop-dark)` : `url(#${uid}-ptop-light)`}
      />

      {/* Label card */}
      <rect
        x={cardX} y={cardY} width={156} height={40} rx={9}
        fill={isDark ? "#1E293B" : "white"}
        stroke={isDark ? s.cardBorderDark : "none"}
        strokeWidth={isDark ? 0.8 : 0}
        opacity={isDark ? 0.97 : 0.93}
        filter={filterId}
      />
      <text
        x={p.cx} y={cardY + 16}
        textAnchor="middle"
        fontFamily="'Segoe UI',system-ui,-apple-system"
        fontSize={12.5} fontWeight={700}
        fill={isDark ? s.labelTitleDark : s.labelTitleLight}
      >
        {cfg.label}
      </text>
      <text
        x={p.cx} y={cardY + 31}
        textAnchor="middle"
        fontFamily="'Segoe UI',system-ui,-apple-system"
        fontSize={10}
        fill={isDark ? s.labelSubDark : s.labelSubLight}
      >
        {cfg.sublabel}
      </text>

      {/* Custom figure — origin at equator centre (cx, cy) */}
      {cfg.figure && (
        <g transform={`translate(${p.cx},${p.cy})`}>
          {cfg.figure}
        </g>
      )}
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HubIllustration({
  platforms,
  bgTheme = "indigo",
  title,
  subtitle,
  hubLabel = "ORDINALY",
  hubSublabel = "AUTOMATIZACIÓN · IA",
  ariaTitle,
  ariaDesc,
  className,
}: HubIllustrationProps) {
  const { isDark } = useTheme();
  const uid = useId().replace(/:/g, "");
  const hubFaces = faces(HUB);
  const theme = BG_THEME[bgTheme];

  const id = (name: string) => `${uid}-${name}`;

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="text-center mb-6 px-4">
          {title && (
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold"
              style={{ color: isDark ? theme.titleDark : theme.titleLight }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="mt-2 text-base sm:text-lg"
              style={{ color: isDark ? theme.subtitleDark : theme.subtitleLight }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* ViewBox starts at y=130 to fully show label cards above top platforms (cy−qh−26 = 162) */}
      <svg
        viewBox="0 130 1200 510"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby={ariaTitle ? id("title") : undefined}
        aria-describedby={ariaDesc ? id("desc") : undefined}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            @keyframes hub-dash  { to { stroke-dashoffset: -30; } }
            @keyframes hub-flt1  { 0%,100% { transform: translateY(0);    } 50% { transform: translateY(-8px);  } }
            @keyframes hub-flt2  { 0%,100% { transform: translateY(-3px); } 50% { transform: translateY(5px);   } }
            @keyframes hub-flt3  { 0%,100% { transform: translateY(2px);  } 50% { transform: translateY(-6px);  } }
            @keyframes hub-flt4  { 0%,100% { transform: translateY(-2px); } 50% { transform: translateY(7px);   } }
            @keyframes hub-pulse { 0% { r: 55; opacity: .18; } 100% { r: 180; opacity: 0; } }
            @keyframes hub-blink { 0% { opacity: .45; } 100% { opacity: 1; } }
            @keyframes hub-glow  { 0%,100% { opacity: .08; } 50% { opacity: .2; } }
          }
        `}</style>

        {ariaTitle && <title id={id("title")}>{ariaTitle}</title>}
        {ariaDesc  && <desc  id={id("desc")}>{ariaDesc}</desc>}

        <defs>
          {/* Background */}
          <linearGradient id={id("bg")} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            {isDark
              ? <><stop offset="0%" stopColor={theme.bgFromDark}/><stop offset="100%" stopColor={theme.bgToDark}/></>
              : <><stop offset="0%" stopColor={theme.bgFromLight}/><stop offset="100%" stopColor={theme.bgToLight}/></>}
          </linearGradient>

          {/* Platform top faces (shared, not theme-dependent) */}
          <linearGradient id={`${uid}-ptop-light`} x1="0" y1="0" x2=".8" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FFFFFF"/>
            <stop offset="100%" stopColor="#F5F3FF"/>
          </linearGradient>
          <linearGradient id={`${uid}-ptop-dark`} x1="0" y1="0" x2=".8" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#1E293B"/>
            <stop offset="100%" stopColor="#1A2544"/>
          </linearGradient>

          {/* Hub faces */}
          <linearGradient id={id("cleft")} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor={theme.hubLeft0}/>
            <stop offset="100%" stopColor={theme.hubLeft1}/>
          </linearGradient>
          <linearGradient id={id("cright")} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor={theme.hubRight0}/>
            <stop offset="100%" stopColor={theme.hubRight1}/>
          </linearGradient>
          <linearGradient id={id("ctop")} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            {isDark
              ? <><stop offset="0%" stopColor={theme.hubTopFromDark}/><stop offset="100%" stopColor={theme.hubTopToDark}/></>
              : <><stop offset="0%" stopColor={theme.hubTopFromLight}/><stop offset="100%" stopColor={theme.hubTopToLight}/></>}
          </linearGradient>

          {/* Hub ambient glow */}
          <radialGradient id={id("hubGl")} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={theme.glowColor} stopOpacity=".25"/>
            <stop offset="100%" stopColor={theme.glowColor} stopOpacity="0"/>
          </radialGradient>

          {/* Dot grid */}
          <pattern id={id("dots")} x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="1"
              fill={isDark ? theme.dotDark : theme.dotLight}
              opacity=".55"
            />
          </pattern>

          {/* Drop shadows */}
          <filter id={id("sh")}  x="-15%" y="-15%" width="130%" height="145%">
            <feDropShadow dx="0" dy="9"  stdDeviation="13" floodColor={theme.glowColor} floodOpacity=".13"/>
          </filter>
          <filter id={id("hsh")} x="-25%" y="-25%" width="150%" height="165%">
            <feDropShadow dx="0" dy="16" stdDeviation="22" floodColor={theme.hubLeft1} floodOpacity=".28"/>
          </filter>

          {/* Particle glow */}
          <filter id={id("glow")}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* animateMotion paths (only for present platforms) */}
          {platforms.map(cfg => {
            const c = CONN[cfg.position];
            return (
              <path key={cfg.position} id={id(`p-${cfg.position}`)}
                d={`M${c.x1},${c.y1} L${c.x2},${c.y2}`} fill="none"/>
            );
          })}
        </defs>

        {/* Background */}
        <rect x="0" y="130" width="1200" height="510" fill={`url(#${id("bg")})`}/>
        <rect x="0" y="130" width="1200" height="510" fill={`url(#${id("dots")})`}/>

        {/* Decorative rings */}
        {[230, 320, 400].map((r, i) => (
          <circle key={r} cx={600} cy={388} r={r} fill="none"
            stroke={isDark ? theme.ringDark : theme.ringLight}
            strokeWidth={[0.6, 0.4, 0.3][i]}
            opacity={[0.5, 0.3, 0.2][i]}
          />
        ))}

        {/* Hub ambient glow */}
        <circle cx={600} cy={388} r={200} fill={`url(#${id("hubGl")})`}
          style={{ animation: "hub-glow 3s ease-in-out infinite", transformBox: "fill-box", transformOrigin: "center" }}
        />

        {/* Pulse rings */}
        <circle cx={600} cy={388} r={55} fill={theme.pulseColor}
          style={{ animation: "hub-pulse 2.8s ease-out infinite", transformBox: "fill-box", transformOrigin: "center" }}
        />
        <circle cx={600} cy={388} r={55} fill={theme.pulseColor}
          style={{ animation: "hub-pulse 2.8s ease-out infinite -1.4s", transformBox: "fill-box", transformOrigin: "center" }}
        />

        {/* Connection lines (only for present platforms) */}
        {platforms.map(cfg => {
          const c = CONN[cfg.position];
          return (
            <line key={cfg.position}
              x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke={SCHEME[c.scheme].lineColor}
              strokeWidth="2.2" opacity=".7"
              style={{ strokeDasharray: "9 6", animation: `hub-dash 1.8s linear infinite ${c.delay}` }}
            />
          );
        })}

        {/* Travelling particles */}
        {platforms.map((cfg, i) => {
          const c = CONN[cfg.position];
          return (
            <circle key={cfg.position} r="5.5"
              fill={SCHEME[c.scheme].particleColor}
              filter={`url(#${id("glow")})`}
              opacity=".9"
            >
              <animateMotion dur="1.9s" repeatCount="indefinite" begin={`${-(i * 0.5)}s`}>
                <mpath href={`#${id(`p-${cfg.position}`)}`}/>
              </animateMotion>
            </circle>
          );
        })}

        {/* Mid-point nodes */}
        {platforms.map(cfg => {
          const n = NODES[cfg.position];
          const c = CONN[cfg.position];
          return (
            <circle key={cfg.position}
              cx={n.cx} cy={n.cy} r={4}
              fill={SCHEME[c.scheme].particleColor}
              filter={`url(#${id("glow")})`}
              style={{ animation: `hub-blink 2s ease-in-out infinite alternate ${n.delay}` }}
            />
          );
        })}

        {/* Satellite platforms */}
        {platforms.map(cfg => (
          <Platform
            key={cfg.position}
            position={cfg.position}
            cfg={cfg}
            isDark={isDark}
            filterId={`url(#${id("sh")})`}
            uid={uid}
          />
        ))}

        {/* Central hub */}
        <g filter={`url(#${id("hsh")})`}>
          <polygon points={hubFaces.left}  fill={`url(#${id("cleft")})`}/>
          <polygon points={hubFaces.right} fill={`url(#${id("cright")})`}/>
          <polygon points={hubFaces.top}   fill={`url(#${id("ctop")})`}/>
          <polygon points={hubFaces.top}   fill="none" stroke={theme.hubLeft0} strokeWidth="1.5" opacity=".35"/>
        </g>

        {/* Dashboard screen */}
        <g transform="translate(516,322)">
          <rect x="2"  y="5"   width="168" height="112" rx="11" fill={theme.hubLeft1} opacity=".14"/>
          <rect x="0"  y="0"   width="168" height="112" rx="11" fill={isDark ? "#1E293B" : "white"} opacity=".97"/>
          <rect x="0"  y="0"   width="168" height="20"  rx="11" fill={theme.hubLeft1}/>
          <rect x="0"  y="11"  width="168" height="9"   fill={theme.hubLeft1}/>
          <circle cx="12" cy="10" r="3" fill="rgba(255,255,255,.4)"/>
          <circle cx="22" cy="10" r="3" fill="rgba(255,255,255,.4)"/>
          <circle cx="32" cy="10" r="3" fill="rgba(255,255,255,.4)"/>
          <text x="100" y="13" textAnchor="middle" fontFamily="'Segoe UI',system-ui" fontSize="8" fontWeight="600" fill="white">
            Ordinaly · Dashboard
          </text>
          {/* Bar chart */}
          <rect x="14" y="30" width="12" height="44" rx="2.5" fill={isDark ? theme.hubTopFromDark : "#C7D2FE"}/>
          <rect x="31" y="44" width="12" height="30" rx="2.5" fill={isDark ? theme.hubLeft1 : "#A5B4FC"}/>
          <rect x="48" y="25" width="12" height="49" rx="2.5" fill={theme.hubLeft1}/>
          <rect x="65" y="38" width="12" height="36" rx="2.5" fill={theme.hubLeft0}/>
          <rect x="82" y="27" width="12" height="47" rx="2.5" fill={theme.hubLeft1}/>
          {/* Trend line */}
          <polyline points="20,27 37,40 54,22 71,34 88,24 105,29"
            fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="20" cy="27" r="3" fill="#10B981"/>
          <circle cx="54" cy="22" r="3" fill="#10B981"/>
          <circle cx="88" cy="24" r="3" fill="#10B981"/>
          {/* Metric cards */}
          <rect x="108" y="24" width="46" height="15" rx="3.5" fill="#F0FDF4"/>
          <text x="113" y="35" fontFamily="'Segoe UI',system-ui" fontSize="9" fill="#16A34A" fontWeight="700">+34% ↑</text>
          <rect x="108" y="43" width="46" height="15" rx="3.5" fill={isDark ? theme.hubTopFromDark : "#EEF2FF"}/>
          <text x="113" y="54" fontFamily="'Segoe UI',system-ui" fontSize="8.5" fill={theme.hubLeft0} fontWeight="600">1.2k tasks</text>
          <rect x="108" y="62" width="46" height="15" rx="3.5" fill={isDark ? "#0C2D48" : "#EFF6FF"}/>
          <text x="113" y="73" fontFamily="'Segoe UI',system-ui" fontSize="8.5" fill="#0EA5E9" fontWeight="600">Live sync</text>
          {/* AI badge + progress */}
          <rect x="14"  y="85" width="34"  height="16" rx="5" fill={theme.hubLeft1}/>
          <text x="31"  y="96" textAnchor="middle" fontFamily="'Segoe UI',system-ui" fontSize="8" fill="white" fontWeight="700">AI ✦</text>
          <rect x="54"  y="89" width="100" height="7"  rx="3.5" fill={isDark ? "#1E293B" : "#E0E7FF"}/>
          <rect x="54"  y="89" width="74"  height="7"  rx="3.5" fill={theme.hubLeft0}/>
          <text x="155" y="96" fontFamily="system-ui" fontSize="7" fill={theme.hubLeft0}>74%</text>
        </g>

        {/* Hub people */}
        <circle cx={568} cy={348} r={9} fill={theme.hubLeft1}/>
        <path d="M561,357 Q560,377 568,377 Q576,377 575,357 Z" fill={theme.hubLeft1}/>
        <line x1="576" y1="362" x2="590" y2="354" stroke={theme.hubLeft1} strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx={632} cy={342} r={9} fill={theme.hubLeft0}/>
        <path d="M625,351 Q624,371 632,371 Q640,371 639,351 Z" fill={theme.hubLeft0}/>

        {/* Hub wordmark — on the hub front face (y ≈ cy+qh = 469 to cy+qh+d = 501) */}
        <rect x={510} y={453} width={180} height={38} rx={6}
          fill={theme.hubLeft1} opacity={isDark ? 0.8 : 0.9}
        />
        <text x={600} y={470} textAnchor="middle"
          fontFamily="'Segoe UI',system-ui,-apple-system"
          fontSize="15" fontWeight="800"
          fill={theme.wordmarkFill} letterSpacing="2"
        >
          {hubLabel}
        </text>
        <text x={600} y={484} textAnchor="middle"
          fontFamily="'Segoe UI',system-ui,-apple-system"
          fontSize="7.5"
          fill={theme.wordmarkSub} letterSpacing="3"
        >
          {hubSublabel}
        </text>
      </svg>
    </div>
  );
}
