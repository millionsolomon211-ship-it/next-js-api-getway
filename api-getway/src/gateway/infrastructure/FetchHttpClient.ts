import { ApiRequest, ApiResponse, RouteConfig } from '../domain/types';
import { HttpClientPort } from '../application/ports';

export class FetchHttpClient implements HttpClientPort {
  async forward(request: ApiRequest, route: RouteConfig): Promise<ApiResponse> {
    const targetUrl = new URL(request.path, route.targetServiceUrl).toString();
    
    const headers = { ...request.headers };
    delete headers.host; // Remove host to avoid conflicts
    
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers as HeadersInit,
    };
    
    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      fetchOptions.body = JSON.stringify(request.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    let body;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try { body = await response.json(); } catch { body = null; }
    } else {
      body = await response.text();
    }

    return {
      status: response.status,
      headers: responseHeaders,
      body,
    };
  }
}
