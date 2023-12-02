import * as md5 from "md5";

export function generateToken(): string {
  return md5(Date.now().toString() + Math.random());
}
