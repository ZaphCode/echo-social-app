import { supabase } from "@/lib/supabase";
import { throwIfError } from "./common";

const STORAGE_PUBLIC_PATH = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function normalizeStoragePath(bucket: string, value: string) {
  if (!value || !isRemoteUrl(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const match = url.pathname.match(STORAGE_PUBLIC_PATH);

    if (!match) {
      return value;
    }

    const [, bucketName, filePath] = match;
    return bucketName === bucket ? decodeURIComponent(filePath) : value;
  } catch {
    return value;
  }
}

export function resolveStorageUrl(bucket: string, value?: string | null) {
  if (!value) {
    return "";
  }

  if (isRemoteUrl(value)) {
    return value;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(value);

  return publicUrl;
}

async function uploadImage(
  bucket: string,
  filePath: string,
  imageUri: string,
  contentType = "image/jpeg"
) {
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from(bucket).upload(filePath, blob, {
    contentType,
    upsert: true,
  });

  throwIfError(error);

  return filePath;
}

export async function uploadAvatarImage(userId: string, imageUri: string) {
  const filePath = `${userId}/avatar_${Date.now()}.jpg`;
  return uploadImage("avatars", filePath, imageUri);
}

export async function uploadServiceImages(
  providerId: string,
  photos: string[]
) {
  return Promise.all(
    photos.map(async (photo, index) => {
      if (photo.startsWith("file://")) {
        const filePath = `${providerId}/service_${Date.now()}_${index}.jpg`;
        return uploadImage("service-photos", filePath, photo);
      }

      return normalizeStoragePath("service-photos", photo);
    })
  );
}
