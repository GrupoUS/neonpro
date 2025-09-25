'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import React, { useRef } from 'react'
import { cn } from '../../utils'

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
  tiltMaxAngleX?: number
  tiltMaxAngleY?: number
  perspective?: number
  scale?: number
  transitionEasing?: [number, number, number, number]
  transitionDuration?: number
  transformOrigin?: string
  disableHoverEffect?: boolean
}

export function TiltedCard({
  children,
  className,
  tiltMaxAngleX = 15,
  tiltMaxAngleY = 15,
  perspective = 1000,
  scale = 1.05,
  transitionEasing = [0.03, 0.98, 0.52, 0.99],
  transitionDuration = 400,
  transformOrigin = 'center center',
  disableHoverEffect = false,
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const mouseXSpring = useSpring(mouseX)
  const mouseYSpring = useSpring(mouseY)

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [tiltMaxAngleX, -tiltMaxAngleX],
  )
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [-tiltMaxAngleY, tiltMaxAngleY],
  )

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disableHoverEffect || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseXPct = (event.clientX - centerX) / (rect.width / 2)
    const mouseYPct = (event.clientY - centerY) / (rect.height / 2)

    mouseX.set(mouseXPct)
    mouseY.set(mouseYPct)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin,
        rotateX: disableHoverEffect ? 0 : rotateX,
        rotateY: disableHoverEffect ? 0 : rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.5,
      }}
      whileHover={disableHoverEffect
        ? {}
        : {
          scale: scale,
          transition: {
            duration: transitionDuration / 1000,
            ease: transitionEasing,
          },
        }}
    >
      <div
        className='w-full h-full'
        style={{
          perspective: `${perspective}px`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

export default TiltedCard
