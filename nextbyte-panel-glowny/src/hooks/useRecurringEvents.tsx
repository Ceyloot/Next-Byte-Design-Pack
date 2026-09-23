import { useMemo } from 'react';
import { clampRecurrenceEnd, MAX_RECURRENCE_INSTANCES } from '@/lib/recurrenceLimits';

/** Returns 'YYYY-MM-DD' in local timezone (avoids UTC shift from toISOString) */
function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface RecurringEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  category: string;
  icon: string | null;
  color: string | null;
  is_completed: boolean | null;
  is_all_day: boolean | null;
  reminder_minutes: number | null;
  subtasks: any;
  recurrence_type: string | null;
  recurrence_rule: string | null;
  recurrence_end: string | null;
  series_id: string | null;
  is_series_master: boolean | null;
  original_date: string | null;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UseRecurringEventsOptions {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Hook that generates recurring event instances dynamically in memory
 * instead of storing them physically in the database.
 */
export const useRecurringEvents = (
  events: RecurringEvent[],
  options: UseRecurringEventsOptions = {}
) => {
  const { startDate, endDate } = options;

  const expandedEvents = useMemo(() => {
    const result: RecurringEvent[] = [];

    events.forEach((event) => {
      // If event has no recurrence, just add it as-is
      if (!event.recurrence_type || !event.is_series_master) {
        result.push(event);
        return;
      }

      // This is a master event - generate instances
      const instances = generateRecurringInstances(event, startDate, endDate);
      result.push(...instances);
    });

    return result;
  }, [events, startDate, endDate]);

  return expandedEvents;
};

function parseRRule(rrule: string): { freq: string; interval: number; byDay: string[]; byDayPos: number[] } {
  const parts = rrule.split(';').reduce((acc, part) => {
    const [key, val] = part.split('=');
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);

  const freq = parts['FREQ'] || 'MONTHLY';
  const interval = parseInt(parts['INTERVAL'] || '1', 10);

  // Parse BYDAY: e.g. "1MO", "-1FR", "MO,FR"
  const byDayStr = parts['BYDAY'] || '';
  const byDay: string[] = [];
  const byDayPos: number[] = [];

  if (byDayStr) {
    byDayStr.split(',').forEach(part => {
      const match = part.match(/^(-?\d+)?([A-Z]{2})$/);
      if (match) {
        if (match[1]) byDayPos.push(parseInt(match[1], 10));
        byDay.push(match[2]);
      }
    });
  }

  return { freq, interval, byDay, byDayPos };
}

const DAY_ABBR_TO_NUM: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

/**
 * For RRULE like FREQ=MONTHLY;BYDAY=1MO — finds the Nth weekday of a given month.
 * position: 1 = first, 2 = second, -1 = last, etc.
 */
function getNthWeekdayOfMonth(year: number, month: number, dayAbbr: string, position: number): Date | null {
  const dayNum = DAY_ABBR_TO_NUM[dayAbbr];
  if (dayNum === undefined) return null;

  if (position > 0) {
    // First day of the month
    const first = new Date(year, month, 1);
    const firstDow = first.getDay();
    let dayOffset = (dayNum - firstDow + 7) % 7;
    const day = 1 + dayOffset + (position - 1) * 7;
    if (day > new Date(year, month + 1, 0).getDate()) return null;
    return new Date(year, month, day);
  } else {
    // Count from end: -1 = last, -2 = second to last
    const last = new Date(year, month + 1, 0); // last day of month
    const lastDow = last.getDay();
    let dayOffset = (lastDow - dayNum + 7) % 7;
    const day = last.getDate() - dayOffset + (position + 1) * 7;
    if (day < 1) return null;
    return new Date(year, month, day);
  }
}

function generateRRuleInstances(
  masterEvent: RecurringEvent,
  rrule: string,
  viewStart?: Date,
  viewEnd?: Date
): RecurringEvent[] {
  const instances: RecurringEvent[] = [];
  const masterStart = new Date(masterEvent.start_time);
  const masterEnd = new Date(masterEvent.end_time);
  const eventDuration = masterEnd.getTime() - masterStart.getTime();

  const recurrenceEndDate = masterEvent.recurrence_end
    ? clampRecurrenceEnd(masterStart, masterEvent.recurrence_end)
    : new Date(masterStart.getTime() + 3 * 365.25 * 24 * 60 * 60 * 1000);

  const generateEnd = viewEnd || recurrenceEndDate;
  const generateStart = viewStart || masterStart;

  const { freq, interval, byDay, byDayPos } = parseRRule(rrule);

  const excludedDates = new Set<string>();
  if ((masterEvent as any).excluded_dates && Array.isArray((masterEvent as any).excluded_dates)) {
    (masterEvent as any).excluded_dates.forEach((d: string) => excludedDates.add(d));
  }

  const addInstance = (date: Date) => {
    // Compare by local date string to avoid timezone-induced off-by-one errors
    const localDateStr = toLocalDateStr(date);
    const generateEndDateStr = toLocalDateStr(generateEnd);
    const recurrenceEndStr = toLocalDateStr(recurrenceEndDate);
    const generateStartDateStr = toLocalDateStr(generateStart);
    const masterStartDateStr = toLocalDateStr(masterStart);

    if (localDateStr > recurrenceEndStr || localDateStr > generateEndDateStr) return;
    if (localDateStr < generateStartDateStr) return;
    const dateStr = localDateStr;
    if (excludedDates.has(dateStr)) return;

    // Set the same time as master
    const instanceStart = new Date(date);
    instanceStart.setHours(masterStart.getHours(), masterStart.getMinutes(), masterStart.getSeconds(), 0);
    const instanceEnd = new Date(instanceStart.getTime() + eventDuration);

    const isMaster = localDateStr === masterStartDateStr;

    instances.push({
      ...masterEvent,
      id: isMaster ? masterEvent.id : `${masterEvent.id}-${localDateStr}`,
      start_time: instanceStart.toISOString(),
      end_time: instanceEnd.toISOString(),
      is_series_master: isMaster ? masterEvent.is_series_master : false,
      original_date: isMaster ? masterEvent.original_date : dateStr,
      series_id: isMaster ? masterEvent.series_id : masterEvent.id,
    });
  };

  if (freq === 'MONTHLY' && byDay.length > 0 && byDayPos.length > 0) {
    // e.g. FREQ=MONTHLY;BYDAY=1MO → first Monday of each month
    let year = masterStart.getFullYear();
    let month = masterStart.getMonth();
    let iteration = 0;

    while (true) {
      if (iteration > 500) break; // safety
      iteration++;

      for (let di = 0; di < byDay.length; di++) {
        const pos = byDayPos[di] || byDayPos[0];
        const dayAbbr = byDay[di];
        const occurrence = getNthWeekdayOfMonth(year, month, dayAbbr, pos);
        if (occurrence) {
          if (occurrence < masterStart && occurrence.toDateString() !== masterStart.toDateString()) {
            // skip past dates before master
          } else {
            addInstance(occurrence);
          }
        }
      }

      month += interval;
      if (month > 11) { year += Math.floor(month / 12); month = month % 12; }

      // Check if we've gone past the end
      const checkDate = new Date(year, month, 1);
      if (checkDate > generateEnd && checkDate > recurrenceEndDate) break;
    }
  } else if (freq === 'WEEKLY' && byDay.length > 0) {
    // e.g. FREQ=WEEKLY;BYDAY=MO,FR
    let current = new Date(masterStart);
    current.setHours(0, 0, 0, 0);
    // Go to start of week
    const weekStart = new Date(current);
    weekStart.setDate(current.getDate() - current.getDay()); // Sunday

    let weekIteration = 0;
    while (weekStart <= generateEnd && weekStart <= recurrenceEndDate) {
      if (weekIteration > 500) break;
      if (weekIteration % interval === 0) {
        byDay.forEach(dayAbbr => {
          const dayNum = DAY_ABBR_TO_NUM[dayAbbr];
          const occurrence = new Date(weekStart);
          occurrence.setDate(weekStart.getDate() + dayNum);
          if (occurrence >= masterStart || occurrence.toDateString() === masterStart.toDateString()) {
            addInstance(occurrence);
          }
        });
      }
      weekStart.setDate(weekStart.getDate() + 7);
      weekIteration++;
    }
  } else {
    // Fallback: treat as simple recurrence
    let current = new Date(masterStart);
    let iteration = 0;
    while (current <= generateEnd && current <= recurrenceEndDate) {
      if (iteration > 500) break;
      addInstance(new Date(current));
      if (freq === 'DAILY') current.setDate(current.getDate() + interval);
      else if (freq === 'WEEKLY') current.setDate(current.getDate() + 7 * interval);
      else if (freq === 'MONTHLY') current.setMonth(current.getMonth() + interval);
      else if (freq === 'YEARLY') current.setFullYear(current.getFullYear() + interval);
      else break;
      iteration++;
    }
  }

  return instances;
}

function generateRecurringInstances(
  masterEvent: RecurringEvent,
  viewStart?: Date,
  viewEnd?: Date
): RecurringEvent[] {
  // If there's a recurrence_rule (RRULE), use advanced expansion
  if (masterEvent.recurrence_rule) {
    return generateRRuleInstances(masterEvent, masterEvent.recurrence_rule, viewStart, viewEnd);
  }

  const instances: RecurringEvent[] = [];
  
  const startDate = new Date(masterEvent.start_time);
  const endDate = new Date(masterEvent.end_time);
  const eventDuration = endDate.getTime() - startDate.getTime();
  
  // Parse excluded dates if they exist
  const excludedDates = new Set<string>();
  if ((masterEvent as any).excluded_dates && Array.isArray((masterEvent as any).excluded_dates)) {
    (masterEvent as any).excluded_dates.forEach((date: string) => {
      excludedDates.add(date);
    });
  }
  
  // Determine the end date for recurrence (clamped to safety limit)
  const recurrenceEndDate = masterEvent.recurrence_end
    ? clampRecurrenceEnd(startDate, masterEvent.recurrence_end)
    : new Date(startDate.getTime() + (3 * 365.25 * 24 * 60 * 60 * 1000)); // 3 years default
  
  // Use view boundaries if provided, otherwise generate for full recurrence period
  const generateStart = viewStart || startDate;
  const generateEnd = viewEnd || recurrenceEndDate;
  
  let currentDate = new Date(startDate);
  
  // Check if master date is excluded
  const masterDateStr = toLocalDateStr(startDate);
  if (!excludedDates.has(masterDateStr)) {
    instances.push(masterEvent);
  }
  
  // Generate instances based on recurrence type (hard-capped for safety)
  let iterations = 0;
  while (currentDate <= generateEnd && currentDate <= recurrenceEndDate) {
    if (++iterations > MAX_RECURRENCE_INSTANCES) {
      console.warn('[useRecurringEvents] hit MAX_RECURRENCE_INSTANCES cap for event', masterEvent.id);
      break;
    }
    currentDate = getNextOccurrence(currentDate, masterEvent.recurrence_type!);
    
    if (currentDate > recurrenceEndDate || currentDate > generateEnd) {
      break;
    }
    
    if (currentDate >= generateStart) {
      const instanceDateStr = toLocalDateStr(currentDate);
      
      // Skip excluded dates
      if (excludedDates.has(instanceDateStr)) {
        continue;
      }
      
      const instanceStartTime = new Date(currentDate);
      const instanceEndTime = new Date(currentDate.getTime() + eventDuration);
      
      instances.push({
        ...masterEvent,
        id: `${masterEvent.id}-${instanceDateStr}`,
        start_time: instanceStartTime.toISOString(),
        end_time: instanceEndTime.toISOString(),
        is_series_master: false,
        original_date: instanceDateStr,
        series_id: masterEvent.id,
      });
    }
  }
  
  return instances;
}

function getNextOccurrence(currentDate: Date, recurrenceType: string): Date {
  const next = new Date(currentDate);
  
  switch (recurrenceType) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setDate(next.getDate() + 7); // Default to weekly
  }
  
  return next;
}

/**
 * Helper to check if an event is part of a recurring series
 */
export const isRecurringEvent = (event: RecurringEvent): boolean => {
  return !!(event.series_id || event.recurrence_type);
};

/**
 * Helper to get the series ID for an event (either its own ID if master, or its series_id)
 */
export const getSeriesId = (event: RecurringEvent): string => {
  return event.series_id || event.id;
};

/**
 * Count unique series from events (for achievements)
 */
export const countUniqueSeries = (events: RecurringEvent[]): number => {
  const seriesIds = new Set<string>();
  
  events.forEach(event => {
    seriesIds.add(getSeriesId(event));
  });
  
  return seriesIds.size;
};
