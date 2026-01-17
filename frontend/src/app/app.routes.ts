import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { SolutionsComponent } from './pages/solutions/solutions.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { DevisComponent } from './pages/devis/devis.component';
import { ClientDashboardComponent } from './pages/client-dashboard/client-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'connexion', component: ConnexionComponent },
  { 
    path: 'projects', 
    component: ProjectsComponent 
  },
  { path: 'solutions', component: SolutionsComponent },
  
  // Protected client routes
  { 
    path: 'devis', 
    component: DevisComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'client-dashboard', 
    component: ClientDashboardComponent,
    canActivate: [AuthGuard] 
  },
  
  // Admin routes
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard] 
  },
  
  // Wildcard redirect
  { path: '**', redirectTo: '' }
];