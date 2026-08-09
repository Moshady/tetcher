export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import {
  GraduationCap, Search, Star, CheckCircle, TrendingUp,
  Users, BookOpen, MapPin, ArrowLeft, Sparkles
} from "lucide-react";

async function getHomepageData() {
  const [featuredTeachers, topRatedTeachers, newestTeachers, subjects, stats] = await Promise.all([
    prisma.teacher.findMany({
      where: { active: true, featured: true },
      include: {
        teacherSubjects: { include: { subject: true }, take: 2 },
        teachingLocations: { take: 1 },
        reviews: { where: { approved: true }, select: { rating: true } },
      },
      take: 6,
    }),
    prisma.teacher.findMany({
      where: { active: true },
      include: {
        teacherSubjects: { include: { subject: true }, take: 2 },
        teachingLocations: { take: 1 },
        reviews: { where: { approved: true }, select: { rating: true } },
      },
      take: 8,
      orderBy: { reviews: { _count: "desc" } },
    }),
    prisma.teacher.findMany({
      where: { active: true },
      include: {
        teacherSubjects: { include: { subject: true }, take: 2 },
        teachingLocations: { take: 1 },
        reviews: { where: { approved: true }, select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.subject.findMany({ take: 12, orderBy: { name: "asc" } }),
    Promise.all([
      prisma.teacher.count({ where: { active: true } }),
      prisma.teacher.count({ where: { active: true, verified: true } }),
      prisma.review.count({ where: { approved: true } }),
      prisma.subject.count(),
    ]),
  ]);
  return { featuredTeachers, topRatedTeachers, newestTeachers, subjects, stats };
}

function getAvgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function TeacherCard({ teacher }: { teacher: ReturnType<typeof getHomepageData> extends Promise<infer T> ? T["featuredTeachers"][0] : never }) {
  const avgRating = getAvgRating(teacher.reviews);
  const subject = teacher.teacherSubjects[0]?.subject;
  const location = teacher.teachingLocations[0]?.label;

  return (
    <Link href={`/teachers/${teacher.slug}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 card-hover shadow-sm">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {teacher.image ? (
              <Image
                src={teacher.image}
                alt={teacher.nameAr || teacher.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl object-cover"
                unoptimized
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {(teacher.nameAr || teacher.name).charAt(0)}
                </span>
              </div>
            )}
            {teacher.verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle size={12} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{teacher.nameAr || teacher.name}</h3>
            {subject && (
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                {subject.nameAr}
              </span>
            )}
            {location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <MapPin size={11} />
                <span className="truncate">{location}</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">
                {avgRating > 0 ? avgRating.toFixed(1) : "جديد"}
              </span>
              {teacher.reviews.length > 0 && (
                <span className="text-xs text-gray-400">({teacher.reviews.length})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

const subjectIcons: Record<string, string> = {
  math: "📐", physics: "⚡", chemistry: "🧪", biology: "🧬",
  arabic: "📖", english: "🌍", french: "🗼", history: "🏛️",
  geography: "🗺️", science: "🔬", "islamic-studies": "☪️",
  "computer-science": "💻", philosophy: "🤔", economics: "📊",
  accounting: "🧾",
};

export default async function HomePage() {
  const session = await getSession();
  const { featuredTeachers, topRatedTeachers, newestTeachers, subjects, stats } = await getHomepageData();
  const [totalTeachers, verifiedTeachers, totalReviews, totalSubjects] = stats;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session?.user} />

      {/* ─── Hero ─── */}
      <section className="hero-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm">
            <Sparkles size={16} className="text-yellow-300" />
            <span>أكبر منصة لاكتشاف المعلمين في مصر</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4">
            ابحث عن المعلم<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-teal-300">
              المثالي لك
            </span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            ابحث عن معلمين مميزين حسب المادة والمرحلة الدراسية والموقع والتقييمات. وضّح ما تريد ودعنا نساعدك.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form action="/teachers" method="GET">
              <div className="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden p-1.5">
                <Search className="text-gray-400 mx-3 flex-shrink-0" size={20} />
                <input
                  name="search"
                  type="text"
                  placeholder="ابحث عن معلم، مادة، أو تخصص..."
                  className="flex-1 py-3 px-2 text-gray-800 outline-none text-right bg-transparent"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition flex-shrink-0"
                >
                  بحث
                </button>
              </div>
            </form>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { label: "أونلاين", href: "/teachers?teachingType=ONLINE" },
              { label: "وجهاً لوجه", href: "/teachers?teachingType=OFFLINE" },
              { label: "موثّقون", href: "/teachers?verified=true" },
              { label: "الثانوية العامة", href: "/teachers?educationLevel=secondary" },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-sm font-medium transition"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: <GraduationCap className="text-blue-500" size={28} />, value: `${totalTeachers}+`, label: "معلم مسجّل" },
              { icon: <CheckCircle className="text-green-500" size={28} />, value: `${verifiedTeachers}+`, label: "معلم موثّق" },
              { icon: <Star className="text-yellow-400" size={28} />, value: `${totalReviews}+`, label: "تقييم حقيقي" },
              { icon: <BookOpen className="text-purple-500" size={28} />, value: `${totalSubjects}+`, label: "مادة دراسية" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                {stat.icon}
                <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Teachers ─── */}
      {featuredTeachers.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">⭐ معلمون مميزون</h2>
                <p className="text-gray-500 text-sm mt-1">اختيارنا لأفضل المعلمين</p>
              </div>
              <Link href="/teachers?featured=true" className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:underline">
                عرض الكل <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTeachers.map((t) => (
                <TeacherCard key={t.id} teacher={t as never} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Top Rated ─── */}
      {topRatedTeachers.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">🏆 الأعلى تقييماً</h2>
                <p className="text-gray-500 text-sm mt-1">معلمون حصلوا على أعلى التقييمات من الطلاب</p>
              </div>
              <Link href="/teachers?sort=rating" className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:underline">
                عرض الكل <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topRatedTeachers.map((t) => (
                <TeacherCard key={t.id} teacher={t as never} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Subjects ─── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">📚 تصفح حسب المادة</h2>
              <p className="text-gray-500 text-sm mt-1">ابحث عن معلم متخصص في مادتك</p>
            </div>
            <Link href="/subjects" className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:underline">
              كل المواد <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/teachers?subjectSlug=${s.slug}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 text-center card-hover shadow-sm"
              >
                <div className="text-3xl mb-2">{subjectIcons[s.slug] || "📝"}</div>
                <div className="text-xs font-semibold text-gray-700 line-clamp-2">{s.nameAr}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Newest Teachers ─── */}
      {newestTeachers.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">🆕 أحدث المعلمين</h2>
                <p className="text-gray-500 text-sm mt-1">معلمون انضموا حديثاً للمنصة</p>
              </div>
              <Link href="/teachers?sort=newest" className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:underline">
                عرض الكل <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newestTeachers.map((t) => (
                <TeacherCard key={t.id} teacher={t as never} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── How It Works ─── */}
      <section className="py-12 px-4 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">كيف يعمل تيتشر؟</h2>
          <p className="text-gray-500 mb-10">4 خطوات بسيطة للعثور على المعلم المثالي</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Search size={28} className="text-blue-500" />, step: "1", title: "ابحث", desc: "ابحث بالاسم أو المادة أو المنطقة" },
              { icon: <Users size={28} className="text-teal-500" />, step: "2", title: "تصفّح", desc: "قارن بروفيلات المعلمين والمعلومات" },
              { icon: <Star size={28} className="text-yellow-500" />, step: "3", title: "اقرأ التقييمات", desc: "تعرّف على تجارب الطلاب الآخرين" },
              { icon: <TrendingUp size={28} className="text-green-500" />, step: "4", title: "اختر واتواصل", desc: "تقدر تقترح اسم معلمك الجديد" },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  {item.icon}
                </div>
                <div className="text-xs text-gray-400 font-medium mb-1">الخطوة {item.step}</div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 px-4 hero-gradient text-white text-center">
        <h2 className="text-3xl font-black mb-3">تعرف معلماً رائعاً؟</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          ساعد الطلاب الآخرين باقتراح معلم متميز. سيراجع فريقنا الطلب ويضيف المعلم للمنصة.
        </p>
        <Link
          href="/suggest-teacher"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition text-lg shadow-xl"
        >
          <GraduationCap size={22} />
          اقترح معلماً الآن
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="text-white" size={16} />
          </div>
          <span className="text-white font-bold text-lg">تيتشر</span>
        </div>
        <p>منصة اكتشاف المعلمين الأولى في مصر — جميع الحقوق محفوظة © 2024</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/teachers" className="hover:text-white transition">المعلمون</Link>
          <Link href="/subjects" className="hover:text-white transition">المواد</Link>
          <Link href="/suggest-teacher" className="hover:text-white transition">اقترح معلماً</Link>
        </div>
      </footer>
    </div>
  );
}
