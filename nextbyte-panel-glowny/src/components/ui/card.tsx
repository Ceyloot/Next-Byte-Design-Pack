import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * KARTA — materiał platformy, nie nieprzezroczysta płyta.
 *
 * DLACZEGO ZMIENIONE (03.08.2026, przegląd Zarządu):
 * baza miała `bg-card`, czyli PEŁNE wypełnienie. To jest ta sama pułapka, co
 * w `tile.tsx` i `dialog.tsx`: klasa Tailwinda WYGRYWA z `.nb-szklo`, więc
 * `<Card className="… nb-szklo">` wyglądało na nieprzezroczyste MIMO
 * zadeklarowanego szkła. Dwa pliki w Zarządzie robiły dokładnie to i przez to
 * nie miały materiału, choć w kodzie wyglądało, że mają. Trzecie wystąpienie
 * tego samego błędu — dlatego naprawa idzie u ŹRÓDŁA, a nie w wywołaniach.
 *
 * ZASIĘG: 241 plików, w tym 105 w Admin Panelu. To największa pojedyncza
 * powierzchnia, jaka została — i to jest odpowiedź na pierwsze pytanie
 * Michała z tej sesji, dlaczego admin jest szary. Był szary, bo `Card` była
 * nieprzezroczysta, a admin stoi prawie wyłącznie na `Card`.
 *
 * `shadow-sm` zdjęty celowo: `.nb-szklo` niesie własny rant i cień. Dwa cienie
 * na jednej krawędzi dają brudną, podwójną linię.
 * `text-card-foreground` zostaje — to kolor tekstu, nie powierzchnia.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border text-card-foreground nb-szklo nb-szklo-plynne",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
