"use client";
import { CardStack } from "@/components/ui/card-stack";
import { cn } from "@/lib/utils";

export default function CardStackDemo() {
  return (
    <div className="flex items-center justify-center w-full py-10">
      <CardStack items={CARDS} />
    </div>
  );
}

// Highlight utility
export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500 px-1 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
};

// Curiosidades reales sobre IA
const CARDS = [
  {
    id: 0,
    name: "Uso empresarial",
    designation: "Dato real",
    content: (
      <p>
        Más del <Highlight>85% de las tareas administrativas</Highlight> pueden
        automatizarse parcial o totalmente con IA, según estudios de McKinsey.
      </p>
    ),
  },
  {
    id: 1,
    name: "Productividad",
    designation: "Impacto directo",
    content: (
      <p>
        Las empresas que adoptan IA en procesos internos reportan un aumento
        medio del <Highlight>30% en productividad</Highlight> en menos de 90 días.
      </p>
    ),
  },
  {
    id: 2,
    name: "Velocidad",
    designation: "Capacidad técnica",
    content: (
      <p>
        Un modelo de IA puede analizar en <Highlight>milisegundos</Highlight> lo
        que un humano tardaría horas en revisar, especialmente en documentos
        largos o datos complejos.
      </p>
    ),
  },
  {
    id: 3,
    name: "Adopción",
    designation: "Comportamiento humano",
    content: (
      <p>
        El mayor freno no es la tecnología, sino la{" "}
        <Highlight>falta de hábitos</Highlight>. Por eso la formación práctica
        es clave para que un equipo adopte IA de verdad.
      </p>
    ),
  },
  {
    id: 4,
    name: "Seguridad",
    designation: "Governance",
    content: (
      <p>
        El 70% de los incidentes con IA se deben a{" "}
        <Highlight>mal uso o falta de políticas internas</Highlight>, no a fallos
        técnicos del modelo.
      </p>
    ),
  },
];
