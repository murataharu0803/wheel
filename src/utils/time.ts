export const fromUnitToSeconds = (value: number, unit: 's' | 'm' | 'h' | 'd'): number => {
  console.log(value, unit)
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

export const fromSecondsToUnit = (value: number, unit: 's' | 'm' | 'h' | 'd'): number => {
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

export const t = (unit: 's' | 'm' | 'h' | 'd'): string => {
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
