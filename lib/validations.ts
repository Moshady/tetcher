import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(4, "كلمة المرور يجب أن تكون 4 أحرف أو أرقام على الأقل"),
});

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const teacherRequestSchema = z.object({
  teacherName: z.string().min(2, "اسم المعلم مطلوب"),
  submitterName: z.string().min(2, "اسمك مطلوب"),
  submitterEmail: z.string().email("بريد إلكتروني غير صالح"),
  submitterContact: z.string().optional(),
  bio: z.string().optional(),
  subjectIds: z.array(z.string()).min(1, "اختر مادة واحدة على الأقل"),
  educationLevelIds: z.array(z.string()).min(1, "اختر مرحلة دراسية"),
  gradeIds: z.array(z.string()).optional().default([]),
  governorateId: z.string().optional(),
  cityId: z.string().optional(),
  areaId: z.string().optional(),
  teachingType: z.enum(["ONLINE", "OFFLINE", "BOTH"]),
  experience: z.coerce.number().min(0).max(50).optional(),
  qualifications: z.string().optional(),
  teachingLocation: z.string().optional(),
  contactInformation: z.string().optional(),
});

export const reviewSchema = z.object({
  teacherId: z.string().min(1, "معرّف المعلم مطلوب"),
  rating: z.coerce.number().min(1).max(5, "التقييم بين 1 و 5"),
  comment: z.string().min(10, "التعليق يجب أن يكون 10 أحرف على الأقل").max(1000),
});

export const reportReviewSchema = z.object({
  reason: z.enum(["SPAM", "FAKE", "OFFENSIVE", "INAPPROPRIATE", "FALSE_INFO", "OTHER"]),
  details: z.string().optional(),
});

export const editRequestSchema = z.object({
  teacherId: z.string(),
  reason: z.string().min(5, "يرجى ذكر سبب التعديل"),
  proposedData: z.record(z.string(), z.unknown()),
});
