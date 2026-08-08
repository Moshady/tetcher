import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { teacherRequestSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { saveTeacherImage } from "@/lib/upload";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for") || "unknown";

    // Rate limit: 3 requests per 10 minutes per IP
    if (!rateLimit(`teacher-request:${ip}`, 3, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تم إرسال طلبات كثيرة. حاول مرة أخرى بعد 10 دقائق." },
        { status: 429 }
      );
    }

    const session = await auth();
    const contentType = req.headers.get("content-type") || "";
    let data: Record<string, unknown> = {};
    let imageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = Object.fromEntries(
        [...formData.entries()].filter(([, v]) => typeof v === "string")
      );
      // Parse JSON arrays
      if (typeof data.subjectIds === "string") data.subjectIds = JSON.parse(data.subjectIds);
      if (typeof data.educationLevelIds === "string") data.educationLevelIds = JSON.parse(data.educationLevelIds);
      if (typeof data.gradeIds === "string") data.gradeIds = JSON.parse(data.gradeIds);

      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile.size > 0) {
        imageUrl = await saveTeacherImage(imageFile);
      }
    } else {
      data = await req.json();
    }

    const parsed = teacherRequestSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      teacherName, submitterName, submitterEmail, submitterContact,
      bio, subjectIds, educationLevelIds, gradeIds, governorateId,
      cityId, areaId, teachingType, experience, qualifications,
      teachingLocation, contactInformation,
    } = parsed.data;

    // Fetch location names for storage
    const governorate = governorateId
      ? await prisma.governorate.findUnique({ where: { id: governorateId } })
      : null;
    const city = cityId
      ? await prisma.city.findUnique({ where: { id: cityId } })
      : null;

    const request = await prisma.teacherRequest.create({
      data: {
        submittedByUserId: session?.user.id || null,
        submitterName,
        submitterEmail,
        submitterContact: submitterContact || null,
        teacherName,
        image: imageUrl,
        bio: bio || null,
        subjectsJson: JSON.stringify(subjectIds),
        educationLevelsJson: JSON.stringify(educationLevelIds),
        gradesJson: JSON.stringify(gradeIds || []),
        governorateId: governorateId || null,
        cityId: cityId || null,
        areaId: areaId || null,
        governorateName: governorate?.nameAr || null,
        cityName: city?.nameAr || null,
        teachingType: teachingType as "ONLINE" | "OFFLINE" | "BOTH",
        experience: experience || null,
        qualifications: qualifications || null,
        teachingLocation: teachingLocation || null,
        contactInformation: contactInformation || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, requestId: request.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/teacher-requests]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const requests = await prisma.teacherRequest.findMany({
    where: { submittedByUserId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}
