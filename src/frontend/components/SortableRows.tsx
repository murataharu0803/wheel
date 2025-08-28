/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @stylistic/comma-dangle */

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
import { Box, Button, Flex } from '@mantine/core'
import React from 'react'

import handleSvg from '@/frontend/assets/handle.svg'

interface RowItemProps {
  id: string
  children: React.ReactNode
  onDelete: () => void
}

const RowItem: React.FC<RowItemProps> = ({
  id,
  children,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return <Flex
    gap="xs"
    justify="stretch"
    my="xs"
    ref={setNodeRef}
    align="center"
    style={style}
    {...attributes}
  >
    <Box ref={setActivatorNodeRef} {...listeners}>{handleSvg}</Box>
    {children}
    <Button size="xs" onClick={onDelete}>x</Button>
  </Flex>
}

interface SortableRowsProps<T extends { id: string } = Record<string, any> & { id: string }> {
  row: (_: T, __: (_: Partial<T>) =>  void) => React.ReactNode
  data: T[]
  setData: React.Dispatch<React.SetStateAction<T[]>>
  defaultItem: Omit<T, 'id'>
}

const SortableRows = <T extends { id: string } = Record<string, any> & { id: string }>({
  row,
  data,
  setData,
  defaultItem
}: SortableRowsProps<T>) => {
  const sensors = useSensors(useSensor(PointerSensor))
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setData(items => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const getSetItem = (id: string) => (newItem: Partial<T>) =>
    setData(items => items.map(item => {
      if (item.id === id) return { ...item, ...newItem }
      return item as T
    }))

  const getDelete = (id: string) =>  () =>
    setData(items => items.filter(i => i.id !== id))

  return <>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={data}
        strategy={verticalListSortingStrategy}
      >
        {data.map(d => {
          return <RowItem key={d.id} id={d.id} onDelete={getDelete(d.id)}>
            {row(d, getSetItem(d.id))}
          </RowItem>
        })}
      </SortableContext>
    </DndContext>
    <Button w="100%" size="xs" onClick={() => {
      setData(items => [
        ...items,
        { ...defaultItem, id: Math.random().toString(36).substring(2, 9) } as T,
      ])
    }}>+</Button>
  </>
}

export default SortableRows
