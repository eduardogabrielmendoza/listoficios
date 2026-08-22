import { describe, expect, it } from "vitest";
import { decryptContact, encryptContact, hashIdentifier, maskPhone } from "@/lib/server/crypto";

const testKey = Buffer.alloc(32, 7).toString("base64");

describe("protección de datos de contacto", () => {
  it("cifra y descifra un teléfono con AES-GCM", () => {
    const encrypted = encryptContact("5493815550101", testKey);
    expect(encrypted.ciphertext).not.toContain("5493815550101");
    expect(decryptContact(encrypted.ciphertext, encrypted.iv, testKey)).toBe("5493815550101");
  });

  it("rechaza una clave con longitud insegura", () => {
    expect(() => encryptContact("1234", Buffer.from("corta").toString("base64"))).toThrow(/32 bytes/);
  });

  it("produce hashes estables y vistas parciales", () => {
    expect(hashIdentifier("visitante")).toBe(hashIdentifier("visitante"));
    expect(maskPhone("5493815550101")).toBe("549 ••• ••01");
  });
});
