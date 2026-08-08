import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAuditAction, generateUniqueSlug } from "@/lib/utils/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => ({}));

    const request = await prisma.teacherRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (request.status !== "PENDING") return NextResponse.json({ error: "لا يمكن الموافقة على هذا الطلب" }, { status: 400 });

    // Use overrides from body if provided, else fall back to request data
    const teacherName = body.teacherName || request.teacherName;
    const teacherImage = body.image !== undefined ? body.image : request.image;
    const teachingType = body.teachingType || request.teachingType;
    const experience = body.experience !== undefined ? Number(body.experience) : request.experience;
    const bio = body.bio !== undefined ? body.bio : request.bio;
    const qualifications = body.qualifications !== undefined ? body.qualifications : request.qualifications;
    const governorateId = body.governorateId || request.governorateId;
    const teachingLocation = body.teachingLocation !== undefined ? body.teachingLocation : request.teachingLocation;

    const subjectIds: string[] = body.subjectIds || (request.subjectsJson ? JSON.parse(request.subjectsJson) : []);
    const levelIds: string[] = body.educationLevelIds || (request.educationLevelsJson ? JSON.parse(request.educationLevelsJson) : []);
    const gradeIds: string[] = body.gradeIds || (request.gradesJson ? JSON.parse(request.gradesJson) : []);

    const contactRaw = body.contactInformation !== undefined ? body.contactInformation : request.contactInformation;

    // Parse contact info (phone, youtube, facebook, telegram, website)
    let phone: string | null = null;
    let youtubeUrl: string | null = null;
    let facebookUrl: string | null = null;
    let telegramUrl: string | null = null;
    let website: string | null = null;

    if (contactRaw) {
      try {
        const parsed = typeof contactRaw === "string" ? JSON.parse(contactRaw) : contactRaw;
        phone = parsed.phone || null;
        youtubeUrl = parsed.youtube || null;
        facebookUrl = parsed.facebook || null;
        telegramUrl = parsed.telegram || null;
        website = parsed.website || null;
      } catch {
        phone = typeof contactRaw === "string" ? contactRaw : null;
      }
    }

    // Duplicate detection
    const duplicateWarning = await prisma.teacher.findFirst({
      where: {
        nameAr: { contains: teacherName.split(" ")[0] },
        teacherSubjects: subjectIds[0] ? { some: { subjectId: subjectIds[0] } } : undefined,
      },
    });

    // Execute in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const slug = await generateUniqueSlug(teacherName);

      // 1. Create Teacher
      const teacher = await tx.teacher.create({
        data: {
          slug,
          name: teacherName,
          nameAr: teacherName,
          image: teacherImage,
          bio,
          teachingType: teachingType as "ONLINE" | "OFFLINE" | "BOTH",
          yearsOfExperience: experience,
          qualifications,
          verified: false,
          active: true,
        },
      });

      // 2. Create Teacher Profile (with phone, youtube, facebook, telegram, website)
      await tx.teacherProfile.create({
        data: {
          teacherId: teacher.id,
          phone,
          youtubeUrl,
          facebookUrl,
          website,
          socialLinks: telegramUrl ? JSON.stringify({ telegram: telegramUrl }) : null,
        },
      });

      // 3. Link Subjects
      for (const subjectId of subjectIds) {
        const subject = await tx.subject.findUnique({ where: { id: subjectId } });
        if (subject) await tx.teacherSubject.create({ data: { teacherId: teacher.id, subjectId } });
      }

      // 4. Link Education Levels
      for (const educationLevelId of levelIds) {
        const level = await tx.educationLevel.findUnique({ where: { id: educationLevelId } });
        if (level) await tx.teacherEducationLevel.create({ data: { teacherId: teacher.id, educationLevelId } });
      }

      // 5. Link Grades
      for (const gradeId of gradeIds) {
        const grade = await tx.grade.findUnique({ where: { id: gradeId } });
        if (grade) await tx.teacherGrade.create({ data: { teacherId: teacher.id, gradeId } });
      }

      // 6. Create Teaching Locations
      if (teachingLocation) {
        const locs = teachingLocation.split(" | ").map((s: string) => s.trim()).filter(Boolean);
        for (const locLabel of locs) {
          await tx.teachingLocation.create({
            data: {
              teacherId: teacher.id,
              label: locLabel,
              governorateId: governorateId || null,
            },
          });
        }
      }

      // 7. Update TeacherRequest Status
      const updatedRequest = await tx.teacherRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          teacherName,
          image: teacherImage,
          teachingType: teachingType as "ONLINE" | "OFFLINE" | "BOTH",
          experience,
          bio,
          qualifications,
          governorateId: governorateId || null,
          teachingLocation: teachingLocation || null,
          subjectsJson: JSON.stringify(subjectIds),
          educationLevelsJson: JSON.stringify(levelIds),
          gradesJson: JSON.stringify(gradeIds),
          contactInformation: contactRaw ? (typeof contactRaw === "string" ? contactRaw : JSON.stringify(contactRaw)) : null,
        },
      });

      return { teacher, request: updatedRequest };
    });

    await logAuditAction({
      action: "APPROVE_TEACHER_REQUEST",
      targetId: id,
      targetType: "TeacherRequest",
      details: { teacherId: result.teacher.id, teacherName: result.teacher.nameAr },
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      teacherSlug: result.teacher.slug,
      duplicateWarning: duplicateWarning ? duplicateWarning.nameAr : null,
    });
  } catch (error) {
    console.error("[POST /api/admin/teacher-requests/:id/approve]", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الموافقة على الطلب" }, { status: 500 });
  }
}
