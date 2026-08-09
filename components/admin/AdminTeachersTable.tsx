"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  Trash2,
  AlertCircle,
  Edit3,
  Filter,
  Camera,
  Phone,
  Send,
  Globe,
  Plus,
  MapPin,
  X,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  FileJson,
  Upload,
  Download,
  Loader2,
  Check,
  FileCode,
} from "lucide-react";
import { importTeachersJsonAction } from "@/lib/actions/teachers";

interface Subject { id: string; nameAr: string; }
interface EducationLevel { id: string; nameAr: string; }
interface Grade { id: string; nameAr: string; educationLevelId: string; }
interface Governorate { id: string; nameAr: string; }

interface TeacherData {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  image?: string | null;
  specialization?: string;
  bio?: string;
  verified: boolean;
  featured: boolean;
  active: boolean;
  teachingType: string;
  yearsOfExperience?: number | null;
  createdAt: string;

  phone: string;
  youtubeUrl: string;
  facebookUrl: string;
  telegramUrl: string;
  websiteUrl: string;

  subjectIds: string[];
  levelIds: string[];
  gradeIds: string[];
  locations: string[];

  subjects: string[];
  levels: string[];
  grades: string[];
  reviewsCount: number;
}

interface Props {
  initialTeachers: TeacherData[];
  allSubjects: Subject[];
  allEducationLevels: EducationLevel[];
  allGrades: Grade[];
  allGovernorates: Governorate[];
}

