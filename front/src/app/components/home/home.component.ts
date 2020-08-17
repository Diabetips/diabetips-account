import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from '@app/models/user';
import { UserService } from '@app/services/user.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  user: User;

  private userSub: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userSub = this.userService.getUser()
      .subscribe((user) => {
        this.user = user;
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
