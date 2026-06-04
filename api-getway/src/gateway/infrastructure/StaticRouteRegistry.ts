import { RouteConfig } from '../domain/types';
import { RouteRegistryPort } from '../application/ports';

export class StaticRouteRegistry implements RouteRegistryPort {
  private routes: RouteConfig[] = [
    {
      pathPrefix: '/api/auth',
      targetServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:8081',
      requiresAuth: false,
      rateLimitType: 'strict',
    },
    {
      pathPrefix: '/api/orders',
      targetServiceUrl: process.env.ORDERS_SERVICE_URL || 'http://localhost:8082',
      requiresAuth: true,
      rateLimitType: 'standard',
    },
    {
      pathPrefix: '/api/regions',
      targetServiceUrl: process.env.content_SERVICE_URL || 'https://service-lime-gamma.vercel.app',
      requiresAuth: false,
      rateLimitType: 'relaxed',
    },
    {
      pathPrefix: '/api/usp',
      targetServiceUrl: process.env.USP_SERVICE_URL || 'https://usp.com.et',
      requiresAuth: true,
      rateLimitType: 'strict',
    },
    {
      pathPrefix: '/api/uspwork',
      targetServiceUrl: process.env.USPWORK_SERVICE_URL || 'https://usp.work.gd',
      requiresAuth: true,
      rateLimitType: 'strict',
      timeoutMs: 5000,
    },
  ];

  async resolveRoute(path: string): Promise<RouteConfig | null> {
    const match = this.routes.find(route => path.startsWith(route.pathPrefix));
    return match || null;
  }
}