export default function AdminTeachersTable({
  initialTeachers,
  allSubjects,
  allEducationLevels,
  allGrades,
  allGovernorates,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [teachers, setTeachers] = useState<TeacherData[]>(initialTeachers);

  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState<"ALL" | "YES" | "NO">("ALL");
  const [filterFeatured, setFilterFeatured] = useState<"ALL" | "YES" | "NO">("ALL");
  const [filterActive, setFilterActive] = useState<"ALL" | "YES" | "NO">("ALL");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Modal State
  const [editingTeacher, setEditingTeacher] = useState<TeacherData | null>(null);

  // Modal Form Fields
  const [editNameAr, setEditNameAr] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editTeachingType, setEditTeachingType] = useState<"ONLINE" | "OFFLINE" | "BOTH">("BOTH");
  const [editVerified, setEditVerified] = useState(false);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editActive, setEditActive] = useState(true);

  const [editPhone, setEditPhone] = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editFacebookUrl, setEditFacebookUrl] = useState("");
  const [editTelegramUrl, setEditTelegramUrl] = useState("");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");

  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [editLevels, setEditLevels] = useState<string[]>([]);
  const [editGrades, setEditGrades] = useState<string[]>([]);
  const [editLocations, setEditLocations] = useState<string[]>([]);
  const [editGovernorateId, setEditGovernorateId] = useState("");
  const [customLocationInput, setCustomLocationInput] = useState("");

  // JSON Import Modal State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    totalCount: number;
    errors: string[];
  } | null>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setImportJsonText(content || "");
    };
    reader.readAsText(file);
  }

  function downloadSampleJson() {
    const sample = [
      {
        nameAr: "أحمد حسن",
        specialization: "معلم أول رياضيات للثانوية العامة",
        bio: "خبرة 15 عاماً في تدريس الرياضيات والإحصاء للثانوية العامة والجامعة.",
        yearsOfExperience: 15,
        teachingType: "BOTH",
        verified: true,
        featured: true,
        phone: "01001234567",
        youtubeUrl: "https://youtube.com/@teacher_ahmed",
        facebookUrl: "https://facebook.com/teacher_ahmed",
        telegramUrl: "https://t.me/teacher_ahmed",
        websiteUrl: "https://example.com",
        subjects: ["الرياضيات"],
        levels: ["المرحلة الثانوية"],
        grades: ["الصف الثالث الثانوي (الثانوية العامة)"],
        locations: ["القاهرة – مدينة نصر", "الجيزة - 6 أكتوبر"]
      },
      {
        nameAr: "سارة إبراهيم",
        specialization: "دكتورة كيمياء عضوي وغير عضوي",
        bio: "خريجة كلية العلوم جامعة عين شمس بخبرة 10 سنوات.",
        yearsOfExperience: 10,
        teachingType: "ONLINE",
        verified: true,
        featured: false,
        phone: "01112223334",
        facebookUrl: "https://facebook.com/sara_chem",
        subjects: ["الكيمياء"],
        levels: ["المرحلة الثانوية", "المرحلة الجامعية"],
        grades: ["الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي (الثانوية العامة)"],
        locations: ["أونلاين عبر زوم"]
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teachers_sample.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportSubmit() {
    if (!importJsonText.trim()) return;

    startTransition(async () => {
      const res = await importTeachersJsonAction(importJsonText);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setImportResult({
          importedCount: res.importedCount || 0,
          totalCount: res.totalCount || 0,
          errors: res.errors || [],
        });
        setMessage({
          type: "success",
          text: `تم استيراد ${res.importedCount} من أصل ${res.totalCount} معلم بنجاح! 🎉`,
        });
        router.refresh();
      }
    });
  }

  function openEditModal(t: TeacherData) {
    setEditingTeacher(t);
    setEditNameAr(t.nameAr || t.name);
    setEditImage(t.image || null);
    setEditImageFile(null);
    setEditSpecialization(t.specialization || "");
    setEditBio(t.bio || "");
    setEditExperience(t.yearsOfExperience?.toString() || "");
    setEditTeachingType((t.teachingType as "ONLINE" | "OFFLINE" | "BOTH") || "BOTH");
    setEditVerified(t.verified);
    setEditFeatured(t.featured);
    setEditActive(t.active);

    setEditPhone(t.phone || "");
    setEditYoutubeUrl(t.youtubeUrl || "");
    setEditFacebookUrl(t.facebookUrl || "");
    setEditTelegramUrl(t.telegramUrl || "");
    setEditWebsiteUrl(t.websiteUrl || "");

    setEditSubjects(t.subjectIds || []);
    setEditLevels(t.levelIds || []);
    setEditGrades(t.gradeIds || []);
    setEditLocations(t.locations || []);

    const matchedGov = allGovernorates.find(g => (t.locations || []).some(loc => loc.includes(g.nameAr)));
    setEditGovernorateId(matchedGov?.id || "");
  }

  function handleGovernorateChange(govId: string) {
    setEditGovernorateId(govId);
    const govObj = allGovernorates.find(g => g.id === govId);
    if (govObj && !editLocations.includes(govObj.nameAr)) {
      setEditLocations([govObj.nameAr, ...editLocations]);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImage(URL.createObjectURL(file));
  }

  function toggleArray(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  function addLocation() {
    const trimmed = customLocationInput.trim();
    if (!trimmed) return;
    if (!editLocations.includes(trimmed)) {
      setEditLocations([...editLocations, trimmed]);
    }
    setCustomLocationInput("");
  }

  function removeLocation(idx: number) {
    setEditLocations(editLocations.filter((_, i) => i !== idx));
  }

  async function toggleTeacherField(id: string, field: "verified" | "featured" | "active", currentValue: boolean) {
    const newValue = !currentValue;
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: newValue } : t))
    );

    startTransition(async () => {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!res.ok) {
        setTeachers((prev) =>
          prev.map((t) => (t.id === id ? { ...t, [field]: currentValue } : t))
        );
        setMessage({ type: "error", text: "فشل تحديث حالة المعلم" });
        return;
      }

      setMessage({ type: "success", text: "تم تحديث حالة المعلم بنجاح" });
      router.refresh();
    });
  }

  async function handleSaveFullEdit() {
    if (!editingTeacher) return;

    startTransition(async () => {
      let finalImageUrl = editImage;
      if (editImageFile) {
        const uploadFd = new FormData();
        uploadFd.append("image", editImageFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: uploadFd });
        if (upRes.ok) {
          const upData = await upRes.json();
          finalImageUrl = upData.url || finalImageUrl;
        }
      }

      const payload = {
        nameAr: editNameAr,
        image: finalImageUrl,
        specialization: editSpecialization,
        bio: editBio,
        yearsOfExperience: editExperience ? Number(editExperience) : null,
        teachingType: editTeachingType,
        verified: editVerified,
        featured: editFeatured,
        active: editActive,
        phone: editPhone,
        youtubeUrl: editYoutubeUrl,
        facebookUrl: editFacebookUrl,
        telegramUrl: editTelegramUrl,
        website: editWebsiteUrl,
        subjectIds: editSubjects,
        levelIds: editLevels,
        gradeIds: editGrades,
        teachingLocations: editLocations,
      };

      const res = await fetch(`/api/admin/teachers/${editingTeacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "حدث خطأ أثناء حفظ تعديلات المعلم" });
        return;
      }

      // Immediately update local teachers list with all new selections
      const selSubjects = allSubjects.filter((s) => editSubjects.includes(s.id)).map((s) => s.nameAr);
      const selLevels = allEducationLevels.filter((l) => editLevels.includes(l.id)).map((l) => l.nameAr);
      const selGrades = allGrades.filter((g) => editGrades.includes(g.id)).map((g) => g.nameAr);

      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id !== editingTeacher.id) return t;
          return {
            ...t,
            nameAr: editNameAr,
            name: editNameAr,
            image: finalImageUrl,
            specialization: editSpecialization,
            bio: editBio,
            yearsOfExperience: editExperience ? Number(editExperience) : null,
            teachingType: editTeachingType,
            verified: editVerified,
            featured: editFeatured,
            active: editActive,
            phone: editPhone,
            youtubeUrl: editYoutubeUrl,
            facebookUrl: editFacebookUrl,
            telegramUrl: editTelegramUrl,
            websiteUrl: editWebsiteUrl,
            subjectIds: editSubjects,
            levelIds: editLevels,
            gradeIds: editGrades,
            locations: editLocations,
            subjects: selSubjects,
            levels: selLevels,
            grades: selGrades,
          };
        })
      );

      setMessage({ type: "success", text: `تم تحديث بيانات المعلم "${editNameAr}" بنجاح!` });
      setEditingTeacher(null);
      router.refresh();
    });
  }

  async function handleDeleteTeacher(id: string, name: string) {
    if (!confirm(`هل أنت تأكد من إزالة المعلم "${name}" نهائياً من المنصة؟`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/teachers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setMessage({ type: "error", text: "حدث خطأ أثناء حذف المعلم" });
        return;
      }

      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setMessage({ type: "success", text: "تم حذف المعلم بنجاح" });
      router.refresh();
    });
  }

  const filteredTeachers = teachers.filter((t) => {
    const displayName = t.nameAr || t.name;
    const matchesSearch =
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesVerified =
      filterVerified === "ALL" || (filterVerified === "YES" ? t.verified : !t.verified);
    const matchesFeatured =
      filterFeatured === "ALL" || (filterFeatured === "YES" ? t.featured : !t.featured);
    const matchesActive =
      filterActive === "ALL" || (filterActive === "YES" ? t.active : !t.active);

    return matchesSearch && matchesVerified && matchesFeatured && matchesActive;
  });

  // Summary Metrics
  const totalCount = teachers.length;
  const verifiedCount = teachers.filter(t => t.verified).length;
  const featuredCount = teachers.filter(t => t.featured).length;
  const activeCount = teachers.filter(t => t.active).length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-bold underline">إغلاق</button>
        </div>
      )}

      {/* Top Stat Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">إجمالي المعلمين</span>
            <span className="text-xl font-black text-gray-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">المعلمون الموثّقون</span>
            <span className="text-xl font-black text-gray-900">{verifiedCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">المعلمون المميزون</span>
            <span className="text-xl font-black text-gray-900">{featuredCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">الحسابات النشطة</span>
            <span className="text-xl font-black text-gray-900">{activeCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المعلم أو المادة..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 outline-none"
          />
          <Search size={18} className="absolute right-3 top-3 text-gray-400" />
        </div>

        {/* Bulk Import JSON Button */}
        <button
          type="button"
          onClick={() => {
            setImportResult(null);
            setImportJsonText("");
            setIsImportOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
        >
          <FileJson size={16} />
          <span>استيراد معلمين من ملف (JSON)</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
            <Filter size={14} className="text-gray-500" />
            <span className="font-bold text-gray-700">التوثيق:</span>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as "ALL" | "YES" | "NO")}
              className="bg-transparent font-semibold outline-none cursor-pointer text-gray-800"
            >
              <option value="ALL">الكل</option>
              <option value="YES">موثّق</option>
              <option value="NO">غير موثّق</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
            <span className="font-bold text-gray-700">التمييز:</span>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value as "ALL" | "YES" | "NO")}
              className="bg-transparent font-semibold outline-none cursor-pointer text-gray-800"
            >
              <option value="ALL">الكل</option>
              <option value="YES">مميز</option>
              <option value="NO">العادي</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
            <span className="font-bold text-gray-700">الحالة:</span>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as "ALL" | "YES" | "NO")}
              className="bg-transparent font-semibold outline-none cursor-pointer text-gray-800"
            >
              <option value="ALL">الكل</option>
              <option value="YES">نشط</option>
              <option value="NO">معطل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-900 text-white text-xs">
              <tr>
                <th className="px-6 py-4 font-bold">المعلم</th>
                <th className="px-6 py-4 font-bold">نوع التدريس</th>
                <th className="px-6 py-4 font-bold">التوثيق (Verified)</th>
                <th className="px-6 py-4 font-bold">تميز (Featured)</th>
                <th className="px-6 py-4 font-bold">النشاط (Active)</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات والتعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    لا يوجد معلمون يطابقون خيارات البحث
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const name = teacher.nameAr || teacher.name;
                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50/80 transition">
                      {/* Teacher Avatar & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 text-lg shadow-sm">
                            {teacher.image ? (
                              <Image src={teacher.image} alt={name} fill className="object-cover" unoptimized />
                            ) : (
                              <span>{name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{name}</span>
                              {teacher.verified && <ShieldCheck size={16} className="text-emerald-500" title="معلم موثّق" />}
                              {teacher.featured && <Sparkles size={16} className="text-amber-500" title="معلم مميز" />}
                            </div>
                            <span className="text-xs text-gray-400">
                              {teacher.specialization || (teacher.yearsOfExperience ? `${teacher.yearsOfExperience} سنوات خبرة` : "معلم")} • {teacher.reviewsCount} تقييم
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Teaching Type */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800">
                          {teacher.teachingType === "ONLINE" ? "💻 أونلاين" : teacher.teachingType === "OFFLINE" ? "🏢 حضوري" : "🌐 الاثنان"}
                        </span>
                      </td>

                      {/* Verified Toggle */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleTeacherField(teacher.id, "verified", teacher.verified)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            teacher.verified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <ShieldCheck size={14} className={teacher.verified ? "text-emerald-600" : "text-gray-400"} />
                          <span>{teacher.verified ? "موثّق ✓" : "إعطاء توثيق"}</span>
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleTeacherField(teacher.id, "featured", teacher.featured)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            teacher.featured
                              ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Sparkles size={14} />
                          <span>{teacher.featured ? "مميز" : "عادي"}</span>
                        </button>
                      </td>

                      {/* Active Toggle */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleTeacherField(teacher.id, "active", teacher.active)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            teacher.active
                              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          <span>{teacher.active ? "نشط" : "معطل"}</span>
                        </button>
                      </td>

                      {/* Actions & Full Edit Button */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(teacher)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
                          >
                            <Edit3 size={14} /> تعديل البيانات
                          </button>

                          <Link
                            href={`/teachers/${teacher.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                            title="عرض البروفايل العام"
                          >
                            <ExternalLink size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(teacher.id, name)}
                            disabled={isPending}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="حذف المعلم"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL TEACHER EDIT MODAL */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">تعديل كافة بيانات المعلم</h2>
                  <p className="text-xs text-gray-500">عدل أي معلومة أو مادة أو صف أو روابط التواصل والتوثيق</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Forms */}
            <div className="space-y-6 text-sm">
              {/* Photo & Verification Flags */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0 flex items-center justify-center font-bold text-gray-400 text-2xl">
                    {editImage ? (
                      <Image src={editImage} alt="معاينة" fill className="object-cover" unoptimized />
                    ) : (
                      <Camera size={24} />
                    )}
                  </div>
                  <label className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 cursor-pointer transition shadow-xs">
                    رفع / تغيير الصورة
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={editVerified}
                      onChange={(e) => setEditVerified(e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <ShieldCheck size={16} className={editVerified ? "text-emerald-600" : "text-gray-400"} />
                    <span>توثيق المعلم (Verified)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <Sparkles size={16} className={editFeatured ? "text-amber-500" : "text-gray-400"} />
                    <span>معلم مميز (Featured)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>حساب نشط</span>
                  </label>
                </div>
              </div>

              {/* Core Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم المعلم كاملاً *</label>
                  <input
                    value={editNameAr}
                    onChange={(e) => setEditNameAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">التخصص</label>
                  <input
                    value={editSpecialization}
                    onChange={(e) => setEditSpecialization(e.target.value)}
                    placeholder="مثال: معلم أول الفيزياء والرياضيات"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">سنوات الخبرة</label>
                  <input
                    type="number"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع التدريس</label>
                  <select
                    value={editTeachingType}
                    onChange={(e) => setEditTeachingType(e.target.value as "ONLINE" | "OFFLINE" | "BOTH")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="ONLINE">أونلاين فقط</option>
                    <option value="OFFLINE">حضوري فقط</option>
                    <option value="BOTH">الاثنان (أونلاين وحضوري)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">النبذة التعريفية</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Contact & Social Links */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <span className="block text-xs font-bold text-gray-800">بيانات التواصل والروابط الرقمية</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">رقم الهاتف / واتساب</label>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="01001234567"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">رابط قناة يوتيوب</label>
                    <input
                      value={editYoutubeUrl}
                      onChange={(e) => setEditYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">رابط صفحة فيسبوك</label>
                    <input
                      value={editFacebookUrl}
                      onChange={(e) => setEditFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">رابط قناة تليجرام</label>
                    <input
                      value={editTelegramUrl}
                      onChange={(e) => setEditTelegramUrl(e.target.value)}
                      placeholder="https://t.me/..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">الموقع الإلكتروني / المنصة</label>
                    <input
                      value={editWebsiteUrl}
                      onChange={(e) => setEditWebsiteUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Governorate & Physical Teaching Centers */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">المحافظة الرئيسية وأماكن التدريس</label>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  {/* Governorate picker */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">المحافظة الرئيسية</label>
                    <select
                      value={editGovernorateId}
                      onChange={(e) => handleGovernorateChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:border-blue-500 outline-none"
                    >
                      <option value="">— اختر المحافظة —</option>
                      {allGovernorates.map(g => (
                        <option key={g.id} value={g.id}>{g.nameAr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Manual location tags */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">أماكن ومراكز تدريس إضافية</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={customLocationInput}
                        onChange={(e) => setCustomLocationInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocation(); } }}
                        placeholder="إضافة مركز أو فرع..."
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={addLocation}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-bold transition"
                      >
                        إضافة
                      </button>
                    </div>
                    {editLocations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {editLocations.map((loc, idx) => (
                          <span key={idx} className="bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 flex items-center gap-1">
                            <MapPin size={12} className="text-teal-600" /> {loc}
                            <button type="button" onClick={() => removeLocation(idx)} className="text-gray-400 hover:text-red-600 mr-1">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subjects & Levels */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">المواد الدراسية</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allSubjects.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleArray(editSubjects, setEditSubjects, s.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                          editSubjects.includes(s.id) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"
                        }`}
                      >
                        {s.nameAr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">المراحل والصفوف الدراسية</label>
                  <div className="space-y-2">
                    {allEducationLevels.map(level => {
                      const isLvlSel = editLevels.includes(level.id);
                      const levelGrades = allGrades.filter(g => g.educationLevelId === level.id);

                      return (
                        <div key={level.id} className="p-3 border rounded-xl border-gray-200 bg-white">
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-900 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isLvlSel}
                              onChange={() => toggleArray(editLevels, setEditLevels, level.id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>{level.nameAr}</span>
                          </label>

                          {isLvlSel && levelGrades.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {levelGrades.map(g => (
                                <label key={g.id} className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editGrades.includes(g.id)}
                                    onChange={() => toggleArray(editGrades, setEditGrades, g.id)}
                                    className="rounded border-gray-300 text-purple-600"
                                  />
                                  <span>{g.nameAr}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleSaveFullEdit}
                disabled={isPending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-60"
              >
                {isPending ? "جاري الحفظ..." : "حفظ والتأكيد"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT JSON MODAL */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileJson size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">استيراد مجموعة معلمين من ملف JSON</h2>
                  <p className="text-xs text-gray-500">قم برفع ملف .json يحتوي على تفاصيل المعلمين لإضافتهم دفعة واحدة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Action buttons: Download Template & File Upload */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="block text-xs font-bold text-gray-900 mb-0.5">تحميل قالب تجريبي</span>
                <span className="block text-[11px] text-gray-500">حمل نموذج JSON المنسق الجاهز للتعبئة</span>
              </div>
              <button
                type="button"
                onClick={downloadSampleJson}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold rounded-xl transition shadow-xs"
              >
                <Download size={14} className="text-blue-600" />
                تحميل النموذج (teachers_sample.json)
              </button>
            </div>

            {/* Upload File Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">اختر ملف JSON من جهازك</label>
              <div className="relative border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition cursor-pointer bg-gray-50/50">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto text-emerald-600 mb-2" size={28} />
                <span className="text-xs font-bold text-gray-800 block">اضغط هنا لرفع الملف أو اسحبه إلى هنا</span>
                <span className="text-[11px] text-gray-400">يدعم ملفات JSON فقط (.json)</span>
              </div>
            </div>

            {/* JSON Text Area Preview / Direct Paste */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">أو قم بلصق نص الـ JSON مباشرة هنا:</label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[\n  {\n    "nameAr": "أحمد حسن",\n    "specialization": "معلم رياضيات",\n    "phone": "01001234567"\n  }\n]'
                rows={6}
                className="w-full p-3 rounded-xl border border-gray-200 font-mono text-xs focus:border-emerald-500 outline-none resize-none bg-slate-900 text-slate-100"
                dir="ltr"
              />
            </div>

            {/* Import Results Feedback */}
            {importResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Check size={18} />
                  <span>اكتملت عملية الاستيراد: تم إضافة {importResult.importedCount} من {importResult.totalCount} معلم.</span>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-red-700 space-y-1 bg-white p-3 rounded-xl border border-red-100 max-h-32 overflow-y-auto">
                    <span className="font-bold block">ملاحظات والتنبيهات:</span>
                    {importResult.errors.map((err, idx) => (
                      <p key={idx}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={isPending || !importJsonText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {isPending ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                {isPending ? "جاري الاستيراد والمعالجة..." : "بدء استيراد المعلمين"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
