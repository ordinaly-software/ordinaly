import { buildBreadcrumbSchema, type BreadcrumbItem } from "@/lib/metadata";

export default function BreadcrumbSchema({
  items,
  locale,
}: {
  items: BreadcrumbItem[];
  locale?: string;
}) {
  const schema = buildBreadcrumbSchema(items, locale);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
