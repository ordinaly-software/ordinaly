import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SandParticle = ({ id }: { id: number }) => (
  <motion.circle
    key={id}
    cx={60 + (Math.random() * 2 - 1)} // Dispersión lateral mínima
    cy="110"
    r="1.2"
    fill="#C99742"
    initial={{ y: 60, opacity: 0 }}
    animate={{ y: -70, opacity: [0, 1, 1, 0] }}
    transition={{ duration: 0.8, ease: "linear" }}
  />
);

let particleCounter = 0;

const RealisticHourglass = () => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => [...prev.slice(-25), ++particleCounter]);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-transparent p-10">
      <div className="relative group">
        <svg width="160" height="260" viewBox="0 0 120 200" fill="none" style={{ filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.5))' }}>
          <defs>
            {/* Gradiente para el cristal */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0.05" />
              <stop offset="50%" stopColor="white" stopOpacity="0.12" />
              <stop offset="100%" stopColor="white" stopOpacity="0.05" />
            </linearGradient>
            
            {/* Reflejo de luz en el vidrio */}
            <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.15" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Cuerpo de Cristal Principal */}
          <path
            d="M10 20C10 80 55 100 55 100C55 100 10 120 10 180H110C110 120 65 100 65 100C65 100 110 80 110 20H10Z"
            fill="url(#glassGrad)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />

          {/* ARENA SUPERIOR (Se va llenando) */}
          <mask id="upperMask">
            <path d="M10 20C10 80 55 100 55 100C55 100 110 80 110 20H10Z" fill="white" />
          </mask>
          <motion.path
            mask="url(#upperMask)"
            d="M5 100 L115 100 L115 100 L5 100 Z"
            fill="#C99742"
            animate={{ d: "M5 100 L115 100 L115 20 L5 20 Z" }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          />

          {/* CHORRO CENTRAL (Arena subiendo) */}
          <rect x="59.5" y="40" width="1" height="120" fill="#C99742" opacity="0.4" />
          <AnimatePresence>
            {particles.map((id) => (
              <SandParticle key={id} id={id} />
            ))}
          </AnimatePresence>

          {/* ARENA INFERIOR (Se va vaciando) */}
          <mask id="lowerMask">
            <path d="M10 180C10 120 55 100 55 100C55 100 110 120 110 180H10Z" fill="white" />
          </mask>
          <motion.path
            mask="url(#lowerMask)"
            d="M5 100 L115 100 L115 180 L5 180 Z"
            fill="#C99742"
            animate={{ d: "M5 180 L115 180 L115 180 L5 180 Z" }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          />

          {/* Reflejo de luz final sobre todo el conjunto */}
          <path
            d="M25 30 Q15 60 55 90"
            stroke="url(#shine)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Tapas de Madera */}
          <rect x="0" y="10" width="120" height="8" rx="2" fill="#4a2406" />
          <rect x="0" y="182" width="120" height="8" rx="2" fill="#4a2406" />
        </svg>
      </div>

      {/* Mensaje con estilo solicitado */}
      <div className="mt-8 text-center leading-tight">
        <p className="text-white text-xl font-medium">
          Te ahorramos <span style={{ color: '#d97757' }}>tiempo</span>
        </p>
        <p className="text-white text-xl font-medium"></p>
      </div>
    </div>
  );
};

export default RealisticHourglass;