export default function ServiceDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--swatch--ivory-light)] dark:bg-[var(--swatch--slate-dark)] text-gray-800 dark:text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="h-72 rounded-3xl bg-oat/80 dark:bg-[var(--swatch--slate-medium)]/80 animate-pulse" />
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <div className="h-10 w-2/3 rounded bg-oat dark:bg-[var(--swatch--slate-medium)] animate-pulse" />
              <div className="h-4 w-full rounded bg-oat dark:bg-[var(--swatch--slate-medium)] animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-oat dark:bg-[var(--swatch--slate-medium)] animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-oat dark:bg-[var(--swatch--slate-medium)] animate-pulse" />
            </div>
            <div className="h-64 rounded-2xl bg-oat/80 dark:bg-[var(--swatch--slate-medium)]/80 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
