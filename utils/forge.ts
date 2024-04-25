import { existsSync, readFileSync, writeFileSync } from "fs";
import * as forge from "node-forge";
import { join } from "path";

if (!existsSync(join(process.cwd(), "config.rsa.json"))) generate();

const keys: { public: string; private: string } = JSON.parse(
  readFileSync(join(process.cwd(), "config.rsa.json"), "utf8"),
);

function encrypter(data: string, key?: string) {
  if (!key) key = keys.public;

  const max_length = 86;

  if (typeof data === "string" && data.length > max_length) {
    const datas: string[] = [];

    for (let i = 0; i < data.length; i += max_length) {
      const dt = data.slice(i, i + max_length);
      const enc = encrypter(dt, key);
      datas.push(enc as string);
    }

    return datas;
  }

  const publicKeyObj = forge.pki.publicKeyFromPem(key);
  const encrypted = publicKeyObj.encrypt(data);
  return forge.util.encode64(encrypted);
}

function decrypter(data: string | string[], key?: string): string {
  if (!key) key = keys.private;

  if (Array.isArray(data)) {
    let datas = "";
    for (const dt of data) datas += decrypter(dt, key);
    return datas;
  }

  const privateKeyObj = forge.pki.privateKeyFromPem(key);
  const decrypted = privateKeyObj.decrypt(forge.util.decode64(data));

  return decrypted;
}

function generate() {
  const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const publicKey = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);

  writeFileSync(
    join(process.cwd(), "config.rsa.json"),
    JSON.stringify({ public: publicKey, private: privateKey }),
  );

  writeFileSync(join(process.cwd(), "keys/public.pem"), publicKey);
  writeFileSync(join(process.cwd(), "keys/private.pem"), privateKey);

  return { public: publicKey, private: privateKey };
}

export default { encrypter, decrypter, generate, keys };
