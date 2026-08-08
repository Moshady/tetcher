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
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });

    await prisma.teacherRequest.update({
      where: { id },
      data: {
        status: "NEEDS_INFORMATION",
        adminNote: message,
        reviewedByAdminId: session.user.id,
        reviewedAt: new Date(),
      },
    });

    await logAuditAction(session.user.id, "REQUEST_NEEDS_INFO", "TeacherRequest", id, { message });
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
