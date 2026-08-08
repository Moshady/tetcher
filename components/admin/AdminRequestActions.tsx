"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react";

interface Props {
  requestId: string;
}

export default function AdminRequestActions({ requestId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<"reject" | "info" | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/teacher-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.refresh();
    });
  }

  async function handleReject() {
    if (!reason) { setError("سبب الرفض مطلوب"); return; }
    startTransition(async () => {
      const res = await fetch(`/api/admin/teacher-requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) { setModal(null); router.refresh(); }
    });
  }

  async function handleRequestInfo() {
    if (!message) { setError("الرسالة مطلوبة"); return; }
    startTransition(async () => {
      const res = await fetch(`/api/admin/teacher-requests/${requestId}/request-information`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) { setModal(null); router.refresh(); }
    });
  }

  return (
    <>
      <div className="flex gap-1">
        <button
          onClick={handleApprove}
          disabled={isPending}
          title="قبول"
          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition disabled:opacity-40"
        >
          <CheckCircle size={16} />
        </button>
        <button
          onClick={() => { setModal("reject"); setError(null); }}
          title="رفض"
          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
        >
          <XCircle size={16} />
        </button>
        <button
          onClick={() => { setModal("info"); setError(null); }}
          title="طلب معلومات"
          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
        >
          <AlertCircle size={16} />
        </button>
      </div>

      {/* Reject Modal */}
      {modal === "reject" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">رفض الطلب</h3>
            <div className="space-y-2 mb-4">
              {["معلومات غير صحيحة", "معلومات غير كافية", "المعلم غير موجود", "طلب مكرر", "طلب غير لائق"].map((r) => (
                <button key={r} type="button" onClick={() => setReason(r)}
                  className={`w-full text-right px-4 py-2.5 rounded-xl text-sm border transition ${reason === r ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 hover:bg-gray-50"}`}>
                  {r}
                </button>
              ))}
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              <button onClick={handleReject} disabled={isPending} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-60">تأكيد الرفض</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {modal === "info" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">طلب معلومات إضافية</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك للمقدّم..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm"
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              <button onClick={handleRequestInfo} disabled={isPending} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-60">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
