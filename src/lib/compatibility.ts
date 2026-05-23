import type { ComponentCategory } from "@prisma/client";

export type BuildSelection = Partial<Record<ComponentCategory, ComponentSpec>>;

export interface ComponentSpec {
  id: string;
  name: string;
  category: ComponentCategory;
  price: number;
  baseMarketPricePLN?: number;
  markupPLN?: number;
  specs: Record<string, unknown>;
}

export interface CompatibilityIssue {
  level: "error" | "warning";
  messageKey: string;
  params?: Record<string, string | number>;
}

function getSpec<T>(specs: Record<string, unknown>, key: string): T | undefined {
  return specs[key] as T | undefined;
}

export function checkCompatibility(selection: BuildSelection): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const cpu = selection.CPU;
  const mb = selection.MOTHERBOARD;
  const ram = selection.RAM;
  const gpu = selection.GPU;
  const psu = selection.PSU;
  const case_ = selection.CASE;
  const cooler = selection.COOLER ?? selection.AIO;

  if (cpu && mb) {
    const cpuSocket = getSpec<string>(cpu.specs, "socket");
    const mbSocket = getSpec<string>(mb.specs, "socket");
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push({ level: "error", messageKey: "socketMismatch", params: { cpu: cpuSocket, mb: mbSocket } });
    }
    const cpuTdp = getSpec<number>(cpu.specs, "tdp") ?? 0;
    const mbTdp = getSpec<number>(mb.specs, "maxTdp") ?? 999;
    if (cpuTdp > mbTdp) {
      issues.push({ level: "warning", messageKey: "tdpHigh", params: { tdp: cpuTdp } });
    }
  }

  if (mb && ram) {
    const mbRam = getSpec<string>(mb.specs, "ramType");
    const ramType = getSpec<string>(ram.specs, "type");
    if (mbRam && ramType && mbRam !== ramType) {
      issues.push({ level: "error", messageKey: "ramTypeMismatch" });
    }
    const mbSlots = getSpec<number>(mb.specs, "ramSlots") ?? 4;
    const ramModules = getSpec<number>(ram.specs, "modules") ?? 2;
    if (ramModules > mbSlots) {
      issues.push({ level: "error", messageKey: "ramSlotsExceeded" });
    }
    const mbMaxRam = getSpec<number>(mb.specs, "maxRam") ?? 128;
    const ramCapacity = getSpec<number>(ram.specs, "capacity") ?? 0;
    if (ramCapacity > mbMaxRam) {
      issues.push({ level: "warning", messageKey: "ramCapacityHigh" });
    }
  }

  if (mb && gpu) {
    const pcie = getSpec<string>(mb.specs, "pcie") ?? "4.0";
    const gpuPcie = getSpec<string>(gpu.specs, "pcie") ?? "4.0";
    if (parseFloat(gpuPcie) > parseFloat(pcie)) {
      issues.push({ level: "warning", messageKey: "pcieDowngrade" });
    }
  }

  if (case_ && gpu) {
    const maxGpu = getSpec<number>(case_.specs, "maxGpuLength") ?? 400;
    const gpuLen = getSpec<number>(gpu.specs, "length") ?? 0;
    if (gpuLen > maxGpu) {
      issues.push({ level: "error", messageKey: "gpuTooLong", params: { length: gpuLen, max: maxGpu } });
    }
  }

  if (case_ && cooler) {
    const maxCooler = getSpec<number>(case_.specs, "maxCoolerHeight") ?? 170;
    const coolerH = getSpec<number>(cooler.specs, "height") ?? 0;
    if (coolerH > maxCooler) {
      issues.push({ level: "error", messageKey: "coolerTooTall" });
    }
  }

  if (case_ && mb) {
    const mbForm = getSpec<string>(mb.specs, "formFactor") ?? getSpec<string>(mb.specs, "format");
    const caseFormats = getSpec<string[]>(case_.specs, "supportedFormFactors") ??
      getSpec<string[]>(case_.specs, "formFactors");
    if (mbForm && caseFormats?.length && !caseFormats.includes(mbForm)) {
      issues.push({
        level: "error",
        messageKey: "formFactorMismatch",
        params: { mb: mbForm, case: caseFormats.join(", ") },
      });
    }
  }

  if (psu) {
    const wattage = getSpec<number>(psu.specs, "wattage") ?? 0;
    let required = 150;
    if (cpu) required += getSpec<number>(cpu.specs, "tdp") ?? 65;
    if (gpu) required += getSpec<number>(gpu.specs, "tdp") ?? 200;
    required += 80;
    if (wattage < required) {
      issues.push({
        level: "error",
        messageKey: "psuInsufficient",
        params: { required, wattage },
      });
    } else if (wattage < required * 1.2) {
      issues.push({
        level: "warning",
        messageKey: "psuTight",
        params: { required, wattage },
      });
    }
  }

  const categories: ComponentCategory[] = [
    "CASE", "CPU", "MOTHERBOARD", "GPU", "RAM", "SSD", "PSU",
  ];
  const missing = categories.filter((c) => !selection[c]);
  if (missing.length > 0 && missing.length < categories.length) {
    issues.push({ level: "warning", messageKey: "incompleteBuild" });
  }

  return issues;
}

export function getTotalPrice(selection: BuildSelection): number {
  return Object.values(selection).reduce((sum, c) => sum + Number(c?.price ?? 0), 0);
}
