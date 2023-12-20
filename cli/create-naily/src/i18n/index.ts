import CN from "./cn.lang";
import EN from "./en.lang";

export interface I18n {
  projectName: string;
  projectNameFileOrFolderExists: string;
  git: string;
  packageManager: string;
  installMyself: string;
  template: string;
}

export default function (select?: "zh" | "en"): I18n {
  if (!select) {
    const lang = process.env.LANG;
    if (lang && typeof lang === "string") {
      if (lang.includes("zh")) {
        select = "zh";
      } else {
        select = "en";
      }
    }
  }

  if (select === "zh") {
    return CN;
  } else {
    return EN;
  }
}
