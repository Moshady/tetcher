import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reportReviewSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });

    const body = await req.json();
    const parsed = reportReviewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });

    // Prevent duplicate reports
    const existing = await prisma.reviewReport.findUnique({
      where: { reviewId_reportedByUserId: { reviewId: id, reportedByUserId: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: "لقد أبلغت عن هذا التقييم مسبقاً" }, { status: 409 });

    await prisma.reviewReport.create({
      data: {
        reviewId: id,
        reportedByUserId: session.user.id,
        reason: parsed.data.reason,
        details: parsed.data.details || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/reviews/:id/report]", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
