"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl font-black text-white">ت</span>
            </div>
            <span className="text-3xl font-black text-white">تيتشر</span>
          </Link>
          <p className="text-blue-100 mt-2 text-sm">انضم لمنصة المعلمين الأولى في مصر</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">إنشاء حساب جديد</h1>
          <p className="text-gray-500 text-sm mb-6">أنشئ حسابك مجاناً وابدأ رحلة البحث عن المعلم الأمثل.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                الاسم الكامل
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="محمد أحمد"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="4 أحرف أو أرقام على الأقل"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">4 أحرف أو أرقام على الأقل (يمكن استخدام الأرقام فقط)</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                تأكيد كلمة المرور
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="أعد كتابة كلمة المرور"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus size={18} />
              )}
              {isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
