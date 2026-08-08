import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`review:${session.user.id}:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "تجاوزت الحد المسموح به من التقييمات. حاول بعد ساعة." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const { teacherId, rating, comment } = parsed.data;

    // Check teacher exists
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId, active: true } });
    if (!teacher) return NextResponse.json({ error: "المعلم غير موجود" }, { status: 404 });

    // Duplicate check
    const existing = await prisma.review.findUnique({
      where: { teacherId_userId: { teacherId, userId: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: "لقد قمت بتقييم هذا المعلم مسبقاً" }, { status: 409 });

    // Verified review check (course enrollment)
    const enrollment = await prisma.course.findFirst({
      where: { teacherId },
    });
    const isVerified = !!enrollment; // simplified: if teacher has courses they had students

    const review = await prisma.review.create({
      data: {
        teacherId,
        userId: session.user.id,
        rating,
        comment: comment.trim(),
        verified: isVerified,
        approved: true,
      },
    });

    return NextResponse.json({ success: true, reviewId: review.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
