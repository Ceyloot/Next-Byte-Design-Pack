import React, { useState } from 'react';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, KeyRound, AlertTriangle, Plug } from 'lucide-react';
import { useMcpTokens } from '@/hooks/useMcpTokens';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MCP_SERVER_URL = 'https://iwuvszxeutvmzcfuetuo.supabase.co/functions/v1/mcp-server';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

const CopyField: React.FC<{
  fieldKey: string;
  label: string;
  hint?: string;
  value: string;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
}> = ({ fieldKey, label, hint, value, copiedKey, onCopy }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    <div className="relative">
      <div className="rounded-xl border border-primary/25 nb-szklo nb-szklo-plynne p-3 pr-14 font-mono text-xs break-all whitespace-pre-wrap select-all leading-relaxed">
        {value}
      </div>
      <Button
        size="icon"
        variant="cichy"
        onClick={() => onCopy(fieldKey, value)}
        className="absolute right-1.5 top-1.5"
        aria-label={`Kopiuj: ${label}`}
      >
        {copiedKey === fieldKey ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  </div>
);

export const GenerateMcpTokenDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { generate } = useMcpTokens();
  const [name, setName] = useState('');
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setRawToken(null);
    setCopiedKey(null);
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Podaj nazwę tokenu');
      return;
    }
    const result = await generate.mutateAsync(name.trim());
    setRawToken(result.raw_token);
  };

  const handleCopy = async (key: string, value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedKey(key);
      toast.success('Skopiowano');
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
    } else {
      toast.error('Nie udało się skopiować — zaznacz tekst i skopiuj ręcznie (Ctrl+C)');
    }
  };

  const urlWithKey = rawToken ? `${MCP_SERVER_URL}?key=${rawToken}` : '';
  const claudeCodeCmd = rawToken
    ? `claude mcp add --transport http --scope user nextbyte ${MCP_SERVER_URL} --header "Authorization: Bearer ${rawToken}"`
    : '';
  const cursorJson = rawToken
    ? JSON.stringify(
        {
          mcpServers: {
            nextbyte: {
              url: MCP_SERVER_URL,
              headers: { Authorization: `Bearer ${rawToken}` },
            },
          },
        },
        null,
        2,
      )
    : '';

  return (
    <NextByteModal
      open={open}
      onOpenChange={handleClose}
      title={rawToken ? 'Token MCP wygenerowany' : 'Nowy token MCP'}
      description={
        rawToken
          ? 'Wybierz sposób podłączenia i skopiuj gotowe pole do klienta MCP.'
          : 'Nadaj tokenowi nazwę (np. „Claude Code na laptopie").'
      }
      icon={<Plug className="w-5 h-5 text-primary-foreground" />}
      maxWidth={rawToken ? '2xl' : 'md'}
    >
      <div className="p-4 space-y-3">
        {!rawToken ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="mcp_token_name">Nazwa tokenu</Label>
              <Input
                id="mcp_token_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Claude Code na laptopie"
                maxLength={80}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim() && !generate.isPending) handleSubmit();
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="cichy" onClick={() => handleClose(false)}>
                Anuluj
              </Button>
              <Button
                variant="glass" className="nb-glass-na-przezroczystym"
                onClick={handleSubmit}
                disabled={!name.trim() || generate.isPending}
              >
                {generate.isPending ? 'Generowanie…' : 'Wygeneruj token'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-100/90">
                <strong className="block mb-1">To jedyny moment, w którym widzisz token.</strong>
                Skopiuj potrzebne pole teraz i wklej w kliencie MCP. Po zamknięciu okna nie da się
                tokenu odzyskać — jeśli zgubisz, wygeneruj nowy.
              </div>
            </div>

            {/*
              KOLEJNOŚĆ JEST CELOWA — od dróg SPRAWDZONYCH do niesprawdzonych.

              Wcześniej pierwsze i najbardziej rzucające się w oczy było pole
              „claude.ai / Claude Desktop (wklej jako URL)". Dane z produkcji
              (21.07.2026): trzy konta, dziewięć wygenerowanych tokenów, a w logu
              wywołań WYŁĄCZNIE konto właściciela — i to przez Claude Code.
              Pozostali nie wykonali ani jednego udanego wywołania. Prowadziliśmy
              więc ludzi najprostszą z pozoru drogą, której nikt nie przeszedł.
            */}
            <CopyField
              fieldKey="claude-code"
              label="✅ Claude Code — sprawdzone, działa"
              hint="Wklej w terminalu, a potem ZRESTARTUJ Claude Code. Bez restartu serwer się nie pojawi i wygląda to jak awaria."
              value={claudeCodeCmd}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />

            <CopyField
              fieldKey="cursor"
              label="Cursor i klienty czytające config JSON"
              hint="Wklej do sekcji mcpServers. Po zapisaniu zrestartuj klienta."
              value={cursorJson}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />

            <CopyField
              fieldKey="url"
              label="URL z tokenem — dla klientów przyjmujących sam adres"
              hint="Nie przeszedł jeszcze naszych testów z konektorem claude.ai. UWAGA: token siedzi w adresie, więc nie wklejaj go nigdzie publicznie."
              value={urlWithKey}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />

            <CopyField
              fieldKey="token"
              label="Sam token"
              hint="Do ręcznej konfiguracji. Serwer przyjmuje go w nagłówku Authorization: Bearer."
              value={rawToken}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />

            <div className="flex justify-end pt-2">
              <Button variant="obwodka" onClick={() => handleClose(false)}>
                <KeyRound className="w-4 h-4 mr-1.5" />
                Zamknij
              </Button>
            </div>
          </>
        )}
      </div>
    </NextByteModal>
  );
};
