"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { Bot, User, ChevronLeft, ChevronRight } from "lucide-react";

type TranslateFn = (key: string) => string;

interface SectionProps {
  t: TranslateFn;
}

interface ChatMessage {
  id: number;
  sender: "customer" | "agent";
  text: string;
}

interface Scenario {
  label: string;
  messages: ChatMessage[];
}

const SCENARIO_COUNT = 4;
const SCENARIO_THEMES = [
  {
    accent: "#0255D5",
    accentDark: "#0144AA",
    accentSoft: "#DCE8FF",
    accentSoftDark: "rgba(2, 85, 213, 0.18)",
    secondary: "#6A9BCC",
  },
  {
    accent: "#D97757",
    accentDark: "#C6613F",
    accentSoft: "#F6E1D8",
    accentSoftDark: "rgba(217, 119, 87, 0.18)",
    secondary: "#D4A27F",
  },
  {
    accent: "#788C5D",
    accentDark: "#5F7147",
    accentSoft: "#E4EBD9",
    accentSoftDark: "rgba(120, 140, 93, 0.2)",
    secondary: "#BCD1CA",
  },
  {
    accent: "#C46686",
    accentDark: "#A84C6B",
    accentSoft: "#F3DFE7",
    accentSoftDark: "rgba(196, 102, 134, 0.2)",
    secondary: "#CBCADB",
  },
] as const;

function buildScenarios(t: TranslateFn): Scenario[] {
  return Array.from({ length: SCENARIO_COUNT }, (_, i) => ({
    label: t(`chatDemo.scenarios.${i}.label`),
    messages: Array.from({ length: 4 }, (_, j) => ({
      id: j,
      sender: t(`chatDemo.scenarios.${i}.messages.${j}.sender`) as "customer" | "agent",
      text: t(`chatDemo.scenarios.${i}.messages.${j}.text`),
    })),
  }));
}

