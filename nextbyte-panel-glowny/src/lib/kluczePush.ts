/*
  Wyciągnięcie kluczy z subskrypcji przeglądarki.

  Wydzielone, bo potrzebują tego DWA miejsca — zapis przy włączaniu powiadomień
  i synchronizacja przy zmianie konta na urządzeniu. Rozjazd między nimi
  kończyłby się zapisem, którego dostawca nie potrafi rozszyfrować, a taki błąd
  nie daje o sobie znać: push „wychodzi", tylko nic się nie pokazuje.
*/

export interface KluczeSubskrypcji {
  p256dh: string;
  auth: string;
}

/** Zwraca klucze w base64 albo `null`, gdy przeglądarka ich nie udostępniła. */
export function kluczeSubskrypcji(subskrypcja: PushSubscription): KluczeSubskrypcji | null {
  const p256dhRaw = subskrypcja.getKey('p256dh');
  const authRaw = subskrypcja.getKey('auth');
  if (!p256dhRaw || !authRaw) return null;

  return {
    p256dh: naBase64(p256dhRaw),
    auth: naBase64(authRaw),
  };
}

function naBase64(bufor: ArrayBuffer): string {
  const bajty = new Uint8Array(bufor);
  let tekst = '';
  /* Pętla, nie `String.fromCharCode(...bajty)`. Rozwinięcie tablicy w argumenty
     przy dłuższym buforze przepełnia stos wywołań — tu klucze są krótkie, ale
     ta funkcja nie ma powodu zakładać, co dostanie. */
  for (let i = 0; i < bajty.length; i++) tekst += String.fromCharCode(bajty[i]);
  return btoa(tekst);
}
