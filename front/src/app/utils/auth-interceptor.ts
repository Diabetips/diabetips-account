import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { from, Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { AuthService } from '@app/services/auth.service';
import { environment } from '@environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler, retried: boolean = false): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    const isApiReq = req.url.startsWith(environment.apiUrl);
    if (token && isApiReq) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        }
      });
      return next.handle(req)
        .pipe(catchError((err) => {
          if (retried || !(err instanceof HttpErrorResponse)) {
            return throwError(err);
          }

          const handleRes = (res: any) => {
            if (res.error === 'invalid_auth') {
              return this.authService.refreshToken()
                .pipe(
                  catchError((err2) => {
                    this.router.navigate(['/logout']);
                    return throwError(err2);
                  }),
                  mergeMap(() => this.intercept(req, next, true))
                );
            }
            return throwError(err);
          };

          if (err.error && err.error.error) {
            return handleRes(err.error);
          } else if (err.error instanceof Blob && err.error.type === 'application/json') {
            return from(err.error.text())
              .pipe(
                mergeMap((decoded) => {
                  return handleRes(JSON.parse(decoded));
                })
              );
          }
        }));
    } else {
      return next.handle(req);
    }
  }
}
