import { I18n } from "./type";

export default {
  description: "The Naily Project",
  versionDescription: "Get the version number",
  devCommandDescription: "Start run development server",
  buildCommandDescription: "Build a naily project",
  buildLibOptionDescription: "Build naily project in library mode",
  buildCommandError: "Unknown build type, please use `naily build --type lib` or `naily build --type app` to build your project.",
} satisfies I18n;
