import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlatnoscWToku } from '@/hooks/usePlatnoscWToku';

/**
 * Pasek: „Twoja płatność czeka na potwierdzenie".
 *
 * DLACZEGO OSOBNY OD PaymentFailedBanner, MIMO PODOBNEGO WYGLĄDU:
 * tamten mówi o AWARII — karta odrzucona, dostęp zaraz zniknie, ton alarmowy
 * (czerwień, trójkąt ostrzegawczy, odliczanie dni do utraty Premium).
 *
 * Ten mówi o czymś przeciwnym: klient WŁAŚNIE PŁACI i wszystko idzie dobrze,
 * tylko bank poprosił o potwierdzenie. Alarmowy ton byłby tu kłamstwem —
 * nic złego się nie stało i nic nie zostanie odebrane.
 *
 * Stąd bursztyn zamiast czerwieni, zegar zamiast trójkąta i „dokończ"
 * zamiast „napraw".
 *
 * Pasek NICZEGO NIE BLOKUJE. Klient korzysta z platformy normalnie.
 */
export const PasekPlatnosciWToku: React.FC = () => {
  const { data: platnosc } = usePlatnoscWToku();

  if (!platnosc) return null;

  // Po dobie samo „dokończ" przestaje wystarczać — dodajemy zdanie, które mówi
  // wprost, że coś poszło nie tak i można się do nas odezwać.
  const dlugoCzeka = platnosc.godzinCzekania >= 24;

  return (
    <div className="mx-4 mt-2 rounded-xl border border-amber-500/30 nb-szklo p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-300">
            Płatność czeka na potwierdzenie
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Twój bank poprosił o potwierdzenie transakcji. Dokończ ją, żeby subskrypcja
            zaczęła działać — nic nie zostało pobrane dwa razy.
            {dlugoCzeka && (
              <span className="block mt-1 text-amber-300/80">
                Czeka już ponad dobę. Jeśli coś nie działa, napisz do nas — pomożemy.
              </span>
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mt-2 h-8 text-xs border-amber-500/30 hover:bg-amber-500/15 text-amber-300"
          >
            {/* Link prowadzi na stronę faktury Stripe — tam klient kończy płatność.
                `noopener` obowiązkowo: to strona zewnętrzna. */}
            <a href={platnosc.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              Dokończ płatność
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasekPlatnosciWToku;
