import { Configuration } from '@nailyjs/ioc'
import k from 'kleur'
import * as winston from 'winston'

export const CustomWinston = '__naily_custom_winston_logger__'
export interface CustomWinston {
  configure(winstonOptions: Naily.Configuration.NailyUserConfig['logger']['winston']): Naily.Configuration.NailyUserConfig['logger']['winston'] | Promise<Naily.Configuration.NailyUserConfig['logger']['winston']>
}

export interface DefaultFormatterOptions {
  timestamp?: boolean
  ms?: boolean
  switchMessageLevelFactory?: (level: string) => k.Color
  label?: string
}

@Configuration(CustomWinston)
export class CustomWinstonImpl implements CustomWinston {
  static switchMessageLevel(level: string): k.Color {
    switch (level) {
      case 'error':
        return k.red
      case 'warn':
        return k.yellow
      case 'info':
        return k.blue
      case 'verbose':
        return k.cyan
      case 'debug':
        return k.magenta
      case 'silly':
        return k.green
      default:
        return ((msg: string | number) => msg) as k.Color
    }
  }

  static getDefaultFormatter(options: DefaultFormatterOptions = {}): winston.Logform.Format {
    const formatters: winston.Logform.Format[] = [
      winston.format.align(),
      winston.format.label({
        label: (options || {}).label || 'Naily',
      }),
      winston.format.printf((info) => {
        const color = options && options.switchMessageLevelFactory
          ? options.switchMessageLevelFactory
          : CustomWinstonImpl.switchMessageLevel(info.level)

        return `${k.green(`[${info.label}]`)} ${(new Date(info.timestamp).toLocaleString())} ${color(`[${info.level.charAt(0).toLocaleUpperCase()}]`)} ${k.dim(info.ms)} ${color(info.message)}`
      }),
    ]
    if (options && options.timestamp !== false) formatters.unshift(winston.format.timestamp())
    if (options && options.ms !== false) formatters.unshift(winston.format.ms())
    return winston.format.combine(...formatters)
  }

  static getDefaultWinstonOptions(): Naily.Configuration.NailyUserConfig['logger']['winston'] {
    return {
      level: 'silly',
      transports: [
        new winston.transports.Console(),
      ],
      format: CustomWinstonImpl.getDefaultFormatter(),
    }
  }

  configure(winstonOptions: Naily.Configuration.NailyUserConfig['logger']['winston']): Naily.Configuration.NailyUserConfig['logger']['winston'] | Promise<Naily.Configuration.NailyUserConfig['logger']['winston']> {
    const defaultOptions = CustomWinstonImpl.getDefaultWinstonOptions()

    if (Array.isArray(winstonOptions))
      return winstonOptions
    return {
      ...defaultOptions,
      ...(winstonOptions || {}),
    }
  }
}
