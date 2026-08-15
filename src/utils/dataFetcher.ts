import * as XLSX from 'xlsx';
import { parseDate } from './dateUtils';

export interface PerformanceRecord {
  date: Date;
  manager: string;
  associate: string;
  rawRow: unknown[];
}

export interface LeaderboardEntry {
  associate: string;
  manager: string;
  count: number;
  rank: number;
}

// Data source configuration
interface DataSourceConfig {
  name: string;
  urls: string[];
  columnMapping: {
    date: number;      // Column index for Date
    manager: number;   // Column index for Manager
    associate: number; // Column index for Associate
  };
}

// Microsoft Excel/SharePoint source
const MICROSOFT_SOURCE: DataSourceConfig = {
  name: 'Microsoft Excel',
  urls: [
    'https://touchstonecomm-my.sharepoint.com/:x:/g/personal/nhussain_touchstone_com_pk/IQDsMmRCJ6HPSb_7H40ADYnaAUDIHjPXSlak5nPj6bcddBA?download=1',
    'https://touchstonecomm-my.sharepoint.com/:x:/g/personal/nhussain_touchstone_com_pk/IQDsMmRCJ6HPSb_7H40ADYnaAUDIHjPXSlak5nPj6bcddBA?e=uV96oD&download=1',
  ],
  columnMapping: {
    date: 2,      // Column C
    manager: 4,   // Column E
    associate: 8, // Column I
  },
};

// Google Sheets backup source
const GOOGLE_SHEETS_ID = '1fz136PRTzq3x81_k25aRS7sjmSePQri7XSL-Cn1fRhg';
const GOOGLE_SOURCE: DataSourceConfig = {
  name: 'Google Sheets',
  urls: [
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/export?format=xlsx`,
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:csv`,
  ],
  columnMapping: {
    date: 1,      // Column B
    manager: 2,   // Column C
    associate: 4, // Column E
  },
};

// CORS proxies to try
const CORS_PROXIES = [
  '', // Try direct first
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

function isValidXlsxBuffer(buffer: ArrayBuffer): boolean {
  const view = new Uint8Array(buffer);
  if (view.length < 4) return false;
  // PK signature for ZIP/XLSX
  if (view[0] === 0x50 && view[1] === 0x4B) return true;
  // XLS (old format) starts with 0xD0CF (OLE)
  if (view[0] === 0xD0 && view[1] === 0xCF) return true;
  return false;
}

function isValidCsvData(buffer: ArrayBuffer): boolean {
  // Check if it looks like CSV (text data with commas/newlines)
  const view = new Uint8Array(buffer);
  if (view.length < 10) return false;
  
  // Check for common CSV patterns - should start with printable ASCII
  // and contain commas and newlines
  const sample = new TextDecoder().decode(view.slice(0, Math.min(500, view.length)));
  
  // Reject if it looks like HTML
  if (sample.toLowerCase().includes('<!doctype') || sample.toLowerCase().includes('<html')) {
    return false;
  }
  
  // Should have commas and newlines for CSV
  return sample.includes(',') && (sample.includes('\n') || sample.includes('\r'));
}

async function tryFetch(url: string, proxy: string = ''): Promise<ArrayBuffer | null> {
  try {
    const fetchUrl = proxy ? `${proxy}${encodeURIComponent(url)}` : url;
    const response = await fetch(fetchUrl, {
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, application/octet-stream, */*',
      },
    });
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    
    // Validate that we got actual data, not an HTML page
    if (isValidXlsxBuffer(buffer) || isValidCsvData(buffer)) {
      return buffer;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchFromSource(source: DataSourceConfig): Promise<{ buffer: ArrayBuffer; isCSV: boolean } | null> {
  for (const proxy of CORS_PROXIES) {
    for (const url of source.urls) {
      const buffer = await tryFetch(url, proxy);
      if (buffer) {
        const isCSV = !isValidXlsxBuffer(buffer) && isValidCsvData(buffer);
        console.log(`✓ Successfully fetched from ${source.name} via ${proxy || 'direct'}`);
        return { buffer, isCSV };
      }
    }
  }
  return null;
}

function parseBuffer(
  buffer: ArrayBuffer,
  isCSV: boolean,
  columnMapping: DataSourceConfig['columnMapping']
): PerformanceRecord[] {
  let jsonData: unknown[][];

  if (isCSV) {
    // Parse CSV
    const text = new TextDecoder().decode(buffer);
    const workbook = XLSX.read(text, { type: 'string' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
  } else {
    // Parse XLSX
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
  }

  const records: PerformanceRecord[] = [];
  const minColumns = Math.max(columnMapping.date, columnMapping.manager, columnMapping.associate) + 1;

  // Skip header row(s) - start from row 1
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as unknown[];
    if (!row || row.length < minColumns) continue;

    const dateVal = row[columnMapping.date];
    const managerVal = row[columnMapping.manager];
    const associateVal = row[columnMapping.associate];

    if (!dateVal || !associateVal) continue;

    const parsedDate = parseDate(dateVal);
    if (!parsedDate) continue;

    const manager = String(managerVal || '').trim();
    const associate = String(associateVal || '').trim();

    if (!associate) continue;

    records.push({
      date: parsedDate,
      manager,
      associate,
      rawRow: row,
    });
  }

  return records;
}

export async function fetchSpreadsheetData(): Promise<PerformanceRecord[]> {
  // Try Microsoft Excel first
  console.log('Attempting to fetch from Microsoft Excel...');
  const microsoftResult = await fetchFromSource(MICROSOFT_SOURCE);
  if (microsoftResult) {
    const records = parseBuffer(
      microsoftResult.buffer,
      microsoftResult.isCSV,
      MICROSOFT_SOURCE.columnMapping
    );
    if (records.length > 0) {
      console.log(`✓ Loaded ${records.length} records from Microsoft Excel`);
      return records;
    }
  }

  // Fallback to Google Sheets
  console.log('Microsoft Excel failed, attempting Google Sheets backup...');
  const googleResult = await fetchFromSource(GOOGLE_SOURCE);
  if (googleResult) {
    const records = parseBuffer(
      googleResult.buffer,
      googleResult.isCSV,
      GOOGLE_SOURCE.columnMapping
    );
    if (records.length > 0) {
      console.log(`✓ Loaded ${records.length} records from Google Sheets`);
      return records;
    }
  }

  throw new Error('FETCH_FAILED');
}

/**
 * Strip leading numeric IDs from associate names.
 * "495029 Aliyan Haider" → "Aliyan Haider"
 * "Aliyan Haider"        → "Aliyan Haider"
 */
function cleanAssociateName(raw: string): string {
  // Remove a leading sequence of digits (and optional trailing whitespace)
  return raw.replace(/^\d+\s+/, '').trim();
}

export function calculateLeaderboard(records: PerformanceRecord[]): LeaderboardEntry[] {
  // Count occurrences per associate (each record = 1 unit of performance)
  // Group by the raw name so IDs still differentiate truly different people
  const countMap = new Map<string, { count: number; manager: string }>();

  for (const rec of records) {
    const key = rec.associate;
    const existing = countMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      countMap.set(key, { count: 1, manager: rec.manager });
    }
  }

  // Sort by count descending
  const sorted = Array.from(countMap.entries())
    .map(([associate, data]) => ({
      associate: cleanAssociateName(associate),
      manager: data.manager,
      count: data.count,
      rank: 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Assign ranks
  sorted.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return sorted;
}
