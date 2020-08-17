import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { UserService } from '@app/services/user.service';
import { environment } from '@environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private userService: UserService,
    private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.userService.token;
    const isApiReq = req.url.startsWith(environment.apiUrl);
    if (token && isApiReq) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        }
      });
      return next.handle(req)
        .pipe(catchError((err) => {
          if (err instanceof HttpErrorResponse && err.error.error === 'invalid_auth') {
            return this.userService.refreshToken()
              .pipe(
                catchError((err2) => {
                  this.router.navigate(['/logout']);
                  return throwError(err2);
                }),
                mergeMap(() => this.intercept(req, next))
              );
          }
          return throwError(err);
        }));
    } else {
      return next.handle(req);
    }
  }
}
