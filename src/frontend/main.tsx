import { MantineProvider } from '@mantine/core'
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from '@/frontend/App'
import AppRouter from '@/frontend/AppRouter'

import '@mantine/charts/styles.css'
import '@mantine/core/styles.css'

import '@/frontend/assets/global.sass'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <AppRouter><App /></AppRouter>
    </MantineProvider>
  </React.StrictMode>,
)
