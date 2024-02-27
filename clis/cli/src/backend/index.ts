import { Command } from "commander";
import { logo } from "../common";
import { t } from "../common/i18n";
import buildLib from "./build/buildLib";
import buildApp from "./build/buildApp";
import buildDev from "./build/buildDev";
import dev from "./dev/dev";

console.clear();
console.log(logo);
const command = new Command().version("0.33.0", "-v -version", t("versionDescription")).description(t("description"));

command
  .command("build")
  .description(t("buildCommandDescription"))
  .option("-t --type [TYPE]", t("buildLibOptionDescription"), "app")
  .action(async (options) => {
    if (options.type === "lib") {
      await buildLib();
      return;
    }
    if (options.type === "app") {
      await buildApp();
      return;
    }
    throw new Error(t("buildCommandError"));
  });

command
  .command("dev")
  .description(t("devCommandDescription"))
  .action(async () => {
    await buildDev();
    dev();
  });
command.parse(process.argv);
