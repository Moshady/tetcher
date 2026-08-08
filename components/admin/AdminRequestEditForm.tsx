"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Save,
  Phone,
  Send,
  Globe,
  MapPin,
  BookOpen,
  GraduationCap,
  Award,
  UserCheck,
  Camera,
} from "lucide-react";

interface Subject { id: string; nameAr: string; }
interface EducationLevel { id: string; nameAr: string; }
interface Grade { id: string; nameAr: string; educationLevelId: string; }
interface Governorate { id: string; nameAr: string; }

interface TeacherRequestData {
  id: string;
  teacherName: string;
  submitterName: string;
  submitterEmail: string;
  submitterContact?: string | null;
  image?: string | null;
  bio?: string | null;
  qualifications?: string | null;
  subjectsJson?: string | null;
  educationLevelsJson?: string | null;
  gradesJson?: string | null;
  governorateId?: string | null;
  governorateName?: string | null;
  teachingType: "ONLINE" | "OFFLINE" | "BOTH";
  experience?: number | null;
  teachingLocation?: string | null;
  contactInformation?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFORMATION" | "DUPLICATE";
  adminNote?: string | null;
  createdAt: string;
  submittedByUser?: { name: string; email: string } | null;
}

interface Props {
  request: TeacherRequestData;
  allSubjects: Subject[];
  allEducationLevels: EducationLevel[];
  allGrades: Grade[];
  allGovernorates: Governorate[];
}

