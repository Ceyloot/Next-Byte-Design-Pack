/** Komunikaty o saldzie, kredytach i doładowaniu (od dostawcy modelu) nigdy nie trafiają do użytkownika — zastępuje je neutralny tekst. */
const KONTO = /do[łl]aduj|top[\s-]?up|credit|kredyt|saldo|balance|insufficient|billing|payment|funds|quota|limit|subscription|subskrypcj|plan\b|brak(uje)? [śs]rodk|nieaktywn\w* konto|add .*account/i

export function czytelnyBlad(tresc: string): string {
  return KONTO.test(tresc) ? 'Nie udało się wygenerować obrazu. Spróbuj ponownie za chwilę.' : tresc
}
