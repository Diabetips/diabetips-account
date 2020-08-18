import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AuthService } from '@app/services/auth.service';

@Component({
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Déconnexion');
    this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
  }

}
