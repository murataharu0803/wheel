import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'

import defaultConfig from '@/defaultConfig'
import TimerData from '@/types/TimerData'
import WheelConfig from '@/types/WheelConfig'

export const writeConfig = async(config: WheelConfig) =>
  writeFile('./config.json', JSON.stringify(config, null, 2))

export const readConfig = async(): Promise<WheelConfig> => {
  if (existsSync('./config.json')) {
    const configData = await readFile('./config.json', 'utf-8')
    return JSON.parse(configData)
  } else {
    await writeConfig(defaultConfig)
    return defaultConfig
  }
}

const writeTimer = async(timer: TimerData) =>
  writeFile('./timer.json', JSON.stringify(timer, null, 2))

export const readTimer = async(): Promise<TimerData> => {
  if (existsSync('./timer.json')) {
    const timerData = await readFile('./timer.json', 'utf-8')
    return JSON.parse(timerData)
  } else {
    const defaultTimer = { durationLeft: 0, isRunning: false, timestamp: Date.now() }
    await writeTimer(defaultTimer)
    return defaultTimer
  }
}

export const updateTimer = async(amount = 0, active?: boolean, reset = false) => {
  const now = Date.now()
  const timer = await readTimer()
  const passed = timer.isRunning ? (now - timer.timestamp) / 1000 : 0
  const newTimer: TimerData = {
    timestamp: now,
    durationLeft: reset ? amount : timer.durationLeft - passed + amount,
    isRunning: active === undefined ? timer.isRunning : active,
  }
  if (newTimer.durationLeft <= 0) {
    newTimer.durationLeft = 0
    newTimer.isRunning = false
  }
  await writeTimer(newTimer)
  return newTimer
}
