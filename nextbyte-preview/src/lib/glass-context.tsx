import React, { createContext, useContext, useState } from 'react'

interface GlassContextValue {
  isGlass: boolean
  setIsGlass: (v: boolean) => void
  toggle: () => void
}

const GlassContext = createContext<GlassContextValue>({
  isGlass: false,
  setIsGlass: () => {},
  toggle: () => {},
})

export function GlassProvider({ children }: { children: React.ReactNode }) {
  const [isGlass, setIsGlass] = useState(false)
  return (
    <GlassContext.Provider value={{ isGlass, setIsGlass, toggle: () => setIsGlass((v) => !v) }}>
      {children}
    </GlassContext.Provider>
  )
}

export function useGlass() {
  return useContext(GlassContext)
}

/** Zwraca 'nb-szklo' gdy glass mode aktywny, inaczej zwraca fallback */
export function useGlassCls(fallback = '') {
  const { isGlass } = useGlass()
  return isGlass ? 'nb-szklo' : fallback
}
