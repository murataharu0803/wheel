/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFunction, Request, Response } from 'express'
import { DateTime } from 'luxon'

const getDateText = () => DateTime.now().setZone('UTC+8').toFormat('HH:mm:ss.SSS')

const customLogger = (level: 'log' | 'info' | 'warn' | 'error') =>
  (...messages: any[]) => console[level](getDateText(), ...messages)

export const customConsole = {
  log: customLogger('log'),
  info: customLogger('info'),
  warn: customLogger('warn'),
  error: customLogger('error'),
}

export const logger = async(req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  const methodText = req.method.padEnd(8, '')
  const urlText = req.url || ''
  res.on('finish', () => {
    const responseTime = startTime ? Date.now() - startTime : null
    const timeText = `${responseTime}ms`
    const resFull = `${methodText} ${urlText} ${res.statusCode} ${timeText}`
    customConsole.log(resFull)
  })
  next()
}

export default customConsole
