"use client";

if (typeof window !== "undefined") {
  import("@/styles/highlight");
}
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAutolinkUrls } from "@/lib/remark-autolink-urls";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  children: string;
  color?: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, color, className }) => {
  // Default color fallback
  const serviceColor = color || "var(--swatch--clay)";

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkAutolinkUrls]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          table: ({children}) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-[--color-border-subtle] dark:border-white/10 bg-ivory-light dark:bg-slate-medium rounded-lg shadow-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({children}) => (
            <thead className="bg-oat dark:bg-[var(--swatch--slate-medium)]">
              {children}
            </thead>
          ),
          tbody: ({children}) => (
            <tbody className="divide-y divide-[--color-border-subtle] dark:divide-white/10">
              {children}
            </tbody>
          ),
          tr: ({children}) => (
            <tr className="hover:bg-oat dark:hover:bg-[var(--swatch--slate-medium)]/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({children}) => (
            <th className="border border-[--color-border-subtle] dark:border-white/10 px-4 py-3 text-left text-sm font-semibold text-slate-dark dark:text-ivory-light bg-oat dark:bg-[var(--swatch--slate-medium)]">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="border border-[--color-border-subtle] dark:border-white/10 px-4 py-3 text-sm text-slate-medium dark:text-cloud-medium">
              {children}
            </td>
          ),
          h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-slate-dark dark:text-ivory-light">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-bold mb-3 text-slate-dark dark:text-ivory-light mt-6">{children}</h2>,
          h3: ({children}) => <h3 className="text-base font-bold mb-2 text-slate-dark dark:text-ivory-light mt-4">{children}</h3>,
          h4: ({children}) => <h4 className="text-sm font-semibold mb-2 text-slate-dark dark:text-ivory-light mt-3">{children}</h4>,
          p: ({children}) => <p className="mb-4 text-slate-medium dark:text-cloud-medium leading-relaxed">{children}</p>,
          br: () => <br className="mb-2" />,
          ul: ({children}) => <ul className="list-disc list-inside mb-4 text-slate-medium dark:text-cloud-medium space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-slate-medium dark:text-cloud-medium space-y-1">{children}</ol>,
          li: ({children}) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({children}) => (
            <blockquote
              className="border-l-4 pl-4 py-2 mb-4 italic bg-oat dark:bg-[var(--swatch--slate-medium)]/50 rounded-r-lg"
              style={{ borderLeftColor: serviceColor }}
            >
              <div className="text-slate-medium dark:text-cloud-medium">
                {children}
              </div>
            </blockquote>
          ),
          code: ({children, className}) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-oat dark:bg-slate-medium text-slate-dark dark:text-ivory-light px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <div className="mb-4">
                <pre className="bg-oat dark:bg-slate-dark p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono text-slate-dark dark:text-ivory-light">
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          pre: ({children}) => (
            <div className="mb-4">
              <pre className="bg-oat dark:bg-slate-dark p-4 rounded-lg overflow-x-auto">
                {children}
              </pre>
            </div>
          ),
          strong: ({children}) => <strong className="font-bold text-slate-dark dark:text-ivory-light">{children}</strong>,
          em: ({children}) => <em className="italic text-slate-medium dark:text-cloud-medium">{children}</em>,
          a: ({children, href}) => {
            if (!href) {
              return <>{children}</>;
            }
            return (
              <a
                href={href}
                className="font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 transition-colors break-words"
                style={{ color: serviceColor }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          hr: () => <hr className="border-[--color-border-subtle] dark:border-white/10 my-6" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
