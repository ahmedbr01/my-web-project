import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  projects: any[] = [];
  user: any = null;
  isLoading = false;
  
  stats = {
    totalProjects: 0,
    pendingProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/connexion']);
      return;
    }
    
    this.user = this.authService.getCurrentUser();
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    
    // Récupérer TOUS les projets (admin + clients)
    this.http.get('http://localhost:5000/api/upload/projects').subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        if (response.success) {
          this.projects = response.projects;
          this.calculateStats();
          
          console.log(`✅ ${this.projects.length} projets chargés dans dashboard client`);
        } else {
          this.projects = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur chargement projets:', error);
        
        // Données de démo
        this.projects = [
          {
            id: 1,
            title: 'Villa Moderne',
            projectType: 'construction',
            projectAddress: 'Sidi Bou Said',
            surface: 350,
            budget: '250000 DT',
            description: 'Villa moderne avec piscine',
            status: 'completed',
            createdAt: new Date()
          },
          {
            id: 2,
            title: 'Rénovation Appartement',
            projectType: 'renovation',
            projectAddress: 'Tunis Centre',
            surface: 120,
            budget: '75000 DT',
            description: 'Rénovation complète',
            status: 'in_progress',
            createdAt: new Date()
          }
        ];
        
        this.calculateStats();
      }
    });
  }

  calculateStats(): void {
    this.stats.totalProjects = this.projects.length;
    this.stats.pendingProjects = this.projects.filter(p => p.status === 'pending').length;
    this.stats.inProgressProjects = this.projects.filter(p => p.status === 'in_progress').length;
    this.stats.completedProjects = this.projects.filter(p => p.status === 'completed').length;
  }

  refreshProjects(): void {
    this.loadProjects();
  }

  getStatusClass(status: string): string {
    return status || 'pending';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminé'
    };
    return statusMap[status] || status;
  }

  viewProjectDetails(project: any): void {
    const message = `
      📋 DÉTAILS DU PROJET
      --------------------
      Type: ${project.projectType}
      Statut: ${this.getStatusText(project.status)}
      Adresse: ${project.projectAddress}
      Surface: ${project.surface} m²
      Budget: ${project.budget || 'Non défini'}
      Date: ${new Date(project.createdAt).toLocaleDateString('fr-FR')}
      
      📝 Description:
      ${project.description || 'Aucune description'}
    `;
    alert(message);
  }

  contactSupport(): void {
    alert('📞 Support technique\nContact: 71 234 567\nEmail: support@sadraoui-construction.com');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}