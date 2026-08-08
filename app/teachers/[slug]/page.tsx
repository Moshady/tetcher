import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star, CheckCircle, MapPin, MonitorPlay, Home, RefreshCw,
  BookOpen, Award, Sparkles, Share2, MessageSquare, AlertCircle,
  GraduationCap, UserCheck, ShieldCheck, Phone, Globe, Youtube, Send
} from "lucide-react";
import ReviewSection from "@/components/review/ReviewSection";
import ShareButton from "@/components/teacher/ShareButton";
import type { Metadata } from "next";

// Custom SVG Icons for Youtube, Facebook, Telegram, WhatsApp to guarantee no icon missing issues
function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.752-.168.706-.427.943-.677.966-.545.051-.96-.358-1.488-.704-.826-.542-1.294-.878-2.096-1.407-.927-.611-.326-.947.202-1.496.138-.143 2.536-2.324 2.583-2.523.006-.025.011-.118-.044-.167-.056-.049-.138-.032-.198-.018-.085.019-1.442.917-4.07 2.695-.385.264-.733.393-1.044.386-.343-.008-.999-.194-1.488-.353-.601-.195-1.077-.298-1.036-.63.021-.173.26-.35.717-.53 2.809-1.223 4.683-2.03 5.621-2.421 2.673-1.112 3.23-1.306 3.593-1.312.08 0 .258.02.373.114.097.08.125.187.135.262.01.074.022.247.012.383z"/>
    </svg>
  );
}

async function getTeacher(slug: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { slug },
    include: {
      profile: true,
      teacherSubjects: { include: { subject: true } },
      teacherEducationLevels: { include: { educationLevel: true } },
      teacherGrades: { include: { grade: true } },
      teachingLocations: true,
      reviews: {
        where: { approved: true },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!teacher || !teacher.active) return null;

  const totalReviews = teacher.reviews.length;
  const avgRating = totalReviews > 0
    ? teacher.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / totalReviews
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: teacher.reviews.filter((r: { rating: number }) => r.rating === star).length,
  }));

  const qualifications = teacher.qualifications
    ? JSON.parse(teacher.qualifications) as string[]
    : [];

  let telegramUrl: string | null = null;
  if (teacher.profile?.socialLinks) {
    try {
      const parsed = JSON.parse(teacher.profile.socialLinks);
      telegramUrl = parsed.telegram || null;
    } catch {
      telegramUrl = null;
    }
  }

  return {
    id: teacher.id,
    slug: teacher.slug,
    name: teacher.nameAr || teacher.name,
    specialization: teacher.specialization,
    bio: teacher.bio,
    image: teacher.image,
    verified: teacher.verified,
    featured: teacher.featured,
    teachingType: teacher.teachingType,
    yearsOfExperience: teacher.yearsOfExperience,
    qualifications,

    // Contact & Social Links
    phone: teacher.profile?.phone || null,
    youtubeUrl: teacher.profile?.youtubeUrl || null,
    facebookUrl: teacher.profile?.facebookUrl || null,
    telegramUrl: telegramUrl,
    websiteUrl: teacher.profile?.website || null,

    avgRating,
    reviewCount: totalReviews,
    ratingDistribution: distribution,
    subjects: teacher.teacherSubjects.map((ts: { subject: { id: string; nameAr: string; slug: string } }) => ({
      id: ts.subject.id,
      name: ts.subject.nameAr,
      slug: ts.subject.slug,
    })),
    educationLevels: teacher.teacherEducationLevels.map((el: { educationLevel: { id: string; nameAr: string } }) => ({
      id: el.educationLevel.id,
      name: el.educationLevel.nameAr,
    })),
    grades: teacher.teacherGrades.map((g: { grade: { id: string; nameAr: string } }) => ({
      id: g.grade.id,
      name: g.grade.nameAr,
    })),
    locations: teacher.teachingLocations.map((loc: { label: string }) => loc.label),
    reviews: teacher.reviews.map((r: { id: string; rating: number; comment: string | null; verifiedStudent: boolean; createdAt: Date; user: { id: string; name: string | null; avatar: string | null } }) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      verified: r.verifiedStudent,
      createdAt: r.createdAt.toISOString(),
      user: { id: r.user.id, name: r.user.name, avatar: r.user.avatar ?? undefined },
    })),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacher(slug);
  if (!teacher) return { title: "معلم غير موجود" };
  return {
    title: `${teacher.name} – معلم ${teacher.subjects[0]?.name || ""}`,
    description: teacher.bio?.slice(0, 160) || `ملف المعلم ${teacher.name} على منصة تيتشر`,
    openGraph: {
      title: `${teacher.name} | تيتشر`,
      description: teacher.bio?.slice(0, 160),
      images: teacher.image ? [{ url: teacher.image }] : [],
    },
  };
}

