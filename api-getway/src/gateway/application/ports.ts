import { ApiRequest, ApiResponse, RouteConfig } from '../domain/types';

export interface AuthPort {
  authenticate(request: ApiRequest): Promise<boolean>;
}

export interface RateLimiterPort {
  isAllowed(clientIp: string, rateLimitType: string): Promise<boolean>;
}

export interface RouteRegistryPort {
  resolveRoute(path: string): Promise<RouteConfig | null>;
}

export interface HttpClientPort {
  forward(request: ApiRequest, route: RouteConfig): Promise<ApiResponse>;
}
