import { Notifications, notifications } from '@mantine/notifications'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import io from 'socket.io-client'

import defaultConfig from '@/defaultConfig'
import ConfigContext from '@/frontend/context/WheelContext'

import WheelConfig from '@/types/WheelConfig'

const socket = io()

const App = () => {
  const [config, setConfig] = useState(defaultConfig)

  useEffect(() => {
    const onConnect = () => {
      console.log('Connected.')
      notifications.show({
        title: 'Web Socket 連線',
        message: '已連線到伺服器。',
        color: 'green',
        autoClose: 2000,
      })
    }

    const onDisconnect = () => {
      console.log('Disconnected.')
      notifications.show({
        title: 'Web Socket 連線',
        message: '已與伺服器斷線。',
        color: 'red',
        autoClose: 5000,
      })
    }

    const onUpdateConfig = (data: WheelConfig) => {
      console.log('[updateConfig]', data)
      setConfig(prevConfig => ({ ...prevConfig, ...data }))
      notifications.show({
        title: '設定更新',
        message: '轉盤設定已更新。',
        color: 'blue',
        autoClose: 2000,
      })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('updateConfig', onUpdateConfig)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('updateConfig', onUpdateConfig)
    }
  }, [])

  return <ConfigContext.Provider value={{ config, socket }}>
    <Outlet />
    <Notifications position="top-left"/>
  </ConfigContext.Provider>
}

export default App
