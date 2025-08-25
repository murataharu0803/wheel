import { MantineProvider } from '@mantine/core'
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from '@/App'
import AppRouter from '@/AppRouter'

import '@/assets/global.sass'
import '@mantine/core/styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <AppRouter><App /></AppRouter>
    </MantineProvider>
  </React.StrictMode>,
)
