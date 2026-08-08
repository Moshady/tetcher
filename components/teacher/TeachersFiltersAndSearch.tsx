"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, CheckCircle, MapPin, SlidersHorizontal, X, MonitorPlay, Home, RefreshCw } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

// We'll use inline debounce since we don't want to depend on use-debounce
function useDebounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

interface Subject { id: string; slug: string; nameAr: string; }
interface EducationLevel { id: string; slug: string; nameAr: string; }
interface Governorate { id: string; slug: string; nameAr: string; }
interface FiltersData { subjects: Subject[]; educationLevels: EducationLevel[]; governorates: Governorate[]; }

interface Teacher {
  id: string; slug: string; name: string; image?: string;
  bio?: string; specialization?: string; yearsOfExperience?: number;
  teachingType: string; verified: boolean; featured: boolean;
  subjects: { id: string; name: string; slug: string }[];
  educationLevels: { id: string; name: string }[];
  locations: string[];
  avgRating: number; reviewCount: number;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
      <span className="text-sm font-semibold text-gray-700 mr-1">
        {rating > 0 ? rating.toFixed(1) : "جديد"}
      </span>
      {count > 0 && <span className="text-xs text-gray-400">({count})</span>}
    </div>
  );
}

function TeachingTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    ONLINE: { label: "أونلاين", icon: <MonitorPlay size={12} />, color: "bg-blue-50 text-blue-700" },
    OFFLINE: { label: "حضوري", icon: <Home size={12} />, color: "bg-green-50 text-green-700" },
    BOTH: { label: "أونلاين وحضوري", icon: <RefreshCw size={12} />, color: "bg-purple-50 text-purple-700" },
  };
  const t = map[type] || map.BOTH;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${t.color}`}>
      {t.icon}{t.label}
    </span>
  );
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <Link href={`/teachers/${teacher.slug}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm card-hover overflow-hidden h-full flex flex-col">
        {/* Top */}
        <div className="p-5 flex-1">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              {teacher.image ? (
                <Image src={teacher.image} alt={teacher.name} width={72} height={72} className="w-18 h-18 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                  {teacher.name.charAt(0)}
                </div>
              )}
              {teacher.verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle size={11} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900">{teacher.name}</h3>
                {teacher.featured && (
                  <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⭐ مميز</span>
                )}
              </div>
              {teacher.specialization && (
                <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{teacher.specialization}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                <TeachingTypeBadge type={teacher.teachingType} />
                {teacher.yearsOfExperience && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                    {teacher.yearsOfExperience} سنة خبرة
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subjects */}
          {teacher.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {teacher.subjects.slice(0, 3).map((s) => (
                <span key={s.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {s.name}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {teacher.bio && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{teacher.bio}</p>
          )}

          {/* Location */}
          {teacher.locations[0] && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <MapPin size={12} />
              <span className="line-clamp-1">{teacher.locations[0]}</span>
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-50 px-5 py-3 flex items-center justify-between">
          <StarRating rating={teacher.avgRating} count={teacher.reviewCount} />
          <span className="text-xs font-semibold text-blue-600 hover:underline">عرض الملف ←</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full text-center py-20">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
      <p className="text-gray-500 mb-6">جرّب تغيير كلمة البحث أو الفلاتر</p>
      <Link href="/teachers" className="text-blue-600 font-medium hover:underline">إزالة كل الفلاتر</Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-2xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/2" />
          <div className="h-3 skeleton rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 skeleton rounded" />
      <div className="h-3 skeleton rounded w-2/3" />
    </div>
  );
}

export default function TeachersFiltersAndSearch({
  filtersData,
  initialParams,
  teachers: initialTeachers,
  pagination: initialPagination,
}: {
  filtersData: FiltersData;
  initialParams: Record<string, string>;
  teachers: Teacher[];
  pagination: Pagination;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialParams.search || "");
  const [teachingType, setTeachingType] = useState(initialParams.teachingType || "");
  const [subjectId, setSubjectId] = useState(initialParams.subjectId || "");
  const [educationLevelId, setEducationLevelId] = useState(initialParams.educationLevelId || "");
  const [governorateId, setGovernorateId] = useState(initialParams.governorateId || "");
  const [minRating, setMinRating] = useState(initialParams.minRating || "");
  const [sort, setSort] = useState(initialParams.sort || "featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const buildParams = useCallback((overrides: Record<string, string> = {}) => {
    const p: Record<string, string> = {};
    if (search) p.search = search;
    if (teachingType) p.teachingType = teachingType;
    if (subjectId) p.subjectId = subjectId;
    if (educationLevelId) p.educationLevelId = educationLevelId;
    if (governorateId) p.governorateId = governorateId;
    if (minRating) p.minRating = minRating;
    if (sort && sort !== "featured") p.sort = sort;
    return { ...p, ...overrides };
  }, [search, teachingType, subjectId, educationLevelId, governorateId, minRating, sort]);

  const fetchTeachers = useCallback(async (params: Record<string, string>, pg = 1) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ ...params, page: String(pg), limit: "12" }).toString();
      const res = await fetch(`/api/teachers?${qs}`);
      const data = await res.json();
      setTeachers(data.teachers || []);
      setPagination(data.pagination);
      setPage(pg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  let searchTimer: ReturnType<typeof setTimeout>;
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      fetchTeachers({ ...buildParams(), search: val }, 1);
    }, 400);
  };

  const handleFilter = (key: string, val: string) => {
    const setters: Record<string, (v: string) => void> = {
      teachingType: setTeachingType, subjectId: setSubjectId,
      educationLevelId: setEducationLevelId, governorateId: setGovernorateId,
      minRating: setMinRating, sort: setSort,
    };
    setters[key]?.(val);
    const params = buildParams({ [key]: val });
    fetchTeachers(params, 1);
  };

  const clearFilters = () => {
    setSearch(""); setTeachingType(""); setSubjectId(""); setEducationLevelId("");
    setGovernorateId(""); setMinRating(""); setSort("featured");
    fetchTeachers({}, 1);
  };

  const hasFilters = !!(search || teachingType || subjectId || educationLevelId || governorateId || minRating);

  return (
    <div>
      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ابحث عن اسم، مادة، أو تخصص..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
          {search && (
            <button onClick={() => handleSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => handleFilter("sort", e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-500"
        >
          <option value="featured">الأكثر تميزاً</option>
          <option value="rating">الأعلى تقييماً</option>
          <option value="newest">الأحدث</option>
          <option value="experience">الأكثر خبرة</option>
          <option value="alphabetical">أبجدي</option>
        </select>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition ${
            hasFilters ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700"
          }`}
        >
          <SlidersHorizontal size={18} />
          فلاتر {hasFilters && <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">!</span>}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-4 py-3 text-sm text-red-600 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition">
            <X size={16} /> مسح
          </button>
        )}
      </div>

      {/* Filters Drawer */}
      {filtersOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">المادة الدراسية</label>
            <select value={subjectId} onChange={(e) => handleFilter("subjectId", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none">
              <option value="">كل المواد</option>
              {filtersData.subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">المرحلة الدراسية</label>
            <select value={educationLevelId} onChange={(e) => handleFilter("educationLevelId", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none">
              <option value="">كل المراحل</option>
              {filtersData.educationLevels.map((l) => <option key={l.id} value={l.id}>{l.nameAr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">نوع التدريس</label>
            <select value={teachingType} onChange={(e) => handleFilter("teachingType", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none">
              <option value="">الكل</option>
              <option value="ONLINE">أونلاين</option>
              <option value="OFFLINE">حضوري</option>
              <option value="BOTH">أونلاين وحضوري</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">المحافظة</label>
            <select value={governorateId} onChange={(e) => handleFilter("governorateId", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none">
              <option value="">كل المحافظات</option>
              {filtersData.governorates.map((g) => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">أدنى تقييم</label>
            <select value={minRating} onChange={(e) => handleFilter("minRating", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none">
              <option value="">أي تقييم</option>
              <option value="3">3+ نجوم</option>
              <option value="4">4+ نجوم</option>
              <option value="4.5">4.5+ نجوم</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : teachers.length === 0
          ? <EmptyState />
          : teachers.map((t) => <TeacherCard key={t.id} teacher={t} />)}
      </div>

      {/* Pagination */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => fetchTeachers(buildParams(), page - 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            السابق
          </button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => fetchTeachers(buildParams(), p)}
                className={`px-4 py-2 rounded-xl border font-medium transition ${
                  p === page ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => fetchTeachers(buildParams(), page + 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
