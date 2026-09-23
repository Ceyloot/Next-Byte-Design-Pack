import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CustomCalendarCaption } from "@/components/ui/calendar-caption";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  useCustomCaption?: boolean;
  fromYear?: number;
  toYear?: number;
  /**
   * Kalendarz BEZ własnej szyby — do osadzenia w kafelku, który szybą już jest.
   *
   * Domyślnie komponent niesie `nb-szklo` + `glass-effect`, czyli własny
   * `backdrop-filter`, tło i rant. Postawiony w `Tile` daje szkło w szkle:
   * strażnik zagnieżdżenia gasi rozmycie dziecka, a zostają dwa ranty i dwa
   * tła jedno na drugim. Ten tryb zdejmuje powierzchnię i zostawia sam
   * kalendarz — materiał niesie rodzic. Dodane 02.09.2026 pod Panel Główny.
   */
  bezSzyby?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  useCustomCaption = false,
  fromYear = 2020,
  toYear = 2050,
  bezSzyby = false,
  ...props
}: CalendarProps) {
  const customComponents = useCustomCaption
    ? {
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: (captionProps: any) => (
          <CustomCalendarCaption {...captionProps} fromYear={fromYear} toYear={toYear} />
        ),
      }
    : {
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      };

  return (
    <DayPicker
      fixedWeeks
      showOutsideDays={showOutsideDays}
      className={cn(
        "pointer-events-auto w-full overflow-hidden",
        bezSzyby
          ? "p-0"
          : "p-3 glass-effect bg-background/25 border border-brand-primary/30 rounded-xl nb-szklo",
        className,
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-3 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-3 w-full px-8",
        caption_label: "text-base font-semibold text-brand-text-primary",
        vhidden: "hidden",
        dropdown: "h-9 px-3 py-2 bg-background/45 border border-brand-primary/30 rounded-lg text-sm font-medium text-brand-text-primary hover:bg-brand-primary/20 hover:border-brand-primary/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer mx-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-background/45 border border-brand-primary/30 p-0 hover:bg-brand-primary/20 hover:border-brand-primary/50 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-1 mb-2 w-full",
        head_cell:
          "text-brand-text-secondary font-medium text-xs uppercase tracking-wider text-center p-2 flex items-center justify-center",
        row: "grid grid-cols-7 gap-3 w-full mb-1",
        cell: "aspect-square text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex items-center justify-center",
        day: cn(
          "w-full h-full p-0 font-medium aria-selected:opacity-100 inline-flex items-center justify-center rounded-lg text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50 hover:bg-brand-primary/20 hover:text-brand-primary text-brand-text-primary aspect-square min-h-[32px] min-w-[32px]"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-brand-primary text-primary-foreground hover:bg-brand-primary hover:text-primary-foreground focus:bg-brand-primary focus:text-primary-foreground font-bold shadow-md shadow-brand-primary/20 ring-1 ring-brand-primary",
        day_today: "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/60",
        day_outside:
          "day-outside text-brand-text-tertiary opacity-60 aria-selected:bg-brand-primary/10 aria-selected:text-brand-text-tertiary aria-selected:opacity-40",
        day_disabled: "text-brand-text-tertiary opacity-30",
        day_range_middle:
          "aria-selected:bg-brand-primary/20 aria-selected:text-brand-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={customComponents}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
