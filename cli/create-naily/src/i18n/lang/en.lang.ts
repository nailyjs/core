import { defineLanguage } from "../utils/manager";

export default defineLanguage(["en"], {
  projectName: "Please enter the project name:",
  projectNameFileOrFolderExists: "The file or folder already exists! Please enter another name, we don't want to overwrite anything!",
  projectNameTestFailed: "The project name cannot have any special characters except underscores!",
  git: "Initialize a git repository?",
  packageManager: "Please select a package manager to install dependencies:",
  installMyself: "I will install dependencies myself",
  template: "Please select a template:",
  done: "Done!",
});
