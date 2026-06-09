import type { ComponentCategory } from "@prisma/client";
import type { BuildSelection } from "@/lib/compatibility";

/** Strict builder step order (desktop + mobile). */
export const BUILDER_CATEGORY_ORDER: ComponentCategory[] = [
  "CASE",
  "CPU",
  "MOTHERBOARD",
  "RAM",
  "GPU",
  "PSU",
  "SSD",
  "HDD",
  "COOLER",
  "AIO",
  "FANS",
];

export const REQUIRED_BUILDER_CATEGORIES = new Set<ComponentCategory>([
  "CASE",
  "CPU",
  "MOTHERBOARD",
  "RAM",
  "GPU",
  "PSU",
]);

const REQUIRED_LIST = BUILDER_CATEGORY_ORDER.filter((c) => REQUIRED_BUILDER_CATEGORIES.has(c));

/** Filled categories are always reachable; otherwise prior required steps must be complete. */
export function canAccessCategory(category: ComponentCategory, selection: BuildSelection): boolean {
  if (selection[category]) return true;

  const targetIdx = BUILDER_CATEGORY_ORDER.indexOf(category);
  if (targetIdx <= 0) return true;

  for (let i = 0; i < targetIdx; i++) {
    const step = BUILDER_CATEGORY_ORDER[i];
    if (REQUIRED_BUILDER_CATEGORIES.has(step) && !selection[step]) return false;
  }
  return true;
}

export function isCategoryLocked(category: ComponentCategory, selection: BuildSelection): boolean {
  return !canAccessCategory(category, selection);
}

export function getNextCategory(current: ComponentCategory): ComponentCategory | null {
  const idx = BUILDER_CATEGORY_ORDER.indexOf(current);
  if (idx < 0 || idx >= BUILDER_CATEGORY_ORDER.length - 1) return null;
  return BUILDER_CATEGORY_ORDER[idx + 1];
}

/** First required category still missing (for highlighting flow). */
export function getFirstIncompleteRequired(selection: BuildSelection): ComponentCategory | null {
  for (const cat of REQUIRED_LIST) {
    if (!selection[cat]) return cat;
  }
  return null;
}
