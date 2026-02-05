import { notFound } from "next/navigation";

export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  await params;
  notFound();
}
