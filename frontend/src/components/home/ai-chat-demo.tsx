"use client";

import { useEffect, useState, useRef, useCallback, type CSSProperties } from "react";
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

const getScenarioThemeVars = (
  theme: (typeof SCENARIO_THEMES)[number],
): CSSProperties => ({
  ["--scenario-accent" as string]: theme.accent,
  ["--scenario-accent-dark" as string]: theme.accentDark,
  ["--scenario-accent-soft" as string]: theme.accentSoft,
  ["--scenario-accent-soft-dark" as string]: theme.accentSoftDark,
  ["--scenario-secondary" as string]: theme.secondary,
  ["--scenario-border" as string]: `${theme.accent}33`,
  ["--scenario-shadow" as string]: `${theme.accentDark}66`,
});

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
    if (index === activeIndex) return;
    setActiveIndex(index);
    startAnimation(scenarios[index].messages.length);
  }, [activeIndex, scenarios, startAnimation]);

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + SCENARIO_COUNT) % SCENARIO_COUNT);
  }, [activeIndex, goTo]);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % SCENARIO_COUNT);
  }, [activeIndex, goTo]);

  const currentScenario = scenarios[activeIndex];
  const currentTheme = SCENARIO_THEMES[activeIndex % SCENARIO_THEMES.length];
  const currentThemeVars = getScenarioThemeVars(currentTheme);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-6 h-72 w-72 -translate-x-[68%] rounded-full bg-clay/12 blur-3xl dark:bg-clay/10" />
        <div className="absolute right-8 top-20 h-64 w-64 rounded-full bg-cobalt/10 blur-3xl dark:bg-cobalt/12" />
      </div>
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
        <div className="flex flex-col items-center gap-6" style={currentThemeVars}>
          {/* Scenario tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {scenarios.map((scenario, i) => {
              const scenarioTheme = SCENARIO_THEMES[i % SCENARIO_THEMES.length];
              const isActive = i === activeIndex;
              const scenarioThemeVars = getScenarioThemeVars(scenarioTheme);

              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-transparent bg-[var(--scenario-accent)] text-white"
                      : "border-[var(--scenario-border)] bg-[var(--scenario-accent-soft)] text-[var(--scenario-accent-dark)] dark:bg-[var(--scenario-accent-soft-dark)] dark:text-[var(--scenario-secondary)]"
                  }`}
                  style={{
                    ...scenarioThemeVars,
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
              className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--scenario-border)] bg-[var(--scenario-accent-soft)] text-[var(--scenario-accent-dark)] transition-all duration-200 shadow-sm dark:bg-[var(--scenario-accent-soft-dark)] dark:text-[var(--scenario-secondary)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Chat window */}
            <div
              className="flex-1 overflow-hidden rounded-3xl border border-[var(--scenario-border)] bg-white/88 shadow-2xl backdrop-blur-md dark:bg-[#121A27]/90"
              style={{
                boxShadow: "0 24px 50px -36px var(--scenario-shadow)",
              }}
            >
              {/* Chat header */}
              <div className="relative overflow-hidden border-b border-[var(--scenario-border)] bg-[--swatch--ivory-medium]/60 dark:bg-[#0F1724]">
                <div
                  className="absolute inset-0 dark:hidden"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--scenario-accent-soft) 0%, rgba(255,255,255,0.94) 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 hidden dark:block"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--scenario-accent-soft-dark) 0%, rgba(15,23,36,0.94) 100%)",
                  }}
                />
                <div className="relative flex items-center gap-3 px-5 py-4">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundImage: "linear-gradient(135deg, var(--scenario-accent) 0%, var(--scenario-secondary) 100%)",
                    }}
                  >
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-dark dark:text-ivory-light">{t("chatDemo.assistant")}</p>
                    <p className="text-xs flex items-center gap-1 text-[var(--scenario-accent-dark)] dark:text-[var(--scenario-secondary)]">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block animate-pulse bg-[var(--scenario-accent)]"
                      />
                      Online
                    </p>
                  </div>
                  <span className="ml-auto rounded-full bg-[var(--scenario-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--scenario-accent-dark)] dark:bg-[var(--scenario-accent-soft-dark)] dark:text-[var(--scenario-secondary)]">
                    {currentScenario.label}
                  </span>
                </div>
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
                            ? "rounded-bl-sm border border-[var(--scenario-border)] bg-[var(--scenario-accent-soft)] text-slate-dark dark:bg-[var(--scenario-accent-soft-dark)] dark:text-ivory-light"
                            : "text-white rounded-br-sm"
                        }`}
                        style={msg.sender === "customer"
                          ? {
                              backgroundColor: "var(--scenario-accent)",
                            }
                          : undefined}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </ChatMessageList>
              </div>

              {/* Fake input */}
              <div className="border-t border-[var(--scenario-border)] bg-[--swatch--ivory-medium]/40 px-4 py-3 dark:bg-[#0E1622]/60">
                <div className="flex items-center gap-2 rounded-full border border-[var(--scenario-border)] bg-white/90 px-4 py-2 dark:bg-[#192334]">
                  <span className="text-sm text-slate-light dark:text-cloud-medium flex-1">
                    {t("chatDemo.you")}…
                  </span>
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--scenario-accent)" }}
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
              className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--scenario-border)] bg-[var(--scenario-accent-soft)] text-[var(--scenario-accent-dark)] transition-all duration-200 shadow-sm dark:bg-[var(--scenario-accent-soft-dark)] dark:text-[var(--scenario-secondary)]"
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
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-[var(--scenario-accent)]"
                      : "bg-[var(--scenario-accent-soft)] dark:bg-[var(--scenario-accent-soft-dark)]"
                  }`}
                  style={{
                    width: isActive ? "1.5rem" : "0.5rem",
                    ...getScenarioThemeVars(scenarioTheme),
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
