import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Plus, Trash2, ShieldCheck, ShieldAlert, Clock, Info, Plug, Terminal } from 'lucide-react';
import { useDesktopTokens, type DesktopDeviceToken } from '@/hooks/useDesktopTokens';
import { useMcpTokens, type McpAccessToken } from '@/hooks/useMcpTokens';
import { GenerateDeviceTokenDialog } from './GenerateDeviceTokenDialog';
import { GenerateMcpTokenDialog } from './GenerateMcpTokenDialog';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { klasyKafelka } from '@/components/ui/tile';

const MCP_SERVER_URL = 'https://iwuvszxeutvmzcfuetuo.supabase.co/functions/v1/mcp-server';

/*
  JEDEN ŁAŃCUCH ZAMIAST DWÓCH IDENTYCZNYCH.

  `McpTokenCard` i `TokenCard` miały ten sam, 250-znakowy łańcuch klas
  wpisany dwa razy — znak w znak. Materiał niesie `klasyKafelka` (ta sama
  funkcja co w `Tile`), więc kafelek tokena jest odtąd z tego samego źródła
  co każda inna karta platformy. Zostaje tylko to, co te karty naprawdę
  wyróżnia: akcentowy rant, poświata i świetlna kreska u góry.
*/
const KLASY_KARTY_TOKENU = cn(
  klasyKafelka({ intencja: 'akcent', zwarty: true }),
  'relative border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-primary/5',
  'shadow-[0_8px_40px_hsl(var(--primary)/0.18)]',
  'after:absolute after:inset-x-4 after:top-0 after:h-px',
  'after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent',
);

