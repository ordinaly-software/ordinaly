const cardCount = [1, 2, 3];

const HeroSkeleton = () => (
  <section className="px-4 py-16 sm:py-20 lg:py-24">
    <div className="mx-auto max-w-6xl space-y-8 lg:flex lg:items-center lg:justify-between lg:space-y-0">
      <div className="space-y-6 lg:max-w-2xl">
        <div className="h-4 w-40 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-4">
          <div className="h-12 w-5/6 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-12 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="h-10 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="h-10 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mt-8 h-72 w-full rounded-3xl bg-slate-200 dark:bg-slate-700 lg:mt-0 lg:w-[28rem]" />
    </div>
  </section>
);

const SectionTitleSkeleton = () => (
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="h-4 w-40 rounded-full bg-slate-200 dark:bg-slate-700" />
    <div className="mt-3 h-6 w-56 rounded-full bg-slate-200 dark:bg-slate-700" />
  </div>
);

const CardsSkeleton = () => (
  <div className="grid gap-6 px-4 pb-12 pt-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
    {cardCount.map((index) => (
      <div
        key={index}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-white/5"
      >
        <div className="h-3 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 space-y-2">
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-5/6 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-4 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    ))}
  </div>
);

const SectionSkeleton = () => (
  <section className="mx-auto my-6 w-full max-w-6xl animate-pulse rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/10 dark:bg-white/[0.04] dark:shadow-black/30">
    <div className="h-6 w-40 rounded-full bg-slate-200 dark:bg-slate-700 mb-6" />
    <div className="space-y-3">
      {[1, 2, 3].map((line) => (
        <div
          key={line}
          className="h-3 rounded-full bg-slate-200 dark:bg-slate-700"
          style={{ width: `${90 - line * 10}%` }}
        />
      ))}
      <div className="mt-6 flex flex-wrap gap-3">
        {[1, 2, 3].map((pill) => (
          <div key={pill} className="h-3 min-w-[5rem] flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  </section>
);

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white transition-colors duration-300">
      <HeroSkeleton />
      <div className="space-y-10">
        <div>
          <SectionTitleSkeleton />
          <CardsSkeleton />
        </div>
        <div>
          <SectionTitleSkeleton />
          <CardsSkeleton />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <SectionSkeleton key={index} />
        ))}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-4 rounded-3xl bg-white/70 p-10 shadow-xl shadow-slate-900/10 backdrop-blur dark:bg-white/[0.02] dark:shadow-black/30">
            <div className="h-4 w-48 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex flex-wrap gap-3">
              <span className="h-10 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
              <span className="h-10 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
