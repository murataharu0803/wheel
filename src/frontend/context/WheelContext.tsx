import { createContext } from 'react'

import defaultConfig from '@/defaultConfig'

import WheelConfig from '@/types/WheelConfig'
import { Socket } from 'socket.io-client'

interface WheelContextProps {
  config: WheelConfig
  socket: Socket | null
}

const WheelContext = createContext<WheelContextProps>({
  config: defaultConfig as WheelConfig,
  socket: null,
})

export default WheelContext
