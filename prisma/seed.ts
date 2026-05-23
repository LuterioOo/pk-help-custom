import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const host = dbUrl.includes("@") ? dbUrl.split("@")[1]?.split("/")[0] : "(not set)";
  console.log(`Seeding core data (host: ${host})`);

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      phone: "+48 777 777 777",
      email: "pk-help@gmail.com",
      telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/pkhelpcustom",
      instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/pkhelpcustom",
    },
    update: {},
  });

  const adminUser = process.env.ADMIN_USERNAME?.trim() || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin";
  await prisma.adminUser.upsert({
    where: { username: adminUser },
    create: { username: adminUser, passwordHash: await hashPassword(adminPass) },
    update: {},
  });

  const reviews = [
    { name: "Alex K.", rating: 5, text: "Amazing build for streaming.", order: 0 },
    { name: "Tomasz N.", rating: 5, text: "Best custom PC shop in Poland.", order: 1 },
  ];

  for (const review of reviews) {
    const existing = await prisma.review.findFirst({ where: { name: review.name } });
    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: { rating: review.rating, text: review.text, order: review.order, active: true },
      });
    } else {
      await prisma.review.create({ data: review });
    }
  }

  console.log("Core seed done. Run seed:components for PC catalog.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
