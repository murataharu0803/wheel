import { NanaServer } from '@harlos/nana'
import serveStatic from 'serve-static'

import { logger } from '@/logger'
import config from '~/config.json'

const PORT = config.PORT || 8888

const server = new NanaServer({
  port: PORT,
  onStart: () => {
    console.log('Server is running on port', PORT)
  },
})

server.expressApp.use(logger)
server.expressApp.use(serveStatic('build'))

export default server
