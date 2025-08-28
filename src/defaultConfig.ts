import WheelConfig from '@/types/WheelConfig'

const config: WheelConfig = {
  options: [
    {
      label: '+ 1 分鐘',
      weight: 1,
      value: 1,
      unit: 'm',
      color: '#cc6666',
    },
    {
      label: '+ 10 分鐘',
      weight: 1,
      value: 10,
      unit: 'm',
      color: '#66cc66',
    },
    {
      label: '+ 1 小時',
      weight: 1,
      value: 1,
      unit: 'h',
      color: '#6666cc',
    },
  ],
  spinDuration: 10,
  spinTimingFunction: 'ease-in-out',
  radius: 200,
  strokeWidth: 2,
  strokeColor: '#000000',
  donutThickness: 150,
  labelStyle: {
    color: '#000000',
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: 'normal',
  },
  labelAlign: 'out',
  labelMargin: 25,
  centerLabel: '轉盤',
  centerLabelStyle: {
    color: '#FFFFFF',
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicatorPosition: 0,
  indicatorColor: '#888888',
  timerDisplayMs: false,
  timerDisplayDay: false,
  timerDigitStyle: {
    color: '#FFFFFF',
    fontFamily: 'Arial',
    fontSize: 40,
    fontWeight: 'bold',
  },
  timerShortcuts: [
    {
      amount: 1,
      unit: 'm',
    },
    {
      amount: 10,
      unit: 'm',
    },
    {
      amount: 1,
      unit: 'h',
    },
  ],
}

export default config
