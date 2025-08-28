import { TimeUnit } from '@/types/WheelConfig'

export const fromUnitToSeconds = (value: number, unit: TimeUnit): number => {
  switch (unit) {
    case 's':
      return value
    case 'm':
      return value * 60
    case 'h':
      return value * 3600
    case 'd':
      return value * 86400
  }
}

export const fromSecondsToUnit = (value: number, unit: TimeUnit): number => {
  switch (unit) {
    case 's':
      return value
    case 'm':
      return value / 60
    case 'h':
      return value / 3600
    case 'd':
      return value / 86400
  }
}

export const t = (unit: TimeUnit): string => {
  switch (unit) {
    case 's':
      return '秒'
    case 'm':
      return '分'
    case 'h':
      return '小時'
    case 'd':
      return '天'
  }
}
