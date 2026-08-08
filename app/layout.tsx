import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "تيتشر – اكتشف أفضل المعلمين في مصر",
    template: "%s | تيتشر",
  },
  description: "منصة تيتشر تساعدك على العثور على أفضل المعلمين في مصر – ابحث، قارن، اقرأ التقييمات واختر المعلم المناسب لك.",
  keywords: ["معلمين", "دروس خصوصية", "مصر", "تعليم", "رياضيات", "فيزياء", "كيمياء"],
  openGraph: {
    title: "تيتشر – اكتشف أفضل المعلمين في مصر",
    description: "ابحث عن معلمين موثوقين في مصر حسب المادة والمنطقة والتقييمات.",
    locale: "ar_EG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
