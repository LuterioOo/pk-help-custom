import { PrismaClient, ComponentCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

function priceWithMarkup(base: number) {
  const markup = base <= 300 ? 50 : base <= 800 ? 80 : base <= 1500 ? 120 : 150;
  return { baseMarketPricePLN: base, markupPLN: markup, price: base + markup };
}

const components: Array<{
  category: ComponentCategory;
  name: string;
  brand: string;
  price: number;
  baseMarketPricePLN: number;
  markupPLN: number;
  specs: Record<string, unknown>;
  featured?: boolean;
}> = [
  {
    category: "CPU",
    name: "AMD Ryzen 7 7800X3D",
    brand: "AMD",
    ...priceWithMarkup(1599),
    specs: { socket: "AM5", tdp: 120, cores: 8 },
    featured: true,
  },
  {
    category: "GPU",
    name: "NVIDIA GeForce RTX 4070 Super",
    brand: "NVIDIA",
    ...priceWithMarkup(2899),
    specs: { tdp: 220, length: 304, pcie: "4.0" },
    featured: true,
  },
];

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const host = dbUrl.includes("@") ? dbUrl.split("@")[1]?.split("/")[0] : "(not set)";
  console.log(`Seeding database host: ${host}`);

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      phone: "+48 777 777 777",
      email: "pk-help@gmail.com",
      telegramUrl: "https://t.me/pkhelpcustom",
      instagramUrl: "https://instagram.com/pkhelpcustom",
    },
    update: {},
  });

  const adminUser = process.env.ADMIN_USERNAME ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "admin";
  await prisma.adminUser.upsert({
    where: { username: adminUser },
    create: { username: adminUser, passwordHash: await hashPassword(adminPass) },
    update: {},
  });

  await prisma.component.deleteMany();
  await prisma.component.createMany({
    data: components.map((c) => ({
      category: c.category,
      name: c.name,
      brand: c.brand,
      baseMarketPricePLN: c.baseMarketPricePLN,
      markupPLN: c.markupPLN,
      price: c.price,
      specs: c.specs,
      featured: c.featured ?? false,
    })),
  });

  await prisma.review.deleteMany();
  await prisma.review.createMany({
    data: [
      { name: "Alex K.", rating: 5, text: "Amazing build for streaming.", order: 0 },
      { name: "Tomasz N.", rating: 5, text: "Best custom PC shop in Poland.", order: 1 },
    ],
  });

  console.log("Seed completed. Run npm run seed:components for full PL catalog.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
