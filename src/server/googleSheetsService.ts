import { google } from 'googleapis';

export interface GoogleSheetsConfig {
  serviceAccountEmail?: string;
  privateKey?: string;
  spreadsheetId?: string;
}

const GOOGLE_SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export class GoogleSheetsService {
  private readonly sheets;
  private readonly spreadsheetId: string;

  constructor(config: GoogleSheetsConfig) {
    const serviceAccountEmail = config.serviceAccountEmail?.trim();
    const privateKey = config.privateKey?.replace(/\\n/g, '\n').trim();
    const spreadsheetId = config.spreadsheetId?.trim();

    if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
      throw new Error('Google Sheets service account email, private key, and spreadsheet ID are required.');
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: GOOGLE_SHEETS_SCOPES
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = spreadsheetId;
  }

  async readRange(range: string): Promise<unknown[][]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range
    });
    return (response.data.values ?? []) as unknown[][];
  }

  async updateRange(range: string, values: unknown[][]): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
  }

  async appendRow(range: string, values: unknown[]): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] }
    });
  }

  async clearRange(range: string): Promise<void> {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range
    });
  }

  async batchUpdateRanges(data: Array<{ range: string; values: unknown[][] }>): Promise<void> {
    await this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: data.map(({ range, values }) => ({ range, values }))
      }
    });
  }

  async ensureTabs(titles: string[]): Promise<void> {
    const response = await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId, fields: 'sheets.properties.title' });
    const existing = new Set((response.data.sheets ?? []).map((sheet) => sheet.properties?.title).filter((title): title is string => Boolean(title)));
    const missing = [...new Set(titles)].filter((title) => !existing.has(title));
    if (!missing.length) return;
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: { requests: missing.map((title) => ({ addSheet: { properties: { title } } })) }
    });
  }
}

export interface ContactSubmission {
  id: string;
  submittedAt: string;
  name: string;
  email: string;
  purpose: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
}

function sanitizeSpreadsheetCell(value: string): string {
  return /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
}

export function serializeContactSubmission(submission: ContactSubmission): unknown[] {
  return [
    submission.id,
    submission.submittedAt,
    sanitizeSpreadsheetCell(submission.name),
    sanitizeSpreadsheetCell(submission.email),
    sanitizeSpreadsheetCell(submission.purpose),
    sanitizeSpreadsheetCell(submission.subject),
    sanitizeSpreadsheetCell(submission.message),
    submission.status
  ];
}

export function parseContactSubmissions(rows: unknown[][]): ContactSubmission[] {
  const hasHeader = rows[0]?.[0] === 'id';
  return (hasHeader ? rows.slice(1) : rows).flatMap((row) => {
    if (!Array.isArray(row) || row.length < 7) return [];
    const [id, submittedAt, name, email, purpose, subject, message, status] = row;
    if (
      typeof id !== 'string' ||
      typeof submittedAt !== 'string' ||
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof purpose !== 'string' ||
      typeof subject !== 'string' ||
      typeof message !== 'string'
    ) {
      return [];
    }
    const validStatus = status === 'read' || status === 'archived' ? status : 'unread';
    return [{ id, submittedAt, name, email, purpose, subject, message, status: validStatus }];
  });
}
