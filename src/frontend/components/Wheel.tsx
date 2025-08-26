import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'

import WheelContext from '@/frontend/context/WheelContext'
import { optionMapper } from '@/utils/optionMapper'
import { getSectorPath } from '@/utils/svg'

import { WheelOption } from '@/types/WheelConfig'

const Wheel: React.FC<{ onResult?: (_: WheelOption) => void }> = ({ onResult = () => {} }) => {
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
  } = config

  const thick = donutThickness || 0
  const sectorOptions = optionMapper(options)

  const spin = useCallback(async(option: WheelOption) => {
    setTimeout(() => {
      onResult(option)
    }, 500)
  }, [onResult])

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
      spin(option)
    }
    const onSpinAngle = (angle: number) => {
      console.log('[spinAngle]', angle)
      spinAngle(angle)
    }
    const onSpinAngleInit = (angle: number) => {
      console.log('[spinAngleInit]', angle)
      setWheelPosition(angle)
    }

    socket?.on('spinAngleInit', onSpinAngleInit)
    socket?.on('spinAngle', onSpinAngle)
    socket?.on('spin', onSpin)
    return () => {
      socket?.off('spin', onSpin)
      socket?.off('spinAngle', onSpinAngle)
      socket?.off('spinAngleInit', onSpinAngleInit)
    }
  }, [socket, spin, spinAngle])

  return <svg
    width={radius * 2 + 100}
    height={radius * 2 + 100}
    viewBox={`${-radius - 50} ${-radius - 50} ${radius * 2 + 100} ${radius * 2 + 100}`}
  >
    <text
      textAnchor='middle'
      x={0}
      y={0}
      style={{ ...centerLabelStyle }}
      dominantBaseline="central"
    >
      {centerLabel}
    </text>
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
          textAnchor="end"
          style={{
            textAlign: 'left',
            transform: `rotate(${(o.startAngle + o.endAngle) / 2}rad)`,
            ...labelStyle,
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
  </svg>
}

export default Wheel
