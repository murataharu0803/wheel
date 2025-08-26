import { Text } from '@mantine/core'
import NumberFlow, { continuous, NumberFlowGroup } from '@number-flow/react'
import React, { useContext, useEffect, useRef, useState } from 'react'

import WheelContext from '@/frontend/context/WheelContext'

import TimerData from '@/types/TimerData'

const Timer: React.FC = () => {
  const { config, socket } = useContext(WheelContext)

  const [timeLeft, setTimeLeft] = useState(0)
  const [timeLeftDisplay, setTimeLeftDisplay] = useState(0)
  const timeLeftRef = useRef(timeLeft)
  const [isRunning, setIsRunning] = useState(false)
  const [trend, setTrend] = useState(-1)

  const {
    timerDisplayDay,
    timerDisplayMs,
    timerDigitStyle,
  } = config

  const d = timerDisplayDay ? Math.floor(timeLeftDisplay / 86400) : 0
  const h = timerDisplayDay
    ? Math.floor((timeLeftDisplay % 86400) / 3600)
    : Math.floor(timeLeftDisplay / 3600)
  const m = Math.floor((timeLeftDisplay % 3600) / 60)
  const s = Math.floor(timeLeftDisplay % 60)
  const ms = Math.floor((timeLeftDisplay % 1) * 1000)

  useEffect(() => {
    const onUpdateTimer = (timer: TimerData) => {
      console.log('[updateTimer]', timer)
      const now = Date.now()
      const passed = timer.isRunning ? now - timer.timestamp : 0
      const newTimeLeft = timer.durationLeft - passed / 1000
      console.log(timer, now, passed, newTimeLeft)
      setTimeLeft(newTimeLeft)
      setIsRunning(timer.isRunning)
    }
    socket?.on('updateTimer', onUpdateTimer)
    return () => {
      socket?.off('updateTimer', onUpdateTimer)
    }
  }, [socket, timeLeft])

  useEffect(() => {
    const ms = timerDisplayMs ? 125 : 1000
    const interval = setInterval(() => {
      if (timeLeftRef.current > 0 && isRunning) {
        setTimeLeft(t => {
          const newT = t - ms / 1000
          if (newT < 0) {
            socket?.emit('timeup')
            return 0
          }
          return newT
        })
      }
    }, ms)
    return () => clearInterval(interval)
  }, [isRunning, socket, timerDisplayMs])

  useEffect(() => {
    setTrend(timeLeft > timeLeftRef.current ? 1 : -1)
    timeLeftRef.current = timeLeft
    setTimeLeftDisplay(timeLeft)
  }, [socket, timeLeft])

  return <Text style={{ ... timerDigitStyle }}>
    <NumberFlowGroup>
      {timerDisplayDay &&
        <NumberFlow
          trend={trend}
          value={d}
          format={{ minimumIntegerDigits: 1 }}
        />
      }
      <NumberFlow
        trend={trend}
        value={h}
        format={{ minimumIntegerDigits: 2 }}
      />
      <NumberFlow
        prefix=":"
        trend={trend}
        value={m}
        digits={{ 1: { max: 5 } }}
        format={{ minimumIntegerDigits: 2 }}
      />
      <NumberFlow
        prefix=":"
        trend={trend}
        value={s}
        digits={{ 1: { max: 5 } }}
        format={{ minimumIntegerDigits: 2 }}
      />
      {timerDisplayMs && <small>
        <NumberFlow
          prefix="."
          trend={trend}
          value={ms}
          format={{ minimumIntegerDigits: 3 }}
          plugins={[continuous]}
        />
      </small>}
    </NumberFlowGroup>
  </Text>
}

export default Timer
