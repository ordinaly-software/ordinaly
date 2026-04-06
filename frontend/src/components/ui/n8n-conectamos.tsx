import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, // WhatsApp
  Calendar,      // Calendly
  Mail,          // Gmail
  Database,      // Postgres/Airtable
  Zap,           // n8n/Trigger
  Split,         // IF
  ArrowRight,
  Check
} from 'lucide-react';

const ConnectionNode = ({ icon: Icon, title, color, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 bg-[#1e293b]/80 border border-slate-700 p-3 rounded-xl w-48 shadow-lg hover:border-slate-500 transition-colors group"
  >
    <div className={`${color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <span className="text-slate-200 text-sm font-medium">{title}</span>
    <div className="ml-auto flex items-center justify-center w-4 h-4 bg-green-500/20 rounded-full border border-green-500/50">
      <Check size={10} className="text-green-500" strokeWidth={4} />
    </div>
  </motion.div>
);

const AnimatedFlow = () => {
  return (
    <div className="bg-[#0b1120] p-6 md:p-12 font-sans flex items-center justify-center min-h-[500px]">
      <div className="w-full max-w-5xl bg-[#0b1121] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative bg-dot-pattern">
        
        {/* Header estilo Browser */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">integracion-total.flow</span>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]"></span>
             <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">Workflow Live</span>
          </div>
        </div>

        {/* Área del Workflow */}
        <div className="relative p-10 flex flex-col md:flex-row items-center justify-between gap-4 min-h-[400px]">
          
          {/* SVG DE LÍNEAS ANIMADAS */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block">
            {/* Línea Entrada -> n8n */}
            <path d="M 150 200 L 350 200" stroke="#475569" strokeWidth="2" fill="none" className="animate-flow-line" />
            
            {/* Líneas n8n -> Salidas (Curvas) */}
            <path d="M 450 200 C 550 200, 550 80, 700 80" stroke="#3b82f6" strokeWidth="2" fill="none" className="animate-flow-line" />
            <path d="M 450 200 L 700 200" stroke="#3b82f6" strokeWidth="2" fill="none" className="animate-flow-line" />
            <path d="M 450 200 C 550 200, 550 320, 700 320" stroke="#3b82f6" strokeWidth="2" fill="none" className="animate-flow-line" />
          </svg>

          {/* Trigger Inicial */}
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] border border-orange-400 relative">
              <Zap className="text-white fill-current" size={32} />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-400 rounded-full border-4 border-[#0b1121]"></div>
            </div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mt-2">Nuevo Lead</p>
          </div>

          {/* Cerebro n8n / IF */}
          <div className="z-10 flex flex-col items-center gap-3">
             <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border-2 border-blue-500/50 rounded-full flex items-center justify-center ring-8 ring-slate-800 shadow-[0_0_50px_rgba(59,130,246,0.2)] relative">
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ping"></div>
                <Split className="text-blue-400 -rotate-90" size={36} />
                {/* Puertos de salida */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-[#0b1121]"></div>
             </div>
             <p className="text-blue-400 text-xs font-black uppercase tracking-tighter bg-blue-500/10 px-3 py-1 rounded-full">Lógica n8n</p>
          </div>

          {/* Salidas (Las Apps que el usuario usa) */}
          <div className="z-10 flex flex-col gap-6">
            <ConnectionNode icon={MessageCircle} title="WhatsApp API" color="bg-green-600" delay={0.2} />
            <ConnectionNode icon={Calendar} title="Calendly" color="bg-blue-600" delay={0.4} />
            <ConnectionNode icon={Mail} title="Gmail" color="bg-red-500" delay={0.6} />
            <ConnectionNode icon={Database} title="Base de Datos" color="bg-slate-600" delay={0.8} />
          </div>

        </div>

        {/* Footer con llamada a la acción */}
        <div className="bg-[#0f172a] p-4 flex justify-center border-t border-slate-800">
          <p className="text-slate-400 text-xs italic flex items-center gap-2">
            Lo conectamos con lo que ya usas <ArrowRight size={14} className="text-orange-500" /> ¡Todo en piloto automático!
          </p>
        </div>

      </div>
    </div>
  );
};

export default AnimatedFlow;