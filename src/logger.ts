import type { NextFunction, Request, Response } from 'express'
import { DateTime } from 'luxon'

export const logger = async(req: Request, res: Response, next: NextFunction) => {
  const date = DateTime.now().setZone('UTC+8').toFormat('HH:mm:ss.SSS')
  const startTime = Date.now()
  const methodText = req.method.padEnd(8, '')
  const urlText = req.url || ''
  res.on('finish', () => {
    const responseTime = startTime ? Date.now() - startTime : null
    const timeText = `${responseTime}ms`
    const resFull = `${date} ${methodText} ${urlText} ${res.statusCode} ${timeText}`
    console.log(resFull)
  })
  next()
}
