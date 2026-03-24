"use client";

import { useRef, useState, useEffect, MouseEvent } from "react";

export default function RobotFollower() {
  const headRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [armRotation, setArmRotation] = useState(0);
  const [isSleep, setIsSleep] = useState(false);
  const [blink, setBlink] = useState(false);

  // Sleep mode — 3 s sin movimiento
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const reset = () => {
      setIsSleep(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsSleep(true), 3000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    return () => window.removeEventListener("mousemove", reset);
  }, []);

  // Parpadeo aleatorio
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!headRef.current) return;
    const rect = headRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    setRotation(deg + 90);
    setArmRotation((deg + 90) * 0.18);
  };

  const handleMouseLeave = () => {
    setRotation(0);
    setArmRotation(0);
  };

  // ── Clases reactivas al estado ──────────────────────────────────────────────
  const eyeBg = isSleep ? "bg-[#1e3040]" : "bg-cyan-300";
  const eyeGlow = isSleep
    ? ""
    : "shadow-[0_0_10px_3px_#22d3ee,0_0_22px_6px_rgba(34,211,238,0.35)]";
  const eyeScale = blink ? "scale-y-0" : "scale-y-100";

  const reactorBg = isSleep ? "bg-[#1e3040]" : "bg-cyan-300";
  const reactorGlow = isSleep ? "" : "shadow-[0_0_8px_3px_#22d3ee]";

  const waistBar = isSleep
    ? "bg-[#1a2a3a] opacity-40"
    : "bg-cyan-400 opacity-85 shadow-[0_0_8px_#22d3ee]";

  // ── Arm / head inline transforms (Tailwind no interpola valores dinámicos) ──
  const headStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: "transform 0.1s ease-out",
  } as React.CSSProperties;

  const armLStyle = {
    transformOrigin: "50% 20px",
    transform: `rotate(${armRotation}deg)`,
    transition: "transform 0.15s ease-out",
  } as React.CSSProperties;

  const armRStyle = {
    transformOrigin: "50% 20px",
    transform: `rotate(${armRotation * -1}deg)`,
    transition: "transform 0.15s ease-out",
  } as React.CSSProperties;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center w-[340px] h-[600px] select-none"
    >
      <div
        className={`relative flex flex-col items-center transition-all duration-700 ${
          isSleep ? "opacity-75 scale-[0.97]" : "opacity-100 scale-100"
        }`}
      >

        {/* ══════════════════════════════════════
            CABEZA
        ══════════════════════════════════════ */}
        <div
          ref={headRef}
          style={headStyle}
          className="relative w-[110px] h-[110px]"
        >
          {/* Shell negro esférico */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_32%,#3c3c3c,#111_55%,#000)] shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_2px_6px_rgba(255,255,255,0.07)]" />

          {/* Visera interior azul oscuro */}
          <div className="absolute inset-[13px] rounded-full overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_40%_28%,#1a2a3a_0%,#06111e_60%,#020810_100%)] shadow-[inset_0_3px_10px_rgba(0,0,0,0.95)]">
            {/* Reflejo */}
            <div className="absolute top-[6px] left-[8px] w-7 h-3 rounded-full bg-white/[0.13] -rotate-[20deg] -skew-x-[8deg]" />

            {/* Ojos LED */}
            <div className="relative z-10 flex gap-[18px]">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`
                    w-4 h-4 rounded-full origin-center
                    transition-transform duration-100
                    ${eyeScale} ${eyeBg} ${eyeGlow}
                  `}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            CUELLO
        ══════════════════════════════════════ */}
        <div className="flex flex-col items-center z-10 -mt-[5px]">
          <div className="w-9 h-2 bg-[#181818] rounded-[3px]" />
          <div className="w-[30px] h-[6px] bg-[#222] rounded-[3px] mt-[2px]" />
          <div className="w-10 h-2 bg-[#181818] rounded-[3px] mt-[2px]" />
        </div>

        {/* ══════════════════════════════════════
            TRONCO + BRAZOS
        ══════════════════════════════════════ */}
        <div className="relative flex items-start mt-[3px]">

          {/* ── BRAZO IZQUIERDO ── */}
          <div
            style={armLStyle}
            className="absolute right-[calc(100%+2px)] top-[8px] flex flex-col items-center"
          >
            {/* Hombro negro */}
            <div className="w-[42px] h-[42px] rounded-full bg-[radial-gradient(circle_at_36%_28%,#3a3a3a,#0f0f0f_70%)] shadow-[0_5px_15px_rgba(0,0,0,0.6)]" />
            {/* Conector blanco */}
            <div className="w-[14px] h-[10px] rounded-b-[6px] bg-[#e8e8e8] -mt-[4px]" />
            {/* Bícep */}
            <div className="w-[28px] h-[62px] rounded-[14px] bg-[linear-gradient(150deg,#f5f5f5_0%,#d8d8d8_50%,#bbb_100%)] shadow-[2px_4px_12px_rgba(0,0,0,0.25)] -mt-[2px]" />
            {/* Codo negro */}
            <div className="w-[34px] h-[32px] rounded-full bg-[radial-gradient(circle_at_36%_28%,#333,#080808_70%)] shadow-[0_4px_10px_rgba(0,0,0,0.6)] -mt-[6px]" />
            {/* Antebrazo */}
            <div className="w-[24px] h-[48px] rounded-xl bg-[linear-gradient(150deg,#efefef_0%,#d0d0d0_60%,#b8b8b8_100%)] shadow-[2px_3px_8px_rgba(0,0,0,0.2)] -mt-[5px]" />
            {/* Muñeca negra */}
            <div className="w-[30px] h-[28px] rounded-full bg-[radial-gradient(circle_at_36%_28%,#282828,#060606_70%)] shadow-[0_3px_8px_rgba(0,0,0,0.6)] -mt-[4px]" />
          </div>

          {/* ── CUERPO PRINCIPAL ── */}
          <div className="relative flex flex-col items-center w-[134px]">

            {/* Pecho superior */}
            <div className="relative w-full h-[104px] flex items-center justify-center overflow-hidden rounded-[28px_28px_12px_12px] bg-[linear-gradient(160deg,#f8f8f8_0%,#e0e0e0_40%,#c8c8c8_100%)] shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_2px_4px_rgba(255,255,255,0.7)]">
              {/* Ranuras decorativas */}
              <div className="absolute inset-x-6 top-5 h-px bg-black/[0.07]" />
              <div className="absolute inset-x-6 top-8 h-px bg-black/[0.04]" />
              {/* Panel reactor */}
              <div className="mt-[14px] w-[38px] h-[22px] rounded-[11px] bg-[#0d0d0d] shadow-[inset_0_1px_4px_rgba(0,0,0,0.9)] flex items-center justify-center">
                <div className={`w-[22px] h-[9px] rounded-[5px] transition-all duration-500 ${reactorBg} ${reactorGlow}`} />
              </div>
            </div>

            {/* Cintura negra */}
            <div className="relative z-10 -mt-[4px] w-[82%] h-[24px] rounded-[5px] bg-[#0f0f0f] shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <div className={`w-[44px] h-[6px] rounded-[3px] transition-all duration-500 ${waistBar}`} />
            </div>

            {/* Pelvis */}
            <div className="-mt-[2px] w-[96%] h-[46px] rounded-[6px_6px_20px_20px] bg-[linear-gradient(170deg,#e2e2e2_0%,#c4c4c4_100%)] shadow-[0_4px_14px_rgba(0,0,0,0.22)]" />
          </div>

          {/* ── BRAZO DERECHO ── */}
          <div
            style={armRStyle}
            className="absolute left-[calc(100%+2px)] top-[8px] flex flex-col items-center"
          >
            {/* Hombro negro */}
            <div className="w-[42px] h-[42px] rounded-full bg-[radial-gradient(circle_at_36%_28%,#3a3a3a,#0f0f0f_70%)] shadow-[0_5px_15px_rgba(0,0,0,0.6)]" />
            {/* Conector blanco */}
            <div className="w-[14px] h-[10px] rounded-b-[6px] bg-[#e8e8e8] -mt-[4px]" />
            {/* Bícep */}
            <div className="w-[28px] h-[62px] rounded-[14px] bg-[linear-gradient(210deg,#f5f5f5_0%,#d8d8d8_50%,#bbb_100%)] shadow-[-2px_4px_12px_rgba(0,0,0,0.25)] -mt-[2px]" />
            {/* Codo negro */}
            <div className="w-[34px] h-[32px] rounded-full bg-[radial-gradient(circle_at_36%_28%,#333,#080808_70%)] shadow-[0_4px_10px_rgba(0,0,0,0.6)] -mt-[6px]" />
            {/* Antebrazo */}
            <div className="w-[24px] h-[48px] rounded-xl bg-[linear-gradient(210deg,#efefef_0%,#d0d0d0_60%,#b8b8b8_100%)] shadow-[-2px_3px_8px_rgba(0,0,0,0.2)] -mt-[5px]" />
            {/* Muñeca negra */}
            <div className="w-[30px] h-[28px] rounded-full bg-[radial-gradient(circle_at_36%_28%,#282828,#060606_70%)] shadow-[0_3px_8px_rgba(0,0,0,0.6)] -mt-[4px]" />
          </div>
        </div>

        {/* ══════════════════════════════════════
            PIERNAS
        ══════════════════════════════════════ */}
        <div className="flex gap-4 mt-[2px]">
          {[0, 1].map((leg) => (
            <div key={leg} className="flex flex-col items-center">
              {/* Cadera negra */}
              <div className="w-[48px] h-[20px] rounded-t-[4px] bg-[radial-gradient(circle_at_40%_30%,#2e2e2e,#0a0a0a_70%)] shadow-[0_3px_8px_rgba(0,0,0,0.5)]" />
              {/* Muslo blanco */}
              <div className="w-[42px] h-[64px] rounded-b-[8px] bg-[linear-gradient(170deg,#e8e8e8_0%,#cccccc_60%,#b5b5b5_100%)] shadow-[0_5px_14px_rgba(0,0,0,0.2)]" />
              {/* Rodilla negra */}
              <div className="w-[50px] h-[24px] rounded-[14px] -mt-[6px] bg-[radial-gradient(circle_at_40%_30%,#303030,#080808_70%)] shadow-[0_5px_12px_rgba(0,0,0,0.6)]" />
              {/* Pantorrilla blanca */}
              <div className="w-[36px] h-[54px] rounded-b-[10px] -mt-[5px] bg-[linear-gradient(170deg,#e2e2e2_0%,#c6c6c6_60%,#b0b0b0_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.18)]" />
              {/* Tobillo negro */}
              <div className="w-[42px] h-[14px] rounded-[4px] -mt-[2px] bg-[#111] shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
              {/* Pie negro */}
              <div className="w-[54px] h-[18px] rounded-b-[12px] bg-[linear-gradient(170deg,#1a1a1a,#060606)] shadow-[0_5px_12px_rgba(0,0,0,0.6)]" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}