export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Search, Star, CheckCircle, MapPin, MonitorPlay, Home, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import TeachersFiltersAndSearch from "@/components/teacher/TeachersFiltersAndSearch";

import { getOrSeedGovernorates } from "@/lib/data/governorates";
import { getOrSeedEducationLevels } from "@/lib/data/education";

export const metadata = {
  title: "دليل المعلمين",
  description: "ابحث عن معلمك المثالي من بين أفضل المعلمين في مصر",
};

async function getFiltersData() {
  const [subjects, educationLevels, governorates] = await Promise.all([
    prisma.subject.findMany({ orderBy: { nameAr: "asc" } }),
    getOrSeedEducationLevels(),
    getOrSeedGovernorates(),
  ]);
  return { subjects, educationLevels, governorates };
}

async function getTeachers(searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams);
  const teachers = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/teachers?${params.toString()}`,
    { cache: "no-store" }
  ).then((r) => r.json()).catch(() => ({ teachers: [], pagination: { total: 0, totalPages: 1, page: 1 } }));
  return teachers;
}

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const filtersData = await getFiltersData();
  const { teachers, pagination } = await getTeachers(sp);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session?.user} />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black text-gray-900">🎓 دليل المعلمين</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination?.total > 0
              ? `${pagination.total} معلم متاح`
              : "ابحث واعثر على معلمك المثالي"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <TeachersFiltersAndSearch
          filtersData={filtersData}
          initialParams={sp}
          teachers={teachers || []}
          pagination={pagination}
        />
      </div>
    </div>
  );
}
