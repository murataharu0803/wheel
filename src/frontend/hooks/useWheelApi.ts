/* eslint-disable no-unused-vars */

import TimerData from '@/types/TimerData'
import WheelConfig, { WheelOption } from '@/types/WheelConfig'
import { useCallback, useState } from 'react'

interface ApiHook {
  // Config operations
  loadConfig: () => Promise<WheelConfig | null>
  saveConfig: (config: WheelConfig) => Promise<{ success: boolean } | null>

  // Timer operations
  loadTimer: () => Promise<TimerData | null>
  saveTimer: (timerData: TimerData) => Promise<{ success: boolean } | null>

  // Wheel operations
  spinWheel: (selectedOption: WheelOption, timerData: TimerData) => Promise<TimerData | null>

  // Loading states
  configLoading: boolean
  timerLoading: boolean
  spinning: boolean
}

export const useWheelApi = (): ApiHook => {
  const [configLoading, setConfigLoading] = useState(false)
  const [timerLoading, setTimerLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)

  const api = <U = { success: boolean }, T = undefined>(
    path: string,
    method: string,
    setLoading: (loading: boolean) => void,
  ) =>
    async(body?: T): Promise<U | null> => {
      setLoading(true)
      try {
        const bodyAttr = body ? {
          body: JSON.stringify(body),
        } : {}
        const response = await fetch('/api/' + path, {
          method,
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache',
          ...bodyAttr,
        })
        if (!response.ok) throw new Error(response.statusText)
        const data: U = await response.json()
        setLoading(false)
        return data
      } catch(error) {
        console.error('Failed to', method, path, ':', error)
        setLoading(false)
        return null
      }
    }

  const loadConfig = useCallback(() => api<WheelConfig>('config', 'GET', setConfigLoading)(), [])

  const saveConfig = useCallback(
    (config: WheelConfig) =>
      api<{ success: boolean }, WheelConfig>('config', 'PUT', setConfigLoading)(config),
    [],
  )

  const loadTimer = useCallback(() => api<TimerData>('timer', 'GET', setTimerLoading)(), [])

  const saveTimer = useCallback(
    (timer: TimerData) =>
      api<{ success: boolean }, TimerData>('timer', 'PUT', setTimerLoading)(timer),
    [],
  )

  const spinWheel = useCallback(
    (selectedOption: WheelOption, timerData: TimerData) =>
      api<TimerData, TimerData & { amount: number }>('wheel', 'POST', setSpinning)({
        amount: selectedOption.value,
        ...timerData,
      }),
    [],
  )

  return {
    loadConfig,
    saveConfig,
    loadTimer,
    saveTimer,
    spinWheel,
    configLoading,
    timerLoading,
    spinning,
  }
}
