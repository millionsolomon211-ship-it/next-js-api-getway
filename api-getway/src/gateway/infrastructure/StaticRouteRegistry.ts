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
      pathPrefix: '/api/catalog',
      targetServiceUrl: process.env.CATALOG_SERVICE_URL || 'http://localhost:8083',
      requiresAuth: false,
      rateLimitType: 'relaxed',
    },
  ];

  async resolveRoute(path: string): Promise<RouteConfig | null> {
    const match = this.routes.find(route => path.startsWith(route.pathPrefix));
    return match || null;
  }
}
