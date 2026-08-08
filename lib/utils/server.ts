import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditLog } from "@prisma/client";

type AuditAction =
  | "ADMIN_LOGIN"
  | "TEACHER_APPROVED"
  | "TEACHER_REJECTED"
  | "TEACHER_CREATED"
  | "TEACHER_UPDATED"
  | "TEACHER_DELETED"
  | "TEACHER_VERIFIED"
  | "TEACHER_UNVERIFIED"
  | "REQUEST_APPROVED"
  | "REQUEST_REJECTED"
  | "REQUEST_NEEDS_INFO"
  | "REQUEST_DUPLICATE"
  | "EDIT_REQUEST_APPROVED"
  | "EDIT_REQUEST_REJECTED"
  | "REVIEW_DELETED"
  | "REVIEW_APPROVED"
  | "USER_SUSPENDED"
  | "USER_UNSUSPENDED"
  | "REPORT_RESOLVED"
  | "REPORT_REJECTED";

export async function logAuditAction(
  actorId: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<AuditLog> {
  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadataJson: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, (char) => {
      const map: Record<string, string> = {
        ا: "a", أ: "a", إ: "i", آ: "aa", ب: "b", ت: "t", ث: "th",
        ج: "j", ح: "h", خ: "kh", د: "d", ذ: "th", ر: "r", ز: "z",
        س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a",
        غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
        ه: "h", و: "w", ي: "y", ى: "a", ة: "a", ء: "", ؤ: "w", ئ: "y",
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(name: string): Promise<string> {
  let slug = generateSlug(name);
  if (!slug) slug = `teacher-${Date.now()}`;

  const existing = await prisma.teacher.findUnique({ where: { slug } });
  if (!existing) return slug;

  let counter = 2;
  while (true) {
    const candidate = `${slug}-${counter}`;
    const found = await prisma.teacher.findUnique({ where: { slug: candidate } });
    if (!found) return candidate;
    counter++;
  }
}
