import type { UserInputConfig } from 'c12'

export const Configuration = '__naily_config_custom_configuration__'
export interface Configuration {
  configure(defaultConfiguration: UserInputConfig): UserInputConfig | Promise<UserInputConfig>
}
