import { ApiRequest, ApiResponse, RouteConfig } from '../domain/types';
import { HttpClientPort } from '../application/ports';

export class FetchHttpClient implements HttpClientPort {
  async forward(request: ApiRequest, route: RouteConfig): Promise<ApiResponse> {
    const baseUrl = route.targetServiceUrl.endsWith('/')
      ? route.targetServiceUrl.slice(0, -1)
      : route.targetServiceUrl;

    // Ensure we don't double up on slashes and include the full path + query string
    const targetUrl = `${baseUrl}${request.path}`;

    const headers = { ...request.headers };
    delete headers.host; // Remove host to avoid conflicts

    // In Node.js 18+ fetch, passing a ReadableStream as body requires 'duplex: half'
    const fetchOptions: RequestInit & { duplex?: 'half' } = {
      method: request.method,
      headers: headers as HeadersInit,
    };

    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      fetchOptions.body = request.body;
      fetchOptions.duplex = 'half';
    }

    const timeout = route.timeoutMs || 30000; // Default to 30s
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(targetUrl, {
        ...fetchOptions,
        signal: controller.signal
      });
      clearTimeout(id);
      
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        headers: responseHeaders,
        body: response.body, // Pass as readable stream directly
      };
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw err;
    }
  }
}
