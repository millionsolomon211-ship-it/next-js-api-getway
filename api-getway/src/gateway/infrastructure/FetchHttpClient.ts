import { ApiRequest, ApiResponse, RouteConfig } from '../domain/types';
import { HttpClientPort } from '../application/ports';

export class FetchHttpClient implements HttpClientPort {
  async forward(request: ApiRequest, route: RouteConfig): Promise<ApiResponse> {
    const targetUrl = new URL(request.path, route.targetServiceUrl).toString();
    
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

    const response = await fetch(targetUrl, fetchOptions);
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      headers: responseHeaders,
      body: response.body, // Pass as readable stream directly
    };
  }
}
