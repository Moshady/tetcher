import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { slug, active: true },
      include: {
        profile: true,
        teacherSubjects: { include: { subject: true } },
        teacherEducationLevels: { include: { educationLevel: true } },
        teacherGrades: { include: { grade: { include: { educationLevel: true } } } },
        teachingLocations: true,
        courses: { where: { active: true }, take: 10 },
        reviews: {
          where: { approved: true },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "المعلم غير موجود" }, { status: 404 });
    }

    const approvedReviews = teacher.reviews;
    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: approvedReviews.filter((r) => r.rating === star).length,
    }));

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        slug: teacher.slug,
        name: teacher.nameAr || teacher.name,
        nameEn: teacher.name,
        image: teacher.image,
        bio: teacher.bio,
        specialization: teacher.specialization,
        yearsOfExperience: teacher.yearsOfExperience,
        qualifications: teacher.qualifications ? JSON.parse(teacher.qualifications) : [],
        teachingType: teacher.teachingType,
        verified: teacher.verified,
        verifiedAt: teacher.verifiedAt,
        featured: teacher.featured,
        profile: teacher.profile,
        subjects: teacher.teacherSubjects.map((s) => ({
          id: s.subject.id,
          name: s.subject.nameAr,
          slug: s.subject.slug,
          icon: s.subject.icon,
        })),
        educationLevels: teacher.teacherEducationLevels.map((l) => ({
          id: l.educationLevel.id,
          name: l.educationLevel.nameAr,
        })),
        grades: teacher.teacherGrades.map((g) => ({
          id: g.grade.id,
          name: g.grade.nameAr,
          level: g.grade.educationLevel.nameAr,
        })),
        locations: teacher.teachingLocations.map((loc) => loc.label),
        courses: teacher.courses,
        reviews: approvedReviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          verified: r.verified,
          createdAt: r.createdAt,
          user: r.user,
        })),
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: approvedReviews.length,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("[GET /api/teachers/:slug]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
