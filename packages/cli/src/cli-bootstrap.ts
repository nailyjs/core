import { argv } from 'node:process'
import { AbstractBootstrap } from '@nailyjs/ioc'
import { Command, program } from 'commander'
import { DevelopmentStarter } from './development.service'
import { NewProjectCreator } from './new-project'
import { ProductionStarter } from './production.service'
import { LogoWriter } from './write-logo'

export class CliBootstrap extends AbstractBootstrap {
  private readonly _newProjectCreator: NewProjectCreator = new NewProjectCreator()
  private readonly _developmentStarter = DevelopmentStarter.getInstance(this)
  private readonly _productionStarter = ProductionStarter.getInstance(this)

  setupCommander(): Command {
    program
      .name('naily')
      .version('0.0.1', '-v, --version', 'Output the current version')
      .description('Naily CLI')

    program.command('new')
      .alias('n')
      .description('Create a new naily project')
      .action(this._newProjectCreator.setup.bind(this._newProjectCreator))

    program.command('dev')
      .alias('d')
      .description('Start the development server')
      .action(this._developmentStarter.setup.bind(this._developmentStarter))

    program.command('build')
      .alias('b')
      .description('Build the project')
      .action(this._productionStarter.setup.bind(this._productionStarter))

    return program
  }

  async run(): Promise<void> {
    await this.getPluginRunner().runBeforeRun()
    LogoWriter.getInstance(this).write(true)
    this.setupCommander().parse(argv)
  }
}
