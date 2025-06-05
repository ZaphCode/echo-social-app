import { pb } from "@/lib/pocketbase";
import { PBCollectionsMap } from "./collections";

export const getFileUrl = (
  coll: keyof PBCollectionsMap,
  recordId: string,
  fileName: string
): string => {
  return pb.files.getURL({ id: recordId, collectionName: coll }, fileName);
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
