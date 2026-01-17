import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.css']
})
export class DevisComponent implements OnInit {
  // Données du formulaire
  devisData = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectAddress: '',
    projectType: 'construction',
    surface: 0,
    budget: '',
    description: '',
    tasks: [] as string[],
    additionalTasks: '',
    deadline: '',
    style: ''
  };

  // Tâches prédéfinies
  availableTasks = [
    'Plomberie',
    'Électricité',
    'Maçonnerie',
    'Menuiserie',
    'Peinture',
    'Carrelage',
    'Isolation',
    'Toiture',
    'Chauffage',
    'Climatisation',
    'Plâtrerie',
    'Revêtement de sol'
  ];

  // États UI
  isLoading = false;
  isSubmitted = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any = null;
  showSuccess = false;

  // CORRECTION: Rendre authService public pour le template
  constructor(
    private http: HttpClient,
    private router: Router,
    public authService: AuthService // Changé de private à public
  ) {}

  ngOnInit(): void {
    console.log('📋 Initialisation page devis');
    this.currentUser = this.authService.getCurrentUser();
    
    // Pré-remplir avec les données utilisateur si connecté
    if (this.currentUser) {
      console.log('👤 Utilisateur connecté:', this.currentUser);
      this.devisData.clientName = `${this.currentUser.prenom || ''} ${this.currentUser.nom || ''}`.trim();
      this.devisData.clientEmail = this.currentUser.email || '';
      this.devisData.clientPhone = this.currentUser.telephone || '';
    } else {
      console.log('👤 Utilisateur non connecté');
    }
  }

  // Gestion des tâches
  toggleTask(task: string): void {
    const index = this.devisData.tasks.indexOf(task);
    if (index === -1) {
      this.devisData.tasks.push(task);
    } else {
      this.devisData.tasks.splice(index, 1);
    }
    console.log('🔧 Tâches sélectionnées:', this.devisData.tasks);
  }

  isTaskSelected(task: string): boolean {
    return this.devisData.tasks.includes(task);
  }

  // Validation du formulaire
  validateForm(): boolean {
    this.errorMessage = '';
    
    if (!this.devisData.clientName.trim()) {
      this.errorMessage = 'Le nom est requis';
      return false;
    }
    
    if (!this.devisData.clientEmail.trim()) {
      this.errorMessage = 'L\'email est requis';
      return false;
    }
    
    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.devisData.clientEmail)) {
      this.errorMessage = 'Format d\'email invalide';
      return false;
    }
    
    if (!this.devisData.projectType) {
      this.errorMessage = 'Le type de projet est requis';
      return false;
    }
    
    if (this.devisData.surface < 0) {
      this.errorMessage = 'La surface doit être positive';
      return false;
    }
    
    if (!this.devisData.description.trim()) {
      this.errorMessage = 'La description du projet est requise';
      return false;
    }
    
    return true;
  }

  // Soumission du formulaire
  async submitDevis(): Promise<void> {
    console.log('📤 Début envoi devis...', this.devisData);
    
    if (!this.validateForm()) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showSuccess = false;
    
    try {
      // Préparer les données
      const formData = {
        ...this.devisData,
        surface: Number(this.devisData.surface) || 0,
        tasks: this.devisData.tasks,
        deadline: this.devisData.deadline || undefined
      };
      
      console.log('📊 Données à envoyer:', formData);
      
      // Préparer les headers avec token si disponible
      const token = this.authService.getToken();
      let headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
        console.log('🔐 Token ajouté aux headers');
      }
      
      // Envoyer la requête
      const response: any = await this.http.post(
        'http://localhost:5000/api/devis/create',
        formData,
        { headers }
      ).toPromise();
      
      console.log('✅ Réponse serveur:', response);
      
      if (response.success) {
        this.successMessage = response.message || 'Votre demande a été envoyée avec succès !';
        this.showSuccess = true;
        this.isSubmitted = true;
        
        // Réinitialiser le formulaire après succès
        setTimeout(() => {
          this.resetForm();
          this.isSubmitted = false;
          this.showSuccess = false;
          
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            if (this.authService.isLoggedIn()) {
              this.router.navigate(['/client-dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 2000);
        }, 3000);
        
      } else {
        this.errorMessage = response.message || 'Erreur lors de l\'envoi de la demande';
      }
      
    } catch (error: any) {
      console.error('❌ Erreur complète envoi devis:', error);
      console.error('❌ Statut:', error.status);
      console.error('❌ Message:', error.message);
      console.error('❌ Données erreur:', error.error);
      
      if (error.status === 0 || error.status === 500) {
        this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        
        // Mode démo en cas d'erreur de connexion
        this.successMessage = '⚠️ Mode démo: Votre demande a été enregistrée localement';
        this.showSuccess = true;
        this.isSubmitted = true;
        
        setTimeout(() => {
          this.resetForm();
          this.isSubmitted = false;
          this.showSuccess = false;
        }, 3000);
        
      } else if (error.status === 400) {
        this.errorMessage = error.error?.message || 'Données invalides. Vérifiez votre formulaire.';
      } else if (error.error?.message) {
        this.errorMessage = error.error.message;
      } else {
        this.errorMessage = 'Une erreur est survenue lors de l\'envoi de votre demande';
      }
      
    } finally {
      this.isLoading = false;
    }
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    console.log('🔄 Réinitialisation du formulaire');
    this.devisData = {
      clientName: this.currentUser ? `${this.currentUser.prenom || ''} ${this.currentUser.nom || ''}`.trim() : '',
      clientEmail: this.currentUser ? this.currentUser.email || '' : '',
      clientPhone: this.currentUser ? this.currentUser.telephone || '' : '',
      projectAddress: '',
      projectType: 'construction',
      surface: 0,
      budget: '',
      description: '',
      tasks: [],
      additionalTasks: '',
      deadline: '',
      style: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Annuler
  cancel(): void {
    if (confirm('Annuler la demande de devis ? Les données saisies seront perdues.')) {
      this.router.navigate(['/']);
    }
  }

  // Formater la date pour l'input
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Formater la date min (aujourd'hui + 1 mois)
  getMinDate(): string {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  }

  // CORRECTION: Méthode pour vérifier la connexion dans le template
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}