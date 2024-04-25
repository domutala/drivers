import * as jwt from "jsonwebtoken";
import forge from "./forge";

export function sign(value: any, options: jwt.SignOptions = {}) {
  const token = jwt.sign(value, forge.keys.private, {
    ...options,
    algorithm: "RS256",
  });
  return token;
}

export function verify(token: string) {
  const decode = jwt.verify(token, forge.keys.private);
  return decode;
}

export default { sign, verify };
