/*
  JEDNO ŹRÓDŁO DOSTĘPU DO MATERIAŁU AKADEMII (08.09.2026, audyt).

  Do tej pory warunek żył w czterech miejscach i tylko `Kurs.tsx` miał go
  poprawnie: premium e-book z ceną 0 (`price === 0 || …`) otwierał się każdemu
  zalogowanemu bez subskrypcji — dokładnie luka, którą w kursach załatano.

  Zasada: materiał premium = subskrypcja LUB jednorazowy zakup; materiał
  zwykły = darmowy (cena 0) LUB zakupiony. Kolejność sprawdzeń ma znaczenie:
  `is_premium` PRZED `price === 0`.
*/
export interface MaterialAkademii {
  id: string;
  price?: number | null;
  is_premium?: boolean | null;
}

export function maDostepDoMaterialu(
  material: MaterialAkademii,
  isSubscribed: boolean,
  hasAccess: (id: string) => boolean,
): boolean {
  if (material.is_premium) return isSubscribed || hasAccess(material.id);
  return (material.price ?? 0) === 0 || hasAccess(material.id);
}
