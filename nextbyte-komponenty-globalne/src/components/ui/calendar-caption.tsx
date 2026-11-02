import * as React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { CaptionProps, useNavigation } from "react-day-picker";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface CustomCaptionProps extends CaptionProps {
  fromYear?: number;
  toYear?: number;
}

export function CustomCalendarCaption({
  displayMonth,
  fromYear = 2020,
  toYear = 2050,
}: CustomCaptionProps) {
  const { goToMonth, previousMonth, nextMonth } = useNavigation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(displayMonth.getMonth());
  const [selectedYear, setSelectedYear] = React.useState(displayMonth.getFullYear());
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const months = [
    "styczeń",
    "luty",
    "marzec",
    "kwiecień",
    "maj",
    "czerwiec",
    "lipiec",
    "sierpień",
    "wrzesień",
    "październik",
    "listopad",
    "grudzień",
  ];

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);

  const handleApply = () => {
    goToMonth(new Date(selectedYear, selectedMonth));
    setIsOpen(false);
  };

  React.useEffect(() => {
    setSelectedMonth(displayMonth.getMonth());
    setSelectedYear(displayMonth.getFullYear());
  }, [displayMonth]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[390] pointer-events-auto"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="relative flex items-center justify-between w-full px-2 z-[391]">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 bg-background/45 border border-brand-primary/30 p-0 hover:bg-brand-primary/20 hover:border-brand-primary/50 transition-all duration-200",
            !previousMonth && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="relative flex justify-center">
          <Button
            ref={triggerRef}
            type="button"
            variant="ghost"
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              "h-auto p-2 font-semibold text-base text-brand-text-primary hover:bg-brand-primary/20 hover:text-brand-primary transition-all duration-200",
              isOpen && "bg-primary/20 text-primary"
            )}
          >
            {format(displayMonth, "LLLL yyyy", { locale: pl })}
            <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
          </Button>

          {isOpen && (
            <div
              ref={panelRef}
              /* `bg-background/95` STAŁO NA `nb-szklo` — narzędzie Tailwinda leży
                 w arkuszu niżej niż warstwa komponentów, więc wygrywało i szyba
                 miała 95% krycia, czyli była zwykłą płytą. Wybór miesiąca unosi
                 się nad stroną, więc to tafla i bierze wypełnienie z tokenu. */
              className="absolute left-1/2 top-full z-[400] mt-2 w-[250px] -translate-x-1/2 rounded-2xl border p-4 text-foreground shadow-[0_18px_44px_-12px_hsl(var(--background)/0.9)] nb-szklo nb-szklo-plynne nb-szklo-tafla pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-secondary">Miesiąc</label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                      className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-base text-foreground outline-none transition focus:ring-2 focus:ring-primary/40"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-text-secondary">Rok</label>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                      className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-base text-foreground outline-none transition focus:ring-2 focus:ring-primary/40"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <Button onClick={handleApply} className="w-full" type="button">
                  Zastosuj
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 bg-background/45 border border-brand-primary/30 p-0 hover:bg-brand-primary/20 hover:border-brand-primary/50 transition-all duration-200",
            !nextMonth && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
