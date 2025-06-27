import Image from 'next/image';
import React from 'react';

interface PlanProps {
  title: string;
  imageSrc: string;
  features: string[];
}
const PlanCard: React.FC<PlanProps> = ({ title, imageSrc, features }) => {
  const getBubbleColor = () => {
    switch (title) {
      case "Asistencia Robótica":
        return "bg-[#32E875]";
      case "Automatización de Ventas":
        return "bg-[#E4572E]";
      case "Estrategia Predictiva IA":
        return "bg-[#623CEA]";
      default:
        return "bg-[#32E875]";
    }
  };

  return (
    <div className="scroll-animate fade-in-up text-center">
      <div className="flex items-center justify-center mb-6 gap-6">
        <div className={`w-20 h-20 ${getBubbleColor()} rounded-full flex items-center justify-center text-black font-bold text-2xl`}>
          {title === "Asistencia Robótica" ? 1 : title === "Automatización de Ventas" ? 2 : 3}
        </div>
        <div className="relative w-40 h-40">
          <Image src={imageSrc} alt={title} layout="fill" objectFit="contain" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <ul className="text-gray-700 dark:text-gray-200 space-y-3 text-left w-full">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className={`w-5 h-5 ${getBubbleColor().replace('bg-', 'text-')} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};
const PricingPlans: React.FC = () => {

    const plans = [
    {
      title: "Asistencia Robótica",
      imageSrc: "/static/plans/1_01.webp",
      features: [
        "Chatbot Inteligente en Web",
        "Agente de WhatsApp con IA",
      ],
    },
    {
      title: "Automatización de Ventas",
      imageSrc: "/static/plans/2_01.webp",
      features: [
        "Todo lo del Plan Asistencia Robótica",
        "CRM Automatizado (usuarios, facturación, informes, pedidos)",
        "Notificaciones Automatizadas (Email/SMS/WhatsApp)",
      ],
    },
    {
      title: "Estrategia Predictiva IA",
      imageSrc: "/static/plans/3_01.webp",
      features: [
        "Todo lo del Plan Automatización de Ventas",
        "Asistentes Inteligentes de Diagnóstico o Recomendación",
        "Integración con Looker Studio y automatización de flujos",
        "Análisis Predictivo y Tendencias de Mercado",
        "Herramientas web para presupuestos rápidos",
      ],
    },
  ];
  
  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PlanCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;