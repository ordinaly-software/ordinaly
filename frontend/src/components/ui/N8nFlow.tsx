"use client";

import { useEffect, useRef, useState } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface FlowNode {
  id: string;
  x: number;
  y: number;
  label: string;
  sublabel: string;
  color: string;
  icon: string;
}

interface Edge {
  from: string;
  to: string;
}

// ─── Flujo: "Un cliente rellena el formulario de tu web" ─────────────────────
//
//  [Formulario web] ──► [¿Es un buen lead?] ──► SÍ ──► [Envía email de bienvenida] ──► [Agenda llamada] ──► [Cierra la venta 🎉]
//                                            └─► NO ──► [Lo añade a lista de espera]
//
const NODES: FlowNode[] = [
  {
    id: "form",
    x: 30,  y: 180,
    label: "Cliente rellena el formulario",
    sublabel: "Tu web, 24/7 automático",
    color: "#E8622A",
    icon: "📋",
  },
  {
    id: "filter",
    x: 260, y: 180,
    label: "¿Es un buen cliente?",
    sublabel: "Filtra por presupuesto y sector",
    color: "#2D6EC8",
    icon: "🤔",
  },
  {
    id: "email",
    x: 490, y: 60,
    label: "Email de bienvenida",
    sublabel: "Se envía solo, al instante",
    color: "#0F9D58",
    icon: "✉️",
  },
  {
    id: "waitlist",
    x: 490, y: 300,
    label: "Lista de espera",
    sublabel: "Lo guarda para más adelante",
    color: "#6B7280",
    icon: "📂",
  },
  {
    id: "calendar",
    x: 720, y: 60,
    label: "Reserva llamada",
    sublabel: "El cliente elige su hora",
    color: "#7C3AED",
    icon: "📅",
  },
  {
    id: "crm",
    x: 720, y: 300,
    label: "Aviso a tu equipo",
    sublabel: "Slack / WhatsApp",
    color: "#4A154B",
    icon: "🔔",
  },
  {
    id: "close",
    x: 950, y: 180,
    label: "¡Venta cerrada!",
    sublabel: "Sin mover un dedo",
    color: "#E8622A",
    icon: "🎉",
  },
];

const EDGES: Edge[] = [
  { from: "form",     to: "filter"   },
  { from: "filter",   to: "email"    },   // rama SÍ
  { from: "filter",   to: "waitlist" },   // rama NO
  { from: "email",    to: "calendar" },
  { from: "waitlist", to: "crm"      },
  { from: "calendar", to: "close"    },
  { from: "crm",      to: "close"    },
];

// Orden de activación
const SEQUENCE = ["form","filter","email","waitlist","calendar","crm","close"];

const NR = 26; // radio nodo

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getNode(id: string) { return NODES.find((n) => n.id === id)!; }
function cx(id: string) { return getNode(id).x + NR; }
function cy(id: string) { return getNode(id).y + NR; }

function edgePts(from: string, to: string) {
  const fx = cx(from), fy = cy(from), tx = cx(to), ty = cy(to);
  const dx = tx - fx, dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x1: fx + (dx / len) * NR, y1: fy + (dy / len) * NR,
    x2: tx - (dx / len) * NR, y2: ty - (dy / len) * NR,
  };
}

