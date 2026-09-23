import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Logowanie do podglądu — własnym kontem NextByte, na PRAWDZIWEJ bazie.
 *
 * Strona logowania platformy to osobny moduł (2FA mailowe, zaufane urządzenia,
 * rejestracja), którego ta paczka nie niesie. Tu jest najprostsza droga:
 * e-mail + hasło, a gdy konto ma kod z aplikacji (TOTP) — jeszcze kod.
 *
 * Wszystko, co zrobisz po zalogowaniu, dzieje się na Twoim koncie naprawdę:
 * generowanie zużywa Byte, zapisane rzeczy zostają w bazie.
 */
export function BramkaLogowania({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [kod, setKod] = useState('');
  const [wymagaKodu, setWymagaKodu] = useState(false);
  const [blad, setBlad] = useState<string | null>(null);
  const [pracuje, setPracuje] = useState(false);

  /* Sesja z poprzedniego razu może czekać na drugi składnik. */
  useEffect(() => {
    if (!user) return;
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      setWymagaKodu(data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2');
    });
  }, [user]);

  const zaloguj = async (e: FormEvent) => {
    e.preventDefault();
    setPracuje(true);
    setBlad(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: haslo });
    if (error) setBlad(error.message === 'Invalid login credentials' ? 'Nieprawidłowy e-mail lub hasło' : error.message);
    setPracuje(false);
  };

  const potwierdzKod = async (e: FormEvent) => {
    e.preventDefault();
    setPracuje(true);
    setBlad(null);
    try {
      const { data: czynniki } = await supabase.auth.mfa.listFactors();
      const totp = czynniki?.totp?.[0];
      if (!totp) throw new Error('Konto nie ma skonfigurowanego kodu z aplikacji');
      const { data: wyzwanie, error: bladWyzwania } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (bladWyzwania || !wyzwanie) throw bladWyzwania ?? new Error('Nie udało się rozpocząć weryfikacji');
      const { error } = await supabase.auth.mfa.verify({ factorId: totp.id, challengeId: wyzwanie.id, code: kod.trim() });
      if (error) throw error;
      setWymagaKodu(false);
    } catch (err) {
      setBlad(err instanceof Error ? err.message : 'Nieprawidłowy kod');
    } finally {
      setPracuje(false);
    }
  };

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Ładowanie…</div>;
  }
  if (user && !wymagaKodu) return <>{children}</>;

  const pole = 'w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary';

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <form
        onSubmit={wymagaKodu ? potwierdzKod : zaloguj}
        className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div>
          <h1 className="text-lg font-semibold text-foreground">Podgląd NextByte</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {wymagaKodu ? 'Wpisz kod z aplikacji uwierzytelniającej.' : 'Zaloguj się swoim kontem NextByte.'}
          </p>
        </div>
        {wymagaKodu ? (
          <input className={pole} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={kod} onChange={(e) => setKod(e.target.value)} />
        ) : (
          <>
            <input className={pole} type="email" autoComplete="email" placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={pole} type="password" autoComplete="current-password" placeholder="hasło" value={haslo} onChange={(e) => setHaslo(e.target.value)} />
          </>
        )}
        {blad && <p className="text-xs text-destructive">{blad}</p>}
        <button
          type="submit"
          disabled={pracuje}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pracuje ? 'Chwila…' : wymagaKodu ? 'Potwierdź' : 'Zaloguj'}
        </button>
      </form>
    </div>
  );
}
