import React, { useState } from 'react'
import { Mail, Lock, User } from 'lucide-react'
import { Input, Field } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { GlassSearch, GlassCard } from '@/components/glass'
import { Button } from '@/components/ui/button'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-foreground/40">{children}</p>
}

export function FormularzeSection() {
  const [searchVal, setSearchVal] = useState('')

  return (
    <div className="space-y-10">

      {/* INPUTS */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Pola tekstowe (Input)</h3>

        <SectionLabel>Warianty</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Domyślne pole..." />
          <Input iconLeft={<Mail className="h-4 w-4" />} placeholder="Email..." type="email" />
          <Input iconLeft={<Lock className="h-4 w-4" />} type="password" placeholder="Hasło..." />
          <Input iconLeft={<User className="h-4 w-4" />} placeholder="Nazwa użytkownika..." />
        </div>

        <SectionLabel>Rozmiary</SectionLabel>
        <div className="flex flex-col gap-3 max-w-sm">
          <Input inputSize="sm" placeholder="Rozmiar sm..." />
          <Input inputSize="default" placeholder="Rozmiar default..." />
          <Input inputSize="lg" placeholder="Rozmiar lg..." />
        </div>

        <SectionLabel>Wariant error</SectionLabel>
        <div className="flex flex-col gap-3 max-w-sm">
          <Input variant="error" placeholder="Błędne pole..." />
          <Input variant="ghost" placeholder="Ghost pole..." />
        </div>
      </div>

      {/* SELECT */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Wybór (Select)</h3>
        <SectionLabel>Rozmiary i stany</SectionLabel>
        <div className="flex flex-col gap-3 max-w-sm">
          <Select>
            <SelectTrigger triggerSize="sm"><SelectValue placeholder="Mały select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt4">GPT-4o</SelectItem>
              <SelectItem value="claude">Claude 4</SelectItem>
              <SelectItem value="gemini">Gemini Flash</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Domyślny select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt4">GPT-4o</SelectItem>
              <SelectItem value="claude">Claude 4</SelectItem>
              <SelectItem value="gemini">Gemini Flash</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger triggerSize="lg"><SelectValue placeholder="Duży select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt4">GPT-4o</SelectItem>
              <SelectItem value="claude">Claude 4</SelectItem>
              <SelectItem value="gemini">Gemini Flash</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SEARCH */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Wyszukiwanie (Search)</h3>
        <SectionLabel>Rozmiary</SectionLabel>
        <div className="flex flex-col gap-3 max-w-md">
          <GlassSearch size="sm"      placeholder="Mała wyszukiwarka..."    value={searchVal} onChange={setSearchVal} />
          <GlassSearch size="default" placeholder="Domyślna wyszukiwarka..." value={searchVal} onChange={setSearchVal} />
          <GlassSearch size="lg"      placeholder="Duża wyszukiwarka..."     value={searchVal} onChange={setSearchVal} />
        </div>
      </div>

      {/* SWITCH */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Przełączniki (Switch)</h3>
        <GlassCard className="max-w-md space-y-4">
          {[
            { label: 'Powiadomienia push',  sub: 'Otrzymuj alerty w czasie rzeczywistym', def: true  },
            { label: 'Tryb ciemny',          sub: 'Zmień wygląd interfejsu',               def: false },
            { label: 'Eksport automatyczny', sub: 'Eksportuj dane co 24h',                 def: false },
            { label: 'Telemetria',           sub: 'Udostępniaj dane do analityki',          def: true  },
          ].map(({ label, sub, def }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-foreground/50">{sub}</p>
              </div>
              <Switch defaultChecked={def} />
            </div>
          ))}
        </GlassCard>
      </div>

      {/* FORMULARZ LOGOWANIA */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Przykład — formularz logowania</h3>
        <GlassCard className="max-w-sm space-y-4">
          <div>
            <p className="text-base font-semibold text-foreground">Zaloguj się</p>
            <p className="text-xs text-foreground/50 mt-1">Witamy z powrotem w NextByte</p>
          </div>
          <Field label="Email">
            <Input iconLeft={<Mail className="h-4 w-4" />} type="email" placeholder="Email..." />
          </Field>
          <Field label="Hasło">
            <Input iconLeft={<Lock className="h-4 w-4" />} type="password" placeholder="Hasło..." />
          </Field>
          <Button variant="nextbyte" size="lg" className="w-full">Zaloguj się</Button>
        </GlassCard>
      </div>

    </div>
  )
}