function arrowAngle(from: string, to: string) {
  const { x1, y1, x2, y2 } = edgePts(from, to);
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function N8nFlow() {
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  const [dotEdge, setDotEdge]         = useState<string | null>(null);
  const [dotProgress, setDotProgress] = useState(0);
  const [running, setRunning]         = useState(false);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef  = useRef<number | null>(null);

  const ekey = (e: Edge) => `${e.from}→${e.to}`;

  function animateDot(key: string): Promise<void> {
    return new Promise((resolve) => {
      setDotEdge(key);
      setDotProgress(0);
      const t0 = performance.now();
      const dur = 550;
      function step(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        setDotProgress(p);
        if (p < 1) { rafRef.current = requestAnimationFrame(step); }
        else { setDotEdge(null); resolve(); }
      }
      rafRef.current = requestAnimationFrame(step);
    });
  }

  async function runFlow() {
    if (running) return;
    setRunning(true);
    setActiveNodes(new Set());
    setActiveEdges(new Set());

    for (const nodeId of SEQUENCE) {
      setActiveNodes((p) => new Set([...p, nodeId]));
      await new Promise((r) => setTimeout(r, 280));

      const outEdges = EDGES.filter((e) => e.from === nodeId);
      for (const edge of outEdges) {
        const key = ekey(edge);
        await animateDot(key);
        setActiveEdges((p) => new Set([...p, key]));
        await new Promise((r) => setTimeout(r, 60));
      }

      await new Promise((r) => setTimeout(r, 180));
    }

    setRunning(false);
    loopRef.current = setTimeout(() => {
      setActiveNodes(new Set());
      setActiveEdges(new Set());
      setTimeout(runFlow, 500);
    }, 3000);
  }

  useEffect(() => {
    const t = setTimeout(runFlow, 600);
    return () => {
      clearTimeout(t);
      if (loopRef.current) clearTimeout(loopRef.current);
      if (rafRef.current)  cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ─── SVG canvas ────────────────────────────────────────────────────────────
  // Ancho de tarjeta por nodo (para calcular la bounding box total)
  const CARD_W = 195;
  const CARD_H = 56;
  const VW = 1130;
  const VH = 420;

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-[#151515] border border-white/[0.08] shadow-[0_32px_100px_rgba(0,0,0,0.7)]">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-[10px] bg-[#111] border-b border-white/[0.06]">
        <div className="flex gap-[5px]">
          <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
          <span className="w-[11px] h-[11px] rounded-full bg-[#ffbd2e]" />
          <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[11px] text-white/25 font-mono tracking-wide">
          automatización-captación-clientes.flow
        </span>
        <div className="ml-auto flex items-center gap-[6px]">
          <span className={`w-[7px] h-[7px] rounded-full transition-colors ${running ? "bg-[#E8622A] animate-pulse" : "bg-white/15"}`} />
          <span className="text-[10px] font-mono text-white/30">
            {running ? "ejecutando…" : "en espera"}
          </span>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="relative overflow-x-auto">
        {/* Grid de puntos */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.06)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full"
          style={{ minWidth: 720 }}
          xmlns="http://www.w3.org/2000/svg"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="nglow">
              <feGaussianBlur stdDeviation="7" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── Etiquetas de rama SÍ / NO ── */}
          <text x="364" y="138" fontSize="10" fill="rgba(255,255,255,0.35)" fontWeight="600">SÍ ✓</text>
          <text x="364" y="272" fontSize="10" fill="rgba(255,255,255,0.25)">NO ✗</text>

          {/* ── Edges ── */}
          {EDGES.map((edge) => {
            const key      = ekey(edge);
            const { x1, y1, x2, y2 } = edgePts(edge.from, edge.to);
            const isActive = activeEdges.has(key);
            const isDot    = dotEdge === key;
            const dotX     = x1 + (x2 - x1) * dotProgress;
            const dotY     = y1 + (y2 - y1) * dotProgress;
            const angle    = arrowAngle(edge.from, edge.to);

            return (
              <g key={key}>
                {/* Base gris */}
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round"
                />
                {/* Activa naranja */}
                {isActive && (
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#E8622A" strokeWidth="2.5" strokeLinecap="round"
                    filter="url(#glow)" opacity="0.9"
                  />
                )}
                {/* Bolita viajera */}
                {isDot && (
                  <circle cx={dotX} cy={dotY} r="5.5" fill="#E8622A" filter="url(#glow)" />
                )}
                {/* Flecha */}
                <polygon
                  points={`${x2},${y2} ${x2 - 9},${y2 - 4} ${x2 - 9},${y2 + 4}`}
                  fill={isActive ? "#E8622A" : "rgba(255,255,255,0.18)"}
                  transform={`rotate(${angle},${x2},${y2})`}
                />
              </g>
            );
          })}

          {/* ── Nodos ── */}
          {NODES.map((node) => {
            const ncx      = cx(node.id);
            const ncy      = cy(node.id);
            const isActive = activeNodes.has(node.id);
            const cardX    = node.x - 8;
            const cardY    = node.y - 8;
            const cardW    = CARD_W;
            const cardH    = CARD_H + 16;

            return (
              <g key={node.id}>
                {/* Glow anillo */}
                {isActive && (
                  <circle cx={ncx} cy={ncy} r={NR + 12}
                    fill="none" stroke={node.color} strokeWidth="1.5"
                    opacity="0.25" filter="url(#nglow)"
                  />
                )}

                {/* Tarjeta fondo */}
                <rect
                  x={cardX} y={cardY} width={cardW} height={cardH} rx="11"
                  fill={isActive ? "#252525" : "#1c1c1c"}
                  stroke={isActive ? node.color : "rgba(255,255,255,0.07)"}
                  strokeWidth={isActive ? "1.5" : "1"}
                />

                {/* Círculo icono */}
                <circle cx={ncx} cy={ncy} r={NR}
                  fill={node.color}
                  opacity={isActive ? 1 : 0.5}
                  filter={isActive ? "url(#nglow)" : undefined}
                />
                <text x={ncx} y={ncy + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="18" fill="white"
                >{node.icon}</text>

                {/* Texto label */}
                <text
                  x={ncx + NR + 10} y={ncy - 8}
                  fontSize="11.5" fontWeight="700"
                  fill={isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)"}
                >{node.label}</text>
                <text
                  x={ncx + NR + 10} y={ncy + 8}
                  fontSize="9.5"
                  fill={isActive ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)"}
                >{node.sublabel}</text>

                {/* Check verde */}
                {isActive && (
                  <g>
                    <circle cx={cardX + cardW - 11} cy={cardY + 11} r="7" fill="#22c55e" />
                    <text x={cardX + cardW - 11} y={cardY + 12}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="8" fontWeight="bold" fill="white"
                    >✓</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center gap-3 px-5 py-[8px] bg-[#111] border-t border-white/[0.05]">
        <span className="text-[10px] text-white/20 font-mono">
          🤖 Ordinaly automatiza esto por ti · sin código · 24/7
        </span>
        <div className="ml-auto flex gap-[5px] items-center">
          {SEQUENCE.map((id, i) => (
            <div key={id} className="flex items-center gap-[5px]">
              <div className={`w-[7px] h-[7px] rounded-full transition-all duration-500 ${
                activeNodes.has(id) ? "bg-[#E8622A] shadow-[0_0_6px_#E8622A]" : "bg-white/10"
              }`} />
              {i < SEQUENCE.length - 1 && (
                <div className={`w-3 h-px transition-all duration-500 ${
                  activeNodes.has(id) ? "bg-[#E8622A]/50" : "bg-white/10"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}