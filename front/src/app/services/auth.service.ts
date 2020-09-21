import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { User } from '@app/models/user';

import { environment } from '@environment';

const LOGIN_URL = `${environment.backUrl}/login`;
const LOGOUT_URL = `${environment.backUrl}/logout`;
const REFRESH_URL = `${environment.backUrl}/refresh`;
const REGISTER_URL = `${environment.backUrl}/register`;
const CONFIRM_URL = `${environment.backUrl}/confirm`;
const RESET_PASSWORD_URL = `${environment.backUrl}/reset-password`;

interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  token?: string;

  private refreshingToken = false;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('access-token');
  }

  login(email: string, password: string): Observable<undefined> {
    return this.http.post<LoginResponse>(LOGIN_URL, {
        email,
        password,
      })
      .pipe(
        map(this.doLogin, this),
      );
  }

  logout(): Observable<undefined> {
    if (!this.token) {
      return of(undefined);
    }

    const req = {
      token: this.token,
    };

    this.token = null;
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');

    return this.http.post<undefined>(LOGOUT_URL, req)
      .pipe(
        catchError((err) => {
          console.error('Backend logout failed:', err);
          return of(undefined);
        })
      );
  }

  register(data: User): Observable<undefined> {
    return this.http.post<LoginResponse>(REGISTER_URL, data)
      .pipe(
        map(this.doLogin, this),
      );
  }

  confirm(code: string): Observable<undefined> {
    return this.http.post<undefined>(CONFIRM_URL, {
      code,
    });
  }

  resetPassword(email: string): Observable<undefined> {
    return this.http.post<undefined>(RESET_PASSWORD_URL, {
      email,
    });
  }

  resetPassword2(code: string, password: string): Observable<undefined> {
    return this.http.put<undefined>(RESET_PASSWORD_URL, {
      code,
      password,
    });
  }

  refreshToken(): Observable<undefined> {
    if (this.refreshingToken) {
      return new Observable<undefined>((subscriber) => {
        const checkRefreshed = () => {
          if (!this.refreshingToken) {
            subscriber.next(undefined);
            subscriber.complete();
            return;
          }
          setTimeout(checkRefreshed, 50);
        };
        checkRefreshed();
      });
    } else {
      this.refreshingToken = true;
      return this.http.post<LoginResponse>(REFRESH_URL, {
          refresh_token: localStorage.getItem('refresh-token'),
        })
        .pipe(
          map(this.doLogin, this),
          tap(() => {
            this.refreshingToken = false;
          }),
        );
    }
  }

  private doLogin(res: LoginResponse): undefined {
    this.token = res.access_token;
    localStorage.setItem('access-token', res.access_token);
    localStorage.setItem('refresh-token', res.refresh_token);
    return undefined;
  }
}
