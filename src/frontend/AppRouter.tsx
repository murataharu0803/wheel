import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router'

import Dashboard from '@/frontend/pages/Dashboard'
import Wheel from '@/frontend/pages/Wheel'

const routes = [
  { key: 'wheel', path: '/', component: <Wheel /> },
  { key: 'dashboard', path: '/dashboard', component: <Dashboard /> },
]

const router = (children?: React.ReactNode) => createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={children}>
      {routes.map(route => <Route
        key={route.key}
        path={route.path}
        element={route.component}
      />)}
    </Route>,
  ),
)

const AppRouter = ({ children }: { children?: React.ReactNode }) =>
  <RouterProvider router={router(children)} />

export default AppRouter
