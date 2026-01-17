import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:5000/api/projects';

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

  // Pour les clients
  getUserProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-projects`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur récupération projets utilisateur:', error);
          
          // Données de démonstration
          if (error.status === 0 || error.status === 500) {
            return new Observable(observer => {
              observer.next({
                success: true,
                projects: [
                  {
                    id: 1,
                    clientName: 'Mohamed Ali',
                    clientEmail: 'mohamed@example.com',
                    projectType: 'construction',
                    projectAddress: 'Sidi Bou Said, Tunis',
                    surface: 350,
                    budget: '250000 DT',
                    description: 'Villa moderne avec piscine et jardin',
                    status: 'in_progress',
                    createdAt: new Date().toISOString()
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

  // Pour l'admin
  getAllProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur récupération tous les projets:', error);
          
          // Données de démonstration
          if (error.status === 0 || error.status === 500) {
            return new Observable(observer => {
              observer.next({
                success: true,
                count: 3,
                projects: [
                  {
                    id: 1,
                    clientName: 'Mohamed Ali',
                    clientEmail: 'mohamed@example.com',
                    projectType: 'construction',
                    surface: 350,
                    budget: '250000 DT',
                    description: 'Villa moderne avec piscine',
                    status: 'completed',
                    createdAt: new Date().toISOString()
                  },
                  {
                    id: 2,
                    clientName: 'Sarah Ben',
                    clientEmail: 'sarah@example.com',
                    projectType: 'renovation',
                    surface: 120,
                    budget: '75000 DT',
                    description: 'Rénovation appartement',
                    status: 'in_progress',
                    createdAt: new Date().toISOString()
                  },
                  {
                    id: 3,
                    clientName: 'Ahmed Trabelsi',
                    clientEmail: 'ahmed@example.com',
                    projectType: 'interior',
                    surface: 85,
                    budget: '45000 DT',
                    description: 'Design intérieur moderne',
                    status: 'pending',
                    createdAt: new Date().toISOString()
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

  getRecentProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recent`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur récupération projets récents:', error);
          
          // Données de démonstration
          if (error.status === 0 || error.status === 500) {
            return new Observable(observer => {
              observer.next({
                success: true,
                projects: [
                  {
                    id: 1,
                    clientName: 'Mohamed Ali',
                    clientEmail: 'mohamed@example.com',
                    projectType: 'construction',
                    surface: 350,
                    budget: '250000 DT',
                    description: 'Villa moderne avec piscine',
                    status: 'completed',
                    createdAt: new Date().toISOString()
                  },
                  {
                    id: 2,
                    clientName: 'Sarah Ben',
                    clientEmail: 'sarah@example.com',
                    projectType: 'renovation',
                    surface: 120,
                    budget: '75000 DT',
                    description: 'Rénovation appartement',
                    status: 'in_progress',
                    createdAt: new Date().toISOString()
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

  createProject(projectData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, projectData, { headers: this.getHeaders() });
  }
}