import { ActionIcon, Collapse, Divider, Group, Space, Switch, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import React from 'react'

import { IconChevronDown } from '@tabler/icons-react'

interface DashboardSectionProps {
  title: string
  isEditable?: boolean
  defaultCollapsed?: boolean
  content: (_: boolean) => React.ReactNode
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  isEditable = false,
  defaultCollapsed = false,
  content,
}) => {
  const [opened, { toggle }] = useDisclosure(!defaultCollapsed)
  const [editable, setEditable] = React.useState(false)

  return <>
    <Divider my="xl" />
    <Group align="center" pb="sm" gap="xs">
      <Title order={3}>{title}</Title>
      {opened && isEditable && <Switch
        checked={editable} onLabel="編輯" offLabel="鎖定"
        onChange={e => setEditable(e.currentTarget.checked)}
      />}
      <Space flex="1 0 0" />
      <ActionIcon variant="transparent" onClick={toggle}
        style={{
          transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}
      ><IconChevronDown /></ActionIcon>
    </Group>
    <Collapse in={opened}>
      {content(isEditable && editable)}
    </Collapse>
  </>
}

export default DashboardSection
