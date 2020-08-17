import { Component, OnDestroy, OnInit } from '@angular/core';

import { User } from '@app/models/user';
import { UserService } from '@app/services/user.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  loading = true;

  user: User;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUser()
      .subscribe((user) => {
        this.user = user;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
  }

}
