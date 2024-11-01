export class TaskRunner {
  async runTasksSequentially(tasks: Array<() => any>): Promise<void> {
    for (const task of tasks) {
      try {
        await task()
      }
      catch (error) {
        return error as any
      }
    }
  }

  async runTasksInParallel(tasks: Array<() => any>): Promise<void> {
    const taskPromises = tasks.map(async (task) => {
      try {
        await task()
      }
      catch (error) {
        return error
      }
    })

    await Promise.allSettled(taskPromises)
  }
}
