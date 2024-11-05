import { Filter, Injectable, PostConstruct } from '@nailyjs/ioc'
import { NodeBootstrap } from '../adapters/node'
import { Body, Cookies, Header, Ip, Params, Post, Query, Req, RestController, type RestErrorHandler, RestFilterContext, Session } from '../src'

@Filter(Error)
export class TestFilter implements RestErrorHandler {
  catch(_error: any, ctx: RestFilterContext): void {
    if (ctx.contextType !== 'RestFilterContext') return
    ctx.sendResponse(new Response('Error666', { status: 500 }))
  }
}

@Injectable()
export class TestService {
  getHello(): string {
    throw new Error('Method not implemented.')
  }

  @PostConstruct()
  initConstruct(): void {
    throw new Error('Method not implemented.')
  }
}

@RestController()
export class TestController {
  constructor(private testService: TestService) {}

  @Post('/2/:id')
  public async test(
    @Params() params: Record<string, string>,
    @Body('jsonrpc') body: any,
    @Body('id') id: any,
    @Query() query: URLSearchParams,
    @Header() headers: Headers,
    @Cookies() cookies: Record<string, string>,
    @Req() req: Request,
    @Ip() ip: string,
    @Ip() ips: string[],
    @Session() session: any,
  ): Promise<string> {
    console.log({ params, body, id, query, headers, cookies, req, ip, ips, session })
    return this.testService.getHello()
  }
}

new NodeBootstrap().run(3000).then(() => {
  console.log('Server started at http://localhost:3000')
})
