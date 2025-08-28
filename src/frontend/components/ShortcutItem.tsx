import { ActionIcon, NumberInput, Select } from '@mantine/core'
import React from 'react'

import { fromUnitToSeconds } from '@/utils/time'

import { Shortcut as ShortcutType, TimeUnit } from '@/types/WheelConfig'
import { IconMinus, IconPlus } from '@tabler/icons-react'

interface ShortcutItemProps {
  shortcut: ShortcutType & { id: string }
  onUpdate: (_: number) => void
  setShortcut: (_: Partial<ShortcutType>) =>  void
}

const ShortcutItem: React.FC<ShortcutItemProps> = (
  { shortcut, setShortcut, onUpdate },
) => {
  const { amount, unit } = shortcut
  const value = fromUnitToSeconds(amount, unit)
  return <>
    <ActionIcon onClick={() => { onUpdate(-value) }}><IconMinus size="16" /></ActionIcon>
    <NumberInput
      flex="1 0 0"
      size="xs"
      value={amount}
      min={1}
      max={999999}
      step={1}
      onChange={value => setShortcut({ amount: Number(value) || 0 })}
    />
    <Select
      flex="1 0 0"
      size="xs"
      value={unit}
      allowDeselect={false}
      onChange={value => setShortcut({ unit: value as TimeUnit })}
      checkIconPosition="right"
      data={[
        { label: '天', value: 'd' },
        { label: '小時', value: 'h' },
        { label: '分', value: 'm' },
        { label: '秒', value: 's' },
      ] as { label: string, value: TimeUnit }[]}
    />
    <ActionIcon onClick={() => { onUpdate(value) }}><IconPlus size="16" /></ActionIcon>
  </>
}

export default ShortcutItem
