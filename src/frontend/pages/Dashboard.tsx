import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Box, Button, Center, Container, Flex, NumberInput, Select, Title } from '@mantine/core'
import React, { useContext, useState } from 'react'

import handleSvg from '@/frontend/assets/handle.svg'
import Timer from '@/frontend/components/Timer'
import Wheel from '@/frontend/components/Wheel'
import WheelContext from '@/frontend/context/WheelContext'
import { fromUnitToSeconds } from '@/utils/time'

const Shortcut: React.FC<{
  id: string
  amount: number
  unit: 's' | 'd' | 'h' | 'm'
  value: number
  onUpdate: (_: number) => void
  onChange: (_: {
    amount: number
    unit: 's' | 'd' | 'h' | 'm'
  }) => void
  onDelete: () => void
}> = ({ id, amount, unit, value, onUpdate, onChange, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  }  = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return <Flex
    key={`${amount}${unit}`}
    gap="xs"
    justify="stretch"
    my="xs"
    ref={setNodeRef}
    align="center"
    style={style}
    {...attributes}
  >
    <Box ref={setActivatorNodeRef} {...listeners}>{handleSvg}</Box>
    <Button size="xs" onClick={() => { onUpdate(-value) }}>-</Button>
    <NumberInput
      flex="1 0 0"
      size="xs"
      value={amount}
      min={1}
      max={999999}
      step={1}
      onChange={value => onChange({ amount: Number(value) || 0, unit })}
    />
    <Select
      flex="1 0 0"
      size="xs"
      value={unit}
      onChange={value => onChange({ amount, unit: value as 's' | 'd' | 'h' | 'm' || unit })}
      data={[
        { label: '天', value: 'd' },
        { label: '小時', value: 'h' },
        { label: '分', value: 'm' },
        { label: '秒', value: 's' },
      ]}
    />
    <Button size="xs" onClick={() => { onUpdate(value) }}>+</Button>
    <Button size="xs" onClick={() => { onDelete() }}>x</Button>
  </Flex>
}

const Dashboard: React.FC = () => {
  const { config, socket } = useContext(WheelContext)

  const {
    spinDuration,
    timerShortcuts,
  } = config

  const editing = {
    spinDuration,
    timerShortcuts,
  }

  const [spinDisabled, setSpinDisabled] = useState(false)

  const [items, setItems] = useState(
    timerShortcuts.map(s => ({
      ...s,
      id: Math.random().toString(36).substring(2, 9),
      value: fromUnitToSeconds(s.amount, s.unit),
    })),
  )
  const sensors = useSensors(useSensor(PointerSensor))
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems(items => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const spin = () => {
    setSpinDisabled(true)
    socket?.emit('spin')
    setTimeout(() => {
      setSpinDisabled(false)
    }, spinDuration * 1000 + 500)
  }

  const resume = () => {
    socket?.emit('resume')
  }

  const pause = () => {
    socket?.emit('pause')
  }

  const reset = () => {
    socket?.emit('reset')
  }

  return <Flex w="100%" h="100dvh" style={{ overflow: 'hidden' }}>
    <Center h="100dvh" style={{ flexDirection: 'column', overflow: 'hidden' }}>
      <Wheel />
      <Timer />
    </Center>
    <Box h="100dvh" style={{ overflow: 'auto' }}>
      <Container p="xs">

        <Title order={2} mt="xl" mb="sm">轉盤儀表版</Title>
        <Flex gap="xs" justify="stretch">
          <Button flex={1} onClick={spin} disabled={spinDisabled}>轉一次！</Button>
          <Button flex={1} onClick={resume}>繼續</Button>
          <Button flex={1} onClick={pause}>暫停</Button>
          <Button flex={1} onClick={reset}>重置</Button>
        </Flex>

        <Title order={3} mt="xl" mb="sm">計時器操作</Title>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            {items.map(shortcut => <Shortcut
              {...shortcut}
              key={shortcut.id}
              onUpdate={value => socket?.emit('updateTimer', value)}
              onChange={newItem => {
                setItems(items => items.map(i => {
                  if (i.id === shortcut.id) {
                    return {
                      id: i.id,
                      ...newItem,
                      value: fromUnitToSeconds(newItem.amount, newItem.unit),
                    }
                  }
                  return i
                }))
              }}
              onDelete={() => {
                setItems(items => items.filter(i => i.id !== shortcut.id))
              }}
            />)}
          </SortableContext>
        </DndContext>
        <Button w="100%" size="xs" onClick={() => {
          setItems(items => [
            ...items,
            {
              id: Math.random().toString(36).substring(2, 9),
              amount: 1,
              unit: 'm',
              value: 60,
            },
          ])
        }}>+</Button>

      </Container>
    </Box>
  </Flex>
}

export default Dashboard
