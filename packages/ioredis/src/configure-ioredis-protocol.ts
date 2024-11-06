export const CustomIoRedis = '__naily_custom_ioredis__'
export interface CustomIoRedis {
  configure(ioRedisOptions: Naily.Configuration.NailyUserConfig['ioRedis']): Naily.Configuration.NailyUserConfig['ioRedis'] | Promise<Naily.Configuration.NailyUserConfig['ioRedis']>
}
