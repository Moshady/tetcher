import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminRequestActions from "@/components/admin/AdminRequestActions";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  NEEDS_INFORMATION: "bg-blue-50 text-blue-700",
  DUPLICATE: "bg-gray-100 text-gray-700",
};
const statusLabels: Record<string, string> = {
  PENDING: "قيد المراجعة", APPROVED: "مقبول", REJECTED: "مرفوض",
  NEEDS_INFORMATION: "يحتاج معلومات", DUPLICATE: "مكرر",
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const sp = await searchParams;
  const status = sp.status || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.teacherName = { contains: search };

  const [requests, total] = await Promise.all([
    prisma.teacherRequest.findMany({
      where,
      include: { submittedByUser: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.teacherRequest.count({ where }),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">طلبات المعلمين</h1>
          <p className="text-gray-500 text-sm mt-1">{total} طلب</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { label: "الكل", value: "" },
          { label: "قيد المراجعة", value: "PENDING" },
          { label: "مقبول", value: "APPROVED" },
          { label: "مرفوض", value: "REJECTED" },
          { label: "يحتاج معلومات", value: "NEEDS_INFORMATION" },
        ].map(({ label, value }) => (
          <Link
            key={value}
            href={`/admin/requests${value ? `?status=${value}` : ""}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              status === value ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-right">
              <tr>
                <th className="px-5 py-3 font-medium">المعلم</th>
                <th className="px-5 py-3 font-medium">المقدّم</th>
                <th className="px-5 py-3 font-medium">التدريس</th>
                <th className="px-5 py-3 font-medium">التاريخ</th>
                <th className="px-5 py-3 font-medium">الحالة</th>
                <th className="px-5 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">لا توجد طلبات</td></tr>
              ) : requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <Link href={`/admin/requests/${req.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {req.teacherName}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    <div>{req.submitterName}</div>
                    <div className="text-xs text-gray-400">{req.submitterEmail}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {req.teachingType === "ONLINE" ? "أونلاين" : req.teachingType === "OFFLINE" ? "حضوري" : "الاثنان"}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                      {statusLabels[req.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/requests/${req.id}`} className="text-xs text-blue-600 hover:underline font-medium">مراجعة</Link>
                      {req.status === "PENDING" && (
                        <AdminRequestActions requestId={req.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {Math.ceil(total / limit) > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
            <Link
              key={i + 1}
              href={`/admin/requests?${new URLSearchParams({ ...(status && { status }), page: String(i + 1) }).toString()}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
