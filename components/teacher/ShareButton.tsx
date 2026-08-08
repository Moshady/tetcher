"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ teacherName }: { teacherName: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ملف المعلم ${teacherName} – منصة تيتشر`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was cancelled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy URL");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
      title="مشاركة الملف الشخصي"
    >
      {copied ? (
        <>
          <Check size={14} className="text-emerald-400" />
          <span className="text-emerald-300">تم نسخ الرابط!</span>
        </>
      ) : (
        <>
          <Share2 size={14} />
          <span>مشاركة</span>
        </>
      )}
    </button>
  );
}
