import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/connexion']);
    } else {
      this.router.navigate(['/']);
    }
    
    return false;
  }
}