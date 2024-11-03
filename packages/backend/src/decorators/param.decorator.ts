import type { Pipe } from './pipe.decorator'
import { Class } from '@nailyjs/ioc'
import { createRestControllerParamDecorator } from '../factories/param-factory'
import { InternalCookiesPipe } from '../pipes'
import { InternalBodyPipe } from '../pipes/body.pipe'
import { InternalBodyArrayBufferPipe } from '../pipes/body-arrayBuffer.pipe'
import { InternalBodyFormDataPipe } from '../pipes/body-formData.pipe'
import { InternalBodyJsonPipe } from '../pipes/body-json.pipe'
import { InternalBodyTextPipe } from '../pipes/body-text.pipe'
import { InternalHeaderPipe } from '../pipes/header.pipe'
import { InternalIpPipe } from '../pipes/ip.pipe'
import { InternalParamsPipe } from '../pipes/params.pipe'
import { InternalQueryPipe } from '../pipes/query.pipe'
import { InternalReqPipe } from '../pipes/req.pipe'
import { InternalSessionPipe } from '../pipes/session.pipe'

export const Params = createRestControllerParamDecorator({
  decorate: 'Params',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalParamsPipe)
  },
})

export const Query = createRestControllerParamDecorator({
  decorate: 'Query',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalQueryPipe)
  },
})

export const Header = createRestControllerParamDecorator({
  decorate: 'Header',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalHeaderPipe)
  },
})

export const Cookies = createRestControllerParamDecorator({
  decorate: 'Cookies',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalCookiesPipe)
  },
})

export const Req = createRestControllerParamDecorator({
  decorate: 'Req',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalReqPipe)
  },
})

export const Ip = createRestControllerParamDecorator({
  decorate: 'Ip',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalIpPipe)
  },
})

export const Session = createRestControllerParamDecorator({
  decorate: 'Session',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalSessionPipe)
  },
})

export function Body(infer: string, ...pipes: Class<Pipe>[]): ParameterDecorator
export function Body(...pipes: Class<Pipe>[]): ParameterDecorator
export function Body(...args: any[]): ParameterDecorator {
  return createRestControllerParamDecorator({
    decorate: 'Body',
    onDecorate(ctx) {
      ctx.unshiftPipe(InternalBodyPipe)
    },
  })(...args)
}

Body.FormData = createRestControllerParamDecorator({
  decorate: 'BodyFormData',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalBodyFormDataPipe)
  },
})

Body.Json = createRestControllerParamDecorator({
  decorate: 'BodyJson',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalBodyJsonPipe)
  },
})

Body.Text = createRestControllerParamDecorator({
  decorate: 'BodyText',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalBodyTextPipe)
  },
})

Body.ArrayBuffer = createRestControllerParamDecorator({
  decorate: 'BodyArrayBuffer',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalBodyArrayBufferPipe)
  },
})
