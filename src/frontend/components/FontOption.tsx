import {
  Checkbox,
  ColorInput,
  Group,
  Slider,
  TextInput,
} from '@mantine/core'
import React, { useEffect, useState } from 'react'

import { FontStyle } from '@/types/WheelConfig'
import { IconBold } from '@tabler/icons-react'

interface FontOptionProps {
  style: FontStyle
  onChange: (_: FontStyle) => void
}

const FontOption: React.FC<FontOptionProps> = ({ style, onChange }) => {
  const [fontFamily, setFontFamily] = useState(style.fontFamily)
  const [fontSize, setFontSize] = useState(style.fontSize)
  const [fontWeight, setFontWeight] = useState(style.fontWeight)
  const [color, setColor] = useState(style.color)

  useEffect(() => {
    onChange({ fontFamily, fontSize, fontWeight, color })
  }, [fontFamily, fontSize, fontWeight, color, onChange])

  return <Group gap="sm">
    <TextInput value={fontFamily} w="160px"
      onChange={e => setFontFamily(e.currentTarget.value)} />
    <Slider value={fontSize} flex="1 0 0"
      onChange={setFontSize}
      min={6} max={48} step={1} />
    <Checkbox icon={IconBold} size="lg" variant="filled"
      checked={fontWeight === 'bold' || Number(fontWeight) > 500}
      onChange={e => setFontWeight(e.currentTarget.checked ? 'bold' : 'normal')}
    />
    <ColorInput value={color} w="100px"
      onChange={setColor} />
  </Group>
}

export default FontOption