export default function AdminRequestEditForm({
  request,
  allSubjects,
  allEducationLevels,
  allGrades,
  allGovernorates,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(request.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Parse contact info
  let initialPhone = "";
  let initialYoutube = "";
  let initialFacebook = "";
  let initialTelegram = "";
  let initialWebsite = "";

  if (request.contactInformation) {
    try {
      const parsed = JSON.parse(request.contactInformation);
      initialPhone = parsed.phone || "";
      initialYoutube = parsed.youtube || "";
      initialFacebook = parsed.facebook || "";
      initialTelegram = parsed.telegram || "";
      initialWebsite = parsed.website || "";
    } catch {
      initialPhone = request.contactInformation || "";
    }
  }

  // Parse JSON IDs
  const initialSubjectIds: string[] = request.subjectsJson ? JSON.parse(request.subjectsJson) : [];
  const initialLevelIds: string[] = request.educationLevelsJson ? JSON.parse(request.educationLevelsJson) : [];
  const initialGradeIds: string[] = request.gradesJson ? JSON.parse(request.gradesJson) : [];

  // Form state
  const [teacherName, setTeacherName] = useState(request.teacherName);
  const [teachingType, setTeachingType] = useState(request.teachingType);
  const [experience, setExperience] = useState<string>(request.experience?.toString() || "");
  const [bio, setBio] = useState(request.bio || "");
  const [governorateId, setGovernorateId] = useState(request.governorateId || "");
  const [teachingLocation, setTeachingLocation] = useState(request.teachingLocation || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSubjectIds);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(initialLevelIds);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(initialGradeIds);

  const [phone, setPhone] = useState(initialPhone);
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutube);
  const [facebookUrl, setFacebookUrl] = useState(initialFacebook);
  const [telegramUrl, setTelegramUrl] = useState(initialTelegram);
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsite);

  const [adminNote, setAdminNote] = useState(request.adminNote || "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [modal, setModal] = useState<"reject" | "info" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  }

  function toggleArray(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  function getContactPayload() {
    return JSON.stringify({
      phone: phone || null,
      youtube: youtubeUrl || null,
      facebook: facebookUrl || null,
      telegram: telegramUrl || null,
      website: websiteUrl || null,
    });
  }

  async function handleSaveOnly() {
    setError(null);
    startTransition(async () => {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploadFd = new FormData();
        uploadFd.append("image", imageFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: uploadFd });
        if (upRes.ok) {
          const upData = await upRes.json();
          finalImageUrl = upData.url || finalImageUrl;
        }
      }

      const payload = {
        teacherName,
        image: finalImageUrl,
        teachingType,
        experience: experience ? Number(experience) : null,
        bio,
        governorateId,
        teachingLocation,
        subjectIds: selectedSubjects,
        educationLevelIds: selectedLevels,
        gradeIds: selectedGrades,
        contactInformation: getContactPayload(),
        adminNote,
      };

      const res = await fetch(`/api/admin/teacher-requests/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "حدث خطأ أثناء حفظ التعديلات");
        return;
      }

      setDone("تم حفظ التعديلات بنجاح!");
      setIsEditing(false);
      router.refresh();
    });
  }

  async function handleApprove() {
    setError(null);
    startTransition(async () => {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploadFd = new FormData();
        uploadFd.append("image", imageFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: uploadFd });
        if (upRes.ok) {
          const upData = await upRes.json();
          finalImageUrl = upData.url || finalImageUrl;
        }
      }

      const payload = {
        teacherName,
        image: finalImageUrl,
        teachingType,
        experience: experience ? Number(experience) : null,
        bio,
        governorateId,
        teachingLocation,
        subjectIds: selectedSubjects,
        educationLevelIds: selectedLevels,
        gradeIds: selectedGrades,
        contactInformation: getContactPayload(),
        adminNote,
      };

      const res = await fetch(`/api/admin/teacher-requests/${request.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء اعتماد الطلب");
        return;
      }

      setDone("تمت الموافقة بنجاح وتأسيس بروفايل المعلم!");
      router.refresh();
    });
  }

  async function handleReject() {
    if (!rejectReason) { setError("سبب الرفض مطلوب"); return; }
    startTransition(async () => {
      const res = await fetch(`/api/admin/teacher-requests/${request.id}/reject`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: rejectReason }),
      });
      if (res.ok) { setModal(null); setDone("تم رفض الطلب."); router.refresh(); }
    });
  }

  async function handleRequestInfo() {
    if (!infoMessage) { setError("الرسالة مطلوبة"); return; }
    startTransition(async () => {
      const res = await fetch(`/api/admin/teacher-requests/${request.id}/request-information`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: infoMessage }),
      });
      if (res.ok) { setModal(null); setDone("تم إرسال طلب المعلومات."); router.refresh(); }
    });
  }

  const selectedSubjectObjs = allSubjects.filter(s => selectedSubjects.includes(s.id));
  const selectedLevelObjs = allEducationLevels.filter(l => selectedLevels.includes(l.id));
  const selectedGradeObjs = allGrades.filter(g => selectedGrades.includes(g.id));
  const selectedGovObj = allGovernorates.find(g => g.id === governorateId);

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    NEEDS_INFORMATION: "bg-blue-50 text-blue-700 border-blue-200",
    DUPLICATE: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const statusLabels: Record<string, string> = {
    PENDING: "قيد المراجعة", APPROVED: "مقبول", REJECTED: "مرفوض",
    NEEDS_INFORMATION: "يحتاج معلومات", DUPLICATE: "مكرر",
  };

  return (
    <div className="space-y-6">
      {/* Header bar with Teacher Photo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-400 text-2xl">
            {imageUrl ? (
              <Image src={imageUrl} alt={teacherName} fill className="object-cover" />
            ) : (
              <span>{teacherName.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900">{teacherName}</h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusColors[request.status]}`}>
                {statusLabels[request.status]}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">تاريخ تقديم الطلب: {new Date(request.createdAt).toLocaleDateString("ar-EG")}</p>
          </div>
        </div>

        {request.status === "PENDING" && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
              isEditing ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            }`}
          >
            <Edit3 size={16} />
            {isEditing ? "إلغاء وضع التعديل" : "تعديل البيانات قبل الاعتماد"}
          </button>
        )}
      </div>

      {done && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={18} /> {done}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Teacher Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Teacher Details & Photo */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" /> الصورة والبيانات الأساسية
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                {/* Photo Change Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الصورة الشخصية للمعلم</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <Image src={imageUrl} alt="معاينة" fill className="object-cover" />
                      ) : (
                        <Camera size={20} className="text-gray-400" />
                      )}
                    </div>
                    <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition">
                      تغيير الصورة
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم المعلم كاملاً</label>
                  <input
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع التدريس</label>
                  <select
                    value={teachingType}
                    onChange={(e) => setTeachingType(e.target.value as "ONLINE" | "OFFLINE" | "BOTH")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="ONLINE">أونلاين فقط</option>
                    <option value="OFFLINE">حضوري فقط</option>
                    <option value="BOTH">الاثنان (أونلاين وحضوري)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">سنوات الخبرة</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المحافظة الرئيسية</label>
                  <select
                    value={governorateId}
                    onChange={(e) => setGovernorateId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="">اختر المحافظة</option>
                    {allGovernorates.map(g => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">أماكن ومراكز التدريس الحضوري</label>
                  <input
                    value={teachingLocation}
                    onChange={(e) => setTeachingLocation(e.target.value)}
                    placeholder="تفصل بينها بشرطة vertical pipe |"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نبذة تعريفية عن المعلم</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 text-xs block">اسم المعلم</span>
                  <span className="font-bold text-gray-900">{teacherName}</span>
                </div>

                <div>
                  <span className="text-gray-500 text-xs block">نوع التدريس</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-xs inline-block mt-0.5">
                    {teachingType === "ONLINE" ? "💻 أونلاين فقط" : teachingType === "OFFLINE" ? "🏢 حضوري فقط" : "🌐 أونلاين + 🏢 حضوري"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 text-xs block">سنوات الخبرة</span>
                  <span className="font-semibold text-gray-900">{experience ? `${experience} سنوات` : "غير محدد"}</span>
                </div>

                <div>
                  <span className="text-gray-500 text-xs block">المحافظة</span>
                  <span className="font-semibold text-gray-900">{selectedGovObj?.nameAr || request.governorateName || "غير محدد"}</span>
                </div>

                {teachingLocation && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 text-xs block mb-1">أماكن ومراكز التدريس الحضوري</span>
                    <div className="flex flex-wrap gap-2">
                      {teachingLocation.split(" | ").map((loc, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1">
                          <MapPin size={12} className="text-teal-600" /> {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {bio && (
                  <div className="sm:col-span-2 mt-2">
                    <span className="text-gray-500 text-xs block mb-1">النبذة التعريفية</span>
                    <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 leading-relaxed border border-gray-100">
                      {bio}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Contact & Social Online Links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Phone size={18} className="text-green-600" /> رقم التواصل والروابط أونلاين
            </h2>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رقم هاتف المعلم / واتساب</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01001234567"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رابط قناة يوتيوب</label>
                  <input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رابط صفحة فيسبوك</label>
                  <input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رابط قناة تليجرام</label>
                  <input
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    placeholder="https://t.me/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الموقع الإلكتروني / المنصة</label>
                  <input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <Phone size={16} className="text-green-600 flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">رقم هاتف المعلم</span>
                    <span className="font-bold text-gray-800" dir="ltr">{phone || "غير محدد"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <svg className="w-4 h-4 text-red-500 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <div className="truncate">
                    <span className="text-gray-400 block text-[10px]">قناة يوتيوب</span>
                    {youtubeUrl ? (
                      <a href={youtubeUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold truncate block" dir="ltr">{youtubeUrl}</a>
                    ) : (
                      <span className="text-gray-400">غير متوفر</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <svg className="w-4 h-4 text-blue-600 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <div className="truncate">
                    <span className="text-gray-400 block text-[10px]">فيسبوك</span>
                    {facebookUrl ? (
                      <a href={facebookUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold truncate block" dir="ltr">{facebookUrl}</a>
                    ) : (
                      <span className="text-gray-400">غير متوفر</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <Send size={16} className="text-sky-500 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-gray-400 block text-[10px]">تليجرام</span>
                    {telegramUrl ? (
                      <a href={telegramUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold truncate block" dir="ltr">{telegramUrl}</a>
                    ) : (
                      <span className="text-gray-400">غير متوفر</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                  <Globe size={16} className="text-teal-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-gray-400 block text-[10px]">الموقع أو المنصة</span>
                    {websiteUrl ? (
                      <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold truncate block" dir="ltr">{websiteUrl}</a>
                    ) : (
                      <span className="text-gray-400">غير متوفر</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Subjects, Education Levels, & Grades */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-purple-600" /> المواد، المراحل، والصفوف الدراسية
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                {/* Subjects Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">المواد الدراسية</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allSubjects.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleArray(selectedSubjects, setSelectedSubjects, s.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          selectedSubjects.includes(s.id) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"
                        }`}
                      >
                        {s.nameAr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Levels & Grades Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">المراحل والصفوف الدراسية</label>
                  <div className="space-y-2">
                    {allEducationLevels.map(level => {
                      const isLvlSel = selectedLevels.includes(level.id);
                      const levelGrades = allGrades.filter(g => g.educationLevelId === level.id);

                      return (
                        <div key={level.id} className="p-3 border rounded-xl border-gray-200">
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-900 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isLvlSel}
                              onChange={() => toggleArray(selectedLevels, setSelectedLevels, level.id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>{level.nameAr}</span>
                          </label>

                          {isLvlSel && levelGrades.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-1.5">
                              {levelGrades.map(g => (
                                <label key={g.id} className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedGrades.includes(g.id)}
                                    onChange={() => toggleArray(selectedGrades, setSelectedGrades, g.id)}
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
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 block mb-2">المواد الدراسية:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubjectObjs.length > 0 ? (
                      selectedSubjectObjs.map(s => (
                        <span key={s.id} className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-xl border border-blue-100">
                          {s.nameAr}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">لم تحدد مواد</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 block mb-2">المراحل التعليمية:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLevelObjs.length > 0 ? (
                      selectedLevelObjs.map(l => (
                        <span key={l.id} className="bg-purple-50 text-purple-800 text-xs font-bold px-3 py-1 rounded-xl border border-purple-100">
                          {l.nameAr}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">لم تحدد مراحل</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 block mb-2">الصفوف الدراسية المحددة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGradeObjs.length > 0 ? (
                      selectedGradeObjs.map(g => (
                        <span key={g.id} className="bg-indigo-50 text-indigo-900 text-xs font-bold px-3 py-1 rounded-xl border border-indigo-100">
                          {g.nameAr}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">لم تحدد صفوف خاصة</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Submitter Details & Action Controls */}
        <div className="space-y-6">
          {/* Submitter Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
              <GraduationCap size={16} className="text-blue-600" /> مقدم الطلب
            </h3>
            <div className="space-y-2 text-xs">
              <div><span className="text-gray-400">الاسم:</span> <span className="font-bold text-gray-800">{request.submitterName}</span></div>
              <div><span className="text-gray-400">البريد:</span> <span className="font-semibold text-gray-800" dir="ltr">{request.submitterEmail}</span></div>
              {request.submitterContact && (
                <div><span className="text-gray-400">هاتف الطالب:</span> <span className="font-semibold text-gray-800" dir="ltr">{request.submitterContact}</span></div>
              )}
              {request.submittedByUser && (
                <div><span className="text-gray-400">المستخدم المسجل:</span> <span className="font-bold text-blue-600">{request.submittedByUser.name}</span></div>
              )}
            </div>
          </div>

          {/* Admin Note Box */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
            <label className="block text-xs font-bold text-gray-700">ملاحظات الداخلي للآدمن (اختياري)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="اكتب ملاحظة لمراجعي اللوحة..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Action Buttons Panel */}
          {request.status === "PENDING" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2.5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Award size={16} className="text-teal-600" /> اتخاذ الإجراء
              </h3>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleSaveOnly}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs transition border border-blue-200 disabled:opacity-60"
                >
                  <Save size={15} /> حفظ التعديلات فقط (دون اعتماد)
                </button>
              )}

              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-60"
              >
                <CheckCircle size={18} /> {isEditing ? "حفظ التعديلات واعتماد المعلم" : "الموافقة واعتماد بروفايل المعلم"}
              </button>

              <button
                type="button"
                onClick={() => { setModal("reject"); setError(null); }}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs transition border border-red-200 disabled:opacity-60"
              >
                <XCircle size={16} /> رفض الطلب
              </button>

              <button
                type="button"
                onClick={() => { setModal("info"); setError(null); }}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-xs transition border border-amber-200 disabled:opacity-60"
              >
                <AlertCircle size={16} /> طلب معلومات إضافية من الطالب
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {modal === "reject" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base">سبب الرفض</h3>
            <div className="space-y-2">
              {["معلومات غير صحيحة", "معلومات غير كافية", "المعلم غير موجود", "طلب مكرر", "طلب غير لائق", "أخرى"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRejectReason(r)}
                  className={`w-full text-right px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                    rejectReason === r ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold">إلغاء</button>
              <button type="button" onClick={handleReject} disabled={isPending} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold disabled:opacity-60">تأكيد الرفض</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {modal === "info" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base">طلب معلومات إضافية</h3>
            <textarea
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              placeholder="ما المعلومات التي تحتاجها؟"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:border-blue-500 outline-none resize-none"
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold">إلغاء</button>
              <button type="button" onClick={handleRequestInfo} disabled={isPending} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold disabled:opacity-60">إرسال الطلب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
