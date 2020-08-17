import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '@app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const loggedIn = this.authService.token != null;
    const guardNotLoggedIn = !route.data.authGuardLoggedIn;
    const ok = loggedIn ? guardNotLoggedIn : !guardNotLoggedIn;

    if (!ok) {
      if (guardNotLoggedIn) {
        this.router.navigate(['/login'], {
          queryParams: {
            redirectUrl: state.url,
          }
        });
      } else {
        this.router.navigate(['/']);
      }
    }
    return ok;
  }
}
