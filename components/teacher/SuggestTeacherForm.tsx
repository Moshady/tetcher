"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Plus, Trash2, MapPin, Phone, Send, Globe, Upload, Camera, X } from "lucide-react";
import Image from "next/image";

interface Subject { id: string; nameAr: string; }
interface EducationLevel { id: string; nameAr: string; }
interface Grade { id: string; nameAr: string; educationLevelId: string; }
interface Governorate { id: string; nameAr: string; }

interface Props {
  subjects: Subject[];
  educationLevels: EducationLevel[];
  grades: Grade[];
  governorates: Governorate[];
  user?: { name?: string | null; email?: string | null } | null;
}

export default function SuggestTeacherForm({ subjects, educationLevels, grades, governorates, user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [teachingLocations, setTeachingLocations] = useState<string[]>([]);
  const [customLocationInput, setCustomLocationInput] = useState("");

  // Photo state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    teacherName: "", submitterName: user?.name || "", submitterEmail: user?.email || "",
    submitterContact: "", bio: "", governorateId: "",
    teachingType: "BOTH", experience: "", qualifications: "",
    teacherPhone: "", youtubeUrl: "", facebookUrl: "", telegramUrl: "", websiteUrl: "",
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  function toggleArray(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  function addLocation() {
    const trimmed = customLocationInput.trim();
    if (!trimmed) return;
    if (!teachingLocations.includes(trimmed)) {
      setTeachingLocations([...teachingLocations, trimmed]);
    }
    setCustomLocationInput("");
  }

  function removeLocation(index: number) {
    setTeachingLocations(teachingLocations.filter((_, i) => i !== index));
  }

  function handleLevelToggle(levelId: string) {
    const isSelected = selectedLevels.includes(levelId);
    const levelGradeIds = grades.filter(g => g.educationLevelId === levelId).map(g => g.id);

    if (isSelected) {
      setSelectedLevels(selectedLevels.filter(id => id !== levelId));
      setSelectedGrades(selectedGrades.filter(gid => !levelGradeIds.includes(gid)));
    } else {
      setSelectedLevels([...selectedLevels, levelId]);
      setSelectedGrades(Array.from(new Set([...selectedGrades, ...levelGradeIds])));
    }
  }

  function handleNextStep() {
    if (step === 1) {
      if (!formData.teacherName.trim()) {
        setError("اسم المعلم كاملاً مطلوب");
        return;
      }
      setError(null);
      setStep(2);
      return;
    }

    if (step === 2) {
      if (selectedSubjects.length === 0) {
        setError("اختر مادة واحدة على الأقل");
        return;
      }
      if (selectedLevels.length === 0) {
        setError("اختر مرحلة دراسية واحدة على الأقل");
        return;
      }
      setError(null);
      setStep(3);
      return;
    }
  }

  async function handleFinalSubmit() {
    if (step !== 3) return;

    if (!formData.submitterName.trim()) {
      setError("بياناتك (الاسم) مطلوبة");
      return;
    }
    if (!formData.submitterEmail.trim()) {
      setError("بياناتك (البريد الإلكتروني) مطلوبة");
      return;
    }
    setError(null);

    startTransition(async () => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      fd.append("subjectIds", JSON.stringify(selectedSubjects));
      fd.append("educationLevelIds", JSON.stringify(selectedLevels));
      fd.append("gradeIds", JSON.stringify(selectedGrades));

      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (formData.teachingType !== "ONLINE") {
        const govName = governorates.find(g => g.id === formData.governorateId)?.nameAr;
        const allLocations = [...teachingLocations];
        if (govName && !allLocations.some(l => l.includes(govName))) {
          allLocations.unshift(govName);
        }
        fd.append("teachingLocation", allLocations.join(" | "));
      } else {
        fd.append("teachingLocation", "أونلاين");
      }

      const contactObj = {
        phone: formData.teacherPhone || null,
        youtube: formData.youtubeUrl || null,
        facebook: formData.facebookUrl || null,
        telegram: formData.telegramUrl || null,
        website: formData.websiteUrl || null,
      };
      fd.append("contactInformation", JSON.stringify(contactObj));

      const res = await fetch("/api/teacher-requests", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ ما أثناء الإرسال");
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user as never} />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">شكراً لمساهمتك!</h2>
          <p className="text-gray-600 mb-8">تم إرسال طلبك بنجاح. سيراجع فريقنا الطلب وسيُضاف المعلم إلى المنصة إن كانت البيانات صحيحة.</p>
          <button
            type="button"
            onClick={() => router.push("/teachers")}
            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-blue-700 transition"
          >
            تصفح المعلمين
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user as never} />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">اقترح معلماً</h1>
          <p className="text-gray-500 mt-2">ساعد الطلاب الآخرين باقتراح معلم رائع تعرفه</p>
        </div>

        {/* Progress Steps Header */}
        <div className="flex items-center justify-between mb-8">
          {["بيانات المعلم والصورة", "المادة والصفوف", "بياناتك"].map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => {
                  if (i + 1 < step) setStep(i + 1);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition ${
                  step > i + 1 ? "bg-green-500 text-white cursor-pointer" : step === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </button>
              <div className={`flex-1 h-0.5 ${i < 2 ? (step > i + 1 ? "bg-green-500" : "bg-gray-200") : "hidden"}`} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Step 1: Teacher Info, Image, Contact & Social Links */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 mb-4">الصورة الشخصية وبيانات المعلم وسُبل التواصل</h2>

              {/* Teacher Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الشخصية للمعلم (اختياري)</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                      <Image src={imagePreview} alt="معاينة الصورة" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        title="حذف الصورة"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/40 transition flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-blue-600">
                      <Camera size={24} />
                      <span className="text-[10px] font-bold mt-1">رفع صورة</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700">تساعد الصورة الشخصية في التعرف على المعلم بسهولة.</p>
                    <p className="text-[11px] text-gray-400">الصيغ المسموحة: JPG, PNG, WebP (أقل من 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Teacher Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المعلم كاملاً *</label>
                <input
                  value={formData.teacherName}
                  onChange={(e) => setFormData(p => ({ ...p, teacherName: e.target.value }))}
                  placeholder="أحمد محمد..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              {/* Teacher Phone / WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم تواصل المعلم (واتساب أو هاتف) (اختياري)</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.teacherPhone}
                    onChange={(e) => setFormData(p => ({ ...p, teacherPhone: e.target.value }))}
                    placeholder="01001234567"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    dir="ltr"
                  />
                  <Phone size={18} className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>

              {/* Teaching Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع التدريس</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["ONLINE", "أونلاين"], ["OFFLINE", "حضوري"], ["BOTH", "الاثنان"]].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, teachingType: val }))}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                        formData.teachingType === val ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social / Online Links (Appears when ONLINE or BOTH) */}
              {formData.teachingType !== "OFFLINE" && (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <span className="block text-xs font-bold text-blue-900 mb-1">
                    روابط القنوات والمنصات أونلاين (اختياري)
                  </span>

                  <div>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.youtubeUrl}
                        onChange={(e) => setFormData(p => ({ ...p, youtubeUrl: e.target.value }))}
                        placeholder="رابط قناة يوتيوب (https://youtube.com/...)"
                        className="w-full px-3.5 py-2.5 pr-9 text-xs rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                        dir="ltr"
                      />
                      <svg className="absolute right-3 top-3 w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.facebookUrl}
                        onChange={(e) => setFormData(p => ({ ...p, facebookUrl: e.target.value }))}
                        placeholder="رابط صفحة فيسبوك (https://facebook.com/...)"
                        className="w-full px-3.5 py-2.5 pr-9 text-xs rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                        dir="ltr"
                      />
                      <svg className="absolute right-3 top-3 w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.telegramUrl}
                        onChange={(e) => setFormData(p => ({ ...p, telegramUrl: e.target.value }))}
                        placeholder="رابط قناة تليجرام (https://t.me/...)"
                        className="w-full px-3.5 py-2.5 pr-9 text-xs rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                        dir="ltr"
                      />
                      <Send size={16} className="absolute right-3 top-3 text-sky-500" />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData(p => ({ ...p, websiteUrl: e.target.value }))}
                        placeholder="رابط المنصة أو الموقع الإلكتروني"
                        className="w-full px-3.5 py-2.5 pr-9 text-xs rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                        dir="ltr"
                      />
                      <Globe size={16} className="absolute right-3 top-3 text-teal-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Governorate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المحافظة الرئيسية</label>
                <select
                  value={formData.governorateId}
                  onChange={(e) => setFormData(p => ({ ...p, governorateId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none"
                >
                  <option value="">اختر المحافظة</option>
                  {governorates.map(g => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
                </select>
              </div>

              {/* Multiple Teaching Locations / Centers (Only visible when NOT ONLINE) */}
              {formData.teachingType !== "ONLINE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">أماكن ومراكز التدريس الحضوري (اختياري)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={customLocationInput}
                      onChange={(e) => setCustomLocationInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocation(); } }}
                      placeholder="مثال: سنتر الأوائل - الغردقة / مدينة نصر"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={addLocation}
                      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                    >
                      <Plus size={16} /> إضافة
                    </button>
                  </div>

                  {teachingLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {teachingLocations.map((loc, idx) => (
                        <div key={idx} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200">
                          <MapPin size={12} className="text-teal-600" />
                          <span>{loc}</span>
                          <button
                            type="button"
                            onClick={() => removeLocation(idx)}
                            className="text-slate-400 hover:text-red-500 transition mr-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">سنوات الخبرة</label>
                <input
                  type="number" min="0" max="50" value={formData.experience}
                  onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))}
                  placeholder="مثلاً: 10"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  dir="ltr"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">نبذة مختصرة (اختياري)</label>
                <textarea
                  value={formData.bio} onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="اكتب نبذة تعريفية عن المعلم..." rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none resize-none"
                />
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">{error}</div>}
            </div>
          )}

          {/* Step 2: Subjects & Nested Education Levels / Grades */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-bold text-gray-900 mb-4">المادة الدراسية والمرحلة مع الصفوف</h2>

              {/* Subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المادة الدراسية *</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleArray(selectedSubjects, setSelectedSubjects, s.id)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition ${
                        selectedSubjects.includes(s.id) ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      {s.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education Levels with Nested Grades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المراحل والصفوف الدراسية *</label>
                <div className="space-y-3">
                  {educationLevels.map(level => {
                    const isLevelSelected = selectedLevels.includes(level.id);
                    const levelGrades = grades.filter(g => g.educationLevelId === level.id);

                    return (
                      <div
                        key={level.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isLevelSelected
                            ? "border-purple-300 bg-purple-50/40 shadow-sm"
                            : "border-gray-200 bg-white hover:border-purple-200"
                        }`}
                      >
                        {/* Level Header Button */}
                        <div
                          onClick={() => handleLevelToggle(level.id)}
                          className="flex items-center justify-between p-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                              isLevelSelected ? "bg-purple-600 border-purple-600 text-white" : "border-gray-300 bg-white"
                            }`}>
                              {isLevelSelected && "✓"}
                            </div>
                            <span className="font-bold text-gray-900 text-base">{level.nameAr}</span>
                          </div>
                          <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2.5 py-1 rounded-full">
                            {isLevelSelected ? "محددة" : "انقر للتحديد"}
                          </span>
                        </div>

                        {/* Nested Grades List */}
                        {isLevelSelected && levelGrades.length > 0 && (
                          <div className="px-4 pb-4 pt-1 border-t border-purple-100 bg-white/70">
                            <span className="block text-xs font-bold text-gray-500 mb-2.5">
                              حدد الصفوف المطلوبة في {level.nameAr}:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {levelGrades.map(grade => {
                                const isGradeSelected = selectedGrades.includes(grade.id);
                                return (
                                  <button
                                    key={grade.id}
                                    type="button"
                                    onClick={() => toggleArray(selectedGrades, setSelectedGrades, grade.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition text-right ${
                                      isGradeSelected
                                        ? "bg-purple-700 text-white border-purple-700 shadow-sm"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50"
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                      isGradeSelected ? "bg-white text-purple-700 border-white font-bold" : "border-gray-300 bg-white"
                                    }`}>
                                      {isGradeSelected && "✓"}
                                    </div>
                                    <span className="truncate">{grade.nameAr}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">{error}</div>}
            </div>
          )}

          {/* Step 3: Submitter Info */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">بياناتك (لأغراض التدقيق والمتابعة)</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">اسمك *</label>
                <input
                  value={formData.submitterName}
                  onChange={(e) => setFormData(p => ({ ...p, submitterName: e.target.value }))}
                  placeholder="اسمك الكامل"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">بريدك الإلكتروني *</label>
                <input
                  type="email"
                  value={formData.submitterEmail}
                  onChange={(e) => setFormData(p => ({ ...p, submitterEmail: e.target.value }))}
                  placeholder="example@email.com" dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم تواصل (اختياري)</label>
                <input
                  value={formData.submitterContact}
                  onChange={(e) => setFormData(p => ({ ...p, submitterContact: e.target.value }))}
                  placeholder="واتساب أو هاتف"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">{error}</div>}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setError(null); setStep(s => Math.max(1, s - 1)); }}
              disabled={step === 1}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-40 hover:bg-gray-50 transition"
            >
              السابق
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
              >
                التالي
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
