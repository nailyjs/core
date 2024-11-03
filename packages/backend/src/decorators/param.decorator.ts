import type { Pipe } from './pipe.decorator'
import { Class } from '@nailyjs/ioc'
import { createRestControllerParamDecorator, CreateRestControllerParamDecoratorReturn } from '../factories/param-factory'
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

export const Params: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
  decorate: 'Params',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalParamsPipe)
  },
})

export const Query: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
  decorate: 'Query',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalQueryPipe)
  },
})

export const Header: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
  decorate: 'Header',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalHeaderPipe)
  },
})

export const Cookies: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
  decorate: 'Cookies',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalCookiesPipe)
  },
})

export const Req: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
  decorate: 'Req',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalReqPipe)
  },
})

export const Ip: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
  decorate: 'Ip',
  onDecorate(ctx) {
    ctx.unshiftPipe(InternalIpPipe)
  },
})

export const Session: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
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

export namespace Body {
  export const FormData: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
    decorate: 'BodyFormData',
    onDecorate(ctx) {
      ctx.unshiftPipe(InternalBodyFormDataPipe)
    },
  })

  export const Json: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
    decorate: 'BodyJson',
    onDecorate(ctx) {
      ctx.unshiftPipe(InternalBodyJsonPipe)
    },
  })

  export const Text: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
    decorate: 'BodyText',
    onDecorate(ctx) {
      ctx.unshiftPipe(InternalBodyTextPipe)
    },
  })

  export const ArrayBuffer: CreateRestControllerParamDecoratorReturn = createRestControllerParamDecorator({
    decorate: 'BodyArrayBuffer',
    onDecorate(ctx) {
      ctx.unshiftPipe(InternalBodyArrayBufferPipe)
    },
  })
}
