import type { ComponentCategory } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  CircuitBoard,
  Cpu,
  Droplets,
  Fan,
  HardDrive,
  MemoryStick,
  MonitorPlay,
  Wind,
  Zap,
} from "lucide-react";

export type CategoryVisual = {
  Icon: LucideIcon;
  label: string;
  gradient: string;
  iconClass: string;
};

export const CATEGORY_VISUALS: Record<ComponentCategory, CategoryVisual> = {
  CPU: {
    Icon: Cpu,
    label: "CPU",
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconClass: "text-cyan-400",
  },
  GPU: {
    Icon: MonitorPlay,
    label: "GPU",
    gradient: "from-violet-500/20 to-fuchsia-500/10",
    iconClass: "text-violet-400",
  },
  RAM: {
    Icon: MemoryStick,
    label: "RAM",
    gradient: "from-emerald-500/20 to-green-500/10",
    iconClass: "text-emerald-400",
  },
  MOTHERBOARD: {
    Icon: CircuitBoard,
    label: "MB",
    gradient: "from-amber-500/20 to-orange-500/10",
    iconClass: "text-amber-400",
  },
  PSU: {
    Icon: Zap,
    label: "PSU",
    gradient: "from-yellow-500/20 to-amber-500/10",
    iconClass: "text-yellow-400",
  },
  CASE: {
    Icon: Box,
    label: "Case",
    gradient: "from-zinc-500/20 to-slate-500/10",
    iconClass: "text-zinc-300",
  },
  SSD: {
    Icon: HardDrive,
    label: "SSD",
    gradient: "from-sky-500/20 to-blue-500/10",
    iconClass: "text-sky-400",
  },
  HDD: {
    Icon: HardDrive,
    label: "HDD",
    gradient: "from-slate-500/20 to-zinc-500/10",
    iconClass: "text-slate-400",
  },
  COOLER: {
    Icon: Wind,
    label: "Cooler",
    gradient: "from-teal-500/20 to-cyan-500/10",
    iconClass: "text-teal-400",
  },
  AIO: {
    Icon: Droplets,
    label: "AIO",
    gradient: "from-indigo-500/20 to-blue-500/10",
    iconClass: "text-indigo-400",
  },
  FANS: {
    Icon: Fan,
    label: "Fans",
    gradient: "from-rose-500/20 to-pink-500/10",
    iconClass: "text-rose-400",
  },
};

export function getCategoryVisual(category?: ComponentCategory | string | null): CategoryVisual {
  if (category && category in CATEGORY_VISUALS) {
    return CATEGORY_VISUALS[category as ComponentCategory];
  }
  return CATEGORY_VISUALS.CPU;
}
