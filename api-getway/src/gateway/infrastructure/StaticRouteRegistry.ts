import { RouteConfig } from '../domain/types';
import { RouteRegistryPort } from '../application/ports';

export class StaticRouteRegistry implements RouteRegistryPort {
  private routes: RouteConfig[] = [
    {
      pathPrefix: '/api/auth',
      targetServiceUrl: 'http://localhost:8081', // Example Auth Microservice
      requiresAuth: false,
      rateLimitType: 'strict',
    },
    {
      pathPrefix: '/api/orders',
      targetServiceUrl: 'http://localhost:8082', // Example Orders Microservice
      requiresAuth: true,
      rateLimitType: 'standard',
    },
    {
      pathPrefix: '/api/catalog',
      targetServiceUrl: 'http://localhost:8083', // Example Catalog Microservice
      requiresAuth: false,
      rateLimitType: 'relaxed',
    },
  ];

  async resolveRoute(path: string): Promise<RouteConfig | null> {
    const match = this.routes.find(route => path.startsWith(route.pathPrefix));
    return match || null;
  }
}
