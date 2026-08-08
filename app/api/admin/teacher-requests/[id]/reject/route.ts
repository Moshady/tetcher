import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAuditAction } from "@/lib/utils/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await requireAdmin();
    const { reason, adminNote } = await req.json();

    if (!reason) return NextResponse.json({ error: "سبب الرفض مطلوب" }, { status: 400 });

    await prisma.teacherRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        adminNote: adminNote || null,
        reviewedByAdminId: session.user.id,
        reviewedAt: new Date(),
      },
    });

    await logAuditAction(session.user.id, "REQUEST_REJECTED", "TeacherRequest", id, { reason });
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
