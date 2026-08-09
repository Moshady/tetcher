"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "بيانات غير صالحة",
    };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "هذا البريد الإلكتروني مسجل مسبقاً" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
        emailVerifiedAt: new Date(), // dev: auto-verify
      },
    });
  } catch (err: any) {
    console.error("Register DB error:", err);
    return { error: "حدث خطأ أثناء الاتصال بقاعدة البيانات. حاول مرة أخرى." };
  }

  // Auto-login after register
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "تم إنشاء الحساب بنجاح، لكن فشل تسجيل الدخول التلقائي. يرجى تسجيل الدخول يدويًا." };
    }
    throw error;
  }
}

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
        default:
          return { error: "حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى" };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

