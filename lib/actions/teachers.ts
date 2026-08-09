"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

export interface ImportTeacherItem {
  name?: string;
  nameAr?: string;
  slug?: string;
  image?: string;
  specialization?: string;
  bio?: string;
  yearsOfExperience?: number | string;
  teachingType?: "ONLINE" | "OFFLINE" | "BOTH";
  verified?: boolean;
  featured?: boolean;
  phone?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  subjects?: string[]; // Subject names, slugs, or IDs
  levels?: string[];   // EducationLevel names, slugs, or IDs
  grades?: string[];   // Grade names, slugs, or IDs
  locations?: string[];
}

export async function importTeachersJsonAction(rawJsonText: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  if (!rawJsonText || !rawJsonText.trim()) {
    return { error: "ملف الـ JSON فارغ" };
  }

  let parsedData: any;
  try {
    parsedData = JSON.parse(rawJsonText);
  } catch (err: any) {
    return { error: "صيغة ملف JSON غير صحيحة. تأكد من أن الملف مكتوب بشكل صحيح." };
  }

  let teacherItems: ImportTeacherItem[] = [];
  if (Array.isArray(parsedData)) {
    teacherItems = parsedData;
  } else if (parsedData && Array.isArray(parsedData.teachers)) {
    teacherItems = parsedData.teachers;
  } else if (typeof parsedData === "object" && parsedData !== null) {
    teacherItems = [parsedData];
  }

  if (teacherItems.length === 0) {
    return { error: "لم يتم العثور على أي معلمين داخل ملف JSON" };
  }

  // Pre-fetch all subjects, levels, grades for fast matching
  const [allSubjects, allLevels, allGrades] = await Promise.all([
    prisma.subject.findMany(),
    prisma.educationLevel.findMany(),
    prisma.grade.findMany(),
  ]);

  let successCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < teacherItems.length; i++) {
    const item = teacherItems[i];
    const nameAr = item.nameAr?.trim() || item.name?.trim();

    if (!nameAr) {
      errors.push(`المعلم رقم ${i + 1}: تم التجاوز بسبب عدم وجود اسم المعلم (nameAr)`);
      continue;
    }

    try {
      // Create unique slug
      let baseSlug = item.slug?.trim() || slugify(nameAr, { lower: true, strict: true }) || `teacher-${Date.now()}`;
      let finalSlug = baseSlug;
      let counter = 1;

      while (await prisma.teacher.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Teaching Type validation
      let typeVal: "ONLINE" | "OFFLINE" | "BOTH" = "BOTH";
      if (item.teachingType && ["ONLINE", "OFFLINE", "BOTH"].includes(item.teachingType.toUpperCase())) {
        typeVal = item.teachingType.toUpperCase() as "ONLINE" | "OFFLINE" | "BOTH";
      }

      // 1. Create Teacher
      const teacher = await prisma.teacher.create({
        data: {
          slug: finalSlug,
          name: nameAr,
          nameAr: nameAr,
          image: item.image?.trim() || null,
          specialization: item.specialization?.trim() || null,
          bio: item.bio?.trim() || null,
          yearsOfExperience: item.yearsOfExperience ? Number(item.yearsOfExperience) || null : null,
          teachingType: typeVal,
          verified: Boolean(item.verified),
          featured: Boolean(item.featured),
          active: true,
        },
      });

      // 2. Create TeacherProfile (Contact Info & Socials)
      const telegram = item.telegramUrl?.trim();
      await prisma.teacherProfile.create({
        data: {
          teacherId: teacher.id,
          phone: item.phone?.trim() || null,
          facebookUrl: item.facebookUrl?.trim() || null,
          youtubeUrl: item.youtubeUrl?.trim() || null,
          website: item.websiteUrl?.trim() || null,
          socialLinks: telegram ? JSON.stringify({ telegram }) : null,
        },
      });

      // 3. Match and link Subjects
      if (Array.isArray(item.subjects) && item.subjects.length > 0) {
        for (const subStr of item.subjects) {
          const matchedSub = allSubjects.find(
            (s) =>
              s.id === subStr ||
              s.slug === subStr ||
              s.nameAr.toLowerCase() === subStr.toLowerCase() ||
              s.name.toLowerCase() === subStr.toLowerCase()
          );
          if (matchedSub) {
            await prisma.teacherSubject.create({
              data: { teacherId: teacher.id, subjectId: matchedSub.id },
            }).catch(() => {});
          }
        }
      }

      // 4. Match and link Education Levels
      if (Array.isArray(item.levels) && item.levels.length > 0) {
        for (const lvlStr of item.levels) {
          const matchedLvl = allLevels.find(
            (l) =>
              l.id === lvlStr ||
              l.slug === lvlStr ||
              l.nameAr.toLowerCase() === lvlStr.toLowerCase() ||
              l.name.toLowerCase() === lvlStr.toLowerCase()
          );
          if (matchedLvl) {
            await prisma.teacherEducationLevel.create({
              data: { teacherId: teacher.id, educationLevelId: matchedLvl.id },
            }).catch(() => {});
          }
        }
      }

      // 5. Match and link Grades
      if (Array.isArray(item.grades) && item.grades.length > 0) {
        for (const grdStr of item.grades) {
          const matchedGrd = allGrades.find(
            (g) =>
              g.id === grdStr ||
              g.slug === grdStr ||
              g.nameAr.toLowerCase() === grdStr.toLowerCase() ||
              g.name.toLowerCase() === grdStr.toLowerCase()
          );
          if (matchedGrd) {
            await prisma.teacherGrade.create({
              data: { teacherId: teacher.id, gradeId: matchedGrd.id },
            }).catch(() => {});
          }
        }
      }

      // 6. Link Teaching Locations
      if (Array.isArray(item.locations) && item.locations.length > 0) {
        for (const locLabel of item.locations) {
          if (typeof locLabel === "string" && locLabel.trim()) {
            await prisma.teachingLocation.create({
              data: { teacherId: teacher.id, label: locLabel.trim() },
            }).catch(() => {});
          }
        }
      }

      successCount++;
    } catch (err: any) {
      console.error(`Error importing teacher #${i + 1}:`, err);
      errors.push(`المعلم "${nameAr}": ${err?.message || "فشلت عملية الإضافة"}`);
    }
  }

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");

  return {
    success: true,
    importedCount: successCount,
    totalCount: teacherItems.length,
    errors,
  };
}
