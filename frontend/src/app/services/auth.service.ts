import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public authStatus$ = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.authStatus$.next(true);
        console.log('👤 Utilisateur chargé depuis localStorage:', user);
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur:', error);
      this.clearAuth();
    }
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    console.log('🔑 Tentative de connexion:', credentials.email);
    
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        console.log('✅ Réponse login:', response);
        
        if (response.success && response.token && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.authStatus$.next(true);
          console.log('✅ Connexion réussie, token stocké');
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    console.log('👋 Déconnexion');
    this.clearAuth();
    this.authStatus$.next(false);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('🔐 Token récupéré:', token ? 'OUI' : 'NON');
    return token;
  }

  getCurrentUser(): any {
    const user = this.currentUserSubject.value;
    console.log('👤 Utilisateur courant:', user);
    return user;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const loggedIn = !!token;
    console.log('🔐 Connecté?:', loggedIn);
    return loggedIn;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    const admin = user && user.role === 'admin';
    console.log('👑 Admin?:', admin);
    return admin;
  }
}