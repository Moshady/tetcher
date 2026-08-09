export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SuggestTeacherForm from "@/components/teacher/SuggestTeacherForm";

export const metadata = { title: "اقترح معلماً" };

export default async function SuggestTeacherPage() {
  const session = await getSession();
  const [subjects, educationLevels, grades, governorates] = await Promise.all([
    prisma.subject.findMany({ orderBy: { nameAr: "asc" } }),
    prisma.educationLevel.findMany({ orderBy: { order: "asc" } }),
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
    prisma.governorate.findMany({ orderBy: { nameAr: "asc" } }),
  ]);

  return (
    <SuggestTeacherForm
      subjects={subjects}
      educationLevels={educationLevels}
      grades={grades}
      governorates={governorates}
      user={session?.user || null}
    />
  );
}
