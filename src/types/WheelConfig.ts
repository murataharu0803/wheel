export type TimeUnit = 's' | 'm' | 'h' | 'd'

export interface WheelOption {
  label: string
  weight: number
  value: number
  unit: TimeUnit
  color: string
}

export interface FontStyle {
  color: string
  fontFamily: string
  fontSize: number
  fontWeight: string | number
}

export interface Shortcut {
  amount: number // positive only
  unit: TimeUnit
}

export default interface WheelConfig {
  options: WheelOption[]
  spinDuration: number // seconds
  spinTimingFunction: string // CSS timing function
  radius: number
  strokeWidth: number
  strokeColor: string
  donutThickness: number | null
  labelStyle: FontStyle
  labelAlign: 'in' | 'out'
  labelMargin: number
  centerLabel: string
  centerLabelStyle: FontStyle
  indicatorPosition: number // degrees
  indicatorColor: string
  timerDisplayMs: boolean
  timerDisplayDay: boolean
  timerDigitStyle: FontStyle
  timerShortcuts: Shortcut[]
}
