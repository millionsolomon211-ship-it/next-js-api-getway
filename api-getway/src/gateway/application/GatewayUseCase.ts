import { ApiRequest, ApiResponse } from '../domain/types';
import { AuthPort, HttpClientPort, RateLimiterPort, RouteRegistryPort } from './ports';

export class GatewayUseCase {
  constructor(
    private routeRegistry: RouteRegistryPort,
    private authService: AuthPort,
    private rateLimiter: RateLimiterPort,
    private httpClient: HttpClientPort
  ) {}

  async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    const route = await this.routeRegistry.resolveRoute(request.path);
    
    if (!route) {
      return { status: 404, headers: {}, body: { error: 'Route not found' } };
    }

    if (route.requiresAuth) {
      const isAuthenticated = await this.authService.authenticate(request);
      if (!isAuthenticated) {
        return { status: 401, headers: {}, body: { error: 'Unauthorized' } };
      }
    }

    const isAllowed = await this.rateLimiter.isAllowed(request.clientIp, route.rateLimitType);
    if (!isAllowed) {
      return { status: 429, headers: {}, body: { error: 'Too Many Requests' } };
    }

    try {
      return await this.httpClient.forward(request, route);
    } catch (error) {
      console.error('Forwarding error', error);
      return { status: 502, headers: {}, body: { error: 'Bad Gateway' } };
    }
  }
}
