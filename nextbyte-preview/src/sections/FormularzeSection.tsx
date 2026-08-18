import React, { useState } from 'react'
import { Mail, Lock, User, Phone, Hash, Link2, CreditCard } from 'lucide-react'
import { Input, Field } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  GlassSearch, GlassCard, GlassCalendar, GlassDatePicker, GlassCombobox,
  GlassStepper, GlassProgressSteps, GlassButton,
} from '@/components/glass'
import type { DateRange, ComboOption } from '@/components/glass'
import { Cpu, Brain, Sparkles as SparkIcon, Bot, User as UserIcon, CreditCard as CardIcon, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxField } from '@/components/ui/checkbox'
import { RadioGroup, RadioField, RadioCard } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { GlassSlider } from '@/components/glass'
import { Rating, EmojiRating } from '@/components/ui/rating'
import { OtpInput } from '@/components/ui/otp-input'
import { TagInput } from '@/components/ui/tag-input'
import { FileUploadButton, FileDropzone, FileList, type UploadedFile } from '@/components/ui/file-upload'
import { FormSection, FormRow, FormDivider, FieldGroup, FormActions } from '@/components/ui/form-layout'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

const MODEL_OPTIONS: ComboOption[] = [
  { value: 'gpt4o',    label: 'GPT-4o',            hint: '128k', icon: SparkIcon },
  { value: 'claude4',  label: 'Claude Sonnet 4',   hint: '200k', icon: Brain },
  { value: 'gemini',   label: 'Gemini 1.5 Flash',  hint: '1M',   icon: Bot },
  { value: 'llama3',   label: 'Llama 3 70B',       hint: '128k', icon: Cpu },
  { value: 'mistral',  label: 'Mistral Large',     hint: '128k', icon: Cpu },
  { value: 'command',  label: 'Command R+',        hint: '128k', icon: Bot, disabled: true },
]

const CHECKOUT_STEPS = [
  { label: 'Koszyk',    description: '3 produkty',    icon: PackageCheck },
  { label: 'Dane',      description: 'Adres wysyłki', icon: UserIcon },
  { label: 'Płatność',  description: 'BLIK / karta',  icon: CardIcon },
  { label: 'Gotowe',    description: 'Potwierdzenie', icon: SparkIcon },
]

