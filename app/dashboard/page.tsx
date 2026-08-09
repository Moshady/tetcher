export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "حسابي" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [myRequests, myReviews] = await Promise.all([
    prisma.teacherRequest.findMany({
      where: { submittedByUserId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.review.findMany({
      where: { userId: session.user.id },
      include: { teacher: { select: { slug: true, nameAr: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700", APPROVED: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700", NEEDS_INFORMATION: "bg-blue-50 text-blue-700",
    DUPLICATE: "bg-gray-50 text-gray-700",
  };
  const statusLabels: Record<string, string> = {
    PENDING: "قيد المراجعة", APPROVED: "مقبول", REJECTED: "مرفوض",
    NEEDS_INFORMATION: "يحتاج معلومات", DUPLICATE: "مكرر",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">مرحباً، {session.user.name} 👋</h1>
          <p className="text-gray-500 mt-1">إليك نظرة على نشاطك على منصة تيتشر</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/suggest-teacher"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 flex items-center gap-4 transition">
            <div className="text-3xl">🎓</div>
            <div>
              <div className="font-bold">اقترح معلماً</div>
              <div className="text-blue-100 text-sm">ساعد الطلاب الآخرين</div>
            </div>
          </Link>
          <Link href="/teachers"
            className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition">
            <div className="text-3xl">🔍</div>
            <div>
              <div className="font-bold text-gray-900">تصفح المعلمين</div>
              <div className="text-gray-500 text-sm">ابحث عن معلمك المثالي</div>
            </div>
          </Link>
        </div>

        {/* My Requests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">طلباتي لإضافة معلمين</h2>
            <span className="text-sm text-gray-400">{myRequests.length} طلب</span>
          </div>
          {myRequests.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>لم تقدّم أي طلبات بعد</p>
              <Link href="/suggest-teacher" className="text-blue-600 font-medium mt-2 inline-block hover:underline">اقترح معلماً الآن</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myRequests.map((req) => (
                <div key={req.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{req.teacherName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                    </div>
                    {req.status === "NEEDS_INFORMATION" && req.adminNote && (
                      <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-xs rounded-lg">
                        💬 {req.adminNote}
                      </div>
                    )}
                    {req.status === "REJECTED" && req.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded-lg">
                        ✕ سبب الرفض: {req.rejectionReason}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[req.status]}`}>
                    {statusLabels[req.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">تقييماتي</h2>
            <span className="text-sm text-gray-400">{myReviews.length} تقييم</span>
          </div>
          {myReviews.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">⭐</div>
              <p>لم تضف أي تقييمات بعد</p>
              <Link href="/teachers" className="text-blue-600 font-medium mt-2 inline-block hover:underline">تصفح المعلمين وقيّم</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myReviews.map((review) => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/teachers/${review.teacher.slug}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {review.teacher.nameAr || review.teacher.name}
                    </Link>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={`text-sm ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString("ar-EG")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
