import winston, { Logger } from 'winston'
import { DEVELOPMENT } from 'src/config/environments'

/**
 * RFC5424 syslog levels are prioritized from 0 to 7 (highest to lowest):
 *
 * emerg: 0
 * alert: 1
 * crit: 2
 * error: 3
 * warning: 4
 * notice: 5
 * info: 6 (development only)
 * debug: 7 (development only)
 *
 * @see https://github.com/winstonjs/winston#logging-levels
 * @see https://github.com/winstonjs/winston#creating-your-own-logger
 */
export function createLogger(level: string): Logger {
   const developmentFormat = winston.format.combine(
      winston.format.splat(),
      winston.format.colorize(),
      winston.format.align(),
      winston.format.simple(),
      winston.format.printf((info) => {
         // @see https://github.com/winstonjs/winston?tab=readme-ov-file#streams-objectmode-and-info-objects
         const splatSymbol = Symbol.for('splat') as any
         const splat = info[splatSymbol]

         // splat is the additional metadata passed to the logger
         return `${info.level}: ${(info.message as string).trim()} ${splat ? JSON.stringify(splat, null, 2) : ''}`
      })
   )

   const productionFormat = winston.format.json()

   const format = DEVELOPMENT ? developmentFormat : productionFormat

   return winston.createLogger({
      levels: winston.config.syslog.levels,
      level,
      transports: [
         new winston.transports.Console({
            format
         })
      ]
   })
}

const logger = createLogger(process.env.MAX_LOG_LEVEL ?? 'notice')

export default logger
