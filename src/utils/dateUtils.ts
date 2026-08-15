/**
 * Business calendar utilities
 * Business month: 21st of month to 20th of next month
 * Business quarter: 3 consecutive business months
 * Business year: 12 consecutive business months
 */

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getToday(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { start, end, label: formatDate(now) };
}

export function getCurrentWeek(): DateRange {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Week starts Monday (1) and ends Sunday (0)
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    start: monday,
    end: sunday,
    label: `${formatDateShort(monday)} – ${formatDateShort(sunday)}`,
  };
}

export function getLastWeek(): DateRange {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - diffToMonday);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  lastMonday.setHours(0, 0, 0, 0);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);
  return {
    start: lastMonday,
    end: lastSunday,
    label: `${formatDateShort(lastMonday)} – ${formatDateShort(lastSunday)}`,
  };
}

/**
 * Business month: 21st to 20th
 * If today is Aug 15 → business month = 21 Jul – 20 Aug
 * If today is Aug 25 → business month = 21 Aug – 20 Sep
 */
export function getCurrentBusinessMonth(): DateRange {
  const now = new Date();
  let startMonth: number, startYear: number;

  if (now.getDate() <= 20) {
    // We are in the business month that started on the 21st of the previous month
    startMonth = now.getMonth() - 1;
    startYear = now.getFullYear();
    if (startMonth < 0) {
      startMonth = 11;
      startYear--;
    }
  } else {
    // We are in the business month that started on the 21st of this month
    startMonth = now.getMonth();
    startYear = now.getFullYear();
  }

  const start = new Date(startYear, startMonth, 21, 0, 0, 0);
  let endMonth = startMonth + 1;
  let endYear = startYear;
  if (endMonth > 11) {
    endMonth = 0;
    endYear++;
  }
  const end = new Date(endYear, endMonth, 20, 23, 59, 59);

  return {
    start,
    end,
    label: `${formatDateShort(start)} – ${formatDateShort(end)}`,
  };
}

/**
 * Business quarters based on 21st–20th months:
 * Q1: 21 Jan – 20 Apr
 * Q2: 21 Apr – 20 Jul
 * Q3: 21 Jul – 20 Oct
 * Q4: 21 Oct – 20 Jan
 */
export function getCurrentBusinessQuarter(): DateRange {
  const now = new Date();
  // Determine which business month we're in
  let bizMonth: number, bizYear: number;
  if (now.getDate() <= 20) {
    bizMonth = now.getMonth() - 1;
    bizYear = now.getFullYear();
    if (bizMonth < 0) {
      bizMonth = 11;
      bizYear--;
    }
  } else {
    bizMonth = now.getMonth();
    bizYear = now.getFullYear();
  }

  // Quarter start months: Jan(0), Apr(3), Jul(6), Oct(9)
  const quarterStarts = [0, 3, 6, 9];
  let qStartMonth = 0;
  for (const qs of quarterStarts) {
    if (bizMonth >= qs) {
      qStartMonth = qs;
    }
  }

  const start = new Date(bizYear, qStartMonth, 21, 0, 0, 0);
  let endMonth = qStartMonth + 3;
  let endYear = bizYear;
  if (endMonth > 11) {
    endMonth = endMonth - 12;
    endYear++;
  }
  const end = new Date(endYear, endMonth, 20, 23, 59, 59);

  return {
    start,
    end,
    label: `${formatDateShort(start)} – ${formatDateShort(end)}`,
  };
}

/**
 * Business year: 12 business months starting from 21 Jan
 * 21 Jan YYYY – 20 Jan (YYYY+1)
 */
export function getCurrentBusinessYear(): DateRange {
  const now = new Date();
  // Determine which business year we're in
  let yearStart: number;

  // If we're past Jan 20 (i.e. in or after the Jan 21 start), the business year started this calendar year
  if (now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() >= 21)) {
    yearStart = now.getFullYear();
  } else {
    // We're in Jan 1-20, still in the business year that started last year
    yearStart = now.getFullYear() - 1;
  }

  const start = new Date(yearStart, 0, 21, 0, 0, 0); // Jan 21
  const end = new Date(yearStart + 1, 0, 20, 23, 59, 59); // Jan 20 next year

  return {
    start,
    end,
    label: `${formatDateShort(start)} – ${formatDateShort(end)}`,
  };
}

/**
 * Parse an Excel serial date number into a JS Date
 */
export function excelDateToJSDate(serial: number): Date {
  // Excel serial date: days since Jan 0, 1900 (with the 1900 leap year bug)
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
}

/**
 * Parse various date formats from Excel
 */
export function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;

  // If it's a number (Excel serial date)
  if (typeof value === 'number') {
    return excelDateToJSDate(value);
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Try standard date parsing
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;

    // Try DD/MM/YYYY format
    const parts = trimmed.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  if (value instanceof Date) return value;

  return null;
}

export function isDateInRange(date: Date, range: DateRange): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const s = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate());
  const e = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate());
  return d >= s && d <= e;
}
