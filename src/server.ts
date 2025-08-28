/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Express, json } from 'express'
import { createServer } from 'node:http'
import serveStatic from 'serve-static'
import { Server, Socket } from 'socket.io'

import { readConfig, readTimer, updateTimer, writeConfig } from '@/api'
import console, { logger } from '@/logger'
import { R_360 } from '@/utils/svg'
import { fromUnitToSeconds } from '@/utils/time'

import WheelConfig, { WheelOption } from '@/types/WheelConfig'

const app: Express = express()

app.use(json())
app.use(logger)
app.use(serveStatic('build'))

const emit = (
  socket: Socket | Server,
  event: string,
  ...data: any[]
) => {
  const dataText = data.map(d =>
    d instanceof Object ? JSON.stringify(d) : String(d),
  )
  console.log(`<${event}>`, ...dataText)
  socket.emit(event, ...data)
}

const httpServer = createServer(app)
const io = new Server(httpServer)
let wheelAngle = 0
let isSpinning = false
io.on('connection', async socket => {
  console.log('Connected.')
  const config = await readConfig()
  const timer = await readTimer()
  emit(socket, 'updateConfig', config)
  emit(socket, 'updateTimer', timer)
  emit(socket, 'spinAngleInit', wheelAngle)

  socket.on('disconnect', () => {
    console.log('Disconnected.')
  })

  socket.on('updateConfig', async(cfg: WheelConfig) => {
    console.log('[updateConfig]', JSON.stringify(cfg))
    const config = await readConfig()
    const newConfig: WheelConfig = { ...config, ...cfg }
    await writeConfig(newConfig)
    emit(io, 'updateConfig', newConfig)
  })

  socket.on('pause', async() => {
    console.log('[pause]')
    const newTimer = await updateTimer(0, false)
    emit(io, 'updateTimer', newTimer)
  })

  socket.on('resume', async() => {
    console.log('[resume]')
    const newTimer = await updateTimer(0, true)
    emit(io, 'updateTimer', newTimer)
  })

  socket.on('updateTimer', async(amount = 0) => {
    console.log('[updateTimer]', amount)
    const newTimer = await updateTimer(Number(amount))
    emit(io, 'updateTimer', newTimer)
  })

  socket.on('reset', async() => {
    console.log('[reset]')
    const newTimer = await updateTimer(0, false, true)
    emit(io, 'updateTimer', newTimer)
  })

  socket.on('timeup', async() => {
    console.log('[timeup]')
    await updateTimer(0, false, true)
    emit(io, 'timeup')
  })

  socket.on('spin', async() => {
    console.log('[spin]')
    if (isSpinning) return
    isSpinning = true
    const {
      spinDuration,
      indicatorPosition,
      options,
    } = await readConfig()

    const totalWeight = options.reduce((acc, o) => acc + o.weight, 0)
    const sectorOptions: (WheelOption & {
      startAngle: number
      endAngle: number
    })[] = []
    let currentAngle = 0
    for (const o of options) {
      const angle = (o.weight / totalWeight) * R_360
      sectorOptions.push({
        ...o,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      })
      currentAngle += angle
    }

    const basicCycle = spinDuration * 4
    const targetCycle = basicCycle + Math.random()
    const targetAngle = wheelAngle + targetCycle
    const angle = 1 - (targetAngle - indicatorPosition / 360) % 1

    const targetOption = sectorOptions.find(o => {
      const start = (o.startAngle / R_360) % 1
      const end = (o.endAngle / R_360) % 1
      if (end > start) return start <= angle && end > angle
      else return start <= angle || end > angle
    })
    if (!targetOption) {
      console.error('Cannot find target option.')
      return
    }
    const targetValue = fromUnitToSeconds(targetOption.value, targetOption.unit)
    wheelAngle = targetAngle
    emit(io, 'spinAngle', targetAngle)

    setTimeout(async() => {
      const newTimer = await updateTimer(targetValue)
      emit(io, 'spin', targetOption)
      emit(io, 'updateTimer', newTimer)
      isSpinning = false
    }, spinDuration * 1000 + 500)
  })

  socket.on('spinTest', async duration => {
    console.log('[spinTest]')
    const targetAngle = wheelAngle + duration * 4
    wheelAngle = targetAngle
    emit(io, 'spinTest', targetAngle)
  })
})

export default httpServer
