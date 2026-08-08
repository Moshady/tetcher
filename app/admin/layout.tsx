import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap, ClipboardList, Star, Flag, Users,
  BookOpen, MapPin, Shield, FileText, Settings, Home, BarChart2, Edit
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

const navItems = [
  { href: "/admin", label: "الرئيسية", icon: <Home size={18} /> },
  { href: "/admin/teachers", label: "المعلمون", icon: <GraduationCap size={18} /> },
  { href: "/admin/requests", label: "طلبات المعلمين", icon: <ClipboardList size={18} /> },
  { href: "/admin/edit-requests", label: "طلبات التعديل", icon: <Edit size={18} /> },
  { href: "/admin/reviews", label: "التقييمات", icon: <Star size={18} /> },
  { href: "/admin/reports", label: "البلاغات", icon: <Flag size={18} /> },
  { href: "/admin/users", label: "المستخدمون", icon: <Users size={18} /> },
  { href: "/admin/subjects", label: "المواد", icon: <BookOpen size={18} /> },
  { href: "/admin/locations", label: "المناطق", icon: <MapPin size={18} /> },
  { href: "/admin/audit-logs", label: "سجل العمليات", icon: <FileText size={18} /> },
  { href: "/admin/settings", label: "الإعدادات", icon: <Settings size={18} /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-l border-gray-100 shadow-sm flex flex-col fixed h-full z-40">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm">تيتشر</div>
              <div className="text-xs text-gray-400">لوحة الإدارة</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <span className="text-gray-400">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {session.user.name?.charAt(0) || "A"}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{session.user.name}</div>
              <div className="text-xs text-gray-400">مسؤول</div>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="w-full text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg transition font-medium">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
