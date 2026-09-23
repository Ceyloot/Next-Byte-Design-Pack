import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Plus, Trash2, Pencil, Check, X, CalendarClock, BarChart3, ListChecks, Lightbulb, MessageSquare, Mail, FileText, Search, Brain, Target, Zap, Bot, Globe, Bell, Star, Heart, Rocket, Flag, Coffee, Music, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssistantQuickActions, DEFAULT_QUICK_ACTIONS, QuickAction } from '@/hooks/useAssistantQuickActions';

const ICON_CHOICES = [
  'Sparkles', 'CalendarClock', 'BarChart3', 'ListChecks', 'Lightbulb',
  'MessageSquare', 'Mail', 'FileText', 'Search', 'Brain', 'Target',
  'Zap', 'Bot', 'Globe', 'Bell', 'Star', 'Heart', 'Rocket', 'Flag',
  'Coffee', 'Music', 'Camera',
];

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const C = (LucideIcons as any)[name] || Sparkles;
  return <C className={className} />;
};

export function AssistantQuickActionsSection() {
  const { custom, addAction, updateAction, removeAction } = useAssistantQuickActions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftIcon, setDraftIcon] = useState('Sparkles');
  const [isAdding, setIsAdding] = useState(false);

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setDraftLabel('');
    setDraftPrompt('');
    setDraftIcon('Sparkles');
  };

  const startEdit = (a: QuickAction) => {
    setIsAdding(false);
    setEditingId(a.id);
    setDraftLabel(a.label);
    setDraftPrompt(a.prompt);
    setDraftIcon(a.icon);
  };

  const cancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const save = () => {
    const label = draftLabel.trim();
    const prompt = draftPrompt.trim();
    if (!label || !prompt) return;
    if (isAdding) {
      addAction({ label, prompt, icon: draftIcon });
    } else if (editingId) {
      updateAction(editingId, { label, prompt, icon: draftIcon });
    }
    cancel();
  };

  const IconPicker = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-11 w-11 rounded-xl flex items-center justify-center bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition"
          title="Wybierz ikonę"
        >
          <Icon name={draftIcon} className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 p-2 rounded-2xl nb-szklo nb-szklo-plynne border-foreground/10"
      >
        <div className="grid grid-cols-6 gap-1">
          {ICON_CHOICES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setDraftIcon(name)}
              className={cn(
                'h-9 w-9 rounded-lg flex items-center justify-center transition',
                draftIcon === name
                  ? 'bg-primary/30 text-primary ring-1 ring-primary/50'
                  : 'hover:bg-primary/10 text-muted-foreground'
              )}
            >
              <Icon name={name} className="w-4 h-4" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="glass-effect bg-background/45 border-brand-primary/30 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="text-lg font-semibold text-brand-text-primary">Szybkie akcje Asystenta</h3>
          <p className="text-sm text-brand-text-secondary mt-1">
            Domyślne kafelki są zawsze widoczne. Dodaj własne przyciski z gotowymi promptami,
            ikoną i nazwą — pojawią się w menu „Szybkie akcje" pod przyciskiem Personalizacja.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={startAdd}
          variant="glass"
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" /> Dodaj
        </Button>
      </div>

      {/*
        DOMYŚLNE JAKO RZĄD PIGUŁEK, NIE CZTERY KAFELKI (06.08.2026).

        Michał: „ile miejsca to zajmuje". Zmierzone: cała sekcja „Szybkie
        akcje" brała 322 px, z czego lwią część te cztery kafelki — każdy
        z ikoną w osobnym pudełku i etykietą POD nią, czyli układ pionowy
        tam, gdzie treścią jest jedno słowo.

        To jest podgląd rzeczy, których NIE DA SIĘ zmienić — nie ma tu ani
        jednej akcji. Podgląd nie potrzebuje kafelków; wystarczy, że widać,
        co się dostaje. Ikona i etykieta w jednej linii, zawijane w rząd.
      */}
      <div className="mt-3">
        <div className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          Domyślne
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_QUICK_ACTIONS.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/5 px-2.5 py-1.5"
              title={a.prompt}
            >
              <Icon name={a.icon} className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">{a.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Custom list */}
      <div className="mt-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Twoje
        </div>
        {/* Pusty stan w jednej linii — ramka przerywana na całą szerokość
            z dwuzdaniowym tekstem robiła z braku treści osobną sekcję.
            Komentarz stoi NAD wyrażeniem warunkowym, bo komentarz JSX
            wstawiony w środek nawiasu warunku nie jest poprawnym JSX-em. */}
        {custom.length === 0 && !isAdding && (
          <p className="px-0.5 text-xs text-muted-foreground">
            Brak własnych akcji — kliknij „Dodaj", żeby utworzyć pierwszą.
          </p>
        )}
        <div className="space-y-2">
          {custom.map((a) => {
            const isEditing = editingId === a.id;
            if (isEditing) return null;
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 border border-foreground/10"
              >
                <span className="p-2 rounded-lg bg-primary/15 text-primary">
                  <Icon name={a.icon} className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{a.label}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{a.prompt}</div>
                </div>
                <Button type="button" size="icon" variant="cichy" className="h-8 w-8" onClick={() => startEdit(a)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="usun"
                  className="h-8 w-8"
                  onClick={() => removeAction(a.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Editor */}
        {(isAdding || editingId) && (
          <div className="mt-3 p-4 rounded-xl border border-primary/30 bg-primary/[0.04] space-y-3">
            <div className="flex items-start gap-3">
              {IconPicker}
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-xs text-brand-text-secondary">Nazwa</Label>
                  <Input
                    value={draftLabel}
                    onChange={(e) => setDraftLabel(e.target.value)}
                    placeholder="np. Plan tygodnia"
                    className="h-10 mt-1 bg-background/60 border-primary/20"
                    maxLength={32}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs text-brand-text-secondary">Prompt</Label>
              <Textarea
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                placeholder="Co dokładnie ma zrobić asystent po kliknięciu w ten przycisk?"
                rows={4}
                className="mt-1 bg-background/60 border-primary/20"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="cichy" size="sm" onClick={cancel}>
                <X className="w-4 h-4 mr-1" /> Anuluj
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={save}
                disabled={!draftLabel.trim() || !draftPrompt.trim()}
                variant="glass"
              >
                <Check className="w-4 h-4 mr-1" /> Zapisz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssistantQuickActionsSection;
