export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SuggestTeacherForm from "@/components/teacher/SuggestTeacherForm";
import { getOrSeedGovernorates } from "@/lib/data/governorates";
import { getOrSeedEducationLevels, getOrSeedGrades } from "@/lib/data/education";

export const metadata = { title: "اقترح معلماً" };

export default async function SuggestTeacherPage() {
  const session = await getSession();
  const [subjects, educationLevels, grades, governorates] = await Promise.all([
    prisma.subject.findMany({ orderBy: { nameAr: "asc" } }),
    getOrSeedEducationLevels(),
    getOrSeedGrades(),
    getOrSeedGovernorates(),
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
