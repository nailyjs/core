import { Filter } from '../decorators/filter.decorator'
import { IPostConstructCatchContext } from '../post-construct-catch-context'
import { PostConstructErrorHandler } from '../types'

@Filter()
export class InternalPostConstructFilter implements PostConstructErrorHandler {
  catch(error: any, _context: IPostConstructCatchContext): void {
    throw error
  }
}
