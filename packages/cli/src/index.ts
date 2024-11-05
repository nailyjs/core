import child_process from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { argv, exit, stderr, stdout } from 'node:process'
import { AbstractBootstrap } from '@nailyjs/ioc'
import { Command, program } from 'commander'
import git from 'gitly'
import ora from 'ora'
import prompts from 'prompts'
import { LogoWriter } from './write-logo'

export class CliBootstrap extends AbstractBootstrap {
  async runNewProject(): Promise<void> {
    const projectPath = await prompts({
      type: 'text',
      name: 'path',
      message: 'Where do you want to create the project?',
      initial: '.',
      validate: (value: string) => {
        if (value.length <= 0) return 'Path cannot be empty'
        if (!fs.existsSync(path.resolve(value))) return true
        if (fs.readdirSync(path.resolve(value)).length > 0)
          return 'Path already exists and is not empty. Please choose another path or remove it first.'
        return true
      },
      format: (value: string) => path.resolve(value),
    }).catch(() => exit(0))
    if (!projectPath.path) return exit(0)
    console.log('✔ Will creating project at:', projectPath.path)
    const template = await prompts({
      type: 'autocomplete',
      name: 'template',
      message: 'Select a template:',
      choices: [
        { title: 'backend-app', value: 'template-backend-app', description: 'Basic naily backend application' },
        { title: 'vitesse-naily', value: 'vitesse-naily', description: 'Antfu\'s Vitesse with Naily' },
      ],
    }).catch(() => exit(0))
    if (!template.template) return exit(0)
    console.log('✔ Selected template:', template.template)
    const packageManager = await prompts({
      type: 'select',
      name: 'packageManager',
      message: 'Select a package manager:',
      choices: [
        { title: 'npm', value: 'npm', description: 'Default package manager' },
        { title: 'yarn', value: 'yarn', description: 'Fast, reliable, and secure dependency management' },
        { title: 'pnpm', value: 'pnpm', description: 'Fast, disk space efficient package manager' },
        { title: 'bun', value: 'bun', description: 'Bun have a Node.js-compatible package manager.' },
        { title: 'Install at later', value: 'none', description: 'Install deps at later' },
      ],
    }).catch(() => exit(0))
    if (!packageManager.packageManager) return exit(0)
    console.log('✔ Selected package manager:', packageManager.packageManager)
    const spinner = ora('Creating project...').start()

    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    const [tarPath, realPath] = await ((typeof git === 'function' ? git : git.default) as typeof import('gitly').default)(`github:nailyjs/${template.template}.git`, projectPath.path, {
      backend: 'axios',
    })
    if (!tarPath || !realPath)
      return spinner.fail('Failed to create project, please try again.') as any
    spinner.succeed('Project created successfully.')

    if (packageManager.packageManager !== 'none') {
      spinner.text = `Installing dependencies using ${packageManager.packageManager}`
      console.log('\n')
      const child_process_exec = child_process.exec(packageManager.packageManager === 'yarn' ? 'FORCE_COLOR=1 yarn' : `FORCE_COLOR=1 ${packageManager.packageManager} install`, {
        cwd: projectPath.path,
      })
      child_process_exec.stdout?.pipe(stdout)
      child_process_exec.stderr?.pipe(stderr)
      child_process_exec.on('exit', () => {
        console.log('\n')
        spinner.succeed('Dependencies installed successfully.')
        exit(0)
      })
    }
  }

  setupCommander(): Command {
    program
      .name('naily')
      .version('0.0.1', '-v, --version', 'Output the current version')
      .description('Naily CLI')

    program.command('new')
      .alias('n')
      .description('Create a new naily project')
      .action(this.runNewProject.bind(this))

    return program
  }

  async run(): Promise<void> {
    await this.getPluginRunner().runBeforeRun()
    LogoWriter.getInstance(this).write(true)
    this.setupCommander().parse(argv)
  }
}
