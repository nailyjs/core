import type { CallType, ErrorHandlerContextType, IPostConstructCatchContext } from './types'
import type { ClassWrapper } from './wrappers/class-wrapper'

export class PostConstructCatchContext implements IPostConstructCatchContext {
  constructor(
    private readonly classWrapper: ClassWrapper,
    private readonly callType: CallType,
  ) {}

  contextType: keyof ErrorHandlerContextType = 'PostConstructCatchContext'

  getClassWrapper(): ClassWrapper {
    return this.classWrapper
  }

  getCallType(): CallType {
    return this.callType
  }
}
