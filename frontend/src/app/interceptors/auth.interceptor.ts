import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('token');
  
  if (token) {
    // Cloner la requête et ajouter l'en-tête Authorization
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  // Si pas de token, envoyer la requête originale
  return next(req);
};