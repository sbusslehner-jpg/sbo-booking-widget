import { createContext, ReactNode, useContext } from 'react'
import type { AnalyticsEvent } from './events'

type AnalyticsContextValue = {
  track: (event: AnalyticsEvent) => void
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  track: () => {},
})

export function AnalyticsProvider({
  track,
  children,
}: {
  track: (event: AnalyticsEvent) => void
  children: ReactNode
}) {
  return (
    <AnalyticsContext.Provider value={{ track }}>{children}</AnalyticsContext.Provider>
  )
}

export function useTrack(): (event: AnalyticsEvent) => void {
  return useContext(AnalyticsContext).track
}
