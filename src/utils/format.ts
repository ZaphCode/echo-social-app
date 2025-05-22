import { PBCollectionsMap } from "./collections";

export const getFileUrl = (
  coll: keyof PBCollectionsMap,
  recordId: string,
  fileName: string
): string => {
  return `http://127.0.0.1:8090/api/files/${coll}/${recordId}/${fileName}`;
};

export const formatDate = (date: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(date).toLocaleDateString("es-ES", options);
};
