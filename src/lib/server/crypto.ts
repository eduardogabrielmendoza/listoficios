import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function getKey(encodedKey = process.env.CONTACT_ENCRYPTION_KEY) {
  if (!encodedKey) throw new Error("CONTACT_ENCRYPTION_KEY no está configurada");
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) throw new Error("CONTACT_ENCRYPTION_KEY debe contener 32 bytes en base64");
  return key;
}

export function encryptContact(value: string, encodedKey?: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(encodedKey), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext: Buffer.concat([encrypted, authTag]).toString("base64"), iv: iv.toString("base64") };
}

export function decryptContact(ciphertext: string, iv: string, encodedKey?: string) {
  const payload = Buffer.from(ciphertext, "base64");
  if (payload.length < 17) throw new Error("El contacto cifrado no es válido");
  const encrypted = payload.subarray(0, -16);
  const authTag = payload.subarray(-16);
  const decipher = createDecipheriv("aes-256-gcm", getKey(encodedKey), Buffer.from(iv, "base64"));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "Número protegido";
  return `${digits.slice(0, 3)} ••• ••${digits.slice(-2)}`;
}