const teachingTypeMap: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  ONLINE: { label: "أونلاين فقط", icon: <MonitorPlay size={15} />, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  OFFLINE: { label: "حضوري فقط", icon: <Home size={15} />, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  BOTH: { label: "أونلاين وحضوري", icon: <RefreshCw size={15} />, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const teacher = await getTeacher(slug);
  if (!teacher) notFound();

  const typeInfo = teachingTypeMap[teacher.teachingType] || teachingTypeMap.BOTH;

  const hasContactLinks =
    teacher.phone ||
    teacher.youtubeUrl ||
    teacher.facebookUrl ||
    teacher.telegramUrl ||
    teacher.websiteUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacher.name,
    description: teacher.bio,
    image: teacher.image,
    url: `${process.env.NEXTAUTH_URL}/teachers/${slug}`,
    aggregateRating: teacher.reviewCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: teacher.avgRating,
      reviewCount: teacher.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar user={session?.user} />

      {/* ─── Premium Header Cover Banner ─── */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden pb-16 pt-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300/80 mb-8">
            <Link href="/" className="hover:text-white transition">الرئيسية</Link>
            <span>/</span>
            <Link href="/teachers" className="hover:text-white transition">المعلمون</Link>
            <span>/</span>
            <span className="text-white font-medium truncate">{teacher.name}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl p-1 bg-gradient-to-tr from-blue-400 via-teal-300 to-indigo-400 shadow-2xl">
                {teacher.image ? (
                  <Image
                    src={teacher.image}
                    alt={teacher.name}
                    width={144}
                    height={144}
                    className="w-full h-full rounded-[22px] object-cover bg-slate-800"
                  />
                ) : (
                  <div className="w-full h-full rounded-[22px] bg-slate-800 flex items-center justify-center text-white text-5xl font-black">
                    {teacher.name.charAt(0)}
                  </div>
                )}
              </div>
              {teacher.verified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-slate-900 shadow-lg" title="معلم موثّق">
                  <CheckCircle size={20} />
                </div>
              )}
            </div>

            {/* Info Summary */}
            <div className="flex-1 text-center md:text-right space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{teacher.name}</h1>
                {teacher.verified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                    <ShieldCheck size={14} /> معلم موثّق
                  </span>
                )}
                {teacher.featured && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-400/30 text-xs font-semibold px-3 py-1 rounded-full">
                    <Sparkles size={14} /> مميز
                  </span>
                )}
              </div>

              {teacher.specialization && (
                <p className="text-blue-200 text-base font-medium">{teacher.specialization}</p>
              )}

              {/* Subjects badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                {teacher.subjects.map((s) => (
                  <span key={s.id} className="bg-white/10 backdrop-blur-md text-white border border-white/15 text-xs px-3 py-1 rounded-full font-medium">
                    {s.name}
                  </span>
                ))}
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${typeInfo.bg} ${typeInfo.color}`}>
                  {typeInfo.icon} {typeInfo.label}
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-center">
              <ShareButton teacherName={teacher.name} />
              {session && (
                <Link
                  href={`/suggest-teacher?editTeacherId=${teacher.id}`}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  ✏️ اقتراح تعديل
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content Container ─── */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16 relative z-20">
        {/* Quick Stat Cards Banner */}
        <div className={`grid gap-4 mb-8 ${teacher.locations.length > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Star size={24} className="fill-amber-400" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">
                {teacher.avgRating > 0 ? teacher.avgRating.toFixed(1) : "جديد"}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {teacher.reviewCount} تقييم
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Award size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">
                {teacher.yearsOfExperience ? `${teacher.yearsOfExperience} سنوات` : "غير حدد"}
              </div>
              <div className="text-xs text-slate-500 font-medium">الخبرة العملية</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">
                {teacher.subjects.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">المواد الدراسية</div>
            </div>
          </div>

          {teacher.locations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 truncate max-w-[120px]">
                  {teacher.locations[0]}
                </div>
                <div className="text-xs text-slate-500 font-medium">الموقع الرئيسي</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Main Column (Left/Wide) ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            {teacher.bio && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    👤
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">نبذة تعريفية</h2>
                </div>
                <p className="text-slate-700 leading-relaxed text-base whitespace-pre-line">
                  {teacher.bio}
                </p>
              </div>
            )}

            {/* Qualifications Card */}
            {teacher.qualifications && teacher.qualifications.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">المؤهلات والإنجازات</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teacher.qualifications.map((qual, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-800 text-sm font-medium">{qual}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teaching Details Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">المراحل والصفوف الدراسية</h2>
              </div>

              <div className="space-y-6">
                {/* Education Levels */}
                {teacher.educationLevels.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">المراحل التعليمية</h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.educationLevels.map((lvl) => (
                        <span key={lvl.id} className="bg-purple-50 text-purple-700 border border-purple-200/60 text-sm font-semibold px-4 py-2 rounded-xl">
                          {lvl.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grades */}
                {teacher.grades.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">الصفوف الدراسية</h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.grades.map((grd) => (
                        <span key={grd.id} className="bg-slate-50 text-slate-700 border border-slate-200/70 text-xs font-medium px-3 py-1.5 rounded-lg">
                          {grd.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Teaching Locations Card */}
            {teacher.locations.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">أماكن ومحافطات التدريس</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teacher.locations.map((loc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-slate-800 text-sm font-medium">{loc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Component */}
            <ReviewSection
              teacher={teacher}
              currentUserId={session?.user?.id}
            />
          </div>

          {/* ─── Sidebar (Right/Narrow) ─── */}
          <div className="space-y-6">
            {/* Contact & Social Links Card */}
            {hasContactLinks && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
                  <span>📱</span> وسائل التواصل والروابط الرسمية
                </h3>

                <div className="space-y-2.5">
                  {/* Phone / WhatsApp */}
                  {teacher.phone && (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-xs truncate">
                        <PhoneIcon className="text-emerald-600 w-4 h-4 flex-shrink-0" />
                        <span dir="ltr">{teacher.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={`tel:${teacher.phone}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition"
                        >
                          اتصال
                        </a>
                        <a
                          href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[11px] font-bold transition"
                        >
                          واتساب
                        </a>
                      </div>
                    </div>
                  )}

                  {/* YouTube */}
                  {teacher.youtubeUrl && (
                    <a
                      href={teacher.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-2xl bg-red-50/60 hover:bg-red-50 border border-red-100 transition group"
                    >
                      <div className="flex items-center gap-2.5 text-red-900 font-bold text-xs">
                        <YoutubeIcon className="text-red-600 w-4 h-4 flex-shrink-0" />
                        <span>قناة اليوتيوب</span>
                      </div>
                      <span className="text-[11px] font-bold text-red-600 group-hover:underline">زيارة ←</span>
                    </a>
                  )}

                  {/* Facebook */}
                  {teacher.facebookUrl && (
                    <a
                      href={teacher.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 hover:bg-blue-50 border border-blue-100 transition group"
                    >
                      <div className="flex items-center gap-2.5 text-blue-900 font-bold text-xs">
                        <FacebookIcon className="text-blue-600 w-4 h-4 flex-shrink-0" />
                        <span>صفحة الفيسبوك</span>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 group-hover:underline">زيارة ←</span>
                    </a>
                  )}

                  {/* Telegram */}
                  {teacher.telegramUrl && (
                    <a
                      href={teacher.telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/60 hover:bg-sky-50 border border-sky-100 transition group"
                    >
                      <div className="flex items-center gap-2.5 text-sky-900 font-bold text-xs">
                        <TelegramIcon className="text-sky-500 w-4 h-4 flex-shrink-0" />
                        <span>قناة التليجرام</span>
                      </div>
                      <span className="text-[11px] font-bold text-sky-600 group-hover:underline">زيارة ←</span>
                    </a>
                  )}

                  {/* Website */}
                  {teacher.websiteUrl && (
                    <a
                      href={teacher.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 transition group"
                    >
                      <div className="flex items-center gap-2.5 text-indigo-900 font-bold text-xs">
                        <Globe size={16} className="text-indigo-600 flex-shrink-0" />
                        <span>الموقع الإلكتروني</span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 group-hover:underline">زيارة ←</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Contact & Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">معلومات التخصيص</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">نوع التدريس:</span>
                  <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${typeInfo.bg} ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </div>

                {teacher.yearsOfExperience && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">خبرة العمل:</span>
                    <span className="font-semibold text-slate-900">{teacher.yearsOfExperience} سنوات</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">حالة التوثيق:</span>
                  <span className={`font-semibold text-xs px-2.5 py-0.5 rounded-full ${teacher.verified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {teacher.verified ? "✓ موثّق من المنصة" : "غير موثق"}
                  </span>
                </div>
              </div>
            </div>

            {/* Guarantee / Verification Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-6 border border-blue-100 text-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <UserCheck className="text-blue-600" size={18} />
                <span>ضمان جودة البيانات</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                جميع بيانات المعلمين وتقييمات الطلاب تمر بمراجعة وتدقيق مستمر من فريق منصة تيتشر لضمان الدقة والمصداقية.
              </p>
            </div>

            {/* Suggest Edit Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center space-y-3">
              <div className="text-2xl">✏️</div>
              <h4 className="font-bold text-slate-900 text-sm">هل تلاحظ خطأً في البيانات؟</h4>
              <p className="text-xs text-slate-500">
                يمكنك اقتراح تعديل أو تحديث معلومات هذا المعلم ليتم مراجعتها.
              </p>
              <Link
                href={`/suggest-teacher?editTeacherId=${teacher.id}`}
                className="block w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
              >
                تقديم اقتراح تعديل
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