export function FormularzeSection() {
  const [searchVal, setSearchVal] = useState('')
  const [tags, setTags] = useState(['react', 'typescript'])
  const [singleDate, setSingleDate] = useState<Date | null>(null)
  const [rangeDate, setRangeDate] = useState<DateRange>({ from: null, to: null })
  const [comboSingle, setComboSingle] = useState<string>('claude4')
  const [comboMulti, setComboMulti] = useState<string[]>(['gpt4o', 'gemini'])
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: 'roadmapa-studio.pdf', size: 245000 },
    { name: 'okladka.png', size: 1200000, progress: 62 },
  ])

  return (
    <div className="space-y-10">

      {/* INPUTS */}
      <div className="space-y-4">
        <h3 id="input" className="text-sm font-semibold text-foreground/70">Pola tekstowe (Input)</h3>

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

        <SectionLabel>Typy specjalne</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input iconLeft={<Hash className="h-4 w-4" />} type="number" placeholder="Ilość..." />
          <Input iconLeft={<Link2 className="h-4 w-4" />} type="url" placeholder="https://..." />
          <Input iconLeft={<Phone className="h-4 w-4" />} type="tel" placeholder="+48 ___ ___ ___" />
          <Input iconLeft={<CreditCard className="h-4 w-4" />} placeholder="0000 0000 0000 0000" />
        </div>
      </div>

      {/* TEXTAREA */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Pole wieloliniowe (Textarea)</h3>
        <SectionLabel>Warianty</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <Textarea placeholder="Domyślne pole tekstowe..." rows={3} />
          <Textarea variant="ghost" placeholder="Ghost..." rows={3} />
          <Textarea variant="error" placeholder="Błędne pole..." rows={3} />
          <Textarea placeholder="Z licznikiem znaków..." rows={3} showCount maxLength={140} />
        </div>
        <SectionLabel>Auto-resize (rośnie z treścią)</SectionLabel>
        <Textarea autoGrow placeholder="Zacznij pisać, pole samo urośnie..." className="max-w-md" defaultValue="Ten tekst jest wystarczająco długi, żeby pole trochę urosło." />
      </div>

      {/* CHECKBOX */}
      <div className="space-y-4">
        <h3 id="checkbox" className="text-sm font-semibold text-foreground/70">Checkbox</h3>
        <SectionLabel>Rozmiary i stany</SectionLabel>
        <div className="flex flex-wrap items-center gap-6">
          <Checkbox checkboxSize="sm" defaultChecked />
          <Checkbox checkboxSize="default" defaultChecked />
          <Checkbox checkboxSize="lg" defaultChecked />
          <Checkbox checked="indeterminate" />
          <Checkbox disabled />
          <Checkbox disabled defaultChecked />
        </div>
        <SectionLabel>Grupa checkboxów</SectionLabel>
        <GlassCard className="max-w-sm space-y-4">
          <CheckboxField label="Powiadomienia e-mail" description="Otrzymuj podsumowanie co tydzień" defaultChecked />
          <CheckboxField label="Powiadomienia push" description="Alerty w czasie rzeczywistym" />
          <CheckboxField label="Newsletter" description="Nowości i promocje" defaultChecked />
        </GlassCard>
      </div>

      {/* RADIO */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Radio</h3>
        <SectionLabel>Grupa pionowa</SectionLabel>
        <RadioGroup defaultValue="pro" className="max-w-xs">
          <RadioField value="free" label="Darmowy" description="Podstawowe funkcje" />
          <RadioField value="pro" label="Pro" description="Wszystko odblokowane" />
          <RadioField value="enterprise" label="Enterprise" description="Dla zespołów" />
        </RadioGroup>
        <SectionLabel>Grupa pozioma</SectionLabel>
        <RadioGroup defaultValue="m" className="flex flex-row gap-6">
          <RadioField value="s" label="S" />
          <RadioField value="m" label="M" />
          <RadioField value="l" label="L" />
        </RadioGroup>
        <SectionLabel>Radio card (klikalny kafelek)</SectionLabel>
        <RadioGroup defaultValue="pro" className="max-w-sm">
          <RadioCard value="free" label="Darmowy" description="0 zł / mies." />
          <RadioCard value="pro" label="Pro" description="49 zł / mies." />
          <RadioCard value="enterprise" label="Enterprise" description="Wycena indywidualna" />
        </RadioGroup>
      </div>

      {/* SELECT */}
      <div className="space-y-4">
        <h3 id="select" className="text-sm font-semibold text-foreground/70">Wybór (Select)</h3>
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

        <SectionLabel>Select natywny (native)</SectionLabel>
        <select
          defaultValue="claude"
          className="h-10 w-full max-w-sm rounded-xl border border-border bg-input px-3 text-sm text-foreground transition-colors hover:border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <option value="gpt4">GPT-4o</option>
          <option value="claude">Claude 4</option>
          <option value="gemini">Gemini Flash</option>
        </select>
      </div>

      {/* SLIDER */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Slider</h3>
        <SectionLabel>GlassSlider — pojedynczy, z wartością · Glass / Normal automatycznie</SectionLabel>
        <GlassSlider defaultValue={[40]} max={100} step={1} showValue className="max-w-sm" />
        <SectionLabel>GlassSlider — zakres (range)</SectionLabel>
        <GlassSlider defaultValue={[20, 70]} max={100} step={1} showValue formatValue={(v) => `${v} Byte`} className="max-w-sm" />
        <SectionLabel>ui/Slider — wariant bazowy (bez glass glow)</SectionLabel>
        <Slider defaultValue={[60]} max={100} step={1} showValue className="max-w-sm" />
      </div>

      {/* COMBOBOX */}
      <div className="space-y-4">
        <h3 id="combobox" className="text-sm font-semibold text-foreground/70">Combobox / Autocomplete</h3>
        <SectionLabel>Pojedynczy wybór z wyszukiwaniem — strzałki + Enter, Esc zamyka</SectionLabel>
        <GlassCombobox
          options={MODEL_OPTIONS}
          value={comboSingle}
          onChange={(v) => setComboSingle(v as string)}
          placeholder="Wybierz model AI..."
        />

        <SectionLabel>Multi-select — wybrane jako chipy, Backspace zdejmuje ostatni</SectionLabel>
        <GlassCombobox
          multiple
          options={MODEL_OPTIONS}
          value={comboMulti}
          onChange={(v) => setComboMulti(v as string[])}
          placeholder="Wybierz modele do porównania..."
        />

        <SectionLabel>Stan pusty i zablokowany</SectionLabel>
        <div className="flex flex-wrap gap-3">
          <GlassCombobox options={[]} placeholder="Brak dostępnych opcji" emptyText="Nic tu nie ma" />
          <GlassCombobox options={MODEL_OPTIONS} disabled placeholder="Zablokowane" />
        </div>
      </div>

      {/* KALENDARZ / DATA */}
      <div className="space-y-4">
        <h3 id="kalendarz" className="text-sm font-semibold text-foreground/70">Kalendarz i wybór daty</h3>

        <SectionLabel>Date picker — pojedyncza data</SectionLabel>
        <GlassDatePicker
          value={singleDate}
          onChange={(v) => setSingleDate(v as Date)}
          placeholder="Wybierz datę"
        />

        <SectionLabel>Date range picker — zakres z podglądem przy najechaniu</SectionLabel>
        <GlassDatePicker
          mode="range"
          value={rangeDate}
          onChange={(v) => setRangeDate(v as DateRange)}
          placeholder="Wybierz zakres dat"
          className="min-w-[260px]"
        />

        <SectionLabel>Kalendarz osadzony — widok miesiąca</SectionLabel>
        <div className="flex flex-wrap items-start gap-4">
          <GlassCalendar
            value={singleDate}
            onChange={(v) => setSingleDate(v as Date)}
          />
          <div className="flex flex-col gap-2">
            <SectionLabel>Wariant kompaktowy (widget)</SectionLabel>
            <GlassCalendar compact value={singleDate} onChange={(v) => setSingleDate(v as Date)} />
          </div>
        </div>

        <SectionLabel>Kalendarz zakresu — z ograniczeniem do przyszłości</SectionLabel>
        <GlassCalendar
          mode="range"
          value={rangeDate}
          onChange={(v) => setRangeDate(v as DateRange)}
          minDate={new Date()}
        />
      </div>

      {/* STEPPER */}
      <div className="space-y-4">
        <h3 id="stepper" className="text-sm font-semibold text-foreground/70">Stepper / Kroki</h3>

        <SectionLabel>Poziomy — kliknij krok, żeby przeskoczyć</SectionLabel>
        <GlassCard>
          <GlassStepper steps={CHECKOUT_STEPS} current={step} onStepClick={setStep} />
          <div className="mt-6 flex justify-between gap-2">
            <GlassButton size="sm" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Wstecz
            </GlassButton>
            <GlassButton size="sm" onClick={() => setStep((s) => Math.min(CHECKOUT_STEPS.length - 1, s + 1))} disabled={step === CHECKOUT_STEPS.length - 1}>
              Dalej
            </GlassButton>
          </div>
        </GlassCard>

        <SectionLabel>Poziomy ze stanem błędu na kroku bieżącym</SectionLabel>
        <GlassCard>
          <GlassStepper steps={CHECKOUT_STEPS} current={2} error />
        </GlassCard>

        <SectionLabel>Pionowy — kreator z opisami</SectionLabel>
        <GlassCard className="max-w-sm">
          <GlassStepper steps={CHECKOUT_STEPS} orientation="vertical" current={step} onStepClick={setStep} />
        </GlassCard>

        <SectionLabel>Pasek postępu — bez opisów, do nagłówka kreatora</SectionLabel>
        <GlassCard className="max-w-md">
          <GlassProgressSteps
            total={CHECKOUT_STEPS.length}
            current={step}
            labels={CHECKOUT_STEPS.map((s) => s.label)}
          />
        </GlassCard>
      </div>

      {/* RATING */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Rating</h3>
        <SectionLabel>Gwiazdki</SectionLabel>
        <div className="flex flex-wrap items-center gap-6">
          <Rating defaultValue={4} size="sm" />
          <Rating defaultValue={3} size="default" />
          <Rating defaultValue={5} size="lg" readOnly />
        </div>
        <SectionLabel>Emoji</SectionLabel>
        <EmojiRating defaultValue={4} />
      </div>

      {/* OTP */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">OTP / PIN input</h3>
        <SectionLabel>6 pól</SectionLabel>
        <OtpInput length={6} />
        <SectionLabel>Błąd</SectionLabel>
        <OtpInput length={6} defaultValue="12" error />
      </div>

      {/* TAG INPUT */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Tag input</h3>
        <SectionLabel>Dodawaj Enterem, usuwaj Backspace/X</SectionLabel>
        <TagInput value={tags} onChange={setTags} className="max-w-md" />
      </div>

      {/* FILE UPLOAD */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">File upload</h3>
        <SectionLabel>Przycisk</SectionLabel>
        <FileUploadButton onFiles={(f) => setFiles((prev) => [...prev, ...f.map((x) => ({ name: x.name, size: x.size }))])} />
        <SectionLabel>Drag & drop</SectionLabel>
        <FileDropzone
          className="max-w-md"
          multiple
          onFiles={(f) => setFiles((prev) => [...prev, ...f.map((x) => ({ name: x.name, size: x.size }))])}
        />
        <SectionLabel>Lista wgranych (multi + preview)</SectionLabel>
        <FileList
          files={files}
          onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
          className="max-w-md"
        />
      </div>

      {/* LAYOUT FORMULARZA */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Layout formularza</h3>
        <GlassCard className="max-w-2xl">
          <FormSection title="Dane konta" description="Podstawowe informacje widoczne w profilu">
            <FormRow columns={2}>
              <Field label="Imię"><Input placeholder="Jan" /></Field>
              <Field label="Nazwisko"><Input placeholder="Kowalski" /></Field>
            </FormRow>
            <Field label="Email" hint="Nigdy nie udostępniamy go publicznie">
              <Input iconLeft={<Mail className="h-4 w-4" />} type="email" placeholder="jan@nextbyte.pl" />
            </Field>
          </FormSection>

          <FormDivider className="my-6" />

          <FormSection title="Adres rozliczeniowy">
            <FieldGroup label="Adres">
              <FormRow columns={2}>
                <Field label="Miasto"><Input placeholder="Warszawa" /></Field>
                <Field label="Kod pocztowy"><Input placeholder="00-000" /></Field>
              </FormRow>
              <Field label="Ulica i numer"><Input placeholder="ul. Przykładowa 1" /></Field>
            </FieldGroup>
          </FormSection>

          <FormActions className="mt-6" align="right">
            <Button variant="ghost">Anuluj</Button>
            <Button variant="nextbyte">Zapisz zmiany</Button>
          </FormActions>
        </GlassCard>
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
