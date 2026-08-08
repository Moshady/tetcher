import { NextResponse } from "next/server";
import { saveTeacherImage } from "@/lib/upload";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: "لم يتم اختيار ملف صورة" }, { status: 400 });
    }

    const imageUrl = await saveTeacherImage(imageFile);
    return NextResponse.json({ success: true, url: imageUrl }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "خطأ أثناء رفع الصورة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
