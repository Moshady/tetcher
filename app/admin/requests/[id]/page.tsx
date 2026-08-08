import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminRequestEditForm from "@/components/admin/AdminRequestEditForm";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const request = await prisma.teacherRequest.findUnique({
    where: { id },
    include: { submittedByUser: { select: { name: true, email: true } } },
  });
  if (!request) notFound();

  // Fetch reference data for editing / display
  const [subjects, educationLevels, grades, governorates] = await Promise.all([
    prisma.subject.findMany({ orderBy: { nameAr: "asc" }, select: { id: true, nameAr: true } }),
    prisma.educationLevel.findMany({ orderBy: { order: "asc" }, select: { id: true, nameAr: true } }),
    prisma.grade.findMany({ orderBy: { order: "asc" }, select: { id: true, nameAr: true, educationLevelId: true } }),
    prisma.governorate.findMany({ orderBy: { nameAr: "asc" }, select: { id: true, nameAr: true } }),
  ]);

  // Duplicate detection for warning banner
  const possibleDuplicates = await prisma.teacher.findMany({
    where: {
      OR: [
        { nameAr: { contains: request.teacherName.split(" ")[0] } },
        { name: { contains: request.teacherName.split(" ")[0] } },
      ],
    },
    include: { teacherSubjects: { include: { subject: true }, take: 3 } },
    take: 3,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/requests" className="text-blue-600 hover:underline text-sm font-bold">
          ← العودة لقائمة الطلبات
        </Link>
      </div>

      {possibleDuplicates.length > 0 && request.status === "PENDING" && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-orange-900 mb-2">⚠️ معلمون مشابهون محتملون في النظام:</p>
          <div className="flex flex-wrap gap-3">
            {possibleDuplicates.map((t) => (
              <Link
                key={t.id}
                href={`/teachers/${t.slug}`}
                target="_blank"
                className="text-xs font-semibold bg-white text-orange-800 px-3 py-1.5 rounded-xl border border-orange-200 hover:underline"
              >
                {t.nameAr || t.name} ({t.teacherSubjects.map(s => s.subject.nameAr).join(", ")})
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Render the full Display & Edit Form */}
      <AdminRequestEditForm
        request={JSON.parse(JSON.stringify(request))}
        allSubjects={subjects}
        allEducationLevels={educationLevels}
        allGrades={grades}
        allGovernorates={governorates}
      />
    </div>
  );
}