export function AiChatDemo({ t }: SectionProps) {
  const scenarios = buildScenarios(t);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const animTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startAnimation = useCallback((msgCount: number) => {
    // Clear any pending timers
    animTimers.current.forEach(clearTimeout);
    animTimers.current = [];
    setVisibleCount(0);
    setIsAnimating(true);
    let i = 0;
    const show = () => {
      if (i < msgCount) {
        setVisibleCount(i + 1);
        i++;
        const id = setTimeout(show, 900);
        animTimers.current.push(id);
      } else {
        setIsAnimating(false);
      }
    };
    const initId = setTimeout(show, 300);
    animTimers.current.push(initId);
  }, []);

  // IntersectionObserver to trigger initial animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          observer.disconnect();
          startAnimation(scenarios[0].messages.length);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      animTimers.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = useCallback((index: number) => {
    if (index === activeIndex || isAnimating) return;
    setActiveIndex(index);
    startAnimation(scenarios[index].messages.length);
  }, [activeIndex, isAnimating, scenarios, startAnimation]);

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + SCENARIO_COUNT) % SCENARIO_COUNT);
  }, [activeIndex, goTo]);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % SCENARIO_COUNT);
  }, [activeIndex, goTo]);

  const currentScenario = scenarios[activeIndex];
  const currentTheme = SCENARIO_THEMES[activeIndex % SCENARIO_THEMES.length];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-dark dark:text-ivory-light mb-4 tracking-tight">
            {t("chatDemo.title")}
          </h2>
          <p className="text-lg text-slate-medium dark:text-cloud-medium max-w-2xl mx-auto leading-relaxed">
            {t("chatDemo.subtitle")}
          </p>
        </div>

        {/* Carousel */}
        <div className="flex flex-col items-center gap-6">
          {/* Scenario tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {scenarios.map((scenario, i) => {
              const scenarioTheme = SCENARIO_THEMES[i % SCENARIO_THEMES.length];
              const isActive = i === activeIndex;

              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: isActive
                      ? scenarioTheme.accent
                      : scenarioTheme.accentSoft,
                    color: isActive ? "#FFFFFF" : scenarioTheme.accentDark,
                    boxShadow: isActive ? `0 10px 24px -16px ${scenarioTheme.accent}` : undefined,
                  }}
                >
                  {scenario.label}
                </button>
              );
            })}
          </div>

          {/* Chat window + arrows */}
          <div className="relative w-full max-w-lg flex items-center gap-3">
            {/* Prev arrow */}
            <button
              onClick={goPrev}
              aria-label="Previous scenario"
              className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--swatch--ivory-medium] dark:bg-[--swatch--slate-medium] border border-[--color-border-subtle] dark:border-[--color-border-strong] text-slate-medium dark:text-cloud-medium transition-all duration-200 shadow-sm"
              style={{
                backgroundColor: currentTheme.accentSoft,
                borderColor: `${currentTheme.accent}33`,
                color: currentTheme.accentDark,
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Chat window */}
            <div
              className="flex-1 bg-white/80 dark:bg-[--swatch--slate-medium]/80 backdrop-blur-md rounded-3xl border border-[--color-border-subtle] dark:border-[--color-border-strong] shadow-2xl overflow-hidden"
              style={{
                borderColor: `${currentTheme.accent}26`,
                boxShadow: `0 24px 50px -36px ${currentTheme.accentDark}`,
              }}
            >
              {/* Chat header */}
              <div
                className="flex items-center gap-3 px-5 py-4 border-b border-[--color-border-subtle] dark:border-[--color-border-strong] bg-[--swatch--ivory-medium]/60 dark:bg-[--swatch--slate-dark]/60"
                style={{
                  borderColor: `${currentTheme.accent}22`,
                  backgroundImage: `linear-gradient(135deg, ${currentTheme.accentSoft} 0%, rgba(255,255,255,0.92) 100%)`,
                }}
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.secondary} 100%)`,
                  }}
                >
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-dark dark:text-ivory-light">{t("chatDemo.assistant")}</p>
                  <p
                    className="text-xs flex items-center gap-1"
                    style={{ color: currentTheme.accentDark }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                      style={{ backgroundColor: currentTheme.accent }}
                    />
                    Online
                  </p>
                </div>
                <span
                  className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: currentTheme.accentSoft,
                    color: currentTheme.accentDark,
                  }}
                >
                  {currentScenario.label}
                </span>
              </div>

              {/* Messages */}
              <div className="h-72">
                <ChatMessageList smooth>
                  {currentScenario.messages.slice(0, visibleCount).map((msg) => (
                    <div
                      key={`${activeIndex}-${msg.id}`}
                      className={`flex items-end gap-2 ${msg.sender === "customer" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                          msg.sender === "agent"
                            ? ""
                            : "bg-[--swatch--oat] dark:bg-[--swatch--slate-light]"
                        }`}
                        style={msg.sender === "agent"
                          ? { backgroundImage: `linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.secondary} 100%)` }
                          : undefined}
                      >
                        {msg.sender === "agent" ? (
                          <Bot className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-slate-medium dark:text-cloud-medium" />
                        )}
                      </div>
                      <div
                        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === "agent"
                            ? "text-slate-dark dark:text-ivory-light rounded-bl-sm"
                            : "text-white rounded-br-sm"
                        }`}
                        style={msg.sender === "agent"
                          ? {
                              backgroundColor: currentTheme.accentSoft,
                              border: `1px solid ${currentTheme.accent}22`,
                            }
                          : {
                              backgroundColor: currentTheme.accent,
                            }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </ChatMessageList>
              </div>

              {/* Fake input */}
              <div className="px-4 py-3 border-t border-[--color-border-subtle] dark:border-[--color-border-strong] bg-[--swatch--ivory-medium]/40 dark:bg-[--swatch--slate-dark]/40">
                <div className="flex items-center gap-2 bg-white dark:bg-[--swatch--slate-medium] rounded-full px-4 py-2 border border-[--color-border-subtle] dark:border-[--color-border-strong]">
                  <span className="text-sm text-slate-light dark:text-cloud-medium flex-1">
                    {t("chatDemo.you")}…
                  </span>
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: currentTheme.accent }}
                  >
                    <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Next arrow */}
            <button
              onClick={goNext}
              aria-label="Next scenario"
              className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--swatch--ivory-medium] dark:bg-[--swatch--slate-medium] border border-[--color-border-subtle] dark:border-[--color-border-strong] text-slate-medium dark:text-cloud-medium transition-all duration-200 shadow-sm"
              style={{
                backgroundColor: currentTheme.accentSoft,
                borderColor: `${currentTheme.accent}33`,
                color: currentTheme.accentDark,
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {scenarios.map((_, i) => {
              const scenarioTheme = SCENARIO_THEMES[i % SCENARIO_THEMES.length];
              const isActive = i === activeIndex;

              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to scenario ${i + 1}`}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? "1.5rem" : "0.5rem",
                    backgroundColor: isActive ? scenarioTheme.accent : scenarioTheme.accentSoft,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
