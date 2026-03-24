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

            <section className="w-full max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-semibold mb-8">Qué automatizamos</h2>
                <ul className="border-l-2 border-neutral-300 pl-6 space-y-4">
                    {content.whatWeAutomate.map((item: string, i: number) => (
                        <li key={i} className="text-lg text-neutral-700">{item}</li>
                    ))}
                </ul>
            </section>

            {/* TIMELINE */}
            <section className="w-full max-w-4xl mx-auto px-6">
                <TimelineHorizontal steps={content.timeline} />
            </section>

            <section className="w-full max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-semibold mb-8">Casos reales</h2>
                <p>Aquí irán los casos reales minimalistas.</p>
            </section>

            <section className="w-full text-center py-24 px-6">
                <h2 className="text-4xl font-bold mb-4">¿Listo para automatizar tu empresa?</h2>
                <p className="text-neutral-600">
                    Definimos un piloto acotado, con métricas claras y sin compromisos a largo plazo.
                </p>
                <a
                    href="#formulario"
                    className="mt-8 inline-block px-8 py-4 bg-orange-500 text-white rounded-lg font-medium"
                    style={{ backgroundColor: "#d97757" }}
                >
                    Reserva una reunión
                </a>
            </section>

            {/* FORM */}
            <section id="formulario" className="max-w-4xl mx-auto px-6 py-20">
                <ContactForm className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0" />
            </section>
            <a
                href="https://wa.me/346XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition"
                style={{ backgroundColor: "#d97757" }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="..." />
                </svg>
                <span>Contáctanos</span>
            </a>

            <Footer />
        </main>
    );
}
