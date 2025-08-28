import { R_360 } from '@/utils/svg'

import { WheelOption } from '@/types/WheelConfig'

export const optionMapper = (options: WheelOption[]) => {
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
  return sectorOptions
}
