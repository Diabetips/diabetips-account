import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, Subscription, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { App } from '@app/models/app';
import { AlertService } from '@app/services/alert.service';
import { AppsService } from '@app/services/apps.service';

@Component({
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
})
export class AppsComponent implements OnInit, OnDestroy {

  locked = false;

  apps: App[];

  private appsSub: Subscription;

  constructor(
    private alertService: AlertService,
    private appsService: AppsService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Mes applications');
    this.initApps();
  }

  initApps(): void {
    this.appsSub = this.appsService.getApps()
      .subscribe((apps) => {
        this.apps = apps;
      });
  }

  ngOnDestroy(): void {
    this.appsSub.unsubscribe();
  }

  appLogo(app: App): Observable<string> {
    return this.appsService.getAppLogo(app);
  }

  appRevoke(app: App): void {
    if (this.locked) {
      return;
    }
    this.locked = true;
    this.appsService.revokeApp(app)
      .subscribe(() => {
        this.locked = false;
        this.initApps();
        this.alertService.success(`Accès de « ${app.name} » à votre compte révoqué.`);
      }, () => {
        this.locked = false;
        this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
      });
  }
}
