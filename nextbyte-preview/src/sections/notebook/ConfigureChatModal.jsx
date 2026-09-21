import React, { useState } from 'react';
import { Check, Sparkles, Sliders, BookOpen, HelpCircle, Briefcase, PenTool } from 'lucide-react';
import { GlassModal, GlassButton } from '@/components/glass';
import { cn } from '@/lib/utils';

const GOAL_OPTIONS = [
  {
    id: 'default',
    label: 'Domyślny (Default)',
    icon: Sparkles,
    desc: 'Najlepszy do ogólnych badań, analiz i burzy mózgów.',
    prompt: ''
  },
  {
    id: 'guide',
    label: 'Przewodnik Naukowy',
    icon: BookOpen,
    desc: 'Wyjaśnia skomplikowane pojęcia krok po kroku i ułatwia przyswajanie wiedzy.',
    prompt: 'Jesteś przewodnikiem naukowym. Wyjaśniaj pojęcia krok po kroku, stosuj analogie i pomagaj użytkownikowi w nauce.'
  },
  {
    id: 'socratic',
    label: 'Sokrates (Pytania)',
    icon: HelpCircle,
    desc: 'Zadaje pytania naprowadzające, skłania do myślenia i testuje Twoją wiedzę.',
    prompt: 'Odpowiadaj metodą sokratejską. Zadawaj pytania naprowadzające, skłaniaj użytkownika do samodzielnego wnioskowania.'
  },
  {
    id: 'executive',
    label: 'Streszczenie Biznesowe',
    icon: Briefcase,
    desc: 'Skupia się na najważniejszych wnioskach, liczbach i punktach kluczowych.',
    prompt: 'Bądź zwięzły i konkretny. Odpowiadaj w punktach, skupiaj się na kluczowych wnioskach i faktach.'
  },
  {
    id: 'custom',
    label: 'Własna Rola (Custom)',
    icon: PenTool,
    desc: 'Wpisz własne instrukcje systemowe dla sztucznej inteligencji.',
    prompt: ''
  }
];

const LENGTH_OPTIONS = [
  { id: 'default', label: 'Domyślna (Default)', desc: 'Zbalansowane odpowiedzi' },
  { id: 'longer', label: 'Dłuższa (Longer)', desc: 'Wyczerpujące analizy i szerszy kontekst' },
  { id: 'shorter', label: 'Krótsza (Shorter)', desc: 'Zwięzłe, szybkie odpowiedzi w punktach' },
];

export default function ConfigureChatModal({ isOpen, onClose, chatConfig, onSaveConfig }) {
  const [goal, setGoal] = useState(() => chatConfig?.goal || 'default');
  const [length, setLength] = useState(() => chatConfig?.length || 'default');
  const [customPrompt, setCustomPrompt] = useState(() => chatConfig?.customPrompt || '');

  if (!isOpen) return null;

  const currentGoalObj = GOAL_OPTIONS.find(g => g.id === goal) || GOAL_OPTIONS[0];

  const handleSave = () => {
    onSaveConfig({
      goal,
      length,
      customPrompt: goal === 'custom' ? customPrompt : currentGoalObj.prompt
    });
    onClose();
  };

  return (
    <GlassModal
      open={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-nb-sm bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <Sliders size={16} />
          </span>
          <span>Dostosuj czat (Configure Chat)</span>
        </span>
      }
      subtitle="Personalizuj zachowanie, ton i cel konwersacji z AI"
      width="max-w-xl"
    >
      <div className="space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar -mx-6 px-6">
        <p className="text-xs text-foreground/60 leading-relaxed">
          Notatnik może być dostosowany do Twoich celów naukowych i badawczych. Wybierz styl wypowiedzi oraz długość generowanych odpowiedzi.
        </p>

        {/* Goal selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
            Zdefiniuj cel konwersacji, styl lub rolę
          </label>

          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map(opt => {
              const isSelected = goal === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGoal(opt.id)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary/60 shadow-[0_0_12px_rgba(112,190,250,0.3)]'
                      : 'nb-szklo bg-card/40 text-foreground/60 border-foreground/15 hover:text-foreground hover:bg-card/70'
                  )}
                >
                  {isSelected && <Check size={13} strokeWidth={3} />}
                  <Icon size={13} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-primary/90 italic pt-1">
            {currentGoalObj.desc}
          </p>

          {goal === 'custom' && (
            <div className="pt-2">
              <textarea
                rows={3}
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="Wpisz swoje szczegółowe instrukcje dla AI (np. Odpowiadaj po angielsku, używaj terminologii medycznej...)"
                className="w-full p-3 rounded-nb-sm nb-szklo bg-card/40 border-foreground/15 text-xs text-foreground placeholder:text-foreground/35 outline-none focus:border-primary/50 resize-none font-sans"
              />
            </div>
          )}
        </div>

        {/* Response length selection */}
        <div className="space-y-3 pt-2 border-t border-foreground/10">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
            Wybierz długość odpowiedzi
          </label>

          <div className="flex flex-wrap gap-2">
            {LENGTH_OPTIONS.map(opt => {
              const isSelected = length === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLength(opt.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary/60 shadow-[0_0_12px_rgba(112,190,250,0.3)]'
                      : 'nb-szklo bg-card/40 text-foreground/60 border-foreground/15 hover:text-foreground hover:bg-card/70'
                  )}
                >
                  {isSelected && <Check size={13} strokeWidth={3} />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-5 mt-1 border-t border-foreground/10">
        <GlassButton type="button" variant="ghost" onClick={onClose}>
          Anuluj
        </GlassButton>
        <GlassButton type="button" variant="solid" onClick={handleSave}>
          Zapisz
        </GlassButton>
      </div>
    </GlassModal>
  );
}
