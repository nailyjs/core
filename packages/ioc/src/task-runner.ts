export class TaskRunner {
  async runTasksSequentially(tasks: Array<(...args: any[]) => any>): Promise<void> {
    for (const task of tasks)
      await task()
  }

  async runTasksInParallel(tasks: Array<(...args: any[]) => any>): Promise<void> {
    const taskPromises = tasks.map(async task => await task())
    await Promise.allSettled(taskPromises)
  }
}
