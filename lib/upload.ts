import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "teachers");
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function saveTeacherImage(file: File): Promise<string> {
  // MIME validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("نوع الملف غير مسموح. اختر صورة JPG أو PNG أو WebP.");
  }

  // Size validation
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("حجم الصورة يجب أن يكون أقل من 5MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Re-compress with sharp (strip metadata, resize, convert to webp)
  const optimized = await sharp(buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  // Save with random UUID filename (never trust original filename)
  const filename = `${randomUUID()}.webp`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), optimized);

  return `/uploads/teachers/${filename}`;
}
