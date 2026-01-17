import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent {
  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    password: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  currentForm: string = 'login';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  showRegister(): void {
    this.currentForm = 'register';
    this.clearMessages();
  }

  showLogin(): void {
    this.currentForm = 'login';
    this.clearMessages();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin(): void {
    this.clearMessages();
    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        if (response.success) {
          this.successMessage = 'Connexion réussie !';
          
          // Redirection selon le rôle
          setTimeout(() => {
            if (response.user.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/client-dashboard']);
            }
          }, 1000);
        } else {
          this.errorMessage = response.message || 'Erreur de connexion';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur de connexion au serveur';
      }
    });
  }

  onRegister(): void {
    this.clearMessages();
    this.isLoading = true;

    const registerDataToSend = {
      prenom: this.registerData.prenom,
      nom: this.registerData.nom || '',
      telephone: this.registerData.telephone || '',
      email: this.registerData.email,
      password: this.registerData.password
    };

    this.authService.register(registerDataToSend).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        if (response.success) {
          this.successMessage = 'Inscription réussie !';
          
          // Auto-login après inscription
          setTimeout(() => {
            this.loginData.email = this.registerData.email;
            this.loginData.password = this.registerData.password;
            this.onLogin();
          }, 1500);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur d\'inscription';
      }
    });
  }
}