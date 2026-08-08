import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/server";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.teacherName = { contains: search };

    const [requests, total] = await Promise.all([
      prisma.teacherRequest.findMany({
        where,
        include: {
          submittedByUser: { select: { id: true, name: true, email: true } },
          reviewedByAdmin: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.teacherRequest.count({ where }),
    ]);

    return NextResponse.json({ requests, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
