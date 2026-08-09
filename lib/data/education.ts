import { prisma } from "@/lib/prisma";

export const DEFAULT_EDUCATION_LEVELS = [
  { slug: "primary", name: "Primary", nameAr: "المرحلة الابتدائية", order: 1 },
  { slug: "preparatory", name: "Preparatory", nameAr: "المرحلة الإعدادية", order: 2 },
  { slug: "secondary", name: "Secondary", nameAr: "المرحلة الثانوية", order: 3 },
  { slug: "university", name: "University", nameAr: "المرحلة الجامعية", order: 4 },
];

export const DEFAULT_GRADES = [
  // Primary
  { slug: "grade-1", name: "Grade 1", nameAr: "الصف الأول الابتدائي", order: 1, levelSlug: "primary" },
  { slug: "grade-2", name: "Grade 2", nameAr: "الصف الثاني الابتدائي", order: 2, levelSlug: "primary" },
  { slug: "grade-3", name: "Grade 3", nameAr: "الصف الثالث الابتدائي", order: 3, levelSlug: "primary" },
  { slug: "grade-4", name: "Grade 4", nameAr: "الصف الرابع الابتدائي", order: 4, levelSlug: "primary" },
  { slug: "grade-5", name: "Grade 5", nameAr: "الصف الخامس الابتدائي", order: 5, levelSlug: "primary" },
  { slug: "grade-6", name: "Grade 6", nameAr: "الصف السادس الابتدائي", order: 6, levelSlug: "primary" },

  // Preparatory
  { slug: "grade-7", name: "Grade 7", nameAr: "الصف الأول الإعدادي", order: 1, levelSlug: "preparatory" },
  { slug: "grade-8", name: "Grade 8", nameAr: "الصف الثاني الإعدادي", order: 2, levelSlug: "preparatory" },
  { slug: "grade-9", name: "Grade 9", nameAr: "الصف الثالث الإعدادي", order: 3, levelSlug: "preparatory" },

  // Secondary
  { slug: "grade-10", name: "Grade 10", nameAr: "الصف الأول الثانوي", order: 1, levelSlug: "secondary" },
  { slug: "grade-11", name: "Grade 11", nameAr: "الصف الثاني الثانوي", order: 2, levelSlug: "secondary" },
  { slug: "grade-12", name: "Grade 12", nameAr: "الصف الثالث الثانوي (الثانوية العامة)", order: 3, levelSlug: "secondary" },

  // University
  { slug: "grade-uni-1", name: "University Year 1", nameAr: "الفرقة الأولى الجامعية", order: 1, levelSlug: "university" },
  { slug: "grade-uni-2", name: "University Year 2", nameAr: "الفرقة الثانية الجامعية", order: 2, levelSlug: "university" },
  { slug: "grade-uni-3", name: "University Year 3", nameAr: "الفرقة الثالثة الجامعية", order: 3, levelSlug: "university" },
  { slug: "grade-uni-4", name: "University Year 4", nameAr: "الفرقة الرابعة الجامعية", order: 4, levelSlug: "university" },
];

export async function getOrSeedEducationLevels() {
  try {
    let levels = await prisma.educationLevel.findMany({ orderBy: { order: "asc" } });
    if (levels.length < 4) {
      for (const level of DEFAULT_EDUCATION_LEVELS) {
        await prisma.educationLevel.upsert({
          where: { slug: level.slug },
          update: { nameAr: level.nameAr, order: level.order },
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
    // Ensure education levels exist first
    const levels = await getOrSeedEducationLevels();
    const levelMap: Record<string, string> = {};
    levels.forEach(l => { levelMap[l.slug] = l.id; });

    let grades = await prisma.grade.findMany({ orderBy: { order: "asc" } });
    if (grades.length < 12) {
      for (const g of DEFAULT_GRADES) {
        const levelId = levelMap[g.levelSlug];
        if (!levelId) continue;
        await prisma.grade.upsert({
          where: { slug: g.slug },
          update: { nameAr: g.nameAr, order: g.order, educationLevelId: levelId },
          create: {
            slug: g.slug,
            name: g.name,
            nameAr: g.nameAr,
            order: g.order,
            educationLevelId: levelId,
          },
        });
      }
      grades = await prisma.grade.findMany({ orderBy: { order: "asc" } });
    }
    return grades;
  } catch (error) {
    console.error("[getOrSeedGrades] Error:", error);
    return [];
  }
}
