---
order: 2
title: Create a project
group:
  title: Start
---

# Create a project

This article will guide you to create a Node.js project with only Naily core.

Open cmd or powershell on Windows, or terminal on MacOS, let's get started~

Create an empty folder and cd to it, then run:

```bash
pnpm init
```

to create a package.json file. We recommend using `pnpm` to install and manage dependencies.

Then create a src folder under the directory, and create a `main.ts` file under the src folder. Our application will start executing with this file as the entry point.

Then create a `tsconfig.json` file and a naily.yaml file in the root directory of the folder.

- naily.yaml is the configuration file of the entire Naily project, which must exist (even if the content is empty);
- tsconfig.json is the configuration file of TypeScript, the file content can refer to the following example:

```json
{
  "compilerOptions": {
    // Experimental decorator options must be turned on
    "experimentalDecorators": true,
    // Reflection Metadata type, must be turned on
    "emitDecoratorMetadata": true,
    // Define the file output directory
    "outDir": "dist",
    // Note: target must be ES2021 or below, ES2022 and above cannot use Naily
    "target": "ES2021",
    "module": "CommonJS",
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

## Install dependencies

```bash
# TypeScript, must be installed
pnpm install -D typescript
# Node.js type package, installed to have intelligent prompts
pnpm install -D @types/node
# Naily core package, must be installed
pnpm install @nailyjs/core
# Naily CLI package, installed to use the `naily` command
pnpm install -D @nailyjs/cli
```

After installation, you can modify the `scripts` field of `package.json` as follows:

```json
{
  "scripts": {
    "start": "naily build && node .naily/cjs/main.js"
  }
}
```

Then we create a `naily.yml` file in the root directory, the content is as follows:

```yml
naily:
  cli:
    src: src/
    output: .naily
```

We will start writing our code with src/main.ts as the entry point. At runtime, just execute:

```bash
pnpm start
```

All done!
