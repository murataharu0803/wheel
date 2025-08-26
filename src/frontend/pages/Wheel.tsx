import { Center, Modal } from '@mantine/core'
import React, { useState } from 'react'

import Wheel from '@/frontend/components/Wheel'
import { WheelOption } from '@/types/WheelConfig'
import { useDisclosure } from '@mantine/hooks'

const WheelPage: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false)
  const [modalText, setModalText] = useState('')

  const onResult = (option: WheelOption) => {
    setModalText(`獲得選項：${option.label}`)
    open()
    setTimeout(() => {
      close()
      setModalText('')
    }, 3000)
  }

  return <Center w="100%" h="100dvh">
    <Wheel onResult={onResult} />
    <Modal opened={opened} onClose={close} title="轉盤結果" centered>
      {modalText}
    </Modal>
  </Center>
}

export default WheelPage
