/**
 * ════════════════════════════════════════════════════════════════════════════
 *  TREŚĆ MODELU — odpowiedź AI wyświetlana jak tekst, nie jak surowy markdown
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Asystent CRM [firma klienta] (24.09.2026) pokazywał odpowiedź modelu w `<div>`
 * z `whitespace-pre-wrap`: gwiazdki, kratki i wcięcia markdownu leżały na
 * ekranie na surowo (Michał: „formatowanie info od modelu lipa jest").
 * Sześć innych miejsc w repo importuje `react-markdown` każde z własną listą
 * klas. To jest JEDEN komponent biblioteki na tę potrzebę: przyjmuje tekst
 * modelu i rysuje go tokenami skali pisma (text-tresc/tytul/etykieta/meta)
 * oraz tokenami motywu — bez zaszytych kolorów, więc słucha obu motywów.
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KOMPONENTY_MARKDOWNU_MODELU } from '@/components/ui/obraz-za-kliknieciem';
import { cn } from '@/lib/utils';

const KLASY = [
  'text-tresc text-foreground',
  '[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5',
  '[&_h1]:text-tytul [&_h2]:text-tytul [&_h3]:text-tresc [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold',
  '[&_h1]:mt-3 [&_h2]:mt-3 [&_h3]:mt-2 [&_h1]:mb-1 [&_h2]:mb-1 [&_h3]:mb-1 [&_strong]:font-semibold',
  '[&_table]:my-2 [&_table]:w-full [&_th]:text-left [&_th]:text-etykieta [&_th]:text-muted-foreground [&_th]:pb-1',
  '[&_td]:py-1 [&_td]:pr-3 [&_td]:align-top [&_td]:border-t [&_td]:border-border',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-meta [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
  '[&_hr]:my-3 [&_hr]:border-border [&_a]:underline [&_a]:underline-offset-2',
].join(' ');

interface Props {
  /** Tekst modelu (markdown lub zwykły tekst). Pusty → nic nie rysujemy. */
  tekst: string;
  className?: string;
}

export function TrescModelu({ tekst, className }: Props) {
  if (!tekst) return null;
  return (
    <div className={cn(KLASY, className)}>
      {/* Obraz z obcej domeny czeka na kliknięcie — adres złożył model (01.10.2026). */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={KOMPONENTY_MARKDOWNU_MODELU}>{tekst}</ReactMarkdown>
    </div>
  );
}

export default TrescModelu;
