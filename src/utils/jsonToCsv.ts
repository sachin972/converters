/**
 * Converts a JSON array of objects to CSV string.
 * Handles nested objects/arrays by stringifying them.
 * Escapes quotes in values.
 */
export function jsonToCsv(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const rows = data as Record<string, unknown>[];
  const headers = collectHeaders(rows);
  const headerLine = headers.map(escapeCsv).join(',');

  const bodyLines = rows.map((row) =>
    headers.map((h) => escapeCsv(getValue(row, h))).join(',')
  );

  return [headerLine, ...bodyLines].join('\n');
}

function collectHeaders(rows: Record<string, unknown>[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      set.add(key);
    }
  }
  return Array.from(set);
}

function getValue(obj: Record<string, unknown>, path: string): string {
  const val = obj[path];
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function escapeCsv(value: string): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Parses JSON string; returns parsed data or throws with a message.
 */
export function parseJson(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Empty input');
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    throw new Error(message);
  }
}

/**
 * Ensures data is an array of objects for CSV conversion.
 */
export function ensureArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.map((item) =>
      item !== null && typeof item === 'object' && !Array.isArray(item)
        ? (item as Record<string, unknown>)
        : { value: item }
    );
  }
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    return [data as Record<string, unknown>];
  }
  throw new Error('JSON must be an array of objects or a single object');
}
