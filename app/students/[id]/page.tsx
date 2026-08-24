import { students } from "@/lib/mock-data";
import { StudentDetail } from "./student-detail";

export function generateStaticParams() {
  return students.map((s) => ({ id: s.id }));
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentDetail id={id} />;
}
