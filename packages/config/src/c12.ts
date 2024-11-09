import { Service } from '@nailyjs/ioc'
import { loadConfig } from 'c12'

export const C12Service = '__naily_c12_service__'
export interface C12Service {
  getConfiguration(): ReturnType<typeof loadConfig>
}

@Service(C12Service)
export class C12ServiceImpl implements C12Service {
  async getConfiguration(): ReturnType<typeof loadConfig> {
    return loadConfig({
      name: 'naily',
      packageJson: true,
    })
  }
}
