
import { useEffect, useState } from 'react'

import WheelConfig, { FontStyle } from '@/types/WheelConfig'
import { randomId } from '@/utils/random'

const useConfigState = (config: WheelConfig) => {
  const [timerShortcuts, setTimerShortcuts] = useState(
    config.timerShortcuts.map(s => ({ ...s, id: randomId() })))
  const [options, setOptions] = useState(
    config.options.map(o => ({ ...o, id: randomId() })))

  const [spinDuration, setSpinDuration] = useState(config.spinDuration)
  const [spinTimingFunction, setSpinTimingFunction] = useState(config.spinTimingFunction)
  const [radius, setRadius] = useState<number>(config.radius)
  const [strokeWidth, setStrokeWidth] = useState<number>(config.strokeWidth)
  const [strokeColor, setStrokeColor] = useState<string>(config.strokeColor)
  const [donutThickness, setDonutThickness] = useState<number | null>(config.donutThickness)

  const [labelStyle, setLabelStyle] = useState<FontStyle>(config.labelStyle)
  const [labelAlign, setLabelAlign] = useState<'in' | 'out'>(config.labelAlign)
  const [labelMargin, setLabelMargin] = useState<number>(config.labelMargin)

  const [centerLabel, setCenterLabel] = useState<string>(config.centerLabel)
  const [centerLabelStyle, setCenterLabelStyle] = useState<FontStyle>(config.centerLabelStyle)

  const [indicatorPosition, setIndicatorPosition] = useState<number>(config.indicatorPosition)
  const [indicatorColor, setIndicatorColor] = useState<string>(config.indicatorColor)

  const [timerDisplayMs, setTimerDisplayMs] = useState<boolean>(config.timerDisplayMs)
  const [timerDisplayDay, setTimerDisplayDay] = useState<boolean>(config.timerDisplayDay)
  const [timerDigitStyle, setTimerDigitStyle] = useState<FontStyle>(config.timerDigitStyle)

  useEffect(() => {
    setTimerShortcuts(config.timerShortcuts.map(s => ({ ...s, id: randomId() })))
    setOptions(config.options.map(o => ({ ...o, id: randomId() })))
    setSpinDuration(config.spinDuration)
    setSpinTimingFunction(config.spinTimingFunction)
    setRadius(config.radius)
    setStrokeWidth(config.strokeWidth)
    setStrokeColor(config.strokeColor)
    setDonutThickness(config.donutThickness)
    setLabelStyle({ ...config.labelStyle })
    setLabelAlign(config.labelAlign)
    setLabelMargin(config.labelMargin)
    setCenterLabel(config.centerLabel)
    setCenterLabelStyle({ ...config.centerLabelStyle })
    setIndicatorPosition(config.indicatorPosition)
    setIndicatorColor(config.indicatorColor)
    setTimerDisplayMs(config.timerDisplayMs)
    setTimerDisplayDay(config.timerDisplayDay)
    setTimerDigitStyle({ ...config.timerDigitStyle })
  }, [config])

  const configState = {
    timerShortcuts,
    options,
    spinDuration,
    spinTimingFunction,
    radius,
    strokeWidth,
    strokeColor,
    donutThickness,
    labelStyle,
    labelAlign,
    labelMargin,
    centerLabel,
    centerLabelStyle,
    indicatorPosition,
    indicatorColor,
    timerDisplayMs,
    timerDisplayDay,
    timerDigitStyle,
  }

  const set = {
    timerShortcuts: setTimerShortcuts,
    options: setOptions,
    spinDuration: setSpinDuration,
    spinTimingFunction: setSpinTimingFunction,
    radius: setRadius,
    strokeWidth: setStrokeWidth,
    strokeColor: setStrokeColor,
    donutThickness: setDonutThickness,
    labelStyle: setLabelStyle,
    labelAlign: setLabelAlign,
    labelMargin: setLabelMargin,
    centerLabel: setCenterLabel,
    centerLabelStyle: setCenterLabelStyle,
    indicatorPosition: setIndicatorPosition,
    indicatorColor: setIndicatorColor,
    timerDisplayMs: setTimerDisplayMs,
    timerDisplayDay: setTimerDisplayDay,
    timerDigitStyle: setTimerDigitStyle,
  }

  return {
    configState,
    set,
  }
}

export default useConfigState
