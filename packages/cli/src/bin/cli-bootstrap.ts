import { argv } from 'node:process'
import { AbstractBootstrap } from '@nailyjs/ioc'
import { Command, program } from 'commander'
import { BuildStarter } from '../commands/build.service'
import { DevelopmentStarter } from '../commands/development.service'
import { NewProjectCreator } from '../commands/new-project.service'
import { LogoWriter } from '../write-logo'

export class CliBootstrap extends AbstractBootstrap {
  setupCommander(): Command {
    program
      .name('naily')
      .version('0.0.1', '-v, --version', 'Output the current version')
      .description('Naily CLI')

    program.command('new')
      .alias('n')
      .description('Create a new naily project')
      .action(async () => await NewProjectCreator.getInstance(this).setup())

    program.command('dev')
      .alias('d')
      .description('Start the development server')
      .action(async () => await DevelopmentStarter.getInstance(this).setup())

    program.command('build')
      .alias('b')
      .description('Build the project')
      .action(async () => await BuildStarter.getInstance(this).setup())

    return program
  }

  async run(): Promise<void> {
    await this.getPluginRunner().runBeforeRun()
    LogoWriter.getInstance(this).write(true)
    this.setupCommander().parse(argv)
  }
}
