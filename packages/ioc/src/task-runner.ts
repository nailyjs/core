import { ErrorHandlerFactory } from './error-handler-factory'
import { PostConstructCatchContext } from './post-construct-catch-context'
import { type ClassWrapper, SinglePostConstructMetadataWrapper } from './wrappers'

export class TaskRunner {
  async runTasksSequentially(tasks: Array<(...args: any[]) => any>): Promise<void> {
    for (const task of tasks)
      await task()
  }

  async runTasksInParallel(tasks: Array<(...args: any[]) => any>): Promise<void> {
    await Promise.all(tasks.map(async (task) => {
      return await task()
    }))
  }

  runPostConstruct(tasks: SinglePostConstructMetadataWrapper[], classWrapper: ClassWrapper, instance: Record<string | symbol, any>): void {
    // 串行任务
    const sequentiallyTasks = tasks
      .filter(task => task.isSeries())
      .filter(task => typeof (instance as Record<string | symbol, any>)[task.getPropertyKey()] === 'function')
      .map(task => (instance as Record<string | symbol, any>)[task.getPropertyKey()])
      .map(task => task.bind(instance))
    this.runTasksSequentially(sequentiallyTasks)
      .catch(error => new ErrorHandlerFactory().catch(error, new PostConstructCatchContext(classWrapper, 'series')))

    // 并行任务
    const parallelTasks = tasks
      .filter(task => task.isParallel())
      .filter(task => typeof (instance as Record<string | symbol, any>)[task.getPropertyKey()] === 'function')
      .map(task => (instance as Record<string | symbol, any>)[task.getPropertyKey()])
      .map(task => task.bind(instance))
    this.runTasksInParallel(parallelTasks)
      .catch(error => new ErrorHandlerFactory().catch(error, new PostConstructCatchContext(classWrapper, 'parallel')))
  }
}
