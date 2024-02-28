import EN from "./lang";
import { I18n, languages } from "./utils/manager";

export default function I18n(): I18n {
  for (const [includes, i18n] of languages) {
    if (includes.some((include) => process.env.LANG?.includes(include))) {
      return i18n;
    }
  }
  return EN;
}
