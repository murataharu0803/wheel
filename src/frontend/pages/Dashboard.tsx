import {
  AngleSlider,
  Box,
  Button,
  Center,
  ColorInput,
  Container,
  Flex,
  Group,
  Slider,
  Switch,
  TextInput,
  Title,
} from '@mantine/core'
import React, { useContext, useState } from 'react'

import ShortcutItem from '@/frontend/components/ShortcutItem'
import SortableRows from '@/frontend/components/SortableRows'
import Timer from '@/frontend/components/Timer'
import Wheel from '@/frontend/components/Wheel'
import WheelOptionItem from '@/frontend/components/WheelOptionItem'
import WheelContext from '@/frontend/context/WheelContext'
import { randomId } from '@/utils/random'

import WheelConfig, { FontStyle, Shortcut as ShortcutType, WheelOption } from '@/types/WheelConfig'

const Dashboard: React.FC = () => {
  const { config, socket } = useContext(WheelContext)

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

  const [spinDisabled, setSpinDisabled] = useState(false)
  const curConfig: WheelConfig = {
    options,
    spinDuration: config.spinDuration,
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
    timerShortcuts,
  }

  const spin = () => {
    setSpinDisabled(true)
    console.log('<spin>')
    socket?.emit('spin')
    setTimeout(() => {
      setSpinDisabled(false)
    }, config.spinDuration * 1000 + 500)
  }

  const resume = () => {
    console.log('<resume>')
    socket?.emit('resume')
  }

  const pause = () => {
    console.log('<pause>')
    socket?.emit('pause')
  }

  const reset = () => {
    console.log('<reset>')
    socket?.emit('reset')
  }

  return <Flex w="100%" h="100dvh" style={{ overflow: 'hidden' }}>
    <Center h="100dvh"
      flex="1 0 0"
      style={{ flexDirection: 'column', overflow: 'hidden' }}>
      <Wheel configOverride={curConfig} />
      <Timer />
    </Center>
    <Box h="100dvh" flex="0 0 500px" style={{ overflow: 'auto' }}>
      <Container p="xs">

        <Title order={2} mt="xl" mb="sm">轉盤儀表版</Title>
        <Group gap="xs" justify="stretch" preventGrowOverflow={false}>
          <Button flex={1} onClick={spin} disabled={spinDisabled}>轉一次！</Button>
          <Button flex={1} onClick={resume}>繼續</Button>
          <Button flex={1} onClick={pause}>暫停</Button>
          <Button flex={1} onClick={reset}>重置</Button>
        </Group>

        <Title order={3} mt="xl" mb="sm">計時器操作</Title>
        <SortableRows<ShortcutType & { id: string }>
          data={timerShortcuts}
          setData={setTimerShortcuts}
          defaultItem={{ amount: 1, unit: 'm' }}
          row={(shortcut, setShortcut) => <ShortcutItem
            shortcut={shortcut}
            setShortcut={setShortcut}
            onUpdate={value => socket?.emit('updateTimer', value)}
          />}
        />

        <Title order={3} mt="xl" mb="sm">轉盤選項</Title>
        <SortableRows<WheelOption & { id: string }>
          data={options}
          setData={setOptions}
          defaultItem={{
            label: '新選項',
            weight: 1,
            value: 1,
            unit: 'm',
            color: 'white',
          }}
          row={(option, setOption) => <WheelOptionItem
            wheelOption={option}
            setWheelOption={setOption}
          />}
        />

        <Title order={3} mt="xl" mb="sm">轉盤樣式</Title>
        <Slider value={spinDuration} onChange={setSpinDuration} min={1} max={15} step={0.5}/>
        <TextInput value={spinTimingFunction}
          onChange={e => setSpinTimingFunction(e.currentTarget.value)} />
        <Slider value={radius} onChange={setRadius} min={200} max={800} step={50} />
        <Slider value={strokeWidth} onChange={setStrokeWidth} min={0} max={10} step={0.25} />
        <ColorInput value={strokeColor} onChange={setStrokeColor} />
        <Slider value={donutThickness || radius} onChange={setDonutThickness}
          min={25} max={radius} step={25} />

        <Title order={3} mt="xl" mb="sm">標籤樣式</Title>
        <TextInput value={centerLabel} onChange={e => setCenterLabel(e.currentTarget.value)} />

        <ColorInput value={centerLabelStyle.color}
          onChange={color => setCenterLabelStyle({ ...centerLabelStyle, color })} />
        <TextInput value={centerLabelStyle.fontFamily}
          onChange={e => setCenterLabelStyle({
            ...centerLabelStyle,
            fontFamily: e.currentTarget.value,
          })}
        />
        <Slider value={centerLabelStyle.fontSize}
          onChange={fontSize => setCenterLabelStyle({ ...centerLabelStyle, fontSize })}
          min={6} max={48} step={1} />
        <TextInput value={centerLabelStyle.fontWeight}
          onChange={e => setCenterLabelStyle({
            ...centerLabelStyle,
            fontWeight: e.currentTarget.value,
          })}
        />

        <ColorInput value={labelStyle.color}
          onChange={color => setLabelStyle({ ...labelStyle, color })} />
        <TextInput value={labelStyle.fontFamily}
          onChange={e => setLabelStyle({ ...labelStyle, fontFamily: e.currentTarget.value })} />
        <Slider value={labelStyle.fontSize}
          onChange={fontSize => setLabelStyle({ ...labelStyle, fontSize })}
          min={6} max={48} step={1} />
        <TextInput value={labelStyle.fontWeight}
          onChange={e => setLabelStyle({ ...labelStyle, fontWeight: e.currentTarget.value })} />

        <Switch checked={labelAlign === 'out'} size="xs" onLabel="in" offLabel="out"
          onChange={e => setLabelAlign(e.currentTarget.checked ? 'out' : 'in')} />
        <Slider value={labelMargin} onChange={setLabelMargin} min={4} max={radius - 50} step={4} />

        <Title order={3} mt="xl" mb="sm">指針樣式</Title>
        <AngleSlider value={indicatorPosition + 90}
          onChange={a => setIndicatorPosition(a - 90)}
          formatLabel={value => `${(value + 270) % 360}°`}/>
        <ColorInput value={indicatorColor} onChange={setIndicatorColor} />

        <Title order={3} mt="xl" mb="sm">計時器樣式</Title>
        <Switch checked={timerDisplayMs} size="xs"
          onChange={e => setTimerDisplayMs(e.currentTarget.checked)} />
        <Switch checked={timerDisplayDay} size="xs"
          onChange={e => setTimerDisplayDay(e.currentTarget.checked)} />

        <ColorInput value={timerDigitStyle.color}
          onChange={color => setTimerDigitStyle({ ...timerDigitStyle, color })} />
        <TextInput value={timerDigitStyle.fontFamily}
          onChange={e => setTimerDigitStyle({
            ...timerDigitStyle,
            fontFamily: e.currentTarget.value,
          })}
        />
        <Slider value={timerDigitStyle.fontSize}
          onChange={fontSize => setTimerDigitStyle({ ...timerDigitStyle, fontSize })}
          min={6} max={48} step={1} />
        <TextInput value={timerDigitStyle.fontWeight}
          onChange={e => setTimerDigitStyle({
            ...timerDigitStyle,
            fontWeight: e.currentTarget.value,
          })}
        />
      </Container>
    </Box>
  </Flex>
}

export default Dashboard
