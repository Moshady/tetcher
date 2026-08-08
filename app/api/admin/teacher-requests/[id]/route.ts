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

    const request = await prisma.teacherRequest.findUnique({ where: { id } });
    if (!request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const {
      teacherName,
      image,
      teachingType,
      experience,
      bio,
      qualifications,
      governorateId,
      teachingLocation,
      subjectIds,
      educationLevelIds,
      gradeIds,
      contactInformation,
      adminNote,
    } = body;

    // Fetch governorate name if updated
    let governorateName = request.governorateName;
    if (governorateId && governorateId !== request.governorateId) {
      const gov = await prisma.governorate.findUnique({ where: { id: governorateId } });
      governorateName = gov?.nameAr || null;
    }

    const updated = await prisma.teacherRequest.update({
      where: { id },
      data: {
        teacherName: teacherName ?? request.teacherName,
        image: image !== undefined ? image : request.image,
        teachingType: teachingType ?? request.teachingType,
        experience: experience !== undefined ? Number(experience) || null : request.experience,
        bio: bio ?? request.bio,
        qualifications: qualifications ?? request.qualifications,
        governorateId: governorateId ?? request.governorateId,
        governorateName,
        teachingLocation: teachingLocation ?? request.teachingLocation,
        subjectsJson: subjectIds ? JSON.stringify(subjectIds) : request.subjectsJson,
        educationLevelsJson: educationLevelIds ? JSON.stringify(educationLevelIds) : request.educationLevelsJson,
        gradesJson: gradeIds ? JSON.stringify(gradeIds) : request.gradesJson,
        contactInformation: contactInformation ?? request.contactInformation,
        adminNote: adminNote ?? request.adminNote,
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("[PUT /api/admin/teacher-requests/:id]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
