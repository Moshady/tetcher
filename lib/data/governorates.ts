import { prisma } from "@/lib/prisma";

export const EGYPT_GOVERNORATES = [
  { slug: "cairo", name: "Cairo", nameAr: "القاهرة" },
  { slug: "giza", name: "Giza", nameAr: "الجيزة" },
  { slug: "alexandria", name: "Alexandria", nameAr: "الإسكندرية" },
  { slug: "qalyubia", name: "Qalyubia", nameAr: "القليوبية" },
  { slug: "dakahlia", name: "Dakahlia", nameAr: "الدقهلية" },
  { slug: "sharqia", name: "Sharqia", nameAr: "الشرقية" },
  { slug: "gharbia", name: "Gharbia", nameAr: "الغربية" },
  { slug: "monufia", name: "Monufia", nameAr: "المنوفية" },
  { slug: "beheira", name: "Beheira", nameAr: "البحيرة" },
  { slug: "kafr-el-sheikh", name: "Kafr el-Sheikh", nameAr: "كفر الشيخ" },
  { slug: "damietta", name: "Damietta", nameAr: "دمياط" },
  { slug: "port-said", name: "Port Said", nameAr: "بورسعيد" },
  { slug: "ismailia", name: "Ismailia", nameAr: "الإسماعيلية" },
  { slug: "suez", name: "Suez", nameAr: "السويس" },
  { slug: "north-sinai", name: "North Sinai", nameAr: "شمال سيناء" },
  { slug: "south-sinai", name: "South Sinai", nameAr: "جنوب سيناء" },
  { slug: "red-sea", name: "Red Sea", nameAr: "البحر الأحمر" },
  { slug: "matrouh", name: "Matrouh", nameAr: "مطروح" },
  { slug: "new-valley", name: "New Valley", nameAr: "الوادي الجديد" },
  { slug: "faiyum", name: "Faiyum", nameAr: "الفيوم" },
  { slug: "beni-suef", name: "Beni Suef", nameAr: "بني سويف" },
  { slug: "minya", name: "Minya", nameAr: "المنيا" },
  { slug: "assiut", name: "Assiut", nameAr: "أسيوط" },
  { slug: "sohag", name: "Sohag", nameAr: "سوهاج" },
  { slug: "qena", name: "Qena", nameAr: "قنا" },
  { slug: "luxor", name: "Luxor", nameAr: "الأقصر" },
  { slug: "aswan", name: "Aswan", nameAr: "أسوان" },
];

export async function getOrSeedGovernorates() {
  try {
    let govs = await prisma.governorate.findMany({ orderBy: { nameAr: "asc" } });
    if (govs.length < 27) {
      // Auto seed missing governorates
      for (const gov of EGYPT_GOVERNORATES) {
        await prisma.governorate.upsert({
          where: { slug: gov.slug },
          update: { nameAr: gov.nameAr, name: gov.name },
          create: gov,
        });
      }
      govs = await prisma.governorate.findMany({ orderBy: { nameAr: "asc" } });
    }
    return govs;
  } catch (error) {
    console.error("[getOrSeedGovernorates] Error:", error);
    // Fallback if DB fetch fails
    return EGYPT_GOVERNORATES.map((g, idx) => ({ id: g.slug || String(idx), ...g, createdAt: new Date() }));
  }
}
