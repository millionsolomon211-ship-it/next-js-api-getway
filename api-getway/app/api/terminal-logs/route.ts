import { NextResponse } from 'next/server';
import { getTerminalLogs } from '@/src/gateway/infrastructure/TerminalLogger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await getTerminalLogs(100);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
