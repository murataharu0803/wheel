import console from '@/logger'
import server from '@/server'

server.listen(8888, () => {
  console.log('伺服器正在運行。')
  console.log('請在瀏覽器打開儀表版： http://localhost:8888/dashboard')
  console.log('請在 OBS 輸入計時器瀏覽器來源： http://localhost:8888/timer')
  console.log('請在 OBS 輸入轉盤瀏覽器來源： http://localhost:8888')
})
