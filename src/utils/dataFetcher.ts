import * as XLSX from 'xlsx';
import { parseDate } from './dateUtils';

export interface PerformanceRecord {
  date: Date;
  manager: string;
  associate: string;
  rawRow: unknown[];
  rowIndex: number;         // original row position (higher = more recent)
  firstSeenAt?: number;     // timestamp when this record was first observed
}

export interface LeaderboardEntry {
  associate: string;
  manager: string;
  count: number;
  rank: number;
}

// Column mappings per source
const MICROSOFT_COLUMNS = { date: 2, manager: 4, associate: 8 };  // C, E, I
const GOOGLE_COLUMNS    = { date: 1, manager: 2, associate: 4 };  // B, C, E

const GOOGLE_SHEETS_ID = '1fz136PRTzq3x81_k25aRS7sjmSePQri7XSL-Cn1fRhg';

// Timeout per individual request (ms)
const REQUEST_TIMEOUT = 8000;

// ── helpers ──────────────────────────────────────────────────────────

function isXlsx(buf: ArrayBuffer): boolean {
  const v = new Uint8Array(buf);
  if (v.length < 4) return false;
  return (v[0] === 0x50 && v[1] === 0x4B) || (v[0] === 0xD0 && v[1] === 0xCF);
}

function isCsv(buf: ArrayBuffer): boolean {
  const v = new Uint8Array(buf);
  if (v.length < 10) return false;
  const s = new TextDecoder().decode(v.slice(0, 500));
  if (s.toLowerCase().includes('<!doctype') || s.toLowerCase().includes('<html')) return false;
  return s.includes(',') && (s.includes('\n') || s.includes('\r'));
}

/** Fetch with an AbortController timeout */
async function timedFetch(url: string, ms: number): Promise<ArrayBuffer> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    if (!isXlsx(buf) && !isCsv(buf)) throw new Error('Not spreadsheet data');
    return buf;
  } finally {
    clearTimeout(timer);
  }
}

/** Build every possible fetch URL for a given data URL */
function buildUrls(dataUrl: string): string[] {
  return [
    dataUrl,  // direct
    `https://corsproxy.io/?url=${encodeURIComponent(dataUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(dataUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(dataUrl)}`,
  ];
}

// ── parse ────────────────────────────────────────────────────────────

type ColMap = { date: number; manager: number; associate: number };

function parseBuffer(buf: ArrayBuffer, cols: ColMap): PerformanceRecord[] {
  const csv = !isXlsx(buf);
  let rows: unknown[][];
  if (csv) {
    const text = new TextDecoder().decode(buf);
    const wb = XLSX.read(text, { type: 'string' });
    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  } else {
    const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: true });
    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  }

  const minCols = Math.max(cols.date, cols.manager, cols.associate) + 1;
  const records: PerformanceRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    if (!r || r.length < minCols) continue;

    const dateVal = r[cols.date];
    const associateVal = r[cols.associate];
    if (!dateVal || !associateVal) continue;

    const parsedDate = parseDate(dateVal);
    if (!parsedDate) continue;

    const associate = String(associateVal).trim();
    if (!associate) continue;

    records.push({
      date: parsedDate,
      manager: String(r[cols.manager] || '').trim(),
      associate,
      rawRow: r,
      rowIndex: i,
    });
  }
  return records;
}

// ── main fetch (everything in parallel) ──────────────────────────────

interface FetchAttempt {
  promise: Promise<ArrayBuffer>;
  cols: ColMap;
  label: string;
}

export async function fetchSpreadsheetData(): Promise<PerformanceRecord[]> {
  // Build ALL attempts from both sources at once
  const attempts: FetchAttempt[] = [];

  // Microsoft URLs
  const msUrls = [
    'https://touchstonecomm-my.sharepoint.com/:x:/g/personal/nhussain_touchstone_com_pk/IQDsMmRCJ6HPSb_7H40ADYnaAUDIHjPXSlak5nPj6bcddBA?download=1',
    'https://touchstonecomm-my.sharepoint.com/:x:/g/personal/nhussain_touchstone_com_pk/IQDsMmRCJ6HPSb_7H40ADYnaAUDIHjPXSlak5nPj6bcddBA?e=uV96oD&download=1',
  ];
  for (const u of msUrls) {
    for (const fullUrl of buildUrls(u)) {
      attempts.push({ promise: timedFetch(fullUrl, REQUEST_TIMEOUT), cols: MICROSOFT_COLUMNS, label: 'Microsoft Excel' });
    }
  }

  // Google Sheets URLs (most likely to succeed — public)
  const gUrls = [
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/export?format=xlsx`,
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:csv`,
  ];
  for (const u of gUrls) {
    for (const fullUrl of buildUrls(u)) {
      attempts.push({ promise: timedFetch(fullUrl, REQUEST_TIMEOUT), cols: GOOGLE_COLUMNS, label: 'Google Sheets' });
    }
  }

  // Race: whichever resolves first with valid data wins
  // We use a manual race that skips rejections
  const result = await raceSuccess(attempts);
  if (result) {
    const records = parseBuffer(result.buffer, result.cols);
    if (records.length > 0) {
      console.log(`✓ Loaded ${records.length} records from ${result.label}`);
      return records;
    }
  }

  throw new Error('FETCH_FAILED');
}

/** Resolve with the first attempt that succeeds; reject only if ALL fail. */
async function raceSuccess(
  attempts: FetchAttempt[]
): Promise<{ buffer: ArrayBuffer; cols: ColMap; label: string } | null> {
  return new Promise((resolve) => {
    let pending = attempts.length;
    let resolved = false;

    if (pending === 0) { resolve(null); return; }

    for (const a of attempts) {
      a.promise
        .then((buffer) => {
          if (!resolved) {
            resolved = true;
            resolve({ buffer, cols: a.cols, label: a.label });
          }
        })
        .catch(() => {
          pending--;
          if (pending === 0 && !resolved) resolve(null);
        });
    }
  });
}

// ── leaderboard ──────────────────────────────────────────────────────

/** Strip leading numeric IDs and normalise whitespace.
 *  "714841  Kashan Ali " → "Kashan Ali"
 *  "495029 Aliyan Haider" → "Aliyan Haider"
 */
export function cleanName(raw: string): string {
  return raw
    .replace(/^\d+\s+/, '')   // strip leading ID
    .replace(/\s+/g, ' ')     // collapse any multi-spaces / tabs
    .trim();
}

/** Normalise key for grouping (lowercase + collapsed whitespace) */
function normaliseKey(raw: string): string {
  return cleanName(raw).toLowerCase();
}

export function calculateLeaderboard(records: PerformanceRecord[]): LeaderboardEntry[] {
  // Group by normalised cleaned name so slight formatting differences merge
  const map = new Map<string, { displayName: string; count: number; manager: string }>();

  for (const r of records) {
    const key = normaliseKey(r.associate);
    const existing = map.get(key);
    if (existing) {
      existing.count++;
    } else {
      map.set(key, {
        displayName: cleanName(r.associate),
        count: 1,
        manager: r.manager,
      });
    }
  }

  const sorted = Array.from(map.values())
    .map((d) => ({
      associate: d.displayName,
      manager: d.manager,
      count: d.count,
      rank: 0,
    }))
    .sort((a, b) => b.count - a.count);

  sorted.forEach((e, i) => { e.rank = i + 1; });
  return sorted;
}
