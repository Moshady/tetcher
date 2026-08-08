import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  GraduationCap, Users, ClipboardList, Star, Flag,
  BarChart2, ShieldCheck, Settings, BookOpen, MapPin, Home
} from "lucide-react";

async function getStats() {
  const [
    totalTeachers, verifiedTeachers, pendingRequests, approvedRequests,
    rejectedRequests, totalUsers, totalReviews, pendingReports, editRequests
  ] = await Promise.all([
    prisma.teacher.count({ where: { active: true } }),
    prisma.teacher.count({ where: { active: true, verified: true } }),
    prisma.teacherRequest.count({ where: { status: "PENDING" } }),
    prisma.teacherRequest.count({ where: { status: "APPROVED" } }),
    prisma.teacherRequest.count({ where: { status: "REJECTED" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.review.count({ where: { approved: true } }),
    prisma.reviewReport.count({ where: { status: "PENDING" } }),
    prisma.teacherEditRequest.count({ where: { status: "PENDING" } }),
  ]);
  return {
    totalTeachers, verifiedTeachers, pendingRequests, approvedRequests,
    rejectedRequests, totalUsers, totalReviews, pendingReports, editRequests
  };
}

async function getRecentRequests() {
  return prisma.teacherRequest.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { submittedByUser: { select: { name: true, email: true } } },
  });
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  NEEDS_INFORMATION: "bg-blue-50 text-blue-700",
  DUPLICATE: "bg-gray-50 text-gray-700",
};
const statusLabels: Record<string, string> = {
  PENDING: "قيد المراجعة", APPROVED: "مقبول", REJECTED: "مرفوض",
  NEEDS_INFORMATION: "يحتاج معلومات", DUPLICATE: "مكرر",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [stats, recentRequests] = await Promise.all([getStats(), getRecentRequests()]);

  const statCards = [
    { label: "إجمالي المعلمين", value: stats.totalTeachers, icon: <GraduationCap size={22} />, color: "bg-blue-500", link: "/admin/teachers" },
    { label: "معلمون موثّقون", value: stats.verifiedTeachers, icon: <ShieldCheck size={22} />, color: "bg-green-500", link: "/admin/teachers?verified=true" },
    { label: "طلبات معلّقة", value: stats.pendingRequests, icon: <ClipboardList size={22} />, color: "bg-amber-500", link: "/admin/requests" },
    { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: <Users size={22} />, color: "bg-purple-500", link: "/admin/users" },
    { label: "إجمالي التقييمات", value: stats.totalReviews, icon: <Star size={22} />, color: "bg-yellow-500", link: "/admin/reviews" },
    { label: "بلاغات معلّقة", value: stats.pendingReports, icon: <Flag size={22} />, color: "bg-red-500", link: "/admin/reports" },
    { label: "طلبات تعديل", value: stats.editRequests, icon: <BarChart2 size={22} />, color: "bg-teal-500", link: "/admin/edit-requests" },
    { label: "طلبات مقبولة", value: stats.approvedRequests, icon: <ShieldCheck size={22} />, color: "bg-blue-400", link: "/admin/requests?status=APPROVED" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">أهلاً {session.user.name}، إليك نظرة عامة على المنصة</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.link}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                {card.icon}
              </div>
              <div className="text-2xl font-black text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">آخر طلبات المعلمين</h2>
          <Link href="/admin/requests" className="text-blue-600 text-sm font-medium hover:underline">عرض الكل</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-right px-6 py-3 font-medium">المعلم</th>
                <th className="text-right px-6 py-3 font-medium">المقدّم</th>
                <th className="text-right px-6 py-3 font-medium">التاريخ</th>
                <th className="text-right px-6 py-3 font-medium">الحالة</th>
                <th className="text-right px-6 py-3 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRequests.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">لا توجد طلبات</td></tr>
              ) : recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{req.teacherName}</td>
                  <td className="px-6 py-4 text-gray-500">{req.submitterName}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                      {statusLabels[req.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/requests/${req.id}`} className="text-blue-600 hover:underline">مراجعة</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
