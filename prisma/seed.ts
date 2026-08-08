import { PrismaClient, Role, TeachingType } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 بدء تهيئة قاعدة البيانات...");

  // ─── Create Admin ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tetcher.local" },
    update: {},
    create: {
      name: "المسؤول",
      email: "admin@tetcher.local",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });
  console.log("✅ تم إنشاء حساب المسؤول:", admin.email);

  // ─── Create Demo User ────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash("User@1234", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "student@tetcher.local" },
    update: {},
    create: {
      name: "طالب تجريبي",
      email: "student@tetcher.local",
      passwordHash: userPassword,
      role: Role.USER,
      emailVerifiedAt: new Date(),
    },
  });
  console.log("✅ تم إنشاء حساب الطالب التجريبي:", demoUser.email);

  // ─── Education Levels ─────────────────────────────────────────────────────
  const educationLevels = [
    { slug: "primary", name: "Primary", nameAr: "المرحلة الابتدائية", order: 1 },
    { slug: "preparatory", name: "Preparatory", nameAr: "المرحلة الإعدادية", order: 2 },
    { slug: "secondary", name: "Secondary", nameAr: "المرحلة الثانوية", order: 3 },
    { slug: "university", name: "University", nameAr: "المرحلة الجامعية", order: 4 },
  ];
  const createdLevels: { [key: string]: string } = {};
  for (const level of educationLevels) {
    const l = await prisma.educationLevel.upsert({
      where: { slug: level.slug },
      update: {},
      create: level,
    });
    createdLevels[level.slug] = l.id;
  }
  console.log("✅ تم إنشاء مراحل التعليم");

  // ─── Grades ───────────────────────────────────────────────────────────────
  const grades = [
    // Primary
    { slug: "grade-1", name: "Grade 1", nameAr: "الصف الأول الابتدائي", order: 1, levelSlug: "primary" },
    { slug: "grade-2", name: "Grade 2", nameAr: "الصف الثاني الابتدائي", order: 2, levelSlug: "primary" },
    { slug: "grade-3", name: "Grade 3", nameAr: "الصف الثالث الابتدائي", order: 3, levelSlug: "primary" },
    { slug: "grade-4", name: "Grade 4", nameAr: "الصف الرابع الابتدائي", order: 4, levelSlug: "primary" },
    { slug: "grade-5", name: "Grade 5", nameAr: "الصف الخامس الابتدائي", order: 5, levelSlug: "primary" },
    { slug: "grade-6", name: "Grade 6", nameAr: "الصف السادس الابتدائي", order: 6, levelSlug: "primary" },
    // Preparatory
    { slug: "grade-7", name: "Grade 7", nameAr: "الصف الأول الإعدادي", order: 1, levelSlug: "preparatory" },
    { slug: "grade-8", name: "Grade 8", nameAr: "الصف الثاني الإعدادي", order: 2, levelSlug: "preparatory" },
    { slug: "grade-9", name: "Grade 9", nameAr: "الصف الثالث الإعدادي", order: 3, levelSlug: "preparatory" },
    // Secondary
    { slug: "grade-10", name: "Grade 10", nameAr: "الصف الأول الثانوي", order: 1, levelSlug: "secondary" },
    { slug: "grade-11", name: "Grade 11", nameAr: "الصف الثاني الثانوي", order: 2, levelSlug: "secondary" },
    { slug: "grade-12", name: "Grade 12", nameAr: "الصف الثالث الثانوي (الثانوية العامة)", order: 3, levelSlug: "secondary" },
  ];
  const createdGrades: { [key: string]: string } = {};
  for (const g of grades) {
    const grade = await prisma.grade.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        slug: g.slug,
        name: g.name,
        nameAr: g.nameAr,
        order: g.order,
        educationLevelId: createdLevels[g.levelSlug],
      },
    });
    createdGrades[g.slug] = grade.id;
  }
  console.log("✅ تم إنشاء الصفوف الدراسية");

  // ─── Subjects ─────────────────────────────────────────────────────────────
  const subjects = [
    { slug: "math", name: "Mathematics", nameAr: "الرياضيات", icon: "📐" },
    { slug: "physics", name: "Physics", nameAr: "الفيزياء", icon: "⚡" },
    { slug: "chemistry", name: "Chemistry", nameAr: "الكيمياء", icon: "🧪" },
    { slug: "biology", name: "Biology", nameAr: "الأحياء", icon: "🧬" },
    { slug: "arabic", name: "Arabic Language", nameAr: "اللغة العربية", icon: "📖" },
    { slug: "english", name: "English Language", nameAr: "اللغة الإنجليزية", icon: "🌍" },
    { slug: "french", name: "French Language", nameAr: "اللغة الفرنسية", icon: "🗼" },
    { slug: "history", name: "History", nameAr: "التاريخ", icon: "🏛️" },
    { slug: "geography", name: "Geography", nameAr: "الجغرافيا", icon: "🗺️" },
    { slug: "science", name: "Science", nameAr: "العلوم", icon: "🔬" },
    { slug: "islamic-studies", name: "Islamic Studies", nameAr: "التربية الإسلامية", icon: "☪️" },
    { slug: "computer-science", name: "Computer Science", nameAr: "علوم الحاسوب", icon: "💻" },
    { slug: "philosophy", name: "Philosophy", nameAr: "الفلسفة والمنطق", icon: "🤔" },
    { slug: "economics", name: "Economics", nameAr: "الاقتصاد", icon: "📊" },
    { slug: "accounting", name: "Accounting", nameAr: "المحاسبة", icon: "🧾" },
  ];
  const createdSubjects: { [key: string]: string } = {};
  for (const s of subjects) {
    const subj = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
    createdSubjects[s.slug] = subj.id;
  }
  console.log("✅ تم إنشاء المواد الدراسية");

  // ─── Egyptian Governorates ─────────────────────────────────────────────────
  const governorates = [
    { slug: "cairo", name: "Cairo", nameAr: "القاهرة" },
    { slug: "giza", name: "Giza", nameAr: "الجيزة" },
    { slug: "alexandria", name: "Alexandria", nameAr: "الإسكندرية" },
    { slug: "red-sea", name: "Red Sea", nameAr: "البحر الأحمر" },
    { slug: "aswan", name: "Aswan", nameAr: "أسوان" },
    { slug: "luxor", name: "Luxor", nameAr: "الأقصر" },
    { slug: "mansoura", name: "Dakahlia", nameAr: "الدقهلية" },
    { slug: "sharqia", name: "Sharqia", nameAr: "الشرقية" },
    { slug: "qalyubia", name: "Qalyubia", nameAr: "القليوبية" },
    { slug: "gharbia", name: "Gharbia", nameAr: "الغربية" },
    { slug: "kafr-el-sheikh", name: "Kafr el-Sheikh", nameAr: "كفر الشيخ" },
    { slug: "beheira", name: "Beheira", nameAr: "البحيرة" },
    { slug: "minufiya", name: "Minufiya", nameAr: "المنوفية" },
    { slug: "ismailia", name: "Ismailia", nameAr: "الإسماعيلية" },
    { slug: "suez", name: "Suez", nameAr: "السويس" },
  ];
  const createdGovernorates: { [key: string]: string } = {};
  for (const g of governorates) {
    const gov = await prisma.governorate.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
    createdGovernorates[g.slug] = gov.id;
  }
  console.log("✅ تم إنشاء المحافظات");

  // ─── Cities ───────────────────────────────────────────────────────────────
  const cities = [
    { slug: "cairo-city", name: "Cairo", nameAr: "القاهرة", governorateSlug: "cairo" },
    { slug: "nasr-city", name: "Nasr City", nameAr: "مدينة نصر", governorateSlug: "cairo" },
    { slug: "heliopolis", name: "Heliopolis", nameAr: "مصر الجديدة", governorateSlug: "cairo" },
    { slug: "maadi", name: "Maadi", nameAr: "المعادي", governorateSlug: "cairo" },
    { slug: "giza-city", name: "Giza", nameAr: "الجيزة", governorateSlug: "giza" },
    { slug: "6th-october", name: "6th of October", nameAr: "السادس من أكتوبر", governorateSlug: "giza" },
    { slug: "alex-city", name: "Alexandria", nameAr: "الإسكندرية", governorateSlug: "alexandria" },
    { slug: "hurghada", name: "Hurghada", nameAr: "الغردقة", governorateSlug: "red-sea" },
    { slug: "sharm-el-sheikh", name: "Sharm El Sheikh", nameAr: "شرم الشيخ", governorateSlug: "red-sea" },
  ];
  const createdCities: { [key: string]: string } = {};
  for (const c of cities) {
    const city = await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        name: c.name,
        nameAr: c.nameAr,
        governorateId: createdGovernorates[c.governorateSlug],
      },
    });
    createdCities[c.slug] = city.id;
  }
  console.log("✅ تم إنشاء المدن");

  // ─── Sample Teachers ────────────────────────────────────────────────────
  const sampleTeachers = [
    {
      slug: "ahmed-hassan-math",
      name: "Ahmed Hassan",
      nameAr: "أحمد حسن",
      bio: "معلم رياضيات متخصص بخبرة 15 عاماً، متخصص في الثانوية العامة والمرحلة الجامعية. حاصل على بكالوريوس الرياضيات من جامعة القاهرة.",
      specialization: "الرياضيات والإحصاء",
      yearsOfExperience: 15,
      qualifications: JSON.stringify(["بكالوريوس رياضيات - جامعة القاهرة", "دبلوم التربية وعلم النفس"]),
      teachingType: TeachingType.BOTH,
      verified: true,
      featured: true,
      subjectSlugs: ["math"],
      levelSlugs: ["secondary", "university"],
      gradeSlugs: ["grade-10", "grade-11", "grade-12"],
      locationLabel: "القاهرة – مدينة نصر",
      citySlug: "nasr-city",
      govSlug: "cairo",
    },
    {
      slug: "sara-ibrahim-chemistry",
      name: "Sara Ibrahim",
      nameAr: "سارة إبراهيم",
      bio: "دكتورة كيمياء متخصصة بخبرة 10 سنوات في تدريس الكيمياء العضوية وغير العضوية. خريجة كلية العلوم، جامعة عين شمس.",
      specialization: "الكيمياء العضوية وغير العضوية",
      yearsOfExperience: 10,
      qualifications: JSON.stringify(["ماجستير كيمياء - جامعة عين شمس", "بكالوريوس علوم"]),
      teachingType: TeachingType.BOTH,
      verified: true,
      featured: true,
      subjectSlugs: ["chemistry"],
      levelSlugs: ["secondary", "university"],
      gradeSlugs: ["grade-10", "grade-11", "grade-12"],
      locationLabel: "القاهرة – مصر الجديدة",
      citySlug: "heliopolis",
      govSlug: "cairo",
    },
    {
      slug: "mohamed-ali-physics",
      name: "Mohamed Ali",
      nameAr: "محمد علي",
      bio: "متخصص في الفيزياء بخبرة 12 سنة. نجح في مساعدة مئات الطلاب على التفوق في امتحانات الثانوية العامة.",
      specialization: "الفيزياء الحيوية والميكانيكا",
      yearsOfExperience: 12,
      qualifications: JSON.stringify(["بكالوريوس فيزياء - جامعة الإسكندرية"]),
      teachingType: TeachingType.ONLINE,
      verified: true,
      featured: false,
      subjectSlugs: ["physics"],
      levelSlugs: ["secondary"],
      gradeSlugs: ["grade-10", "grade-11", "grade-12"],
      locationLabel: "الإسكندرية",
      citySlug: "alex-city",
      govSlug: "alexandria",
    },
    {
      slug: "nour-khalil-english",
      name: "Nour Khalil",
      nameAr: "نور خليل",
      bio: "معلمة لغة إنجليزية معتمدة IELTS وTOEFL. خبرة 8 سنوات في تدريس اللغة الإنجليزية لجميع المراحل.",
      specialization: "اللغة الإنجليزية وإعداد للاختبارات الدولية",
      yearsOfExperience: 8,
      qualifications: JSON.stringify(["بكالوريوس آداب إنجليزي", "شهادة CELTA من بريطانيا"]),
      teachingType: TeachingType.BOTH,
      verified: true,
      featured: true,
      subjectSlugs: ["english"],
      levelSlugs: ["primary", "preparatory", "secondary", "university"],
      gradeSlugs: ["grade-7", "grade-8", "grade-9", "grade-10", "grade-11", "grade-12"],
      locationLabel: "الجيزة – السادس من أكتوبر",
      citySlug: "6th-october",
      govSlug: "giza",
    },
    {
      slug: "hassan-mahmoud-biology",
      name: "Hassan Mahmoud",
      nameAr: "حسن محمود",
      bio: "دكتور أحياء متخصص بخبرة 20 عاماً. متميز في شرح علم الوراثة والفسيولوجيا.",
      specialization: "الأحياء والوراثة",
      yearsOfExperience: 20,
      qualifications: JSON.stringify(["دكتوراه أحياء - جامعة القاهرة", "ماجستير علوم"]),
      teachingType: TeachingType.OFFLINE,
      verified: true,
      featured: false,
      subjectSlugs: ["biology"],
      levelSlugs: ["secondary", "university"],
      gradeSlugs: ["grade-11", "grade-12"],
      locationLabel: "القاهرة – المعادي",
      citySlug: "maadi",
      govSlug: "cairo",
    },
    {
      slug: "iman-farouk-arabic",
      name: "Iman Farouk",
      nameAr: "إيمان فاروق",
      bio: "معلمة لغة عربية متخصصة بخبرة 13 سنة. متخصصة في النحو والإملاء والأدب العربي.",
      specialization: "النحو والأدب العربي",
      yearsOfExperience: 13,
      qualifications: JSON.stringify(["بكالوريوس دار العلوم", "دبلوم تدريس اللغة العربية"]),
      teachingType: TeachingType.BOTH,
      verified: false,
      featured: false,
      subjectSlugs: ["arabic"],
      levelSlugs: ["primary", "preparatory", "secondary"],
      gradeSlugs: ["grade-5", "grade-6", "grade-7", "grade-8", "grade-9", "grade-10", "grade-11", "grade-12"],
      locationLabel: "الجيزة",
      citySlug: "giza-city",
      govSlug: "giza",
    },
    {
      slug: "omar-sayed-computer",
      name: "Omar Sayed",
      nameAr: "عمر سيد",
      bio: "مهندس برمجيات ومعلم علوم الحاسوب بخبرة 7 سنوات. يدرس البرمجة وأساسيات الحاسوب.",
      specialization: "علوم الحاسوب والبرمجة",
      yearsOfExperience: 7,
      qualifications: JSON.stringify(["بكالوريوس هندسة حاسوبات", "شهادة AWS Developer"]),
      teachingType: TeachingType.ONLINE,
      verified: false,
      featured: false,
      subjectSlugs: ["computer-science"],
      levelSlugs: ["secondary", "university"],
      gradeSlugs: ["grade-10", "grade-11", "grade-12"],
      locationLabel: "الغردقة – البحر الأحمر",
      citySlug: "hurghada",
      govSlug: "red-sea",
    },
  ];

  for (const t of sampleTeachers) {
    const teacher = await prisma.teacher.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        slug: t.slug,
        name: t.name,
        nameAr: t.nameAr,
        bio: t.bio,
        specialization: t.specialization,
        yearsOfExperience: t.yearsOfExperience,
        qualifications: t.qualifications,
        teachingType: t.teachingType,
        verified: t.verified,
        verifiedAt: t.verified ? new Date() : null,
        verifiedById: t.verified ? admin.id : null,
        featured: t.featured,
      },
    });

    // Profile
    await prisma.teacherProfile.upsert({
      where: { teacherId: teacher.id },
      update: {},
      create: { teacherId: teacher.id },
    });

    // Subjects
    for (const slug of t.subjectSlugs) {
      if (createdSubjects[slug]) {
        await prisma.teacherSubject.upsert({
          where: { teacherId_subjectId: { teacherId: teacher.id, subjectId: createdSubjects[slug] } },
          update: {},
          create: { teacherId: teacher.id, subjectId: createdSubjects[slug] },
        });
      }
    }

    // Education Levels
    for (const slug of t.levelSlugs) {
      if (createdLevels[slug]) {
        await prisma.teacherEducationLevel.upsert({
          where: { teacherId_educationLevelId: { teacherId: teacher.id, educationLevelId: createdLevels[slug] } },
          update: {},
          create: { teacherId: teacher.id, educationLevelId: createdLevels[slug] },
        });
      }
    }

    // Grades
    for (const slug of t.gradeSlugs) {
      if (createdGrades[slug]) {
        await prisma.teacherGrade.upsert({
          where: { teacherId_gradeId: { teacherId: teacher.id, gradeId: createdGrades[slug] } },
          update: {},
          create: { teacherId: teacher.id, gradeId: createdGrades[slug] },
        });
      }
    }

    // Teaching Location
    await prisma.teachingLocation.create({
      data: {
        teacherId: teacher.id,
        label: t.locationLabel,
        cityId: createdCities[t.citySlug] || null,
        governorateId: createdGovernorates[t.govSlug] || null,
      },
    });
  }
  console.log("✅ تم إنشاء المعلمين النموذجيين");

  // ─── Sample Reviews ────────────────────────────────────────────────────
  const reviewsData = [
    { teacherSlug: "ahmed-hassan-math", rating: 5, comment: "دكتور رائع جداً، شرحه واضح ومبسط. نجحت في الثانوية العامة بفضله." },
    { teacherSlug: "ahmed-hassan-math", rating: 4, comment: "معلم ممتاز وصبور. أسلوبه في الشرح يجعل الرياضيات سهلة." },
    { teacherSlug: "sara-ibrahim-chemistry", rating: 5, comment: "الأفضل في الكيمياء على الإطلاق. طريقتها مميزة جداً." },
    { teacherSlug: "sara-ibrahim-chemistry", rating: 5, comment: "شرح ممتاز ومتميز. أرشح أي طالب ثانوي بالتواصل معها." },
    { teacherSlug: "mohamed-ali-physics", rating: 4, comment: "أون لاين لكن شرحه أحسن من كتير أوفلاين." },
    { teacherSlug: "nour-khalil-english", rating: 5, comment: "علمتني الإنجليزي من الصفر. الآن أتكلم بطلاقة تامة." },
    { teacherSlug: "nour-khalil-english", rating: 5, comment: "شهادة IELTS جاءت بسبب مجهودها معايا." },
    { teacherSlug: "hassan-mahmoud-biology", rating: 5, comment: "الترم ده خدت 95% في الأحياء. شكراً دكتور." },
    { teacherSlug: "iman-farouk-arabic", rating: 4, comment: "النحو كان مشكلتي الكبيرة وحلّتها معلمة إيمان." },
  ];

  const teachersMap: { [key: string]: string } = {};
  for (const t of sampleTeachers) {
    const teacher = await prisma.teacher.findUnique({ where: { slug: t.slug } });
    if (teacher) teachersMap[t.slug] = teacher.id;
  }

  // Create additional users for reviews
  const reviewUsers = [];
  for (let i = 1; i <= 5; i++) {
    const pw = await bcrypt.hash("Review@1234", 10);
    const u = await prisma.user.upsert({
      where: { email: `reviewer${i}@tetcher.local` },
      update: {},
      create: {
        name: `طالب ${i}`,
        email: `reviewer${i}@tetcher.local`,
        passwordHash: pw,
        role: Role.USER,
        emailVerifiedAt: new Date(),
      },
    });
    reviewUsers.push(u);
  }

  let reviewIdx = 0;
  for (const r of reviewsData) {
    const teacherId = teachersMap[r.teacherSlug];
    if (!teacherId) continue;
    const userId = reviewUsers[reviewIdx % reviewUsers.length].id;
    reviewIdx++;
    try {
      await prisma.review.create({
        data: {
          teacherId,
          userId,
          rating: r.rating,
          comment: r.comment,
          verified: Math.random() > 0.5,
          approved: true,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    } catch {
      // Skip duplicate
    }
  }
  console.log("✅ تم إنشاء التقييمات النموذجية");

  console.log("\n🎉 تم الانتهاء من تهيئة قاعدة البيانات بنجاح!");
  console.log("\n📝 بيانات تسجيل الدخول:");
  console.log("   المسؤول: admin@tetcher.local / Admin@1234");
  console.log("   الطالب: student@tetcher.local / User@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
