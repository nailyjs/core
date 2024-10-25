import type { InjectOptions } from '../decorators'
import type { InjectableWrapper } from '../injectable-wrapper'

export const MarkedInjectable = new Set<InjectableWrapper>()
export const MarkedInject = new Set<Partial<InjectOptions>>()
