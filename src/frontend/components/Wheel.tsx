import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'

import WheelContext from '@/frontend/context/WheelContext'
import { optionMapper } from '@/utils/optionMapper'
import { getSectorPath } from '@/utils/svg'

import WheelConfig, { WheelOption } from '@/types/WheelConfig'

interface WheelProps {
  configOverride?: WheelConfig
  isPreview?: boolean
  onResult?: (_: WheelOption) => void
}

const Wheel: React.FC<WheelProps> = ({
  configOverride,
  isPreview = false,
  onResult = () => {},
}) => {
  const { config, socket } = useContext(WheelContext)

  const isSpinning = useRef(false)
  const [wheelPosition, setWheelPosition] = useState(0)
  const [wheelAnimating, setWheelAnimating] = useState(false)

  const {
    options,
    spinDuration,
    spinTimingFunction,
    radius,
    strokeWidth,
    strokeColor,
    donutThickness = 0,
    labelStyle,
    labelAlign,
    labelMargin,
    centerLabel,
    centerLabelStyle,
    indicatorPosition,
    indicatorColor,
  } = configOverride || config

  const thick = donutThickness || radius
  const sectorOptions = optionMapper(options)

  const spinAngle = useCallback(async(angle: number) => {
    if (isSpinning.current) return
    isSpinning.current = true
    setWheelAnimating(true)
    setWheelPosition(angle)
    setTimeout(() => {
      setWheelAnimating(false)
      isSpinning.current = false
    }, spinDuration * 1000 + 500)
  }, [spinDuration])

  useEffect(() => {
    const onSpin = (option: WheelOption) => {
      console.log('[spin]', option)
      if (!isPreview) setTimeout(() => { onResult(option) }, 500)
    }
    const onSpinAngle = (angle: number) => {
      console.log('[spinAngle]', angle)
      spinAngle(angle)
    }
    const onSpinAngleInit = (angle: number) => {
      console.log('[spinAngleInit]', angle)
      setWheelPosition(angle)
    }
    const onSpinTest = (angle: number) => {
      console.log('[spinTest]', angle)
      if (isPreview) spinAngle(angle)
      else setWheelPosition(angle)
    }

    socket?.on('spinAngleInit', onSpinAngleInit)
    socket?.on('spin', onSpin)
    socket?.on('spinAngle', onSpinAngle)
    socket?.on('spinTest', onSpinTest)
    return () => {
      socket?.off('spinAngleInit', onSpinAngleInit)
      socket?.off('spin', onSpin)
      socket?.off('spinAngle', onSpinAngle)
      socket?.off('spinTest', onSpinTest)
    }
  }, [isPreview, onResult, socket, spinAngle])

  return <svg
    width={radius * 2 + 100}
    height={radius * 2 + 100}
    viewBox={`${-radius - 50} ${-radius - 50} ${radius * 2 + 100} ${radius * 2 + 100}`}
  >
    <g className="rotate" style={{
      transition: `transform ${wheelAnimating ? spinDuration : 0}s ${spinTimingFunction}`,
      transform: `rotate(${wheelPosition * 360}deg)`,
    }}>
      {sectorOptions.map(o => <g key={o.label}>
        <path
          key={o.label}
          d={getSectorPath(
            { x: 0, y: 0 },
            radius - thick,
            radius,
            o.startAngle,
            o.endAngle,
          )}
          fill={o.color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <text
          x={labelAlign === 'out' ? radius - labelMargin : radius - thick + labelMargin}
          y={0}
          textAnchor={labelAlign === 'out' ? 'end' : 'start'}
          dominantBaseline="central"
          style={{
            textAlign: 'left',
            transform: `rotate(${(o.startAngle + o.endAngle) / 2}rad)`,
            ...labelStyle,
            fill: labelStyle.color,
          }}
        >{o.label}</text>
      </g>)}
    </g>
    <path
      d={`
        M ${radius - 10} 0
        L ${radius + 10} -10
        L ${radius + 10} 10
        Z
      `}
      fill={indicatorColor}
      style={{
        transform: `rotate(${indicatorPosition}deg)`,
      }}
    />
    <text
      textAnchor='middle'
      x={0}
      y={0}
      style={{ ...centerLabelStyle, fill: centerLabelStyle.color }}
      dominantBaseline="central"
    >
      {centerLabel}
    </text>
  </svg>
}

export default Wheel
