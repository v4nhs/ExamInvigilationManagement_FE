import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[] | undefined;

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = this.authService.hasAnyRole(requiredRoles);

    if (hasRequiredRole) {
      return true;
    }

    // User doesn't have required role
    console.warn(`❌ User does not have required roles: ${requiredRoles.join(', ')}`);
    this.router.navigate(['/home']);
    return false;
  }
}
