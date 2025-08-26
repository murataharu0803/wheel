import express, { Express, json } from 'express'
import { createServer } from 'node:http'
import serveStatic from 'serve-static'
import { Server } from 'socket.io'

import { readConfig, readTimer, updateTimer } from '@/api'
import { logger } from '@/logger'
import { WheelOption } from '@/types/WheelConfig'
import { R_360 } from '@/utils/svg'
import { fromUnitToSeconds } from '@/utils/time'

const app: Express = express()

app.use(json())
app.use(logger)
app.use(serveStatic('build'))

const httpServer = createServer(app)
const io = new Server(httpServer)
let wheelAngle = 0
let isSpinning = false
io.on('connection', async socket => {
  console.log('Connected.')
  const config = await readConfig()
  const timer = await readTimer()
  socket.emit('updateConfig', config)
  socket.emit('updateTimer', timer)
  socket.emit('spinAngleInit', wheelAngle)

  socket.on('disconnect', () => {
    console.log('Disconnected.')
  })

  socket.on('updateConfig', async msg => {
    console.log('[updateConfig]', msg)
    const config = await readConfig()
    const newConfig = { config, ...msg }
    io.emit('updateConfig', newConfig)
  })

  socket.on('pause', async() => {
    console.log('[pause]')
    const newTimer = await updateTimer(0, false)
    io.emit('updateTimer', newTimer)
  })

  socket.on('resume', async() => {
    console.log('[resume]')
    const newTimer = await updateTimer(0, true)
    io.emit('updateTimer', newTimer)
  })

  socket.on('updateTimer', async(amount = 0) => {
    console.log('[updateTimer]', amount)
    const newTimer = await updateTimer(Number(amount))
    io.emit('updateTimer', newTimer)
  })

  socket.on('reset', async() => {
    console.log('[reset]')
    const newTimer = await updateTimer(0, false, true)
    io.emit('updateTimer', newTimer)
  })

  socket.on('timeup', async() => {
    console.log('[timeup]')
    await updateTimer(0, false, true)
    io.emit('timeup')
  })

  socket.on('spinAngle', async angle => {
    console.log('[spinAngle]', angle)
    wheelAngle = angle
    io.emit('spinAngle', wheelAngle)
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
      console.error('找不到中獎選項')
      return
    }
    const targetValue = fromUnitToSeconds(targetOption.value, targetOption.unit)
    wheelAngle = targetAngle
    io.emit('spinAngle', targetAngle)

    setTimeout(async() => {
      const newTimer = await updateTimer(targetValue)
      io.emit('spin', targetOption)
      io.emit('updateTimer', newTimer)
      isSpinning = false
    }, spinDuration * 1000 + 500)
  })
})

export default httpServer
