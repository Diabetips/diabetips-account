import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { App } from '@app/models/app';
import { User } from '@app/models/user';
import { AppsService } from '@app/services/apps.service';
import { UserService } from '@app/services/user.service';
import { Langs } from '@app/utils/langs';
import { Timezones } from '@app/utils/timezones';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  apps: App[];
  user: User;
  userPictureUrl?: SafeUrl;

  private userSub: Subscription;
  private pictureSub: Subscription;

  constructor(
    private appsService: AppsService,
    private userService: UserService,
    private domSanitizer: DomSanitizer,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Diabetips');

    this.appsService.getApps()
      .subscribe((apps) => {
        this.apps = apps;
      });
    this.userSub = this.userService.getUser()
      .subscribe((user) => {
        this.user = user;
      });
    this.pictureSub = this.userService.getUserPicture()
      .subscribe((picture) => {
        this.userPictureUrl = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(picture));
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.pictureSub.unsubscribe();
  }

  ready(): boolean {
    return this.user != null && this.apps !== undefined;
  }

  langName(id: string): string {
    return Langs[id];
  }

  timezoneName(id: string): string {
    return Timezones[id];
  }

}
