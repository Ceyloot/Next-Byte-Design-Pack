export type PatternLocationKey = string

export function usePatternLocations() {
  return {
    isLocationEnabled: (_location: PatternLocationKey) => false,
  }
}
