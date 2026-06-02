import { NextRequest, NextResponse } from 'next/server';
import '@/src/gateway/infrastructure/TerminalLogger'; // Hook terminal dynamically
import { GatewayUseCase } from '@/src/gateway/application/GatewayUseCase';
import { StaticRouteRegistry } from '@/src/gateway/infrastructure/StaticRouteRegistry';
import { JwtAuthAdapter } from '@/src/gateway/infrastructure/JwtAuthAdapter';
import { InMemoryRateLimiter } from '@/src/gateway/infrastructure/InMemoryRateLimiter';
import { FetchHttpClient } from '@/src/gateway/infrastructure/FetchHttpClient';
import { FileLoggerAdapter } from '@/src/gateway/infrastructure/FileLoggerAdapter';
import { ApiRequest, HttpMethod } from '@/src/gateway/domain/types';

const routeRegistry = new StaticRouteRegistry();
const authAdapter = new JwtAuthAdapter();
const rateLimiter = new InMemoryRateLimiter();
const httpClient = new FetchHttpClient();
export const loggerAdapter = new FileLoggerAdapter();

const gateway = new GatewayUseCase(routeRegistry, authAdapter, rateLimiter, httpClient, loggerAdapter);

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const path = url.pathname + url.search;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

  let body;
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    // Forward the readable stream directly to avoid bufferinfADvg overhead
    body = request.body;
  }

  const apiRequest: ApiRequest = {
    path,
    method: request.method as HttpMethod,
    headers,
    body,
    clientIp,
  };

  const response = await gateway.handleRequest(apiRequest);

  // Support returning Next.js errors or streamed responses from API directly
  if (response.status >= 400 && response.status < 500 && !response.body) {
    return NextResponse.json(response.body, { status: response.status });
  }

  // Stream standard fetch responses dynamically avoiding buffer
  return new NextResponse(response.body as any, {
    status: response.status,
    headers: response.headers,
  });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
