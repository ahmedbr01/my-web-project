import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  projects: any[] = [];
  recentProjects: any[] = [];
  clients: any[] = [];
  problems: any[] = [];
  isLoading = false;
  currentDate = new Date();
  
  stats = {
    activeProjects: 0,
    urgentProblems: 0,
    totalClients: 0,
    monthlyRevenue: 425000
  };

  constructor(
    public router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loadData();
  }

  refreshData(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadProjects();
    this.loadClients();
    this.loadRecentProjects();
    this.loadProblems();
  }

  loadProjects(): void {
    this.isLoading = true;
    
    this.projectService.getAllProjects().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.projects = response.projects;
          this.stats.activeProjects = response.count || response.projects.length;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Erreur chargement projets:', error);
      }
    });
  }

  loadClients(): void {
    this.adminService.getAllClients().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.clients = response.clients;
          this.stats.totalClients = response.clients.length;
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement clients:', error);
      }
    });
  }

  loadRecentProjects(): void {
    this.projectService.getRecentProjects().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.recentProjects = response.projects?.slice(0, 3) || [];
        }
      },
      error: (error: any) => {
        console.error('Erreur projets récents:', error);
      }
    });
  }

  loadProblems(): void {
    // Données de démonstration
    this.problems = [
      {
        id: 1,
        clientName: 'Mohamed Ali',
        description: 'Retard dans la livraison des matériaux',
        priority: 'Haute',
        date: '15/01/2024',
        status: 'Nouveau'
      },
      {
        id: 2,
        clientName: 'Sarah Ben',
        description: 'Problème de plomberie dans la salle de bain',
        priority: 'Moyenne',
        date: '20/01/2024',
        status: 'En cours'
      },
      {
        id: 3,
        clientName: 'Ahmed Trabelsi',
        description: 'Fenêtre cassée pendant les travaux',
        priority: 'Basse',
        date: '22/01/2024',
        status: 'Résolu'
      }
    ];
    
    this.stats.urgentProblems = this.problems.filter(p => p.priority === 'Haute').length;
  }

  // ====================
  // MÉTHODES UTILITAIRES
  // ====================

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-new',
      'in_progress': 'status-in-progress',
      'completed': 'status-resolved',
      'Nouveau': 'status-new',
      'En cours': 'status-in-progress',
      'Résolu': 'status-resolved'
    };
    return statusClasses[status] || 'status-new';
  }

  getPriorityClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      'Haute': 'priority-high',
      'Moyenne': 'priority-medium',
      'Basse': 'priority-low'
    };
    return priorityClasses[priority] || 'priority-medium';
  }

  // ====================
  // MÉTHODES D'ACTION
  // ====================

  viewProjectDetails(project: any): void {
    const statusText = project.status === 'pending' ? 'En attente' : 
                      project.status === 'in_progress' ? 'En cours' : 
                      project.status === 'completed' ? 'Terminé' : project.status;
    
    const message = `
      📋 DÉTAILS DU PROJET
      --------------------
      ID: #${project.id}
      Client: ${project.clientName}
      Email: ${project.clientEmail}
      Type: ${project.projectType}
      Statut: ${statusText}
      Surface: ${project.surface} m²
      Budget: ${project.budget || 'Non défini'}
      Date: ${new Date(project.createdAt).toLocaleDateString('fr-FR')}
      
      📝 Description:
      ${project.description || 'Aucune description'}
    `;
    alert(message);
  }

  viewProblemDetails(problem: any): void {
    const message = `
      ⚠️ PROBLÈME SIGNALÉ
      ------------------
      Client: ${problem.clientName}
      Date: ${problem.date}
      Priorité: ${problem.priority}
      Statut: ${problem.status}
      
      📋 Description:
      ${problem.description}
    `;
    alert(message);
  }

  resolveProblem(problem: any): void {
    if (confirm(`Marquer le problème de ${problem.clientName} comme résolu ?`)) {
      // Mettre à jour le statut localement
      problem.status = 'Résolu';
      
      // Mettre à jour les statistiques
      if (problem.priority === 'Haute') {
        this.stats.urgentProblems--;
      }
      
      alert('✅ Problème marqué comme résolu !');
    }
  }

  deleteClient(client: any): void {
    if (confirm(`Supprimer définitivement le client ${client.prenom} ${client.nom} ?`)) {
      this.adminService.deleteClient(client.id).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Supprimer le client de la liste locale
            this.clients = this.clients.filter(c => c.id !== client.id);
            this.stats.totalClients = this.clients.length;
            alert('✅ Client supprimé avec succès !');
          } else {
            alert(`❌ ${response.message}`);
          }
        },
        error: (error: any) => {
          console.error('Erreur suppression client:', error);
          
          // Fallback: supprimer localement en cas d'erreur
          this.clients = this.clients.filter(c => c.id !== client.id);
          this.stats.totalClients = this.clients.length;
          alert('⚠️ Client supprimé localement (serveur hors ligne)');
        }
      });
    }
  }

  deleteProject(project: any): void {
    if (confirm(`Supprimer définitivement le projet #${project.id} ?`)) {
      this.adminService.deleteProject(project.id).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Supprimer le projet de toutes les listes
            this.projects = this.projects.filter(p => p.id !== project.id);
            this.recentProjects = this.recentProjects.filter(p => p.id !== project.id);
            this.stats.activeProjects = this.projects.length;
            alert('✅ Projet supprimé avec succès !');
          } else {
            alert(`❌ ${response.message}`);
          }
        },
        error: (error: any) => {
          console.error('Erreur suppression projet:', error);
          
          // Fallback: supprimer localement
          this.projects = this.projects.filter(p => p.id !== project.id);
          this.recentProjects = this.recentProjects.filter(p => p.id !== project.id);
          this.stats.activeProjects = this.projects.length;
          alert('⚠️ Projet supprimé localement (serveur hors ligne)');
        }
      });
    }
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/connexion']);
    }
  }
}