export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminTeachersTable from "@/components/admin/AdminTeachersTable";

export default async function AdminTeachersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  // Fetch teachers with full profile & relations
  const [teachers, subjects, educationLevels, grades, governorates] = await Promise.all([
    prisma.teacher.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        teacherSubjects: { include: { subject: true } },
        teacherEducationLevels: { include: { educationLevel: true } },
        teacherGrades: { include: { grade: true } },
        teachingLocations: true,
        _count: { select: { reviews: true } },
      },
    }),
    prisma.subject.findMany({ orderBy: { nameAr: "asc" }, select: { id: true, nameAr: true } }),
    prisma.educationLevel.findMany({ orderBy: { order: "asc" }, select: { id: true, nameAr: true } }),
    prisma.grade.findMany({ orderBy: { order: "asc" }, select: { id: true, nameAr: true, educationLevelId: true } }),
    prisma.governorate.findMany({ orderBy: { nameAr: "asc" }, select: { id: true, nameAr: true } }),
  ]);

  const formattedTeachers = teachers.map((t) => {
    let telegram = "";
    if (t.profile?.socialLinks) {
      try {
        const parsed = JSON.parse(t.profile.socialLinks);
        telegram = parsed.telegram || "";
      } catch {
        telegram = "";
      }
    }

    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      nameAr: t.nameAr || t.name,
      image: t.image,
      specialization: t.specialization || "",
      bio: t.bio || "",
      verified: t.verified,
      featured: t.featured,
      active: t.active,
      teachingType: t.teachingType,
      yearsOfExperience: t.yearsOfExperience,
      createdAt: t.createdAt.toISOString(),

      // Contact info
      phone: t.profile?.phone || "",
      youtubeUrl: t.profile?.youtubeUrl || "",
      facebookUrl: t.profile?.facebookUrl || "",
      telegramUrl: telegram,
      websiteUrl: t.profile?.website || "",

      // Relation IDs
      subjectIds: t.teacherSubjects.map((ts) => ts.subjectId),
      levelIds: t.teacherEducationLevels.map((el) => el.educationLevelId),
      gradeIds: t.teacherGrades.map((g) => g.gradeId),
      locations: t.teachingLocations.map((loc) => loc.label),

      // Relation Names for quick display
      subjects: t.teacherSubjects.map((ts) => ts.subject.nameAr),
      levels: t.teacherEducationLevels.map((el) => el.educationLevel.nameAr),
      grades: t.teacherGrades.map((g) => g.grade.nameAr),
      reviewsCount: t._count.reviews,
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
            <Link href="/admin" className="hover:underline">← العودة للوحة التحكم</Link>
          </div>
          <h1 className="text-3xl font-black text-gray-900">إدارة ودعم المعلمين ({teachers.length})</h1>
          <p className="text-xs text-gray-500 mt-1">عرض بروفايلات المعلمين، تعديل البيانات بالكامل، ومنح الشارات والتوثيق المعتمد</p>
        </div>
      </div>

      {/* Interactive Rich Table & Full Edit Modal */}
      <AdminTeachersTable
        initialTeachers={formattedTeachers}
        allSubjects={subjects}
        allEducationLevels={educationLevels}
        allGrades={grades}
        allGovernorates={governorates}
      />
    </div>
  );
}
