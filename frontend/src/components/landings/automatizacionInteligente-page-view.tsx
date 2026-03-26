"use client";

import React from "react";
import dynamic from "next/dynamic";

import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";
import { WobbleCard } from "@/components/ui/wobble-card";
import N8nFlow from "@/components/ui/N8nFlow";

export interface LandingPageContent {
    title: string;
    subtitle: string;
    description: string;
    heroCtaLabel: string;
    heroCtaHref: string;
    steps: string[];
    benefits: string[];
    before: string[];
    after: string[];
}

export default function AutomatizacionInteligenteView({
    content,
}: {
    content: LandingPageContent;
}) {
    return (
        <div className="relative z-20 isolate bg-white dark:bg-neutral-900 transition-colors">

            {/* HERO */}
            <section className="relative w-full min-h-[48rem] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-900 to-black">

                <div className="relative z-20 flex flex-col items-center text-center px-4 mt-10">
                    <h1 className="text-white font-bold leading-[1.05] drop-shadow-xl">
                        <span className="block text-5xl md:text-7xl">Automatización</span>
                        <span className="block text-5xl md:text-7xl">Inteligente</span>
                        <span className="block text-5xl md:text-7xl text-[#d97757]">para Empresas</span>
                    </h1>
                    <a
                        href="#formulario"
                        className="mt-10 px-6 py-3 rounded-full bg-[#d97757] text-white font-semibold hover:bg-[#b45309] transition"
                    >
                        Quiero saber más
                    </a>
                </div>
                <div className="relative z-10 w-full max-w-6xl mt-16 px-4">
                    <N8nFlow />
                </div>

            </section>


            <section className="py-24 bg-white dark:bg-neutral-900 transition-colors">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-neutral-900 dark:text-white">
                    Cómo automatizamos tus procesos
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-16 max-w-5xl mx-auto px-6">
                    {content.steps.map((step, i) => (
                        <div key={i} className="relative flex flex-col items-center group">
                            <div
                                className="w-44 h-28 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:border-[#d97706] group-hover:bg-[#d97706]/10"
                            >
                                {/* Icono SVG */}
                                <div className="transition-all duration-300 group-hover:text-[#d97706] text-neutral-600 dark:text-neutral-400">

                                    {i === 0 && (
                                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                                            className="stroke-current">
                                            <path d="M4 4h7v7H4zM13 13h7v7h-7zM4 13l7 7M13 4l7 7"
                                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}

                                    {i === 1 && (
                                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                                            className="stroke-current">
                                            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
                                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}

                                    {i === 2 && (
                                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                                            className="stroke-current">
                                            <path d="M6 4v6a4 4 0 004 4h4m4-10v6a4 4 0 01-4 4h-4"
                                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}

                                </div>
                            </div>
                            <p className="mt-4 text-neutral-700 dark:text-neutral-300 font-medium max-w-xs text-center">
                                {step}
                            </p>
                            {i < content.steps.length - 1 && (
                                <div
                                    className="hidden md:block absolute top-14 left-full w-24 h-[2px] bg-neutral-300 dark:bg-neutral-700 group-hover:bg-[#d97706] transition-all duration-300"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </section>
            <section className="py-24 bg-neutral-50 dark:bg-neutral-800 transition-colors">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
                    Beneficios de la Automatización Inteligente
                </h2>

                <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
                    {content.benefits.map((benefit, i) => {
                        const icons = [
                            //1
                            (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-[#d97706]">
                                    <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ),
                            //2
                            (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-[#d97706]">
                                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ),
                            //3
                            (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-[#d97706]">
                                    <path d="M6 4v6a4 4 0 004 4h4m4-10v6a4 4 0 01-4 4h-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ),
                            //4
                            (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-[#d97706]">
                                    <path d="M12 3a4 4 0 00-4 4v1H7a4 4 0 000 8h1v1a4 4 0 008 0v-1h1a4 4 0 000-8h-1V7a4 4 0 00-4-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ),
                            //5
                            (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-[#d97706]">
                                    <path d="M12 8v8m-4-4h8M12 2a10 10 0 110 20 10 10 0 010-20z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ),
                            //6
                            (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-[#d97706]">
                                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                    <path d="M12 7v5l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ),
                        ];

                        const icon = icons[i % icons.length];

                        return (
                            <WobbleCard
                                key={i}
                                containerClassName="relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 min-h-[200px] group"
                                className="text-white"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-3 h-3 rounded-full bg-neutral-400 dark:bg-neutral-600 group-hover:bg-[#d97706] transition-all duration-300"
                                    />
                                    {icon}
                                </div>
                                <p className="text-neutral-700 dark:text-neutral-300 font-medium relative z-10">
                                    {benefit}
                                </p>
                                <div
                                    className="absolute inset-0 bg-[#d97706] opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                />
                            </WobbleCard>
                        );
                    })}
                </div>
            </section>
            <section className="py-24 bg-white dark:bg-neutral-900 transition-colors">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900 dark:text-white">
                    Antes y después de automatizar
                </h2>

                <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto px-6">

                    <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-lg shadow hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-200">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            Antes
                        </h3>

                        <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                            {content.before.map((item, i) => (
                                <li key={i}>• {item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-lg shadow hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-200">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            Después
                        </h3>

                        <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                            {content.after.map((item, i) => (
                                <li key={i}>• {item}</li>
                            ))}
                        </ul>
                    </div>

                </div>
            </section>

            {/*FORM */}
            <section id="formulario" className="max-w-4xl mx-auto px-6 py-20">
                <div className="overflow-hidden">
                    <ContactForm className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0" />
                </div>
            </section>
            <a
                href="https://wa.me/34626270806"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition"
                style={{ backgroundColor: "#d97757" }}
            >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.64a12 12 0 0 0 5.74 1.46h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.4ZM12.05 21.3h-.01a9.3 9.3 0 0 1-4.74-1.3l-.34-.2-3.74.97 1-3.64-.22-.37a9.28 9.28 0 0 1-1.42-4.9c0-5.14 4.18-9.32 9.33-9.32 2.49 0 4.83.97 6.6 2.73a9.27 9.27 0 0 1 2.73 6.6c0 5.15-4.18 9.33-9.33 9.33Zm5.13-6.96c-.28-.14-1.65-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.08-.17.19-.33.21-.61.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34 0 1.38 1 2.72 1.14 2.9.14.19 1.96 3 4.75 4.2.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.12-.26-.19-.54-.33Z" />
                </svg>
                <span>Quiero automatizar mi empresa</span>
            </a>

            <Footer />
        </div>
    );
}
