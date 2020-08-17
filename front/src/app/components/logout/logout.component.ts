import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '@app/services/user.service';

@Component({
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router) {}

  ngOnInit(): void {
    this.userService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
  }

}
