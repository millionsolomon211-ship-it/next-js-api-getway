import { ApiRequest, ApiResponse } from '../domain/types';
import { AuthPort, HttpClientPort, RateLimiterPort, RouteRegistryPort, LoggerPort } from './ports';

export class GatewayUseCase {
  constructor(
    private routeRegistry: RouteRegistryPort,
    private authService: AuthPort,
    private rateLimiter: RateLimiterPort,
    private httpClient: HttpClientPort,
    private logger: LoggerPort
  ) { }

  async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    const startTime = Date.now();
    let responseBody: any = null;
    let status = 200;
    let errorMsg: string | undefined;

    try {
      const route = await this.routeRegistry.resolveRoute(request.path);

      if (!route) {
        status = 404;
        errorMsg = 'Route not found';
        return { status, headers: {}, body: { error: errorMsg } };
      }

      if (route.requiresAuth) {
        const isAuthenticated = await this.authService.authenticate(request);
        if (!isAuthenticated) {
          status = 401;
          errorMsg = 'Unauthorized';
          return { status, headers: {}, body: { error: errorMsg } };
        }
      }

      const isAllowed = await this.rateLimiter.isAllowed(request.clientIp, route.rateLimitType);
      if (!isAllowed) {
        status = 429;
        errorMsg = 'Too Many Requests';
        return { status, headers: {}, body: { error: errorMsg } };
      }

      const forwardResponse = await this.httpClient.forward(request, route);
      status = forwardResponse.status;
      responseBody = forwardResponse;
      return forwardResponse;

    } catch (err: any) {
      status = err.message.includes('timeout') ? 504 : 502;
      errorMsg = err.message || 'Bad Gateway';
      return { status, headers: {}, body: { error: errorMsg } };
    } finally {
      const durationMs = Date.now() - startTime;
      this.logger.log({
        id: Math.random().toString(36).substring(2, 10),
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.path,
        clientIp: request.clientIp,
        status,
        durationMs,
        error: errorMsg
      });
    }
  }
}
