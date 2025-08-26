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
    }

    const onDisconnect = () => {
      console.log('Disconnected.')
    }

    const onUpdateConfig = (data: WheelConfig) => {
      setConfig(prevConfig => ({ ...prevConfig, ...data }))
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
  </ConfigContext.Provider>
}

export default App
