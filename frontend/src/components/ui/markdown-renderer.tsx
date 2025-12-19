"use client";

if (typeof window !== "undefined") {
  import("@/styles/highlight");
}
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  children: string;
  color?: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, color, className }) => {
  // Default color fallback
  const serviceColor = color || "#1F8A0D";

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          table: ({children}) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({children}) => (
            <thead className="bg-gray-50 dark:bg-gray-700">
              {children}
            </thead>
          ),
          tbody: ({children}) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {children}
            </tbody>
          ),
          tr: ({children}) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({children}) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white mt-6">{children}</h2>,
          h3: ({children}) => <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white mt-4">{children}</h3>,
          h4: ({children}) => <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white mt-3">{children}</h4>,
          p: ({children}) => <p className="mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>,
          br: () => <br className="mb-2" />,
          ul: ({children}) => <ul className="list-disc list-inside mb-4 text-gray-600 dark:text-gray-400 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-gray-600 dark:text-gray-400 space-y-1">{children}</ol>,
          li: ({children}) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({children}) => (
            <blockquote 
              className="border-l-4 pl-4 py-2 mb-4 italic bg-gray-50 dark:bg-gray-800/50 rounded-r-lg"
              style={{ borderLeftColor: serviceColor }}
            >
              <div className="text-gray-700 dark:text-gray-300">
                {children}
              </div>
            </blockquote>
          ),
          code: ({children, className}) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <div className="mb-4">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          pre: ({children}) => (
            <div className="mb-4">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                {children}
              </pre>
            </div>
          ),
          strong: ({children}) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
          em: ({children}) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
          a: ({children, href}) => (
            <a 
              href={href} 
              className="hover:underline transition-colors" 
              style={{ color: serviceColor }}
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-gray-200 dark:border-gray-700 my-6" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
