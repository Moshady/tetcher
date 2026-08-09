"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

export async function createSubjectAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const nameAr = (formData.get("nameAr") as string)?.trim();
  const name = (formData.get("name") as string)?.trim() || nameAr;
  const icon = (formData.get("icon") as string)?.trim() || "📚";
  const description = (formData.get("description") as string)?.trim() || null;
  let customSlug = (formData.get("slug") as string)?.trim();

  if (!nameAr) {
    return { error: "اسم المادة بالعربية مطلوب" };
  }

  const slug = customSlug || slugify(name || nameAr, { lower: true, strict: true }) || `subject-${Date.now()}`;

  const existing = await prisma.subject.findUnique({ where: { slug } });
  if (existing) {
    return { error: "يوجد مادة تحمل نفس هذا المعرّف (slug)" };
  }

  try {
    await prisma.subject.create({
      data: {
        nameAr,
        name,
        slug,
        icon,
        description,
      },
    });

    revalidatePath("/admin/subjects");
    revalidatePath("/subjects");
    return { success: true };
  } catch (err: any) {
    console.error("Create Subject Error:", err);
    return { error: "حدث خطأ أثناء إضافة المادة" };
  }
}

export async function updateSubjectAction(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const id = formData.get("id") as string;
  const nameAr = (formData.get("nameAr") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const icon = (formData.get("icon") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!id || !nameAr) {
    return { error: "جميع الحقول المطلوبة يجب ملؤها" };
  }

  try {
    await prisma.subject.update({
      where: { id },
      data: {
        nameAr,
        name: name || nameAr,
        icon: icon || "📚",
        description,
      },
    });

    revalidatePath("/admin/subjects");
    revalidatePath("/subjects");
    return { success: true };
  } catch (err: any) {
    console.error("Update Subject Error:", err);
    return { error: "حدث خطأ أثناء تحديث المادة" };
  }
}

export async function deleteSubjectAction(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  if (!id) return { error: "معرّف المادة مفقود" };

  try {
    await prisma.subject.delete({
      where: { id },
    });

    revalidatePath("/admin/subjects");
    revalidatePath("/subjects");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Subject Error:", err);
    return { error: "حدث خطأ أثناء حذف المادة" };
  }
}
