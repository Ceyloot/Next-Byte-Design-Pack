import React, { useEffect, useRef } from 'react';
import { parseTabularText } from './utils/tableFormat';
import { GlassCard, GlassEmpty } from '@/components/glass';

/**
 * Renderuje sparsowaną tabelę ("Wiersz N: kol: wartość | ...") jako prawdziwą
 * tabelę HTML zamiast surowego tekstu. Gdy podano highlightRow, ten wiersz
 * dostaje wyróżnienie i widok automatycznie się do niego przewija —
 * dzięki temu "sprawdź w źródle" trafia dokładnie tam, skąd wzięto informację,
 * zamiast zostawiać użytkownika z całą tabelą do przeszukania ręcznie.
 */
export default function DataTable({ rawText, highlightRow, className = '' }) {
  const rowRef = useRef(null);
  const parsed = parseTabularText(rawText);

  useEffect(() => {
    if (highlightRow != null && rowRef.current) {
      rowRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [highlightRow]);

  if (!parsed) {
    if (!rawText) {
      return <GlassEmpty variant="brak-danych" compact className={className} />;
    }
    return (
      <GlassCard padding="p-5" radius="rounded-xl" className={className}>
        <div className="text-sm text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
          {rawText}
        </div>
      </GlassCard>
    );
  }

  const { columns, rows } = parsed;

  return (
    <GlassCard padding="p-0" radius="rounded-xl" className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto max-w-full custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-primary/10 border-b border-foreground/15 sticky top-0">
              <th className="p-3 font-semibold text-primary/80 border-r border-foreground/10 w-16 text-center">Wiersz</th>
              {columns.map(col => (
                <th key={col} className="p-3 font-semibold text-foreground/90 border-r border-foreground/10 min-w-[120px] whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const isHighlighted = highlightRow != null && String(row.rowNum) === String(highlightRow);
              return (
                <tr
                  key={rIdx}
                  ref={isHighlighted ? rowRef : null}
                  className={`border-b border-foreground/10 transition-colors ${
                    isHighlighted ? 'bg-primary/15 hover:bg-primary/20' : 'hover:bg-primary/5'
                  }`}
                >
                  <td className={`p-3 font-mono font-medium border-r border-foreground/10 text-center ${isHighlighted ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-primary/5'}`}>
                    {row.rowNum}
                  </td>
                  {columns.map(col => (
                    <td key={col} className="p-3 text-foreground/85 border-r border-foreground/10 font-medium break-all">
                      {row.fields[col] ?? ''}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
