import { IPipeContext } from '../contexts/pipe-context'
import { Pipe } from '../decorators'
import { IHandlerRequest } from '../handler-request'

@Pipe()
export class InternalIpPipe implements Pipe {
  private readonly headerKeys = [
    'X-Forwarded-For',
    'X-Real-IP',
    'X-Client-IP',
    'CF-Connecting-IP',
    'Fastly-Client-IP',
    'X-Cluster-Client-IP',
    'X-Forwarded',
    'Forwarded-For',
    'Forwarded',
    'appengine-user-ip',
    'true-client-ip',
    'cf-psuedo-ipv4',
  ]

  private getIp(request: IHandlerRequest): string | undefined {
    return this.getMultipleHeaderIps(request, this.headerKeys)[0] || ''
  }

  private getSingleHeaderIps(request: IHandlerRequest, headerKey: string): string[] {
    return ((request.headers.get(headerKey) || '') as string)
      .split(',')
      .map(ip => ip.trim())
      .filter(Boolean)
  }

  private getMultipleHeaderIps(request: IHandlerRequest, headerKeys: string[]): string[] {
    let ips: string[] = []
    for (const headerKey of headerKeys) {
      const ip = this.getSingleHeaderIps(request, headerKey)
      if (ip.length) ips = ips.concat(ip)
    }
    return ips
  }

  transform(_value: undefined, context: IPipeContext): string | string[] {
    const request = context.getRequest()
    const metadata = context.getMetadata()
    const parameterIndex = metadata.getParameterIndex()
    const designParamTypes = context.getHandler().getDesignParamTypes()
    const designType = designParamTypes[parameterIndex]

    const singleIp: string = this.getIp(request)
    const ipArray: string[] = this.getMultipleHeaderIps(request, this.headerKeys)

    if (designType === Array) return ipArray
    else return singleIp
  }
}
