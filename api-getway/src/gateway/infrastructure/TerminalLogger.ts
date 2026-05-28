import fs from 'fs';
import path from 'path';

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
}

const logFile = path.join(process.cwd(), 'terminal-logs.json');

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, JSON.stringify([]));
}

function writeLog(type: string, args: any[]) {
  try {
    // Avoid circular JSON errors when stringifying complex objects
    const message = args.map(a => {
      try {
        return typeof a === 'object' ? JSON.stringify(a) : String(a);
      } catch {
        return '[Object]';
      }
    }).join(' ');
    
    // Ignore empty logs or clear commands to avoid noise
    if (!message || message.includes('clear')) return;
    
    const entry: TerminalLog = {
      id: Math.random().toString(36).substring(2, 10),
      timestamp: new Date().toISOString(),
      type: type as any,
      message
    };
    
    const data = fs.readFileSync(logFile, 'utf8');
    let logs: TerminalLog[] = [];
    try { logs = JSON.parse(data); } catch {}
    
    logs.unshift(entry);
    if (logs.length > 300) logs.length = 300;
    fs.writeFileSync(logFile, JSON.stringify(logs));
  } catch (e) {
    // Silently fail to not crash actual console operations
  }
}

// NextJS heavily utilizes multiple processes; we ensure we only hook once globally in whichever thread imports this
if (!(global as any).__terminalHooked) {
  (global as any).__terminalHooked = true;
  
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  console.log = (...args) => {
    writeLog('log', args);
    originalLog.apply(console, args);
  };
  console.error = (...args) => {
    writeLog('error', args);
    originalError.apply(console, args);
  };
  console.warn = (...args) => {
    writeLog('warn', args);
    originalWarn.apply(console, args);
  };
  console.info = (...args) => {
    writeLog('info', args);
    originalInfo.apply(console, args);
  };
}

export async function getTerminalLogs(limit: number = 100): Promise<TerminalLog[]> {
  try {
    const data = fs.readFileSync(logFile, 'utf8');
    const logs: TerminalLog[] = JSON.parse(data);
    return logs.slice(0, limit);
  } catch {
    return [];
  }
}
