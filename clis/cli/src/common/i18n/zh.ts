import { I18n } from "./type";

export default {
  description: "The Naily Project",
  versionDescription: "输出CLI版本信息",
  devCommandDescription: "启动开发服务器",
  buildCommandDescription: "编译Naily项目",
  buildLibOptionDescription: "库模式编译Naily模块",
  buildCommandError: "未知编译类型，请使用 `naily build --type lib` 或 `naily build --type app` 来编译你的项目。",
} satisfies I18n;
