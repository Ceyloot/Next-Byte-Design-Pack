/* Prymitywy stylu „duch" mieszkają teraz w bibliotece (`@/components/duch`),
   bo używa ich nie tylko panel 2.0, ale też notatnik — a definicja ma być
   jedna i ma wyjeżdżać skryptem do `design-kit` i paczki npm.

   Ten plik zostaje jako reeksport, żeby panel 2.0 nie wymagał przepinania
   importów w każdym pliku naraz. */
export * from '@/components/duch'
