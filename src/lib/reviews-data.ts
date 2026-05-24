import { prisma } from "@/lib/prisma";

export type ReviewItem = {
  id: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  text: string;
};

const demoReviews: ReviewItem[] = [
  {
    id: "1",
    name: "Alex K.",
    avatarUrl: null,
    rating: 5,
    text: "Amazing build for streaming. Everything works perfectly.",
  },
  {
    id: "2",
    name: "Maria W.",
    avatarUrl: null,
    rating: 5,
    text: "Premium service from start to finish.",
  },
];

export async function getReviewsData(): Promise<ReviewItem[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        rating: true,
        text: true,
      },
    });
    return reviews.length > 0 ? reviews : demoReviews;
  } catch {
    return demoReviews;
  }
}
