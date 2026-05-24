import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

const demoReviews = [
  {
    id: "1",
    name: "Alex K.",
    avatarUrl: null,
    rating: 5,
    text: "Amazing build for streaming. Everything works perfectly, compatibility check saved me from mistakes.",
  },
  {
    id: "2",
    name: "Maria W.",
    avatarUrl: null,
    rating: 5,
    text: "Premium service from start to finish. Fast assembly and beautiful cable management.",
  },
  {
    id: "3",
    name: "Tomasz N.",
    avatarUrl: null,
    rating: 5,
    text: "Best custom PC shop in Poland. The builder tool is incredibly useful.",
  },
];

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: demoReviews });
  }
}
