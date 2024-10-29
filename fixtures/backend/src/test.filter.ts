import { Catch, Filter } from '@nailyjs/ioc'

@Filter()
export class TestFilter {
  @Catch()
  catch(error: unknown): void {
    console.log('catch error', error)
  }
}
