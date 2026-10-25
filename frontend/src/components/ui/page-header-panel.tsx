import type { ReactNode } from "react";

interface PageHeaderPanelProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeaderPanel({ title, subtitle, children, className = "" }: PageHeaderPanelProps) {
  return (
    <div
      className={`rounded-3xl border border-[--color-border-subtle] bg-white/75 px-6 py-6 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.04] sm:px-10 ${className}`}
    >
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-light dark:text-cloud-medium">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default PageHeaderPanel;
