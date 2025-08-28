import {
  Anchor,
  AngleSlider,
  Box,
  Button,
  Center,
  ColorInput,
  Container,
  Flex,
  Group,
  InputLabel,
  LoadingOverlay,
  RangeSlider,
  Slider,
  Space,
  Stack,
  Switch,
  TextInput,
  Title,
} from '@mantine/core'
import { notifications, Notifications } from '@mantine/notifications'
import React, { useContext, useEffect, useRef, useState } from 'react'

import DashboardSection from '@/frontend/components/DashboardSection'
import FontOption from '@/frontend/components/FontOption'
import ShortcutItem from '@/frontend/components/ShortcutItem'
import SortableRows from '@/frontend/components/SortableRows'
import Timer from '@/frontend/components/Timer'
import Wheel from '@/frontend/components/Wheel'
import WheelOptionItem from '@/frontend/components/WheelOptionItem'
import WheelContext from '@/frontend/context/WheelContext'
import useConfigState from '@/frontend/hooks/useConfigState'

import { Shortcut as ShortcutType, WheelOption } from '@/types/WheelConfig'
import { useDisclosure } from '@mantine/hooks'

const Dashboard: React.FC = () => {
  const { config, socket } = useContext(WheelContext)

  const { configState: editingConfig, set } = useConfigState(config)
  const {
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
  } = editingConfig

  const [spinDisabled, setSpinDisabled] = useState(false)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(true)
  const [visible, { toggle }] = useDisclosure(true)
  const isVisible = useRef(true)

  const spin = () => {
    setSpinDisabled(true)
    console.log(preview ? '<spinTest>' : '<spin>')
    if (preview) socket?.emit('spinTest', spinDuration)
    else socket?.emit('spin')
    setTimeout(() => {
      setSpinDisabled(false)
    }, spinDuration * 1000 + 500)
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

  const save = () => {
    console.log('<save>', editingConfig)
    setSaving(true)
    socket?.emit('updateConfig', editingConfig)
  }

  const onSpin = (option: WheelOption) => {
    notifications.show({
      title: '轉盤結果',
      message: `轉到「${option.label}」!`,
      color: 'green',
      autoClose: 2000,
    })
  }

  useEffect(() => {
    const onConnect = () => {
      notifications.show({
        title: 'Web Socket 連線',
        message: '已連線到伺服器。',
        color: 'green',
        autoClose: 2000,
      })
    }

    const onDisconnect = () => {
      notifications.show({
        title: 'Web Socket 連線',
        message: '已與伺服器斷線。',
        color: 'red',
        autoClose: 5000,
      })
    }

    const onUpdateConfig = () => {
      if (isVisible.current) toggle()
      isVisible.current = false
      setSaving(false)
      notifications.show({
        title: '設定更新',
        message: '轉盤設定已更新。',
        color: 'blue',
        autoClose: 2000,
      })
    }

    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('updateConfig', onUpdateConfig)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('updateConfig', onUpdateConfig)
    }
  }, [socket, toggle])

  return <Flex w="100%" h="100dvh" style={{ overflow: 'hidden' }}>
    <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ blur: 2 }} />
    <Center h="100dvh" flex="1 0 0" pos="relative"
      style={{ flexDirection: 'column', overflow: 'hidden' }}>
      <Wheel configOverride={preview ? editingConfig : config}
        isPreview={preview} onResult={onSpin}/>
      <Timer configOverride={preview ? editingConfig : config} />
      <Group right="1rem" bottom="1rem" pos="absolute">
        <Switch size="lg" checked={preview} onLabel="預覽" offLabel="顯示"
          onChange={e => setPreview(e.currentTarget.checked)} />
        <Button flex={1} onClick={save} disabled={saving}>儲存並套用設定</Button>
      </Group>
    </Center>
    <Box h="100dvh" flex="0 0 500px" style={{ overflow: 'auto' }}>
      <Container px="md" py="xl">

        <Title order={2} mt="xl" mb="sm">轉盤儀表版</Title>
        <Group gap="xs" justify="stretch" preventGrowOverflow={false}>
          <Button flex={1} onClick={spin} color="green"
            variant={preview ? 'outline' : 'filled'} disabled={spinDisabled}>
            {preview ? '測試轉盤' : '轉一次！'}
          </Button>
          <Button flex={1} onClick={resume}>繼續</Button>
          <Button flex={1} onClick={pause}>暫停</Button>
          <Button flex={1} color="red" onClick={reset}>重置</Button>
        </Group>

        <DashboardSection
          title="計時器操作"
          isEditable={true}
          content={editable => <SortableRows<ShortcutType & { id: string }>
            data={timerShortcuts}
            setData={set.timerShortcuts}
            editable={editable}
            defaultItem={{ amount: 1, unit: 'm' }}
            row={(shortcut, setShortcut) => <ShortcutItem
              shortcut={shortcut}
              setShortcut={setShortcut}
              onUpdate={value => socket?.emit('updateTimer', value)}
            />}
          />}
        />

        <DashboardSection
          title="轉盤選項"
          isEditable={preview}
          content={editable => <SortableRows<WheelOption & { id: string }>
            data={options}
            setData={set.options}
            editable={editable}
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
          />}
        />

        <DashboardSection
          title="轉盤樣式"
          defaultCollapsed={true}
          content={() => <>
            <Group my="sm">
              <TextInput label="動畫函數" value={spinTimingFunction} w="120px"
                onChange={e => set.spinTimingFunction(e.currentTarget.value)} />
              <Stack flex="1 0 0">
                <InputLabel>動畫時間</InputLabel>
                <Slider value={spinDuration} w="100%"
                  onChange={set.spinDuration} min={1} max={15} step={0.5}/>
              </Stack>
            </Group>
            <Stack flex="1 0 0" my="sm">
              <InputLabel>半徑與厚度</InputLabel>
              <RangeSlider
                value={[radius - (donutThickness || radius), radius]}
                onChange={([i, o]) => {
                  set.radius(o)
                  set.donutThickness(o - i)
                }}
                min={0} max={800} step={25}
              />
            </Stack>
            <Group my="sm">
              <Stack flex="1 0 0">
                <InputLabel>邊框厚度</InputLabel>
                <Slider
                  value={strokeWidth} onChange={set.strokeWidth}
                  min={0} max={10} step={0.25}
                />
              </Stack>
              <ColorInput label="邊框顏色" w="120px"
                value={strokeColor} onChange={set.strokeColor} />
            </Group>
          </>}
        />

        <DashboardSection
          title="標籤樣式"
          defaultCollapsed={true}
          content={() => <Stack>
            <Group>
              <InputLabel>中心標籤文字</InputLabel>
              <TextInput value={centerLabel} flex="1 0 0"
                onChange={e => set.centerLabel(e.currentTarget.value)} />
            </Group>
            <FontOption style={centerLabelStyle} onChange={set.centerLabelStyle} />
            <InputLabel>選項標籤文字</InputLabel>
            <FontOption style={labelStyle} onChange={set.labelStyle} />
            <Group>
              <Switch size="lg" checked={labelAlign === 'out'} onLabel="靠內" offLabel="靠外"
                onChange={e => set.labelAlign(e.currentTarget.checked ? 'out' : 'in')} />
              <Slider flex="1 0 0"
                value={labelMargin} onChange={set.labelMargin}
                min={4} max={radius - 40} step={4}
              />
            </Group>
          </Stack>}
        />

        <DashboardSection
          title="指針樣式"
          defaultCollapsed={true}
          content={() => <Group>
            <AngleSlider value={indicatorPosition + 90}
              onChange={a => set.indicatorPosition(a - 90)}
              formatLabel={value => `${(value + 270) % 360}°`}/>
            <ColorInput w="100px" value={indicatorColor} onChange={set.indicatorColor} />
          </Group>}
        />

        <DashboardSection
          title="計時器樣式"
          defaultCollapsed={true}
          content={() => <Stack>
            <Group>
              <Switch size="lg" checked={timerDisplayMs} label="顯示毫秒"
                onChange={e => set.timerDisplayMs(e.currentTarget.checked)} />
              <Switch size="lg" checked={timerDisplayDay} label="顯示天數"
                onChange={e => set.timerDisplayDay(e.currentTarget.checked)} />
            </Group>
            <FontOption style={timerDigitStyle} onChange={set.timerDigitStyle} />
          </Stack>}
        />

        <Space h="xl" />

        <Center>
          由
          <Anchor href="https://github.com/kami-0121">神の反逆者</Anchor>
          與
          <Anchor href="https://github.com/murataharu0803">村田ハル</Anchor>
          制作
        </Center>

        <Space h="xl" />
      </Container>
    </Box>
    <Notifications position="top-left"/>
  </Flex>
}

export default Dashboard
