import { Container } from '@nailyjs/ioc'
import { Rule, ValidateService } from '../src'

describe('validateService', () => {
  it('should validate service', () => {
    class NestTestObject {
      @Rule()
      prop5: string

      @Rule()
      prop6: number
    }

    class Test {
      @Rule()
      prop1: string

      @Rule()
      prop2: number

      @Rule()
      prop3: boolean

      @Rule()
      nest: NestTestObject
    }

    const validateService = ValidateService.getInstance(new Container())
    validateService.parse(Test, {
      prop1: 'test',
      prop2: 1,
      prop3: true,
      nest: {
        prop5: 'test',
        prop6: 1,
      },
    } as InstanceType<typeof Test>)
  })
})
