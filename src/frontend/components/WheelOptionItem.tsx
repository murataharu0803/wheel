import { ColorInput, Input, NumberInput, Select } from '@mantine/core'
import React from 'react'

import { TimeUnit, WheelOption } from '@/types/WheelConfig'

interface WheelOptionItemProps {
  wheelOption: WheelOption & { id: string }
  setWheelOption: (_: Partial<WheelOption>) =>  void
}

const WheelOptionItem: React.FC<WheelOptionItemProps> = (
  { wheelOption, setWheelOption },
) => {
  const { label, weight, value, unit, color } = wheelOption
  return <>
    <Input
      flex="1 0 0"
      size="xs"
      value={label}
      onChange={value => setWheelOption({ label: value.currentTarget.value })}
    />
    <NumberInput
      size="xs"
      value={weight}
      min={1}
      max={999999}
      step={1}
      onChange={value => setWheelOption({ weight: Number(value) || 0 })}
    />
    <NumberInput
      size="xs"
      value={value}
      min={1}
      max={999999}
      step={1}
      onChange={v => setWheelOption({ value: Number(v) || 0 })}
    />
    <Select
      flex="1 0 0"
      size="xs"
      value={unit}
      onChange={value => setWheelOption({ unit: value as TimeUnit })}
      allowDeselect={false}
      checkIconPosition="right"
      data={[
        { label: '天', value: 'd' },
        { label: '小時', value: 'h' },
        { label: '分', value: 'm' },
        { label: '秒', value: 's' },
      ] as { label: string, value: TimeUnit }[]}
    />
    <ColorInput
      flex="1 0 0"
      size="xs"
      value={color}
      onChange={value => setWheelOption({ color: value })}
    />
  </>
}

export default WheelOptionItem
