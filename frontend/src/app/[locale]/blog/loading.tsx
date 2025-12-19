export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="h-12 w-1/2 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-2xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse">
                <div className="h-40 rounded-t-2xl bg-gray-300/80 dark:bg-gray-700/80" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 rounded bg-gray-300/80 dark:bg-gray-700/80" />
                  <div className="h-4 w-full rounded bg-gray-300/80 dark:bg-gray-700/80" />
                  <div className="h-4 w-5/6 rounded bg-gray-300/80 dark:bg-gray-700/80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
