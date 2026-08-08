import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
    const body = await req.json();

    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) {
      return NextResponse.json({ error: "المعلم غير موجود" }, { status: 404 });
    }

    const {
      nameAr,
      specialization,
      bio,
      yearsOfExperience,
      teachingType,
      image,
      verified,
      featured,
      active,
      phone,
      youtubeUrl,
      facebookUrl,
      telegramUrl,
      website,
      subjectIds,
      levelIds,
      gradeIds,
      teachingLocations,
    } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Teacher core record
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          name: nameAr || teacher.name,
          nameAr: nameAr ?? teacher.nameAr,
          specialization: specialization ?? teacher.specialization,
          bio: bio ?? teacher.bio,
          yearsOfExperience: yearsOfExperience !== undefined ? Number(yearsOfExperience) || null : teacher.yearsOfExperience,
          teachingType: teachingType ?? teacher.teachingType,
          image: image !== undefined ? image : teacher.image,
          verified: verified !== undefined ? Boolean(verified) : teacher.verified,
          featured: featured !== undefined ? Boolean(featured) : teacher.featured,
          active: active !== undefined ? Boolean(active) : teacher.active,
        },
      });

      // 2. Upsert Teacher Profile (Phone, Social Links, Website)
      await tx.teacherProfile.upsert({
        where: { teacherId: id },
        create: {
          teacherId: id,
          phone: phone || null,
          youtubeUrl: youtubeUrl || null,
          facebookUrl: facebookUrl || null,
          website: website || null,
          socialLinks: telegramUrl ? JSON.stringify({ telegram: telegramUrl }) : null,
        },
        update: {
          phone: phone !== undefined ? phone || null : undefined,
          youtubeUrl: youtubeUrl !== undefined ? youtubeUrl || null : undefined,
          facebookUrl: facebookUrl !== undefined ? facebookUrl || null : undefined,
          website: website !== undefined ? website || null : undefined,
          socialLinks: telegramUrl !== undefined ? (telegramUrl ? JSON.stringify({ telegram: telegramUrl }) : null) : undefined,
        },
      });

      // 3. Update Subjects if provided
      if (Array.isArray(subjectIds)) {
        await tx.teacherSubject.deleteMany({ where: { teacherId: id } });
        for (const subjectId of subjectIds) {
          await tx.teacherSubject.create({ data: { teacherId: id, subjectId } });
        }
      }

      // 4. Update Education Levels if provided
      if (Array.isArray(levelIds)) {
        await tx.teacherEducationLevel.deleteMany({ where: { teacherId: id } });
        for (const educationLevelId of levelIds) {
          await tx.teacherEducationLevel.create({ data: { teacherId: id, educationLevelId } });
        }
      }

      // 5. Update Grades if provided
      if (Array.isArray(gradeIds)) {
        await tx.teacherGrade.deleteMany({ where: { teacherId: id } });
        for (const gradeId of gradeIds) {
          await tx.teacherGrade.create({ data: { teacherId: id, gradeId } });
        }
      }

      // 6. Update Teaching Locations if provided
      if (Array.isArray(teachingLocations)) {
        await tx.teachingLocation.deleteMany({ where: { teacherId: id } });
        for (const locLabel of teachingLocations) {
          if (locLabel.trim()) {
            await tx.teachingLocation.create({
              data: { teacherId: id, label: locLabel.trim() },
            });
          }
        }
      }

      return updatedTeacher;
    });

    return NextResponse.json({ success: true, teacher: result });
  } catch (error) {
    console.error("[PUT /api/admin/teachers/:id]", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تعديل بيانات المعلم" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
    const body = await req.json();

    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) {
      return NextResponse.json({ error: "المعلم غير موجود" }, { status: 404 });
    }

    const { verified, active, featured } = body;

    const updated = await prisma.teacher.update({
      where: { id },
      data: {
        verified: verified !== undefined ? Boolean(verified) : teacher.verified,
        active: active !== undefined ? Boolean(active) : teacher.active,
        featured: featured !== undefined ? Boolean(featured) : teacher.featured,
      },
    });

    return NextResponse.json({ success: true, teacher: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/teachers/:id]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();

    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) {
      return NextResponse.json({ error: "المعلم غير موجود" }, { status: 404 });
    }

    await prisma.teacher.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/teachers/:id]", error);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف المعلم" }, { status: 500 });
  }
}
