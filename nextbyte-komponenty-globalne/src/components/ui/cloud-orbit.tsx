"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CloudOrbitProps {
  children?: React.ReactNode
  size?: number
  className?: string
  centerContent?: React.ReactNode
}

export function CloudOrbit({
  children,
  size = 160,
  className,
  centerContent,
}: CloudOrbitProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size * 2.8, height: size * 2.8 }}
    >
      {/* Center circle with inner shadow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 1.1,
          height: size * 1.1,
          background: 'hsl(var(--card) / 0.6)',
          boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.3)',
          border: '1px solid hsl(var(--border) / 0.15)',
        }}
      />
      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {centerContent}
      </div>
      {children}
    </div>
  )
}

interface OrbitingItemProps {
  speed?: number
  radius?: number
  startAt?: number
  size?: number
  className?: string
  children?: React.ReactNode
}

export function OrbitingItem({
  speed = 20,
  radius = 150,
  startAt = 0,
  size = 60,
  className,
  children,
}: OrbitingItemProps) {
  // Pre-compute keyframes for smooth elliptical orbit
  const steps = 120
  const xFrames: number[] = []
  const yFrames: number[] = []

  for (let i = 0; i <= steps; i++) {
    const angle = ((i / steps) + startAt) * 2 * Math.PI
    xFrames.push(radius * Math.cos(angle))
    yFrames.push(radius * 0.85 * Math.sin(angle))
  }

  return (
    <motion.div
      className={cn("absolute flex items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      animate={{ x: xFrames, y: yFrames }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.div>
  )
}
