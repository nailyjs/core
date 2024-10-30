import type { UserInputConfig } from '@nailyjs/config'
import { Configuration } from '@nailyjs/config'
import { Service } from '@nailyjs/ioc'

@Service(Configuration)
export class CustomConfigurationService implements Configuration {
  configure(defaultConfiguration: UserInputConfig): UserInputConfig | Promise<UserInputConfig> {
    return defaultConfiguration
  }
}
