import type { TeachingType, UniversityType, YearData } from "../services/api";

export const scoreColors: Record<string, string> = {
  SAY: "border-sky-200 bg-sky-50 text-sky-800",
  EA: "border-violet-200 bg-violet-50 text-violet-800",
  SOZ: "border-rose-200 bg-rose-50 text-rose-800",
  DIL: "border-amber-200 bg-amber-50 text-amber-800",
  TYT: "border-slate-200 bg-slate-50 text-slate-700",
};

export const universityTypeColors: Record<string, string> = {
  DEVLET: "border-sky-200 bg-sky-50 text-sky-800",
  VAKIF: "border-teal-200 bg-teal-50 text-teal-800",
  VAKIF_UCRETLI: "border-amber-200 bg-amber-50 text-amber-800",
};

export function formatNumber(value?: number | null) {
  return value == null ? "" : value.toLocaleString("tr-TR");
}

export function formatScore(value?: number | null) {
  return value == null ? "" : Number(value).toFixed(2);
}

export function displayCity(value?: string | null) {
  return value?.trim() ? value : "Şehir bilgisi yok";
}

export function teachingLabel(value?: TeachingType | string | null) {
  if (!value) return "";
  if (value === "IKINDI") return "İkinci öğretim";
  if (value === "UZAKTAN") return "Uzaktan";
  return "Örgün";
}

export function universityTypeLabel(value?: UniversityType | string) {
  if (value === "DEVLET") return "Devlet";
  if (value === "VAKIF") return "Vakıf";
  if (value === "VAKIF_UCRETLI") return "Vakıf ücretli";
  return value ?? "";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export function latestYear(yearData?: YearData[] | null) {
  return [...(yearData ?? [])].sort((a, b) => b.year - a.year)[0] ?? null;
}



