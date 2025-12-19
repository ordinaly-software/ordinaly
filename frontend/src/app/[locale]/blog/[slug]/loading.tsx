export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1A1924] text-gray-800 dark:text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-64 rounded-3xl bg-gray-200/80 dark:bg-gray-800/80 animate-pulse" />
          <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-11/12 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-10/12 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-9/12 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
