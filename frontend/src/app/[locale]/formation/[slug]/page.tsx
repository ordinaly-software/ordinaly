import FormationRoot from '@/components/formation/formation-root';

export default async function FormationSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Server component that renders the client FormationRoot with initialCourseSlug
  return <FormationRoot initialCourseSlug={slug} />;
}
