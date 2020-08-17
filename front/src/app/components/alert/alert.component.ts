import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Alert, AlertService, AlertType } from '@app/services/alert.service';
import { animate, sequence, style, transition, trigger } from '@angular/animations';

type AnimAlert = Alert & { state: string };

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [
    trigger('anim', [
      transition('active => void', [
        style({ opacity: '1' }),
        sequence([
          animate('.5s ease', style({ opacity: '0' }))
        ])
      ])
    ])
  ]
})
export class AlertComponent implements OnInit, OnDestroy {

  alerts: AnimAlert[] = [];

  private alertSubscription: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertSubscription = this.alertService.onAlert()
      .subscribe((alert) => {
        if (alert == null) {
          this.alerts = this.alerts.filter((a) => a.keepAfterNavigate);
          this.alerts.forEach((a) => { a.keepAfterNavigate = false; });
          return;
        }

        const animAlert: AnimAlert = { ...alert, state: 'active' };

        this.alerts.push(animAlert);
        if (alert.autoDismissSecs > 0) {
          setTimeout(() => this.closeAlert(animAlert), animAlert.autoDismissSecs * 1000);
        }
      });
  }

  ngOnDestroy(): void {
    this.alertSubscription.unsubscribe();
  }

  alertCss(alert: Alert): string[] {
    const classes = ['mat-elevation-z4', 'alert'];
    classes.push('alert-' + alert.type);
    return classes;
  }

  alertIcon(alert: Alert): string {
    switch (alert.type) {
      case AlertType.SUCCESS:
        return 'done';
      case AlertType.INFO:
        return 'info';
      case AlertType.WARNING:
        return 'warning';
      case AlertType.ERROR:
      default:
        return 'error';
    }
  }

  closeAlert(alert: AnimAlert): void {
    this.alerts = this.alerts.filter((a) => a !== alert);
  }
}
