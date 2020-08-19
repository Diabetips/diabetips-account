import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

const EXCLUDED_ROUTES: string[] = ['/login', '/logout', '/register', '/confirm', '/reset-password'];

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  shown = true;

  private routerSubscription: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const path = this.router.url.split('?')[0];
        this.shown = !EXCLUDED_ROUTES.includes(path);
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

}
