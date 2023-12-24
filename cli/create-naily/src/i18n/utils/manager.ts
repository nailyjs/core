export interface I18n {
  projectName: string;
  projectNameFileOrFolderExists: string;
  projectNameTestFailed: string;
  git: string;
  packageManager: string;
  installMyself: string;
  template: string;
  done: string;
}

export const languages = new Map<string[], I18n>();
export function defineLanguage(includes: string[], i18n: I18n) {
  languages.set(includes, i18n);
  return i18n;
}
