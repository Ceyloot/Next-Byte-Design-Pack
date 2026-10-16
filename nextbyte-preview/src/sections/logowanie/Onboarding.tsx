import { useState } from 'react'
import { OnboardingFlow } from './OnboardingFlow'
import { WejscieNaPlatforme } from './WejscieNaPlatforme'

/** Cały onboarding po rejestracji: pytania (faza B), a po ostatnim —
 *  wejście na platformę z sekwencją ofert (faza C). */
export function Onboarding({
  poczatkowyEtap = 'pytania',
  onWrocDoFormularza,
}: {
  poczatkowyEtap?: 'pytania' | 'platforma'
  onWrocDoFormularza?: () => void
}) {
  const [etap, setEtap] = useState(poczatkowyEtap)
  return etap === 'pytania'
    ? <OnboardingFlow onWrocDoFormularza={onWrocDoFormularza} onZakoncz={() => setEtap('platforma')} />
    : <WejscieNaPlatforme />
}
