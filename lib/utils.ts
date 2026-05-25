import type { ClassValue } from 'clsx';

/** Returns the Monday 00:00:00 of the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift so week starts Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Day-of-week abbreviation for display, Mon-based (0=Mon … 6=Sun). */
export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Returns 0 (Mon) … 6 (Sun) from a Date. */
export function dayIndex(date: Date): number {
  const d = date.getDay(); // 0=Sun … 6=Sat
  return d === 0 ? 6 : d - 1;
}

export function cn(...inputs: ClassValue[]) {
  // Simple className merge without the twMerge dependency
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === 'string') return [input];
      if (Array.isArray(input)) return input;
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k);
      }
      return [];
    })
    .join(' ');
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
}

export function moneySaved(cravingsResisted: number, type: 'vaping' | 'junkfood'): number {
  // Rough estimates: vape pod ~3€, junk food ~2€ per craving
  const costPerCraving = type === 'vaping' ? 3 : 2;
  return cravingsResisted * costPerCraving;
}
