
import React from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedBorderInput } from '@/components/ui/animated-border-input';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import { CheckCircle, XCircle, Lock, KeyRound } from 'lucide-react';

interface PasswordTabProps {
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  onChangePassword: () => void;
  onCancel: () => void;
  isChangingPassword: boolean;
}

export function PasswordTab({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onChangePassword,
  onCancel,
  isChangingPassword
}: PasswordTabProps) {
  const passwordValidation = usePasswordValidation(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && passwordValidation.valid && passwordsMatch && newPassword.length > 0;

  return (
    <div className="space-y-3 p-2">
      <div className="glass-effect bg-background/45 border-brand-primary/30 rounded-2xl p-4">
        {/*
          ══════════════════════════════════════════════════════════════════
           DWIE KOLUMNY ZAMIAST JEDNEJ WIEŻY (06.08.2026)
          ══════════════════════════════════════════════════════════════════

          Michał, ze zrzutem pomalowanym na czerwono: pola haseł zajmowały
          lewą połowę, a cała prawa stała PUSTA — i pod nimi, przez całą
          szerokość, siedmiowierszowa lista wymagań. Trzy pola i lista, które
          się wzajemnie dotyczą, były rozciągnięte na dwa ekrany wysokości,
          mając obok wolne pół ekranu.

          Teraz: pola po lewej, wymagania po prawej — w tej samej wysokości,
          na którą i tak trzeba było patrzeć. Lista stoi PRZY polu, którego
          dotyczy, więc przy wpisywaniu widać ją bez przewijania.

          `lg:` a nie `md:` — przy 768 px dwie kolumny robią z pól hasła
          wąskie paski; podział wchodzi dopiero tam, gdzie jest na niego
          miejsce. Poniżej wraca układ jeden pod drugim.
        */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
          <div className="space-y-3">
          {/* Current Password */}
          <div className="space-y-3">
            <AnimatedBorderInput
              id="currentPassword"
              type="password"
              label="Aktualne hasło"
              icon={KeyRound}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Wprowadź aktualne hasło"
              autoComplete="current-password"
            />
          </div>

          {/* New Password */}
          <div className="space-y-3">
            <AnimatedBorderInput
              id="newPassword"
              type="password"
              label="Nowe hasło"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Wprowadź nowe hasło"
              autoComplete="new-password"
            />
            {newPassword && !passwordValidation.valid && (
              <div className="glass-effect rounded-lg p-3 border border-red-500/30 bg-red-500/10">
                <div className="text-sm text-red-400 space-y-1">
                  <div className="font-medium mb-2">Niespełnione wymagania:</div>
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                      {error}
                    </div>
                  ))}
                  {passwordValidation.score > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-500/20">
                      <div className="text-xs text-red-300">
                        Siła hasła: {passwordValidation.score}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <AnimatedBorderInput
              id="confirmPassword"
              type="password"
              label="Potwierdź nowe hasło"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Potwierdź nowe hasło"
              autoComplete="new-password"
            />
            {confirmPassword && !passwordsMatch && (
              <div className="glass-effect rounded-lg p-3 border border-red-500/30 bg-red-500/10">
                <div className="text-sm text-red-400">
                  • Hasła nie są identyczne
                </div>
              </div>
            )}
          </div>

          </div>

          {/* Password Requirements — prawa kolumna */}
          <div className="glass-effect rounded-lg p-4 border border-border/50 lg:sticky lg:top-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-brand-text-primary">Wymagania dotyczące hasła</h4>
              {newPassword && (
                <div className={`text-xs px-2 py-1 rounded ${
                  passwordValidation.score >= 80 ? 'bg-green-500/20 text-green-400' :
                  passwordValidation.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                  passwordValidation.score >= 40 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  Siła: {passwordValidation.score}%
                </div>
              )}
            </div>
            <ul className="text-sm space-y-2">
              {passwordValidation.requirements.map((requirement) => (
                <li 
                  key={requirement.id}
                  className={`flex items-center gap-2 transition-colors ${
                    requirement.met ? 'text-green-400' : 'text-brand-text-secondary'
                  }`}
                >
                  {requirement.met ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-brand-text-tertiary flex-shrink-0" />
                  )}
                  {requirement.label}
                </li>
              ))}
            </ul>
            
            {newPassword && passwordValidation.valid && (
              <div className="mt-3 pt-3 border-t border-green-500/20">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Hasło spełnia wszystkie wymagania bezpieczeństwa
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Akcje poza siatką — dotyczą całej karty, nie jednej kolumny. */}
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-border/40">
            <Button
              variant="obwodka"
              onClick={onCancel}
              disabled={isChangingPassword}
            >
              Anuluj
            </Button>
            <Button
              onClick={onChangePassword}
              disabled={isChangingPassword || !canSubmit}
              variant="glass"
            >
              {isChangingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Zmieniam...
                </>
              ) : (
                'Zmień hasło'
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}
