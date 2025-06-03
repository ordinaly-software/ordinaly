"use client"

import { Bot, Workflow, Zap, Globe, Users, TrendingUp, Moon, Sun, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import StyledButton from "@/components/home/styled-button";
import ColourfulText from "@/components/home/colourful-text"
import { Cover } from "@/components/home/cover"
import Footer from "@/components/footer";
import DemoModal from "@/components/demo-modal"


export default function HomePage() {
  const [isDark, setIsDark] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const savedTheme = localStorage.getItem("theme")

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDark(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
        }
      })
    }, observerOptions)

    const animateElements = document.querySelectorAll(".scroll-animate")
    animateElements.forEach((el) => observer.observe(el))

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 1000)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-gray-300 dark:border-gray-800 bg-[#FFFFFF] dark:bg-[#1A1924]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="mr-4">
                <img
                  src="/logo.webp"
                  alt="Ordinaly.ai Logo"
                  className="h-8 w-auto"
                />
              </div>
              <div className="text-2xl font-bold text-[#32E875]">ORDINALY</div>
              <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">.ai</div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-700 dark:text-gray-300 hover:text-[#32E875] transition-colors">
                Servicios
              </a>
              <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-[#32E875] transition-colors">
                Nosotros
              </a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-[#32E875] transition-colors">
                Contacto
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="text-gray-700 dark:text-gray-300"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button className="bg-[#32E875] hover:bg-[#2BC765] text-white font-semibold">Comenzar</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F9E5] via-[#E6F7FA] to-[#EDE9FE] dark:from-[#32E875]/10 dark:via-[#46B1C9]/10 dark:to-[#623CEA]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate slide-in-left">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#32E875] via-[#46B1C9] to-[#623CEA] bg-clip-text text-transparent">
                <ColourfulText text="AUTOMATIZA" />
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-gray-800 dark:text-white">TU NEGOCIO CON IA</h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
                Transformamos empresas con automatizaciones inteligente. Desde chatbots hasta
                flujos de trabajo avanzados, te ayudamos a modernizar tu empresa y a ser más eficiente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative inline-flex items-center justify-center gap-4 group">
                  <div
                    className={cn(
                      "absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200",
                      "dark:from-[#32E875]/30 dark:via-[#46B1C9]/30 dark:to-[#623CEA]/30"
                    )}
                  ></div>
                  <Button variant="special" size="lg" asChild>
                    <a href="#process">
                      Descubre cómo
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 10 10"
                        height="10"
                        width="10"
                        fill="none"
                        className={cn("mt-0.5 ml-2 -mr-1 stroke-[#1A1924] stroke-2", "dark:stroke-white")}
                      >
                        <path
                          d="M0 5h7"
                          className="transition opacity-0 group-hover:opacity-100"
                        ></path>
                        <path
                          d="M1 1l4 4-4 4"
                          className="transition group-hover:translate-x-[3px]"
                        ></path>
                      </svg>
                    </a>
                  </Button>
                </div>
                <Button
                  size="lg"
                  variant="special"
                  className="border-[#46B1C9] text-[#46B1C9] hover:bg-[#46B1C9] hover:text-white text-lg px-8 py-4"
                  onClick={() => setIsDemoModalOpen(true)}
                >
                  Ver Demo
                </Button>
              </div>
            </div>
            <div className="scroll-animate slide-in-right">
              <div className="relative">
                <img
                  src="/static/girl_resting_transparent.webp"
                  alt="AI Automation Dashboard"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#32E875]/20 via-transparent to-[#623CEA]/20 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#32E875] text-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            {/* <div className="scroll-animate fade-in-up">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-black/80">Empresas Transformadas</div>
            </div> */}
            <div className="scroll-animate fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-black/80">Reducción de Costos</div>
            </div>
            <div className="scroll-animate fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-black/80">Soporte Disponible</div>
            </div>
            <div className="scroll-animate fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-black/80">Satisfacción Cliente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#32E875]">NUESTROS SERVICIOS</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Soluciones de automatización diseñadas para impulsar y acelerar tu empresa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="scroll-animate slide-in-left bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#32E875] transition-all duration-300 hover:shadow-xl hover:shadow-[#32E875]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#32E875]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-[#32E875]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Chatbots Inteligentes</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Automatiza atención al cliente 24/7 con IA conversacional avanzada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate fade-in-up bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#46B1C9] transition-all duration-300 hover:shadow-xl hover:shadow-[#46B1C9]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#46B1C9]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Workflow className="h-8 w-8 text-[#46B1C9]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Workflows Automatizados</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Integración con Odoo, Slack y herramientas empresariales
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate slide-in-right bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#E4572E] transition-all duration-300 hover:shadow-xl hover:shadow-[#E4572E]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#E4572E]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-[#E4572E]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">WhatsApp Business</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Automatización de ventas y soporte vía WhatsApp Business API
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate slide-in-left bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#623CEA] transition-all duration-300 hover:shadow-xl hover:shadow-[#623CEA]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#623CEA]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-[#623CEA]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Integración Global</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Conectamos todos tus sistemas en una plataforma unificada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate fade-in-up bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#32E875] transition-all duration-300 hover:shadow-xl hover:shadow-[#32E875]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#32E875]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-[#32E875]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Consultoría Personalizada</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Análisis y estrategia de automatización adaptada a tu negocio
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="scroll-animate slide-in-right bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#46B1C9] transition-all duration-300 hover:shadow-xl hover:shadow-[#46B1C9]/10">
              <CardHeader>
                <div className="w-16 h-16 bg-[#46B1C9]/10 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-[#46B1C9]" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Optimización Continua</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Monitoreo y mejora constante de tus procesos automatizados
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate slide-in-left">
              <img
                src="/static/hand_shake_transparent.webp?height=500&width=600"
                alt="Andalusian Business Transformation"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="scroll-animate slide-in-right">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-[#32E875]">
                LIDERANDO LA TRANSFORMACIÓN DIGITAL EN ANDALUCÍA
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                En Ordinaly.ai, creemos que las empresas andaluzas tienen el potencial de liderar la innovación
                tecnológica en España y Europa. Nuestra misión es democratizar el acceso a la inteligencia artificial y
                la automatización.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Trabajamos codo con codo con empresas locales para implementar soluciones que no solo mejoran la
                eficiencia, sino que las posicionan como referentes en sus sectores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="scroll-animate fade-in-up mt-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#E4572E]">NUESTRAS TECNOLOGÍAS</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-[#32E875]/10 rounded-2xl flex flex-col items-center">
              <img src="/static/tools/odoo_logo.webp" alt="Odoo" className="h-10 mb-2 dark:invert" />
              <div className="text-lg font-semibold text-[#32E875] mb-1">Odoo</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">ERP y automatización empresarial</div>
            </div>
            <div className="text-center p-6 bg-[#46B1C9]/10 rounded-2xl flex flex-col items-center">
              <img src="/static/tools/whatsapp_logo.webp" alt="WhatsApp Business" className="h-10 mb-2 dark:invert" />
              <div className="text-lg font-semibold text-[#46B1C9] mb-1">WhatsApp Business</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Automatización de ventas y soporte</div>
            </div>
            <div className="text-center p-6 bg-[#623CEA]/10 rounded-2xl flex flex-col items-center">
              <img src="/static/tools/chatgpt_logo.webp" alt="ChatGPT" className="h-10 mb-2 dark:invert" />
              <div className="text-lg font-semibold text-[#623CEA] mb-1">ChatGPT</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">IA conversacional avanzada</div>
            </div>
            <div className="text-center p-6 bg-[#FFD600]/10 rounded-2xl flex flex-col items-center">
              <img src="/static/tools/copilot_logo.webp" alt="Copilot" className="h-10 mb-2" />
              <div className="text-lg font-semibold text-[#FFD600] mb-1">Copilot</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Automatización y productividad IA</div>
            </div>
            <div className="text-center p-6 bg-[#00BFAE]/10 rounded-2xl flex flex-col items-center">
              <img src="/static/tools/gemini_logo.webp" alt="Gemini" className="h-10 mb-2" />
              <div className="text-lg font-semibold text-[#00BFAE] mb-1">Gemini</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">IA generativa de Google</div>
            </div>
            <div className="text-center p-6 bg-[#4285F4]/10 rounded-2xl flex flex-col items-center">
              <img src="/static/tools/looker_studio_logo.webp" alt="Looker Studio" className="h-10 mb-2" />
              <div className="text-lg font-semibold text-[#4285F4] mb-1">Looker Studio</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Visualización de datos y BI</div>
            </div>
            <div className="text-center p-6 bg-[#E4572E]/10 rounded-2xl flex flex-col items-center">
              <img src="/static/tools/claude_logo.webp" alt="Claude" className="h-10 mb-2" />
              <div className="text-lg font-semibold text-[#E4572E] mb-1">Claude</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">IA generativa de Anthropic</div>
            </div>
            <div className="text-center p-6 bg-[#8B5CF6]/10 rounded-2xl flex flex-col items-center">
              <img src="/static/tools/caleida_logo.webp" alt="Caleida" className="h-10 mb-2" />
              <div className="text-lg font-semibold text-[#8B5CF6] mb-1">Caleida</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Agente de IA para ventas y marketing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#623CEA]">NUESTRO PROCESO</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Un enfoque estructurado para transformar tu empresa paso a paso
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="scroll-animate slide-in-left text-center">
              <div className="w-20 h-20 bg-[#32E875] rounded-full flex items-center justify-center mx-auto mb-6 text-black font-bold text-2xl">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Análisis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Evaluamos tus procesos actuales y identificamos oportunidades de automatización
              </p>
            </div>

            <div className="scroll-animate fade-in-up text-center">
              <div className="w-20 h-20 bg-[#46B1C9] rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Implementación</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Desarrollamos e integramos soluciones personalizadas para tu empresa
              </p>
            </div>

            <div className="scroll-animate slide-in-right text-center">
              <div className="w-20 h-20 bg-[#E4572E] rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Optimización</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitoreamos y mejoramos continuamente el rendimiento de tus sistemas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#32E875] via-[#46B1C9] to-[#623CEA] text-white"
      >
        <div className="max-w-4xl mx-auto text-center scroll-animate fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">¿LISTO PARA <Cover>ACELERAR</Cover> TU EMPRESA?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Únete a las empresas andaluzas que ya están liderando la revolución digital. Comienza tu transformación hoy
            mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <StyledButton />
              </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-[#32E875] hover:bg-[#2BC765] text-black shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5"
          size="icon"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
