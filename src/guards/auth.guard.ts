import { AuthService } from '../services/auth.service';

export class AuthGuard {
  static isAuthenticated(): boolean {
    const user = AuthService.getCurrentUser();
    return !!user;
  }
}
