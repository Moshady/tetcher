"use client";

import { useState, useTransition } from "react";
import { Star, Flag, CheckCircle, ThumbsUp } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  user: { id: string; name: string; avatar?: string };
}

interface Teacher {
  id: string;
  reviewCount: number;
  avgRating: number;
  ratingDistribution: { star: number; count: number }[];
  reviews: Review[];
}

function StarRatingPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star size={28} className={(hover || value) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({
  teacher,
  currentUserId,
}: {
  teacher: Teacher;
  currentUserId?: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(teacher.reviews);
  const [isPending, startTransition] = useTransition();
  const [reportModal, setReportModal] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("يرجى اختيار تقييم بالنجوم"); return; }
    if (comment.trim().length < 10) { setError("التعليق يجب أن يكون 10 أحرف على الأقل"); return; }
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: teacher.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
      setReviews(prev => [{
        id: data.reviewId,
        rating,
        comment,
        verified: false,
        createdAt: new Date().toISOString(),
        user: { id: currentUserId!, name: "أنت" },
      }, ...prev]);
      setRating(0);
      setComment("");
    });
  };

  const handleReport = async (reviewId: string, reason: string) => {
    const res = await fetch(`/api/reviews/${reviewId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) setReportModal(null);
  };

  // Rating distribution
  const total = teacher.reviewCount || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">التقييمات والتعليقات</h2>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-6 pb-6 border-b border-gray-100">
          <div className="text-center flex-shrink-0">
            <div className="text-5xl font-black text-gray-900">{teacher.avgRating.toFixed(1)}</div>
            <div className="flex justify-center mt-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} className={s <= Math.round(teacher.avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">{reviews.length} تقييم</div>
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            {teacher.ratingDistribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-3">{star}</span>
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
                <span className="text-gray-400 w-5 text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {currentUserId ? (
        !success ? (
          <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">أضف تقييمك</h3>
            <div className="mb-3">
              <StarRatingPicker value={rating} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تجربتك مع هذا المعلم..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 outline-none transition text-sm"
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <button
              type="submit"
              disabled={isPending}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm disabled:opacity-60"
            >
              {isPending ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            شكراً! تم إرسال تقييمك بنجاح.
          </div>
        )
      ) : (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm text-center">
          <a href="/login" className="font-semibold underline">سجّل دخولك</a> لإضافة تقييم
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">💬</div>
          <p>لا توجد تقييمات بعد. كن أول من يُقيّم!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-sm font-bold">
                    {review.user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{review.user.name}</span>
                      {review.verified && (
                        <span className="flex items-center gap-0.5 text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                          <ThumbsUp size={10} />طالب موثّق
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={12} className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                      ))}
                      <span className="text-xs text-gray-400 mr-1">
                        {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </div>
                {currentUserId && currentUserId !== review.user.id && (
                  <button
                    onClick={() => setReportModal(review.id)}
                    className="text-gray-300 hover:text-red-400 transition"
                    title="الإبلاغ عن التقييم"
                  >
                    <Flag size={14} />
                  </button>
                )}
              </div>
              <p className="text-gray-700 text-sm mt-3 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">الإبلاغ عن تقييم</h3>
            <div className="space-y-2">
              {[
                ["SPAM", "رسالة مزعجة"],
                ["FAKE", "تقييم مزيف"],
                ["OFFENSIVE", "محتوى مسيء"],
                ["INAPPROPRIATE", "محتوى غير لائق"],
                ["FALSE_INFO", "معلومات كاذبة"],
                ["OTHER", "سبب آخر"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleReport(reportModal, key)}
                  className="w-full text-right px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition border border-gray-100"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReportModal(null)}
              className="mt-4 w-full text-center text-gray-500 text-sm hover:underline"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
