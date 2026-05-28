export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RouteConfig {
  pathPrefix: string;
  targetServiceUrl: string;
  requiresAuth: boolean;
  rateLimitType: 'strict' | 'standard' | 'relaxed';
}

export interface ApiRequest {
  path: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: any;
  clientIp: string;
}

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body?: any; // Can be a stream, text, or json for true proxying
}

export interface LogEntry {
  id: string;
  timestamp: string;
  method: HttpMethod;
  path: string;
  clientIp: string;
  status: number;
  durationMs: number;
  error?: string;
}
