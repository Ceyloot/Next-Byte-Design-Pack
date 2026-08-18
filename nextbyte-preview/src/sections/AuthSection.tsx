import React from 'react'
import { Zap, ShieldCheck, Mail, ArrowRight } from 'lucide-react'
import {
  GlassCard, GlassAuthCard, GlassLoginForm, GlassPasswordField,
  GlassPasswordStrength, GlassSocialButtons, GlassDivider, GlassButton,
  GlassBadge, GlassOrb, GlassSplit,
} from '@/components/glass'
import { OtpInput } from '@/components/ui/otp-input'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

function Logo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
      <Zap className="h-5 w-5 text-background" />
    </div>
  )
}

export function AuthSection() {
  const [pw, setPw] = React.useState('')
  const [pwDemo, setPwDemo] = React.useState('Haslo123')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | undefined>()

  function fakeLogin() {
    setError(undefined)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setError('Nieprawidłowy e-mail lub hasło.')
    }, 1200)
  }

  return (
    <div className="space-y-10">

      {/* KARTA AUTH */}
      <div className="space-y-4">
        <h3 id="auth-karta" className="text-sm font-semibold text-foreground/70">Karta autoryzacji</h3>
        <SectionLabel>Kontener z logo, tytułem, podtytułem i stopką — baza pod każdy ekran auth</SectionLabel>
        <div className="flex flex-wrap gap-4">
          <GlassAuthCard
            title="Zaloguj się"
            subtitle="Witamy z powrotem w NextByte"
            logo={<Logo />}
            footer={<>Nie masz konta? <button className="font-semibold text-primary hover:underline">Załóż konto</button></>}
          >
            <GlassLoginForm onSubmit={fakeLogin} loading={loading} error={error} />
          </GlassAuthCard>

          <GlassAuthCard
            title="Załóż konto"
            subtitle="Dołącz do 12 000+ twórców"
            logo={<Logo />}
            footer={<>Masz już konto? <button className="font-semibold text-primary hover:underline">Zaloguj się</button></>}
          >
            <div className="flex flex-col gap-3">
              <GlassSocialButtons />
              <GlassDivider label="albo e-mailem" />
              <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-input px-3">
                <Mail className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
                <input
                  placeholder="Adres e-mail"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
                />
              </div>
              <GlassPasswordField value={pw} onChange={setPw} placeholder="Utwórz hasło" showStrength />
              <GlassButton className="mt-1 w-full gap-1.5">Utwórz konto <ArrowRight className="h-3.5 w-3.5" /></GlassButton>
            </div>
          </GlassAuthCard>
        </div>
      </div>

      {/* SIŁA HASŁA */}
      <div className="space-y-4">
        <h3 id="auth-sila" className="text-sm font-semibold text-foreground/70">Wskaźnik siły hasła</h3>
        <SectionLabel>Pięć kryteriów, wynik 0–4 · wpisz coś, żeby zobaczyć reakcję</SectionLabel>
        <GlassCard className="max-w-sm space-y-3">
          <GlassPasswordField value={pwDemo} onChange={setPwDemo} placeholder="Wpisz hasło" showStrength />
        </GlassCard>

        <SectionLabel>Wszystkie poziomy obok siebie</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {['a', 'abcdefgh', 'Abcdefgh', 'Abcdefg1', 'Abcdefg1!'].map((p) => (
            <GlassCard key={p} padding="p-3">
              <code className="mb-2 block font-mono text-[10px] text-foreground/45">&quot;{p}&quot;</code>
              <GlassPasswordStrength password={p} showChecks={false} />
            </GlassCard>
          ))}
        </div>
      </div>

      {/* LOGOWANIE SPOŁECZNOŚCIOWE */}
      <div className="space-y-4">
        <h3 id="auth-social" className="text-sm font-semibold text-foreground/70">Logowanie zewnętrzne</h3>
        <SectionLabel>Układ pionowy (z etykietami) i poziomy (same ikony)</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="max-w-xs"><GlassSocialButtons layout="stack" /></GlassCard>
          <GlassCard className="max-w-xs"><GlassSocialButtons layout="row" /></GlassCard>
        </div>
      </div>

      {/* MFA / OTP */}
      <div className="space-y-4">
        <h3 id="auth-mfa" className="text-sm font-semibold text-foreground/70">Weryfikacja dwuetapowa (MFA)</h3>
        <SectionLabel>Ekran z kodem jednorazowym</SectionLabel>
        <GlassAuthCard
          title="Potwierdź logowanie"
          subtitle="Wysłaliśmy 6-cyfrowy kod na a***@gmail.com"
          logo={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShieldCheck className="h-5 w-5" /></div>}
          footer={<>Nie dostałeś kodu? <button className="font-semibold text-primary hover:underline">Wyślij ponownie</button></>}
        >
          <div className="flex flex-col items-center gap-4">
            <OtpInput length={6} />
            <GlassButton className="w-full">Zweryfikuj</GlassButton>
          </div>
        </GlassAuthCard>
      </div>

      {/* STANY */}
      <div className="space-y-4">
        <h3 id="auth-stany" className="text-sm font-semibold text-foreground/70">Stany formularza</h3>
        <SectionLabel>Błąd, ładowanie i konto zablokowane</SectionLabel>
        <div className="flex flex-wrap gap-4">
          <GlassCard className="w-full max-w-xs">
            <GlassLoginForm error="Nieprawidłowy e-mail lub hasło." />
          </GlassCard>
          <GlassCard className="w-full max-w-xs">
            <GlassLoginForm loading />
          </GlassCard>
          <GlassCard className="flex w-full max-w-xs flex-col items-center gap-3 text-center">
            <GlassBadge intent="danger">KONTO ZABLOKOWANE</GlassBadge>
            <p className="text-xs text-foreground/60">
              Po 5 nieudanych próbach konto zostało tymczasowo zablokowane. Spróbuj ponownie za 15 minut.
            </p>
            <GlassButton size="sm" variant="ghost" className="w-full">Zresetuj hasło</GlassButton>
          </GlassCard>
        </div>
      </div>

      {/* LAYOUT STRONY AUTH */}
      <div className="space-y-4">
        <h3 id="auth-layout" className="text-sm font-semibold text-foreground/70">Layout strony logowania</h3>
        <SectionLabel>Split — marketing po lewej, formularz po prawej</SectionLabel>
        <div className="relative overflow-hidden rounded-2xl border border-border p-6">
          <GlassOrb size={300} style={{ top: -90, left: -70 }} opacity={0.14} />
          <GlassSplit ratio="1/2">
            <div className="relative space-y-3">
              <Logo />
              <h2 className="text-2xl font-light tracking-tight text-foreground">
                Przestań gonić AI.<br />Zacznij go używać.
              </h2>
              <p className="max-w-xs text-xs leading-relaxed text-foreground/50">
                Jedna platforma, jedna waluta rozliczeniowa, wszystkie modele. Bez żonglowania kontami.
              </p>
              <div className="flex gap-2 pt-1">
                <GlassBadge size="sm" intent="success" dot>99.8% uptime</GlassBadge>
                <GlassBadge size="sm">4.9/5 · 2 400 opinii</GlassBadge>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <GlassAuthCard title="Zaloguj się" subtitle="Witamy z powrotem">
                <div className="flex flex-col gap-3">
                  <GlassSocialButtons layout="row" />
                  <GlassDivider label="albo" />
                  <GlassLoginForm />
                </div>
              </GlassAuthCard>
            </div>
          </GlassSplit>
        </div>
      </div>

    </div>
  )
}
