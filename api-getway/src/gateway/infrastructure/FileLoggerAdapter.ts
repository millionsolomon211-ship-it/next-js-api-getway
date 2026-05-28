import { LoggerPort } from '../application/ports';
import { LogEntry } from '../domain/types';
import fs from 'fs';
import path from 'path';

export class FileLoggerAdapter implements LoggerPort {
  private logFile: string;

  constructor() {
    this.logFile = path.join(process.cwd(), 'gateway-logs.json');
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, JSON.stringify([]));
    }
  }

  log(entry: LogEntry): void {
    try {
      const data = fs.readFileSync(this.logFile, 'utf8');
      const logs: LogEntry[] = JSON.parse(data);
      logs.unshift(entry);
      // Keep only last 500 logs to prevent file explosion
      if (logs.length > 500) logs.length = 500;
      fs.writeFileSync(this.logFile, JSON.stringify(logs)); // no padding for performance
    } catch (e) {
      console.error('Failed to write log', e);
    }
  }

  async getRecentLogs(limit: number = 50): Promise<LogEntry[]> {
    try {
      const data = fs.readFileSync(this.logFile, 'utf8');
      const logs: LogEntry[] = JSON.parse(data);
      return logs.slice(0, limit);
    } catch {
      return [];
    }
  }
}
