export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import AdminSubjectsTable from "@/components/admin/AdminSubjectsTable";

export const metadata = {
  title: "إدارة المواد الدراسية | لوحة الإدارة",
};

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: {
      _count: {
        select: {
          teacherSubjects: true,
        },
      },
    },
    orderBy: {
      nameAr: "asc",
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">📚 إدارة المواد الدراسية</h1>
        <p className="text-gray-500 text-sm mt-1">
          إضافة وتعديل وحذف المواد الدراسية المتاحة في المنصة ({subjects.length} مادة)
        </p>
      </div>

      <AdminSubjectsTable subjects={subjects} />
    </div>
  );
}
