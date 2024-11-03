import { Injectable } from '@nailyjs/ioc'
import { NodeBootstrap } from '../adapters/node'
import { Body, Cookies, Header, Ip, Params, Post, Query, Req, RestController, Session } from '../src'

@Injectable()
export class TestService {
  getHello(): string {
    return 'Hello World!'
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
  ): Promise<any> {
    console.log({ params, body, id, query, headers, cookies, req, ip, ips, session })
    return this.testService.getHello()
  }
}

new NodeBootstrap().run(3000).then(() => {
  console.log('Server started at http://localhost:3000')
})
