export interface WheelOption {
  label: string
  weight: number
  value: number // seconds
  color: string
}

export interface FontStyle {
  color: string
  fontFamily: string
  fontSize: number
  fontWeight: string | number
}

export default interface WheelConfig {
  options: WheelOption[]
  style: {
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
    timerDurationFormat: string
    timerDigitStyle: FontStyle
    timerShortcuts: {
      amount: number // positive only
      unit: 's' | 'm' | 'h' | 'd'
    }[]
  }
}
