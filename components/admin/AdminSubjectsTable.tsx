"use client";

import { useState, useTransition } from "react";
import { BookOpen, Plus, Search, Edit2, Trash2, X, Check, Loader2 } from "lucide-react";
import { createSubjectAction, updateSubjectAction, deleteSubjectAction } from "@/lib/actions/subjects";

interface SubjectItem {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  icon: string | null;
  description: string | null;
  _count: {
    teacherSubjects: number;
  };
}

export default function AdminSubjectsTable({ subjects }: { subjects: SubjectItem[] }) {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<SubjectItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = subjects.filter(
    (s) =>
      s.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createSubjectAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsAddOpen(false);
      }
    });
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSubjectAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setEditSubject(null);
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteSubjectAction(deleteId);
      if (res?.error) {
        setError(res.error);
      } else {
        setDeleteId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث في المواد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsAddOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
        >
          <Plus size={18} /> إضافة مادة جديدة
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Grid view of subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{subject.icon || "📚"}</span>
                <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full">
                  {subject._count.teacherSubjects} معلم
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{subject.nameAr}</h3>
              <p className="text-xs text-gray-400 mb-2 font-mono" dir="ltr">
                {subject.slug}
              </p>
              {subject.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{subject.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-2">
              <button
                onClick={() => {
                  setError(null);
                  setEditSubject(subject);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition"
              >
                <Edit2 size={14} /> تعديل
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setDeleteId(subject.id);
                }}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
                title="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="text-gray-600 font-bold mb-1">لا توجد مواد دراسية</h3>
          <p className="text-gray-400 text-sm">لم يتم العثور على أي مادة مطابقة لبحثك.</p>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">إضافة مادة دراسية جديدة</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">اسم المادة بالعربية *</label>
                <input
                  name="nameAr"
                  required
                  placeholder="مثال: الرياضيات"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">اسم المادة بالإنجليزية</label>
                <input
                  name="name"
                  placeholder="مثال: Mathematics"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">الأيقونة (إيموجي)</label>
                <input
                  name="icon"
                  placeholder="📐"
                  defaultValue="📚"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">المعرف البرمجي (Slug)</label>
                <input
                  name="slug"
                  placeholder="math (يترك فارغاً للإنشاء التلقائي)"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">الوصف</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="وصف مختصر للمادة..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSubject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">تعديل المادة الدراسية</h2>
              <button onClick={() => setEditSubject(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="hidden" name="id" value={editSubject.id} />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">اسم المادة بالعربية *</label>
                <input
                  name="nameAr"
                  defaultValue={editSubject.nameAr}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">اسم المادة بالإنجليزية</label>
                <input
                  name="name"
                  defaultValue={editSubject.name}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">الأيقونة (إيموجي)</label>
                <input
                  name="icon"
                  defaultValue={editSubject.icon || "📚"}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">الوصف</label>
                <textarea
                  name="description"
                  defaultValue={editSubject.description || ""}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  تحديث البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setEditSubject(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">تأكيد حذف المادة</h3>
            <p className="text-xs text-gray-500">
              هل أنت تأكد من رغبتك في حذف هذه المادة؟ قد يؤثر ذلك على ربط المعلمين بالمادة.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="animate-spin" size={16} /> : "تأكيد الحذف"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
