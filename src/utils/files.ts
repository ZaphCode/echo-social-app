import { PBCollectionsMap } from "./collections";

export const getFileUrl = (
  coll: keyof PBCollectionsMap,
  recordId: string,
  fileName: string
): string => {
  return `http://127.0.0.1:8090/api/files/${coll}/${recordId}/${fileName}`;
};
