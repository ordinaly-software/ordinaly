import Image from 'next/image';
import React from 'react';
import { useTranslations } from "next-intl";

interface PlanProps {
  id: number;
  title: string;
  imageSrc: string;
  features: string[];
  bubbleColor: string;
}
const PlanCard: React.FC<PlanProps> = ({ id, title, imageSrc, features, bubbleColor }) => {

  return (
    <div className="scroll-animate fade-in-up text-center">
      <div className="flex items-center justify-center mb-6 gap-6">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 ${bubbleColor} rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl flex-shrink-0 aspect-square`}>
          {id}
        </div>
        <div className="relative w-40 h-40 hidden md:block">
          <Image src={imageSrc} alt={title} fill className="object-contain" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <ul className="text-gray-700 dark:text-gray-200 space-y-3 text-left w-full">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className={`w-5 h-5 ${bubbleColor.replace('bg-', 'text-')} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

  const t = useTranslations("home.pricingPlans");

  const plans = [
    {
      id: 1,
      title: t('1.title'),
      imageSrc: "/static/plans/1_01.webp",
      features: [
        t('1.features.0'),
        t('1.features.1'),
      ],
      bubbleColor: "bg-[#32E875]",
    },
    {
      id: 2,
      title: t('2.title'),
      imageSrc: "/static/plans/2_01.webp",
      features: [
        t('2.features.0'),
        t('2.features.1'),
        t('2.features.2'),
      ],
      bubbleColor: "bg-[#E4572E]",
    },
    {
      id: 3,
      title: t('3.title'),
      imageSrc: "/static/plans/3_01.webp",
      features: [
        t('1.features.0'),
        t('3.features.1'),
        t('3.features.2'),
        t('3.features.3'),
        t('3.features.4'),
      ],
      bubbleColor: "bg-[#623CEA]",
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