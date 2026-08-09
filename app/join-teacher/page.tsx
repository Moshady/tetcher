export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SuggestTeacherForm from "@/components/teacher/SuggestTeacherForm";
import { getOrSeedGovernorates } from "@/lib/data/governorates";
import { getOrSeedEducationLevels } from "@/lib/data/education";

export const metadata = { title: "تسجيل معلم جديد | تيتشر" };

export default async function JoinTeacherPage() {
  const session = await getSession();
  const [subjects, educationLevels, grades, governorates] = await Promise.all([
    prisma.subject.findMany({ orderBy: { nameAr: "asc" } }),
    getOrSeedEducationLevels(),
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
    getOrSeedGovernorates(),
  ]);

  return (
    <SuggestTeacherForm
      subjects={subjects}
      educationLevels={educationLevels}
      grades={grades}
      governorates={governorates}
      user={session?.user || null}
      isTeacherSelfRegister={true}
    />
  );
}
