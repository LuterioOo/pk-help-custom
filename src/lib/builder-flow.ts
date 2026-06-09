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
  "COOLER",
  "AIO",
  "SSD",
  "HDD",
  "FANS",
];

export const REQUIRED_BUILDER_CATEGORIES: ComponentCategory[] = [
  "CASE",
  "CPU",
  "MOTHERBOARD",
  "RAM",
  "GPU",
  "PSU",
];

const REQUIRED_SET = new Set(REQUIRED_BUILDER_CATEGORIES);
const OPTIONAL_AFTER_COOLING: ComponentCategory[] = ["SSD", "HDD", "FANS"];

export function hasCoolingSelected(selection: BuildSelection): boolean {
  return Boolean(selection.COOLER || selection.AIO);
}

function requiredStepsCompleteBefore(category: ComponentCategory, selection: BuildSelection): boolean {
  const targetIdx = BUILDER_CATEGORY_ORDER.indexOf(category);
  if (targetIdx <= 0) return true;

  for (let i = 0; i < targetIdx; i++) {
    const step = BUILDER_CATEGORY_ORDER[i];
    if (step === "COOLER" || step === "AIO") {
      if (!hasCoolingSelected(selection)) return false;
      continue;
    }
    if (REQUIRED_SET.has(step) && !selection[step]) return false;
  }
  return true;
}

/** Filled categories are always reachable; otherwise prior required steps must be complete. */
export function canAccessCategory(category: ComponentCategory, selection: BuildSelection): boolean {
  if (selection[category]) return true;

  if (category === "COOLER" || category === "AIO") {
    return Boolean(selection.PSU);
  }

  if (OPTIONAL_AFTER_COOLING.includes(category)) {
    return Boolean(selection.PSU) && hasCoolingSelected(selection);
  }

  return requiredStepsCompleteBefore(category, selection);
}

export function isCategoryLocked(category: ComponentCategory, selection: BuildSelection): boolean {
  return !canAccessCategory(category, selection);
}

export function getNextCategory(current: ComponentCategory, selection: BuildSelection): ComponentCategory | null {
  const idx = BUILDER_CATEGORY_ORDER.indexOf(current);
  if (idx < 0) return null;

  for (let i = idx + 1; i < BUILDER_CATEGORY_ORDER.length; i++) {
    const next = BUILDER_CATEGORY_ORDER[i];
    if (next === "AIO" && selection.COOLER) continue;
    if (next === "COOLER" && selection.AIO) continue;
    if (canAccessCategory(next, selection)) return next;
  }
  return null;
}

/** First required category still missing (for highlighting flow). */
export function getFirstIncompleteRequired(selection: BuildSelection): ComponentCategory | null {
  for (const cat of REQUIRED_BUILDER_CATEGORIES) {
    if (!selection[cat]) return cat;
  }
  if (!hasCoolingSelected(selection)) return "COOLER";
  return null;
}

export function getMissingBuildCategories(selection: BuildSelection): ComponentCategory[] {
  const missing: ComponentCategory[] = [];
  for (const cat of REQUIRED_BUILDER_CATEGORIES) {
    if (!selection[cat]) missing.push(cat);
  }
  if (!hasCoolingSelected(selection)) {
    missing.push("COOLER");
  }
  return missing;
}

export function isBuildComplete(selection: BuildSelection): boolean {
  return getMissingBuildCategories(selection).length === 0;
}
