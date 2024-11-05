import { IConfigureErrorHandlerContext } from './configure-error-handler-context'
import 'reflect-metadata'

export const InjectableWatermark = '__naily_injectable__'
export const InjectWatermark = '__naily_inject__'
export const FilterWatermark = '__naily_filter__'
export const PostConstructWatermark = '__naily_post_construct__'
export const CatchParamWatermark = '__naily_catch_param__'
export const ConfigureErrorHandler = '__naily_configure_error_handler__'
export interface ConfigureErrorHandler {
  configure(context: IConfigureErrorHandlerContext): void | Promise<void>
}