const McpTokenCard: React.FC<{ token: McpAccessToken; onRevoke: (id: string) => void; isRevoking: boolean }> = ({
  token,
  onRevoke,
  isRevoking,
}) => (
  <div className={KLASY_KARTY_TOKENU}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <Plug className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground truncate">{token.name}</div>
          <div className="font-mono text-xs text-muted-foreground mt-0.5">{token.token_prefix}</div>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {token.last_used_at ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(token.last_used_at), { addSuffix: true, locale: pl })}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                Nie używany
              </span>
            )}
          </div>
        </div>
      </div>
      <Button
        size="icon"
        variant="usun"
        onClick={() => {
          if (confirm(`Odwołać token MCP „${token.name}"? Klient AI straci dostęp natychmiast.`)) {
            onRevoke(token.id);
          }
        }}
        disabled={isRevoking}
        aria-label="Odwołaj token"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const TokenCard: React.FC<{ token: DesktopDeviceToken; onRevoke: (id: string) => void; isRevoking: boolean }> = ({
  token,
  onRevoke,
  isRevoking,
}) => {
  const result = token.last_check_result as any;
  const subscribed = result?.subscribed === true;
  const tier = result?.tier as string | undefined;

  return (
    <div
      className={KLASY_KARTY_TOKENU}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground truncate">{token.device_name}</div>
            <div className="font-mono text-xs text-muted-foreground mt-0.5">{token.token_prefix}</div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              {token.last_used_at ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(token.last_used_at), { addSuffix: true, locale: pl })}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Nie używany
                </span>
              )}
              {result &&
                (subscribed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    {tier?.toUpperCase() || 'ACTIVE'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <ShieldAlert className="w-3 h-3" />
                    Brak subskrypcji
                  </span>
                ))}
            </div>
          </div>
        </div>

        <Button
          size="icon"
          variant="usun"
          onClick={() => {
            if (confirm(`Odwołać token urządzenia „${token.device_name}"? Aplikacja przestanie działać natychmiast.`)) {
              onRevoke(token.id);
            }
          }}
          disabled={isRevoking}
          aria-label="Odwołaj token"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export const ApplicationsTab: React.FC = () => {
  const { data: tokens, isLoading, revoke } = useDesktopTokens();
  const { data: mcpTokens, isLoading: mcpLoading, revoke: revokeMcp } = useMcpTokens();
  const [genOpen, setGenOpen] = useState(false);
  const [mcpGenOpen, setMcpGenOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyMcpUrl = async () => {
    try {
      await navigator.clipboard.writeText(MCP_SERVER_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-3 p-1">
      {/* Header card */}
      <div className="relative rounded-2xl border border-primary/25 nb-szklo nb-szklo-plynne bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-4 shadow-[0_8px_40px_hsl(var(--primary)/0.18)] after:absolute after:inset-x-5 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">NextByte Desktop</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Asystent głosowy sterujący komputerem. Wymaga aktywnej subskrypcji NextByte. Aplikacja używa
              Twoich własnych kluczy API (BYOK) — platforma tylko sprawdza uprawnienie.
            </p>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          Wygeneruj token dla każdego urządzenia oddzielnie. Token pokazujemy tylko raz — skopiuj go do
          aplikacji od razu. Odwołanie tokenu natychmiast blokuje aplikację na danym urządzeniu.
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Aktywne urządzenia</h4>
        <Button variant="glass" size="sm" onClick={() => setGenOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nowe urządzenie
        </Button>
      </div>

      {/* Tokens list */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground text-center py-8">Ładowanie…</div>
      ) : !tokens || tokens.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border/40 rounded-2xl">
          <Monitor className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Brak aktywnych urządzeń</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Kliknij „Nowe urządzenie", aby wygenerować pierwszy token.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              onRevoke={(id) => revoke.mutate(id)}
              isRevoking={revoke.isPending}
            />
          ))}
        </div>
      )}

      {/* ===== MCP Server section ===== */}
      <div className="pt-4 mt-4 border-t border-border/40" />

      <div className="relative rounded-2xl border border-primary/25 nb-szklo nb-szklo-plynne bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-4 shadow-[0_8px_40px_hsl(var(--primary)/0.18)] after:absolute after:inset-x-5 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Plug className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">Serwer MCP — podłącz Claude / ChatGPT</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Daj asystentowi AI (Claude Code, Claude Desktop, ChatGPT, Cursor) bezpośredni dostęp do Twoich
              notatek, zadań i pamięci NextByte. Klient MCP wywołuje narzędzia w Twoim imieniu — wszystko
              działa pod Twoim kontem i limitami Byte.
            </p>
          </div>
        </div>
      </div>

      {/*
        NAJPROSTSZA DROGA NA GÓRZE — od 21.07.2026 serwer obsługuje OAuth, więc
        nie trzeba już nigdzie wklejać tokenu. Wcześniej ta sekcja zaczynała się
        od instrukcji z nagłówkami i URL-em z tokenem w query; dane z produkcji
        pokazały, że tamtędy nie przeszedł nikt poza jednym kontem na Claude Code.
      */}
      <div className="rounded-xl border border-primary/30 nb-szklo p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide">
          <Terminal className="w-3.5 h-3.5" />
          Podłącz w 30 sekund
        </div>

        <ol className="text-sm text-foreground/90 space-y-1.5 list-decimal list-inside">
          <li>Skopiuj adres poniżej.</li>
          <li>W Claude: <strong>Ustawienia → Konektory → Dodaj własny konektor</strong>.</li>
          <li>Wklej adres i zaloguj się swoim kontem NextByte. Gotowe.</li>
        </ol>

        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-xs bg-background/60 border border-border/40 rounded-lg px-3 py-2 break-all select-all">
            {MCP_SERVER_URL}
          </code>
          <Button size="sm" variant="cichy" onClick={copyMcpUrl}>
            {copiedUrl ? 'Skopiowano' : 'Kopiuj'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Nie potrzebujesz tokenu — logowanie odbywa się przez okno zgody NextByte.
          Dostęp cofniesz w każdej chwili na liście poniżej.
        </p>
      </div>

      {/*
        TOKENY POD ROZWIJANYM (06.08.2026). Michał: „ile miejsca to zajmuje".

        Od czasu OAuth (21.07) domyślną drogą jest „Podłącz w 30 sekund" wyżej —
        wystarczy wkleić adres. Tokeny są potrzebne WYŁĄCZNIE klientom bez OAuth
        (Claude Code, Cursor), czyli mniejszości przypadków. Trzymanie ich stale
        rozwiniętych — nagłówek, akapit, przycisk, lista albo pusty stan
        z ikoną 40 px — kosztowało kilkaset pikseli u każdego, kto tego nie
        potrzebuje. Kto potrzebuje, klika raz.
      */}
      <details className="group rounded-xl border border-border/40 nb-szklo overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-foreground/[0.04]">
          <span className="font-medium text-foreground/90">Klienty bez OAuth (Claude Code, Cursor) — tokeny</span>
          <span className="text-xs text-muted-foreground group-open:hidden">Pokaż</span>
          <span className="hidden text-xs text-muted-foreground group-open:inline">Ukryj</span>
        </summary>
        <div className="space-y-3 border-t border-border/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Tam wygodniej użyć tokenu: wygeneruj go poniżej i wklej gotowe polecenie.
          <strong className="text-foreground/80"> Po dodaniu serwera zrestartuj klienta</strong> —
          bez restartu nie zobaczy nowej konfiguracji i wygląda to jak awaria.
        </p>

      {/* MCP actions */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Aktywne tokeny MCP</h4>
        <Button variant="glass" size="sm" onClick={() => setMcpGenOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nowy token MCP
        </Button>
      </div>

      {mcpLoading ? (
        <div className="text-sm text-muted-foreground text-center py-8">Ładowanie…</div>
      ) : !mcpTokens || mcpTokens.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border/40 rounded-2xl">
          <Plug className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Brak aktywnych tokenów MCP</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Kliknij „Nowy token MCP", aby podłączyć klienta AI do swojego konta.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mcpTokens.map((token) => (
            <McpTokenCard
              key={token.id}
              token={token}
              onRevoke={(id) => revokeMcp.mutate(id)}
              isRevoking={revokeMcp.isPending}
            />
          ))}
        </div>
      )}
        </div>
      </details>

      <GenerateDeviceTokenDialog open={genOpen} onOpenChange={setGenOpen} />
      <GenerateMcpTokenDialog open={mcpGenOpen} onOpenChange={setMcpGenOpen} />
    </div>
  );
};
