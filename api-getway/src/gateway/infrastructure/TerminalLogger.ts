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
        const text = typeof a === 'object' ? JSON.stringify(a) : String(a);
        // Clean out terminal ANSI color codes before saving to JSON UI
        return text.replace(/\u001b\[\d+m/g, '').replace(/\u001b\[\d+;\d+m/g, '');
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

// NextJS heavily utilizes custom loggers that bypass console.log, so we hook process.stdout directly
if (!(global as any).__terminalHooked) {
  (global as any).__terminalHooked = true;
  
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);

  // Hook STDOUT
  process.stdout.write = (chunk: any, encoding?: any, cb?: any) => {
    if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
      writeLog('info', [chunk.toString().trim()]);
    }
    return originalStdoutWrite(chunk, encoding as BufferEncoding, cb);
  };

  // Hook STDERR
  process.stderr.write = (chunk: any, encoding?: any, cb?: any) => {
    if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
      writeLog('error', [chunk.toString().trim()]);
    }
    return originalStderrWrite(chunk, encoding as BufferEncoding, cb);
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
