export default function FormationLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="h-56 rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-12 rounded-xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-80 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
