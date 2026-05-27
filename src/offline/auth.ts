import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import { User } from "@/models/User";
import { cacheAuthUser, getCachedAuthUserByEmail } from "./store";
import { createLocalUuid } from "./ids";

type OfflineCredential = {
  email: string;
  userId: string;
  salt: string;
  verifier: string;
  updatedAt: string;
};

const KEY_PREFIX = "echo.offline.credentials.";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function getCredentialKey(email: string) {
  const emailHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalizeEmail(email)
  );

  return `${KEY_PREFIX}${emailHash.replace(/[^A-Za-z0-9._-]/g, "_")}`;
}

async function hashPassword(password: string, salt: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

export async function saveOfflineCredential(
  email: string,
  password: string,
  user: User
) {
  const normalizedEmail = normalizeEmail(email);
  const salt = createLocalUuid();
  const verifier = await hashPassword(password, salt);
  const credential: OfflineCredential = {
    email: normalizedEmail,
    userId: user.id,
    salt,
    verifier,
    updatedAt: new Date().toISOString(),
  };
  const credentialKey = await getCredentialKey(normalizedEmail);

  await SecureStore.setItemAsync(
    credentialKey,
    JSON.stringify(credential)
  );
  await cacheAuthUser(user, true);
}

export async function verifyOfflineCredential(
  email: string,
  password: string
) {
  const normalizedEmail = normalizeEmail(email);
  const credentialKey = await getCredentialKey(normalizedEmail);
  const credentialValue = await SecureStore.getItemAsync(
    credentialKey
  );

  if (!credentialValue) return null;

  const credential = JSON.parse(credentialValue) as OfflineCredential;
  const verifier = await hashPassword(password, credential.salt);

  if (verifier !== credential.verifier) return null;

  return getCachedAuthUserByEmail(normalizedEmail);
}
