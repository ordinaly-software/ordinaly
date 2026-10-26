const bar = "rounded bg-slate-200 dark:bg-slate-700";

const FieldSkeleton = ({ tall = false }: { tall?: boolean }) => (
  <div>
    <div className={`${bar} mb-2 h-3 w-24`} />
    <div className={`${bar} ${tall ? "h-[120px]" : "h-10"} w-full rounded-md`} />
  </div>
);

// Mirrors the layout of ContactForm so the page doesn't jump when the form mounts.
export default function ContactFormSkeleton({ id }: { id?: string }) {
  return (
    <section
      id={id}
      aria-hidden="true"
      className="relative overflow-hidden bg-gradient-to-br from-[--swatch--slate-dark] via-[#1e1a2e] to-[--swatch--slate-dark] py-16 md:py-24 px-4 sm:px-6"
    >
      <div className="relative max-w-6xl mx-auto">
        <div className="animate-pulse rounded-2xl border border-white/20 bg-white p-6 shadow-2xl shadow-black/40 dark:border-white/10 dark:bg-[--swatch--slate-medium] md:p-8">
          <div className="flex flex-col items-center space-y-3">
            <div className={`${bar} h-4 w-32`} />
            <div className={`${bar} h-8 w-72 max-w-full`} />
            <div className={`${bar} h-4 w-96 max-w-full`} />
          </div>
          <div className="mt-8 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton tall />
            <div className="space-y-2">
              <div className={`${bar} h-3 w-full`} />
              <div className={`${bar} h-3 w-5/6`} />
            </div>
            <div className="flex justify-center">
              <div className={`${bar} h-12 w-full rounded-lg md:w-48`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
