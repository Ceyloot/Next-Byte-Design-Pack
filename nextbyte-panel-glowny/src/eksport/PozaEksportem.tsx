import { Link, useLocation } from 'react-router-dom';

/** Zaślepka dla pozycji menu, które prowadzą do modułów spoza tej paczki. */
export function PozaEksportem() {
  const { pathname } = useLocation();
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="max-w-md rounded-2xl border border-border bg-card/80 p-6 text-center">
        <p className="text-sm font-medium text-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{pathname}</code> nie jest częścią tej paczki
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Paczka zawiera Panel Główny z powłoką platformy. Pozostałe moduły zostały poza nią.
        </p>
        <Link to="/panel-glowny" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
          Wróć do Panelu Głównego
        </Link>
      </div>
    </div>
  );
}
