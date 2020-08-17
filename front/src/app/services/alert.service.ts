import { Injectable, OnDestroy } from '@angular/core';
import { NavigationStart, Router, NavigationEnd } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export class Alert {
  type: AlertType = AlertType.INFO;
  message: string;
  autoDismissSecs: number;
  keepAfterNavigate: boolean;

  constructor(options?: Partial<Alert>) {
    Object.assign(this, options);
  }
}

export enum AlertType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warn',
  ERROR = 'error',
}

@Injectable({
  providedIn: 'root'
})
export class AlertService implements OnDestroy {

  private routerSubscription: Subscription;

  private subject = new Subject<Alert>();

  constructor(router: Router) {
    this.routerSubscription = router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.clear();
      });
  }

  ngOnDestroy(): void {
    this.subject.complete();
    this.routerSubscription.unsubscribe();
  }

  onAlert(): Observable<Alert> {
    return this.subject.asObservable();
  }

  alert(alert: Alert): void {
    this.subject.next(alert);
  }

  success(message: string, options?: Partial<Alert>): void {
    return this.alert(new Alert({ type: AlertType.SUCCESS, message, ...options }));
  }

  info(message: string, options?: Partial<Alert>): void {
    return this.alert(new Alert({ type: AlertType.INFO, message, ...options }));
  }

  warning(message: string, options?: Partial<Alert>): void {
    return this.alert(new Alert({ type: AlertType.WARNING, message, ...options }));
  }

  error(message: string, options?: Partial<Alert>): void {
    return this.alert(new Alert({ type: AlertType.ERROR, message, ...options }));
  }

  clear(): void {
    this.subject.next(null);
  }

}
