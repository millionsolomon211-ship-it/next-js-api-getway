import { NextRequest, NextResponse } from 'next/server';
import { GatewayUseCase } from '@/src/gateway/application/GatewayUseCase';
import { StaticRouteRegistry } from '@/src/gateway/infrastructure/StaticRouteRegistry';
import { JwtAuthAdapter } from '@/src/gateway/infrastructure/JwtAuthAdapter';
import { InMemoryRateLimiter } from '@/src/gateway/infrastructure/InMemoryRateLimiter';
import { FetchHttpClient } from '@/src/gateway/infrastructure/FetchHttpClient';
import { ApiRequest, HttpMethod } from '@/src/gateway/domain/types';

const routeRegistry = new StaticRouteRegistry();
const authAdapter = new JwtAuthAdapter();
const rateLimiter = new InMemoryRateLimiter();
const httpClient = new FetchHttpClient();

const gateway = new GatewayUseCase(routeRegistry, authAdapter, rateLimiter, httpClient);

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const path = url.pathname;
  
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  let body;
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      body = await request.json();
    } catch {
      // Ignore if not json
    }
  }

  const apiRequest: ApiRequest = {
    path,
    method: request.method as HttpMethod,
    headers,
    body,
    clientIp,
  };

  const response = await gateway.handleRequest(apiRequest);
  
  return NextResponse.json(response.body, {
    status: response.status,
  });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
