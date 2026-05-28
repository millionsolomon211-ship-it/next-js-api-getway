import { NextResponse } from 'next/server';
import { loggerAdapter } from '@/app/api/[...proxy]/route'; // Reusing the same file instance

// In a real scenario we wouldn't import loggerAdapter like this if we scale horizontally, 
// but for a single instance memory/file logger, it works to fetch the recent logs.
// Actually since it's a FileLogger, we can just instantiate a new one to read the file.
import { FileLoggerAdapter } from '@/src/gateway/infrastructure/FileLoggerAdapter';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET() {
  try {
    const logger = new FileLoggerAdapter();
    const logs = await logger.getRecentLogs(100);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
