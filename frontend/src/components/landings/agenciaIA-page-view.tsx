"use client";

import { useMessages } from "next-intl";
import RobotFollower from "../../components/ui/RobotFollower";
import TimelineHorizontal from "../../components/ui/TimelineHorizontal";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";

export default function AgenciaIAView() {
    const messages = useMessages() as any;
    const content = messages.landings["agencia-automatizacion-ia"];

    return (
        <main className="w-full flex flex-col gap-32">

            {/* HERO */}
            <section className="w-full bg-black text-white">
                <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                            Automatizamos tu empresa con IA
                        </h1>
                        <p className="mt-5 text-lg text-neutral-300 max-w-md">
                            Procesos más rápidos, menos errores, más beneficios.
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                            <a
                                href="#formulario"
                                className="px-6 py-3 text-white rounded-lg text-sm font-medium"
                                style={{ backgroundColor: "#d97757" }}
                            >
                                Solicitar auditoría
                            </a>
                            <button className="text-sm text-neutral-300 underline underline-offset-4">
                                Ver cómo trabajamos
                            </button>
                        </div>
                    </div>

                    {/* Robot */}
                    <div className="w-full md:w-auto flex justify-center md:justify-end">
                        <RobotFollower />
                    </div>
                </div>
            </section>
            <section className="w-full max-w-5xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-semibold mb-12 text-center dark:text-white">
                    Qué automatizamos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {content.whatWeAutomate.map((item: string, i: number) => (
                        <div
                            key={i}
                            className="flex items-start gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition">
                            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
                                {i === 0 && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M3 8h18M3 16h18M7 4v4M7 16v4M17 4v4M17 16v4" />
                                    </svg>
                                )}
                                {i === 1 && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 3v18M3 12h18M5 5l14 14" />
                                    </svg>
                                )}
                                {i === 2 && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12zM4 21c0-4 4-7 8-7s8 3 8 7" />
                                    </svg>
                                )}
                                {i === 3 && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 3l8 4v6c0 5-3 8-8 8s-8-3-8-8V7l8-4z" />
                                    </svg>
                                )}
                                {i === 4 && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M4 4h16v16H4zM8 8h8M8 12h5" />
                                    </svg>
                                )}
                            </div>
                            <p className="text-neutral-700 dark:text-neutral-100 text-lg leading-relaxed">
                                {item}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* TIMELINE */}
            <section className="w-full max-w-4xl mx-auto px-6">
                <TimelineHorizontal steps={content.timeline} />
            </section>

            <section className="w-full max-w-6xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-semibold mb-12 text-center dark:text-white">
                    Casos reales
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {content.caseStudies.map((caseItem: any, i: number) => (
                        <div
                            key={i}
                            className="group p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition relative">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6"
                                style={{ backgroundColor: "#d97757" }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M4 7h16M4 12h16M4 17h10" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-semibold mb-3 group-hover:text-neutral-900 dark:group-hover:text-white dark:text-neutral-100 transition">
                                {caseItem.title}
                            </h3>

                            <p className="text-neutral-600 dark:text-neutral-100 leading-relaxed text-sm">
                                {caseItem.description}
                            </p>

                            <div
                                className="absolute bottom-0 left-0 w-0 h-1 transition-all duration-300 group-hover:w-full"
                                style={{ backgroundColor: "#d97757" }}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="relative w-full py-28 px-6 overflow-hidden dark:bg-neutral-900">
                <div className="absolute inset-0 bg-gradient-to-br from-[#d97757]/20 via-[#d97757]/10 to-transparent dark:from-[#d97757]/10 dark:via-[#d97757]/5" />
                <div className="absolute -top-20 right-0 w-72 h-72 bg-[#d97757]/30 dark:bg-[#d97757]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d97757]/20 dark:bg-[#d97757]/10 rounded-full blur-3xl" />

                <div className="relative max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-semibold mb-6 dark:text-white">
                        ¿Listo para automatizar tu empresa?
                    </h2>

                    <p className="text-neutral-700 dark:text-neutral-200 text-lg mb-10 leading-relaxed">
                        Definimos un piloto acotado, con métricas claras y sin compromisos a largo plazo.
                    </p>

                    <a
                        href="https://wa.me/346XXXXXXXXX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition"
                        style={{ backgroundColor: "#d97757" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                            <path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.26-1.64A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.9 9.9 0 0 1-5.06-1.39l-.36-.21-3.72.98 1-3.63-.24-.37A9.9 9.9 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.9 9.9 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.13-7.47c-.28-.14-1.65-.82-1.9-.91-.25-.1-.43-.14-.62.14-.18.28-.71.91-.87 1.1-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.43-.48.14-.16.18-.28.28-.46.1-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.06-.22-.53-.45-.46-.62-.46h-.53c-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.28 0 1.34.98 2.63 1.12 2.81.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.58.65.2 1.24.17 1.7.1.52-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.2-.53-.34z" />
                        </svg>
                        Reserva una reunión
                    </a>
                </div>
            </section>

            <style jsx>{`
                @keyframes pulse-slow {
                    0% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                    100% { opacity: 0.4; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 6s ease-in-out infinite;
                }
            `}</style>

            {/* FORM */}
            <section id="formulario" className="max-w-4xl mx-auto px-6 py-20">
                <ContactForm className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0" />
            </section>

            <Footer />
        </main>
    );
}
