import { IPipeContext, Pipe } from '@nailyjs/backend'
import { UrlSearchParamsPipeService } from './url-search-params.pipe'

@Pipe()
export class ValidationPipe implements Pipe {
  constructor(private readonly urlSearchParamsPipeService: UrlSearchParamsPipeService) {}

  async transform(value: URLSearchParams, context: IPipeContext): Promise<any> {
    const decorate = context.getMetadata().getDecorate()

    if (decorate === 'Query')
      return await this.urlSearchParamsPipeService.transformUrlSearchParams(value, context)
  }
}
