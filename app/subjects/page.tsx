import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export const metadata = { title: "المواد الدراسية" };

export default async function SubjectsPage() {
  const session = await auth();
  const subjects = await prisma.subject.findMany({
    include: { _count: { select: { teacherSubjects: true } } },
    orderBy: { nameAr: "asc" },
  });

  const icons: Record<string, string> = {
    math: "📐", physics: "⚡", chemistry: "🧪", biology: "🧬",
    arabic: "📖", english: "🌍", french: "🗼", history: "🏛️",
    geography: "🗺️", science: "🔬", "islamic-studies": "☪️",
    "computer-science": "💻", philosophy: "🤔", economics: "📊",
    accounting: "🧾",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session?.user} />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">📚 المواد الدراسية</h1>
        <p className="text-gray-500 mb-8">اختر المادة واعثر على أفضل المعلمين المتخصصين</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {subjects.map((s) => (
            <Link key={s.id} href={`/teachers?subjectId=${s.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 card-hover shadow-sm text-center">
                <div className="text-4xl mb-3">{icons[s.slug] || "📝"}</div>
                <h3 className="font-bold text-gray-900 text-sm">{s.nameAr}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {s._count.teacherSubjects} معلم
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
