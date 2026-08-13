import { useEffect } from 'react'

/**
 * Lightweight TypeScript hook for dynamic Liquid Glass scroll refraction.
 * Calculates scroll velocity, direction and depth position, updating CSS
 * variables with requestAnimationFrame.
 *
 * Only runs the rAF loop while something is actually moving (during/right
 * after a scroll) and stops once the values settle — the previous version
 * ran forever from mount, writing to document.documentElement.style every
 * single frame even at complete rest, which forces a style recalc on the
 * root (and everything that inherits from it) 60x/sec for no visual gain
 * and was the main source of page-wide jank alongside the backdrop-filter
 * tiles.
 */
export function useLiquidGlassScroll(containerRef?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    let animationFrameId: number | null = null
    let lastScrollY = 0
    let currentVelocity = 0
    let targetVelocity = 0
    let currentShift = 0
    let targetShift = 0

    const getScrollY = () => {
      if (containerRef && containerRef.current) {
        return containerRef.current.scrollTop
      }
      return window.scrollY || document.documentElement.scrollTop || 0
    }

    const SETTLE_EPSILON = 0.01

    const updateRefraction = () => {
      const scrollY = getScrollY()
      const deltaY = scrollY - lastScrollY
      lastScrollY = scrollY

      // Velocity calculation with dampening
      targetVelocity = deltaY * 0.4
      currentVelocity += (targetVelocity - currentVelocity) * 0.15

      // Curvature shift based on scroll position & velocity
      targetShift = Math.sin(scrollY * 0.008) * 3 + currentVelocity * 0.5
      currentShift += (targetShift - currentShift) * 0.12

      // Apply dynamic CSS custom properties to document root
      document.documentElement.style.setProperty('--nb-scroll-shift', `${currentShift.toFixed(2)}px`)
      document.documentElement.style.setProperty('--nb-scroll-velocity', `${currentVelocity.toFixed(2)}`)
      document.documentElement.style.setProperty(
        '--nb-scroll-scale',
        `${(14 + Math.min(Math.abs(currentVelocity) * 0.5, 8)).toFixed(2)}px`
      )

      // Decay velocity when stationary
      targetVelocity *= 0.85

      const settled =
        Math.abs(deltaY) < SETTLE_EPSILON &&
        Math.abs(currentVelocity) < SETTLE_EPSILON &&
        Math.abs(targetShift - currentShift) < SETTLE_EPSILON

      if (settled) {
        animationFrameId = null
        return
      }

      animationFrameId = requestAnimationFrame(updateRefraction)
    }

    const ensureRunning = () => {
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(updateRefraction)
      }
    }

    const targetElement = containerRef?.current || window
    targetElement.addEventListener('scroll', ensureRunning, { passive: true })

    return () => {
      targetElement.removeEventListener('scroll', ensureRunning)
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
    }
  }, [containerRef])
}
