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
