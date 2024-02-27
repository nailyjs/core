import { relative } from "path";
import { watch } from "chokidar";
import { ChildProcess, fork } from "child_process";
import { isEsm } from "../utils/isEsm";
import build from "../build/buildDev";

function getDevelopmentForkProcess() {
  return fork(isEsm() ? ".naily/dev/esm/bundle.mjs" : ".naily/dev/cjs/bundle.cjs", {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
    },
  });
}

function exit(process?: ChildProcess) {
  console.log();
  console.log("Exiting...");
  if (process) process.kill();

  const interval = setInterval(() => {
    if (process) {
      process.kill();
      clearInterval(interval);
    }
  });
}

let newProcess: ChildProcess | undefined;

export default function () {
  process.on("exit", () => {
    exit(newProcess);
  });
  newProcess = getDevelopmentForkProcess();
  watch(".", {
    ignored: ["**/node_modules/**", "**/.git/**", "**/.naily/**"],
  }).on("change", async (path) => {
    console.clear();
    console.log(`${relative(process.cwd(), path)} File changed`);
    await build(false);
    if (newProcess) {
      newProcess.kill();
      newProcess = getDevelopmentForkProcess();
    }
  });
}
