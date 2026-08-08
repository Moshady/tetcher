import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const search = searchParams.get("search")?.trim() || "";
    const subjectId = searchParams.get("subjectId") || "";
    const educationLevelId = searchParams.get("educationLevelId") || "";
    const gradeId = searchParams.get("gradeId") || "";
    const teachingType = searchParams.get("teachingType") || "";
    const governorateId = searchParams.get("governorateId") || "";
    const cityId = searchParams.get("cityId") || "";
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const minExperience = parseInt(searchParams.get("minExperience") || "0");
    const sort = searchParams.get("sort") || "featured";
    const featured = searchParams.get("featured") === "true";

    const where: Record<string, unknown> = {
      active: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { specialization: { contains: search } },
        { bio: { contains: search } },
      ];
    }

    if (teachingType && ["ONLINE", "OFFLINE", "BOTH"].includes(teachingType)) {
      where.teachingType = teachingType;
    }

    if (minExperience > 0) {
      where.yearsOfExperience = { gte: minExperience };
    }

    if (featured) {
      where.featured = true;
    }

    const subjectFilter = subjectId
      ? { teacherSubjects: { some: { subjectId } } }
      : {};
    const levelFilter = educationLevelId
      ? { teacherEducationLevels: { some: { educationLevelId } } }
      : {};
    const gradeFilter = gradeId
      ? { teacherGrades: { some: { gradeId } } }
      : {};
    const locationFilter = governorateId
      ? { teachingLocations: { some: { governorateId } } }
      : cityId
      ? { teachingLocations: { some: { cityId } } }
      : {};

    const fullWhere = {
      ...where,
      ...subjectFilter,
      ...levelFilter,
      ...gradeFilter,
      ...locationFilter,
    };

    // Sort config
    type OrderBy = Record<string, "asc" | "desc">;
    const orderByMap: Record<string, OrderBy[]> = {
      featured: [{ featured: "desc" }, { verified: "desc" }, { createdAt: "desc" }],
      rating: [{ reviews: { _count: "desc" } }],
      newest: [{ createdAt: "desc" }],
      experience: [{ yearsOfExperience: "desc" }],
      alphabetical: [{ nameAr: "asc" }],
    };
    const orderBy = orderByMap[sort] || orderByMap.featured;

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where: fullWhere,
        include: {
          teacherSubjects: { include: { subject: true } },
          teacherEducationLevels: { include: { educationLevel: true } },
          teachingLocations: true,
          reviews: {
            where: { approved: true },
            select: { rating: true },
          },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.teacher.count({ where: fullWhere }),
    ]);

    const teachersWithRating = teachers.map((t) => {
      const approvedReviews = t.reviews;
      const avgRating =
        approvedReviews.length > 0
          ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
          : 0;

      // Filter by minRating
      if (minRating > 0 && avgRating < minRating) return null;

      return {
        id: t.id,
        slug: t.slug,
        name: t.nameAr || t.name,
        image: t.image,
        bio: t.bio,
        specialization: t.specialization,
        yearsOfExperience: t.yearsOfExperience,
        teachingType: t.teachingType,
        verified: t.verified,
        featured: t.featured,
        subjects: t.teacherSubjects.map((s) => ({
          id: s.subject.id,
          name: s.subject.nameAr,
          slug: s.subject.slug,
        })),
        educationLevels: t.teacherEducationLevels.map((l) => ({
          id: l.educationLevel.id,
          name: l.educationLevel.nameAr,
        })),
        locations: t.teachingLocations.map((loc) => loc.label),
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: t._count.reviews,
      };
    }).filter(Boolean);

    return NextResponse.json({
      teachers: teachersWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/teachers]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
