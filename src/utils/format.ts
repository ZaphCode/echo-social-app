import { resolveStorageUrl } from "@/api/storage";

export const getFileUrl = (
  bucket: string,
  filePath: string
): string => {
  return resolveStorageUrl(bucket, filePath);
};

export const formatDate = (date: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(date).toLocaleDateString("es-ES", options);
};

export function formatDateLong(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(dateStr: string, now = new Date()) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;
  const yearMs = 365 * dayMs;

  if (absMs < minuteMs) return "Hace un momento";
  if (absMs < hourMs) return formatRelativeUnit(diffMs, minuteMs, "min");
  if (absMs < dayMs) return formatRelativeUnit(diffMs, hourMs, "h");
  if (absMs < weekMs) return formatRelativeUnit(diffMs, dayMs, "día");
  if (absMs < monthMs) return formatRelativeUnit(diffMs, weekMs, "semana");
  if (absMs < yearMs) return formatRelativeUnit(diffMs, monthMs, "mes");

  return formatRelativeUnit(diffMs, yearMs, "año");
}

function formatRelativeUnit(
  diffMs: number,
  unitMs: number,
  unitLabel: string,
) {
  const value = Math.max(1, Math.trunc(Math.abs(diffMs) / unitMs));
  const pluralSuffix = value === 1 ? "" : unitLabel === "mes" ? "es" : "s";
  const prefix = diffMs <= 0 ? "Hace" : "En";

  return `${prefix} ${value} ${unitLabel}${pluralSuffix}`;
}
