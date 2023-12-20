import { defineLanguage } from "../utils/manager";

export default defineLanguage(["zh", "zh_CN"], {
  projectName: "请输入项目名称:",
  projectNameFileOrFolderExists: "文件或文件夹已存在! 请输入其他名称, 我们不想覆盖任何东西!",
  git: "初始化git仓库?",
  packageManager: "请选择包管理器以安装依赖:",
  installMyself: "暂不安装依赖",
  template: "请选择模板:",
});
