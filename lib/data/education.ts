import { prisma } from "@/lib/prisma";

export const DEFAULT_EDUCATION_LEVELS = [
  { slug: "primary", name: "Primary", nameAr: "المرحلة الابتدائية", order: 1 },
  { slug: "preparatory", name: "Preparatory", nameAr: "المرحلة الإعدادية", order: 2 },
  { slug: "secondary", name: "Secondary", nameAr: "المرحلة الثانوية", order: 3 },
  { slug: "university", name: "University", nameAr: "المرحلة الجامعية", order: 4 },
];

export async function getOrSeedEducationLevels() {
  try {
    let levels = await prisma.educationLevel.findMany({ orderBy: { order: "asc" } });
    if (levels.length === 0) {
      for (const level of DEFAULT_EDUCATION_LEVELS) {
        await prisma.educationLevel.upsert({
          where: { slug: level.slug },
          update: {},
          create: level,
        });
      }
      levels = await prisma.educationLevel.findMany({ orderBy: { order: "asc" } });
    }
    return levels;
  } catch (error) {
    console.error("[getOrSeedEducationLevels] Error:", error);
    return DEFAULT_EDUCATION_LEVELS.map((l, idx) => ({ id: l.slug || String(idx), ...l, createdAt: new Date() }));
  }
}

export async function getOrSeedGrades() {
  try {
    let grades = await prisma.grade.findMany({ orderBy: { order: "asc" } });
    return grades;
  } catch (error) {
    console.error("[getOrSeedGrades] Error:", error);
    return [];
  }
}
