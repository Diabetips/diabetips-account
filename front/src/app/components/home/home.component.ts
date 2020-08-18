import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { App } from '@app/models/app';
import { User } from '@app/models/user';
import { AppsService } from '@app/services/apps.service';
import { UserService } from '@app/services/user.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  apps: App[];
  user: User;

  private appsSub: Subscription;
  private userSub: Subscription;

  constructor(
    private appsService: AppsService,
    private userService: UserService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Diabetips');

    this.appsSub = this.appsService.getApps()
      .subscribe((apps) => {
        this.apps = apps;
      });
    this.userSub = this.userService.getUser()
      .subscribe((user) => {
        this.user = user;
      });
  }

  ngOnDestroy(): void {
    this.appsSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  ready(): boolean {
    return this.user != null && this.apps !== undefined;
  }
}
