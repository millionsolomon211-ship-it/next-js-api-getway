import { ApiRequest } from '../domain/types';
import { AuthPort } from '../application/ports';

export class JwtAuthAdapter implements AuthPort {
  async authenticate(request: ApiRequest): Promise<boolean> {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.split(' ')[1];
    
    // Simple validation, replace with decoding and verification
    return token.length > 10;
  }
}
