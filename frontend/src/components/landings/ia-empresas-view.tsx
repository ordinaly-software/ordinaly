"use client";

import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import ContactForm from "@/components/ui/contact-form.client";
import Footer from "@/components/ui/footer";

export interface LandingPageContent {
    title: string;
    subtitle: string;
    description: string;
    heroCtaLabel: string;
    heroCtaHref: string;
    cards: { title: string; description: string; image: string }[];
    steps: string[];
}

export default function InteligenciaArtificialEmpresasView({ content }: { content: LandingPageContent }) {
    return (
        <div className="relative z-20 isolate">

            {/* HERO */}
            <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        {content.title}
                    </h1>

                    <p className="text-xl text-slate-700 dark:text-neutral-300 mb-4">
                        {content.subtitle}
                    </p>

                    <p className="text-slate-600 dark:text-neutral-400 mb-8 max-w-lg">
                        {content.description}
                    </p>

                    <a
                        href={content.heroCtaHref}
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition"
                    >
                        {content.heroCtaLabel}
                    </a>
                </div>

                <div className="flex justify-center">
                    <img src="assets/hero.jpg" />
                </div>
            </section>

            {/* CARDS */}
            <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {content.cards.map((card, i) => (
                    <CardContainer key={i} className="inter-var">
                        <CardBody className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xl">

                            <CardItem translateZ={50} className="text-xl font-bold text-slate-900 dark:text-white">
                                {card.title}
                            </CardItem>
                            <CardItem translateZ={80} className="mt-4 w-full">
                                <img
                                    src={card.image}
                                    className="rounded-xl w-full h-48 object-cover"
                                />
                            </CardItem>
                            <CardItem translateZ={30} className="mt-6 text-sm text-neutral-600 dark:text-neutral-300">
                                {card.description}
                            </CardItem>

                        </CardBody>
                    </CardContainer>
                ))}
            </section>


            <section className="max-w-5xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10">
                    Secuencia de implantación
                </h2>

                <ol className="space-y-6">
                    {content.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                            <span className="text-orange-500 font-bold text-2xl">{i + 1}</span>
                            <p className="text-slate-700 dark:text-neutral-300">{step}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section id="formulario" className="max-w-4xl mx-auto px-6 py-20">
                <div className="overflow-hidden">
                    <ContactForm className="[&>section]:max-w-none [&>section]:px-0 [&>section]:py-0" />
                </div>
            </section>

            {/*CTA*/}
            <a
                href="https://wa.me/34626270806?text=Quiero%20evaluar%20cómo%20usar%20IA%20en%20mi%20empresa"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-xl transition"
                style={{
                    backgroundColor: "#e4572e",
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                >
                    <path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.26-1.64A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.9 9.9 0 0 1-5.06-1.39l-.36-.21-3.72.98 1-3.63-.24-.37A9.9 9.9 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.9 9.9 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.13-7.47c-.28-.14-1.65-.82-1.9-.91-.25-.1-.43-.14-.62.14-.18.28-.71.91-.87 1.1-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.43-.48.14-.16.18-.28.28-.46.1-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.06-.22-.53-.45-.46-.62-.46h-.53c-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.28 0 1.34.98 2.63 1.12 2.81.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.58.65.2 1.24.17 1.7.1.52-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.2-.53-.34z" />
                </svg>

                <span>Contáctanos</span>
            </a>
            <Footer />
        </div>
    );
}
