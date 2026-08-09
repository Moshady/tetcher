"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, GraduationCap, LogOut, User, LayoutDashboard, Shield } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

interface NavbarProps {
  user?: { name?: string | null; role?: string } | null;
}

const navLinks = [
  { href: "/teachers", label: "المعلمون" },
  { href: "/subjects", label: "المواد" },
  { href: "/join-teacher", label: "انضم كمعلم" },
  { href: "/suggest-teacher", label: "اقترح معلماً" },
];

export default function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-gray-900">تيتشر</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                  >
                    <Shield size={16} /> لوحة الإدارة
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  <LayoutDashboard size={16} /> حسابي
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    <LogOut size={16} /> تسجيل خروج
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-3 px-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-700">
                    <Shield size={16} /> لوحة الإدارة
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700">
                  <User size={16} /> حسابي
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600">
                    <LogOut size={16} /> تسجيل خروج
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700">تسجيل الدخول</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-bold text-blue-600">إنشاء حساب</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
