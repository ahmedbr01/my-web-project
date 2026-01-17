import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  // Projects data
  allProjects: any[] = [];
  filteredProjects: any[] = [];
  
  // UI states
  activeFilter = 'all';
  showAddModal = false;
  showGallery = false;
  isLoading = false;
  isSubmitting = false;
  
  // Gallery
  selectedProject: any = null;
  currentImageIndex = 0;
  
  // File upload
  selectedFiles: File[] = [];
  
  // Admin state
  isAdmin = false;
  currentUser: any = null;
  
  // New project form
  newProject = {
    title: '',
    type: 'construction',
    category: 'residential',
    status: 'completed',
    description: '',
    surface: 0,
    location: 'Tunis',
    isFeatured: false
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Utilisateur:', this.currentUser, 'Admin:', this.isAdmin);
    this.loadProjects();
  }

  // ====================
  // FILE UPLOAD METHODS
  // ====================

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    console.log('📁 Fichiers sélectionnés:', files.length);
    
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (this.selectedFiles.length < 10) {
          this.selectedFiles.push(files[i]);
          console.log(`✅ Fichier ajouté: ${files[i].name}`);
        }
      }
      console.log(`📁 Total fichiers: ${this.selectedFiles.length}`);
    }
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
    console.log(`🗑️ Fichier supprimé, reste: ${this.selectedFiles.length}`);
  }

  // ====================
  // LOAD PROJECTS
  // ====================

  loadProjects(): void {
    this.isLoading = true;
    console.log('🔄 Chargement des projets...');
    
    this.http.get('http://localhost:5000/api/upload/projects').subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('✅ Réponse API:', response);
        
        if (response.success) {
          // Traiter les images pour avoir des URLs complètes
          this.allProjects = (response.projects || []).map((project: any) => {
            // S'assurer que les images ont des URLs complètes
            if (project.images && project.images.length > 0) {
              project.images = project.images.map((img: any) => {
                // Si l'image a déjà une URL complète
                if (img.displayUrl || (img.path && img.path.startsWith('http'))) {
                  return img;
                }
                
                // Construire l'URL complète
                let imageUrl = '';
                if (img.path) {
                  if (img.path.startsWith('/uploads')) {
                    imageUrl = `http://localhost:5000${img.path}`;
                  } else {
                    imageUrl = `http://localhost:5000/uploads/projects/${img.path}`;
                  }
                } else if (img.filename) {
                  imageUrl = `http://localhost:5000/uploads/projects/${img.filename}`;
                }
                
                return {
                  ...img,
                  displayUrl: imageUrl,
                  path: imageUrl
                };
              });
            }
            return project;
          });
          
          this.filteredProjects = [...this.allProjects];
          console.log(`✅ ${this.allProjects.length} projets chargés`);
          
          // Debug: Afficher les URLs des images
          this.allProjects.forEach((project, index) => {
            if (project.images && project.images.length > 0) {
              console.log(`📸 Projet ${index + 1} images:`, 
                project.images.map((img: any) => img.displayUrl || img.path));
            }
          });
        } else {
          console.error('❌ Erreur API:', response.message);
          this.loadDemoProjects();
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Erreur chargement:', error);
        this.loadDemoProjects();
      }
    });
  }

  loadDemoProjects(): void {
    console.log('📋 Chargement données démo...');
    this.allProjects = [
      {
        id: 1,
        title: 'Villa Moderne Sidi Bou Said',
        type: 'construction',
        status: 'completed',
        category: 'residential',
        description: 'Villa moderne avec piscine et jardin',
        surface: 350,
        location: 'Sidi Bou Said',
        images: [{
          filename: 'villa.jpg',
          path: 'http://localhost:5000/uploads/projects/villa.jpg',
          displayUrl: 'http://localhost:5000/uploads/projects/villa.jpg'
        }],
        isFeatured: true,
        date: new Date()
      }
    ];
    
    this.filteredProjects = [...this.allProjects];
    console.log('📋 Données démo chargées');
  }

  // ====================
  // IMAGE METHODS
  // ====================

  getImageUrl(image: any): string {
    if (!image) {
      return 'assets/images/default-project.jpg';
    }
    
    // Priorité 1: displayUrl
    if (image.displayUrl) {
      return image.displayUrl;
    }
    
    // Priorité 2: path
    if (image.path) {
      if (image.path.startsWith('http://') || image.path.startsWith('https://')) {
        return image.path;
      }
      
      if (image.path.startsWith('/uploads')) {
        return `http://localhost:5000${image.path}`;
      }
      
      return `http://localhost:5000/uploads/projects/${image.path}`;
    }
    
    // Priorité 3: filename
    if (image.filename) {
      return `http://localhost:5000/uploads/projects/${image.filename}`;
    }
    
    // Image par défaut
    return 'assets/images/default-project.jpg';
  }

  onImageError(event: any, image: any): void {
    console.log('❌ Erreur chargement image:', event);
    
    // Remplacer par l'image par défaut
    event.target.src = 'assets/images/default-project.jpg';
    
    // Essayer une URL alternative
    setTimeout(() => {
      if (image) {
        const altUrl = this.getAlternativeUrl(image);
        if (altUrl !== event.target.src) {
          event.target.src = altUrl;
        }
      }
    }, 100);
  }

  getAlternativeUrl(image: any): string {
    if (!image) return 'assets/images/default-project.jpg';
    
    // Essayer différentes combinaisons
    if (image.filename) {
      return `http://localhost:5000/uploads/projects/${image.filename}`;
    }
    
    if (image.path) {
      if (image.path.startsWith('http')) {
        return image.path;
      }
      if (image.path.startsWith('/')) {
        return `http://localhost:5000${image.path}`;
      }
      return `http://localhost:5000/uploads/projects/${image.path}`;
    }
    
    return 'assets/images/default-project.jpg';
  }

  // ====================
  // FILTER PROJECTS
  // ====================

  filterProjects(filter: string): void {
    this.activeFilter = filter;
    
    switch (filter) {
      case 'all':
        this.filteredProjects = this.allProjects;
        break;
      case 'completed':
        this.filteredProjects = this.allProjects.filter(p => p.status === 'completed');
        break;
      case 'in_progress':
        this.filteredProjects = this.allProjects.filter(p => p.status === 'in_progress');
        break;
      case 'construction':
        this.filteredProjects = this.allProjects.filter(p => p.type === 'construction');
        break;
      case 'renovation':
        this.filteredProjects = this.allProjects.filter(p => p.type === 'renovation');
        break;
      case 'interior':
        this.filteredProjects = this.allProjects.filter(p => p.type === 'interior');
        break;
      default:
        this.filteredProjects = this.allProjects;
    }
    
    console.log(`🔍 ${this.filteredProjects.length} projets après filtre`);
  }

  // ====================
  // ADD PROJECT (ADMIN)
  // ====================

  openAddProjectModal(): void {
    const token = this.authService.getToken();
    if (!token) {
      alert('🔒 Connectez-vous pour ajouter un projet');
      return;
    }
    
    this.showAddModal = true;
    
    // Pré-remplir avec les infos utilisateur
    if (!this.isAdmin && this.currentUser) {
      this.newProject.title = `${this.currentUser.prenom} ${this.currentUser.nom}`;
    } else {
      this.newProject.title = 'Sadraoui Construction';
    }
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newProject = {
      title: '',
      type: 'construction',
      category: 'residential',
      status: 'completed',
      description: '',
      surface: 0,
      location: 'Tunis',
      isFeatured: false
    };
    this.selectedFiles = [];
  }

  async submitProject(): Promise<void> {
    console.log('📤 Envoi projet...');
    
    if (!this.validateForm()) return;
    
    this.isSubmitting = true;
    
    const token = this.authService.getToken();
    if (!token) {
      alert('❌ Connectez-vous d\'abord');
      this.isSubmitting = false;
      return;
    }
    
    // Préparer les données
    const projectData = {
      clientName: this.newProject.title,
      clientEmail: this.isAdmin ? 
        'info@sadraoui-construction.com' : 
        (this.currentUser?.email || 'client@email.com'),
      projectAddress: this.newProject.location,
      projectType: this.newProject.type,
      category: this.newProject.category,
      status: this.newProject.status,
      description: this.newProject.description,
      surface: this.newProject.surface,
      is_featured: this.newProject.isFeatured
    };
    
    const formData = new FormData();
    formData.append('projectData', JSON.stringify(projectData));
    
    // Ajouter les images
    this.selectedFiles.forEach(file => {
      formData.append('images', file, file.name);
    });
    
    try {
      const response: any = await this.http.post(
        'http://localhost:5000/api/upload/project',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      ).toPromise();
      
      console.log('✅ Réponse serveur:', response);
      
      if (response.success) {
        alert('🎉 Projet créé avec succès !');
        
        // Traiter les images du nouveau projet
        const newProject = {
          ...response.project,
          title: response.project.title || response.project.clientName,
          location: response.project.location || response.project.projectAddress,
          date: response.project.date || response.project.created_at,
          images: (response.project.images || []).map((img: any) => ({
            ...img,
            displayUrl: this.getImageUrl(img)
          }))
        };
        
        // Ajouter à la liste
        this.allProjects.unshift(newProject);
        this.filterProjects(this.activeFilter);
        
        this.closeAddModal();
      } else {
        alert(`❌ ${response.message}`);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur création projet:', error);
      
      if (error.status === 401) {
        alert('⚠️ Session expirée. Reconnectez-vous.');
        this.authService.logout();
      } else if (error.error?.message) {
        alert(`❌ ${error.error.message}`);
      } else {
        alert('❌ Erreur création projet');
        
        // Fallback: ajouter localement
        this.addProjectLocally(projectData);
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  addProjectLocally(projectData: any): void {
    const newProject = {
      id: Date.now(),
      title: projectData.clientName,
      type: projectData.projectType,
      status: projectData.status,
      category: projectData.category,
      description: projectData.description,
      surface: projectData.surface,
      location: projectData.projectAddress,
      images: this.selectedFiles.map(file => ({
        filename: file.name,
        path: URL.createObjectURL(file),
        displayUrl: URL.createObjectURL(file)
      })),
      isFeatured: projectData.is_featured,
      date: new Date(),
      source: this.isAdmin ? 'admin' : 'client'
    };
    
    this.allProjects.unshift(newProject);
    this.filterProjects(this.activeFilter);
    
    alert('⚠️ Projet ajouté localement');
    this.closeAddModal();
  }

  validateForm(): boolean {
    if (!this.newProject.title.trim()) {
      alert('⚠️ Titre du projet requis');
      return false;
    }
    
    if (!this.newProject.description.trim()) {
      alert('⚠️ Description requise');
      return false;
    }
    
    return true;
  }

  // ====================
  // GALLERY FUNCTIONS
  // ====================

  openGallery(project: any): void {
    if (project.images && project.images.length > 0) {
      // S'assurer que toutes les images ont des URLs complètes
      const processedImages = project.images.map((img: any) => ({
        ...img,
        displayUrl: img.displayUrl || this.getImageUrl(img)
      }));
      
      this.selectedProject = {
        ...project,
        images: processedImages
      };
      this.currentImageIndex = 0;
      this.showGallery = true;
      console.log('🖼️ Galerie ouverte avec images:', processedImages.length);
    } else {
      this.viewProjectDetails(project);
    }
  }

  closeGallery(): void {
    this.showGallery = false;
    this.selectedProject = null;
  }

  changeImage(index: number): void {
    this.currentImageIndex = index;
  }

  nextImage(): void {
    if (this.selectedProject && this.currentImageIndex < this.selectedProject.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  // ====================
  // PROJECT DETAILS
  // ====================

  viewProjectDetails(project: any): void {
    const message = `
      🏗️ ${project.title}
      --------------------
      📍 ${project.location || 'Non spécifié'}
      📏 ${project.surface || '?'} m²
      🏷️ ${this.getProjectTypeLabel(project.type)}
      📊 ${this.getStatusText(project.status)}
      📅 ${project.date ? new Date(project.date).toLocaleDateString('fr-FR') : 'Récent'}
      
      📝 Description:
      ${project.description || 'Aucune description'}
    `;
    alert(message);
  }

  getProjectTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'construction': 'Construction',
      'renovation': 'Rénovation',
      'interior': 'Design intérieur'
    };
    return types[type] || type;
  }

  // ====================
  // UTILITIES
  // ====================

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminé'
    };
    return statusMap[status] || status;
  }

  refreshProjects(): void {
    this.loadProjects();
  }

  getStatusClass(status: string): string {
    return status;
  }
}