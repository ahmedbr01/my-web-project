import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token non disponible');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur récupération clients:', error);
          
          // Données de démonstration en cas d'erreur
          if (error.status === 0 || error.status === 500) {
            return new Observable(observer => {
              observer.next({
                success: true,
                clients: [
                  {
                    id: 1,
                    prenom: 'Admin',
                    nom: 'Sadraoui',
                    email: 'admin@sadraoui.com',
                    telephone: '71234567',
                    role: 'admin',
                    created_at: new Date().toISOString()
                  },
                  {
                    id: 2,
                    prenom: 'Mohamed',
                    nom: 'Ali',
                    email: 'mohamed@example.com',
                    telephone: '71234568',
                    role: 'client',
                    created_at: new Date().toISOString()
                  },
                  {
                    id: 3,
                    prenom: 'Sarah',
                    nom: 'Ben',
                    email: 'sarah@example.com',
                    telephone: '71234569',
                    role: 'client',
                    created_at: new Date().toISOString()
                  }
                ]
              });
              observer.complete();
            });
          }
          
          return throwError(() => error);
        })
      );
  }

  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${clientId}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur suppression client:', error);
          return throwError(() => error);
        })
      );
  }

  deleteProject(projectId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur suppression projet:', error);
          return throwError(() => error);
        })
      );
  }
}