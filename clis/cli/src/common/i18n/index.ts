import ZH from "./zh";
import EN from "./en";
import { I18n } from "./type";

export function t(key: keyof I18n): string {
  if (process.env.LANG && typeof process.env.LANG === "string" && process.env.LANG.includes("zh")) {
    return ZH[key];
  } else {
    return EN[key];
  }
}
