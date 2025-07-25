import { LoggerService, LogLevel } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import * as dayjs from 'dayjs';
import * as chalk from 'chalk';

const chalkColors = {
  info: chalk.green,
  error: chalk.red,
  warn: chalk.yellow,
  debug: chalk.blue,
  verbose: chalk.cyan,
  fatal: chalk.magenta,
  silly: chalk.gray,
} as const;


export class MyLogger implements LoggerService {
  private logger: Logger;
  constructor(context?: string) {
    this.logger = createLogger({
      level: 'debug',
      transports: [
        new transports.Console({
          format: format.combine(
            format.timestamp({
              format: () => dayjs().format('DD/MM/YYYY HH:mm:ss'),
            }),
            format.printf((info) => {
              const strApp = chalk.green('[Nest]');
              const strContext = chalk.yellow(`[${info.context || context}]`);
              const strPid = chalk.green(`${process.pid}`);
              const strLevel = chalkColors[info.level](info.level.toUpperCase());
              return `${strApp} ${strPid} - ${info.timestamp} ${strLevel} ${strContext} ${info.message}`;
            }),
          ),
        }),
        new transports.File({
          format: format.combine(
            format.timestamp({
              format: () => dayjs().format('DD/MM/YYYY HH:mm:ss'),
            }),
            format.json(),
          ),
          dirname: 'logs',
          filename: 'application-dev.log',
          maxsize: 1024 * 1024 * 5,
        }),
      ],
    });
  }

  private getTime() {
    return dayjs(Date.now()).format('DD/MM/YYYY HH:mm:ss');
  }

  log(message: string, context?: string) {
    this.logger.log('info', message, { context, time: this.getTime() });
  }

  error(message: string, context?: string) {
    this.logger.log('error', message, { context, time: this.getTime() });
  }

  warn(message: string, context?: string) {
    this.logger.log('warn', message, { context, time: this.getTime() });
  }

  debug?(message: string, context?: string) {
    this.logger.log('debug', message, { context, time: this.getTime() });
  }

  verbose?(message: string, context?: string) {
    this.logger.log('verbose', message, { context, time: this.getTime() });
  }

  fatal?(message: string, context?: string) {
    this.logger.log('fatal', message, { context, time: this.getTime() });
  }

  setLogLevels?(levels: LogLevel[]) {}
}
