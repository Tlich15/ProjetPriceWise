import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ExternalUrlGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Récupère l'URL externe depuis les paramètres de la route
    const externalUrl = route.data['externalUrl'];
    
    // Redirige vers l'URL externe
    if (externalUrl) {
      window.location.href = externalUrl;
    }
    
    // Renvoie false pour empêcher la navigation Angular
    return false;
  }
}