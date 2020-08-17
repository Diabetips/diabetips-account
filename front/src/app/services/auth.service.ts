import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('access-token');
  }

  login(email: string, password: string): Observable<{}> {
    return this.http.post<LoginResponse>(LOGIN_URL, {
        email,
        password,
      })
      .pipe(
        map(this.doLogin, this),
      );
  }

  logout(): Observable<{}> {
    if (!this.token) {
      return of({});
    }

    const req = {
      token: this.token,
    };

    this.token = null;
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');

    return this.http.post<null>(LOGOUT_URL, req)
      .pipe(catchError((err) => {
        console.error('Backend logout failed:', err);
        return of({});
      }));
  }

  register(data: User): Observable<{}> {
    return this.http.post<LoginResponse>(REGISTER_URL, data)
      .pipe(
        map(this.doLogin, this),
      );
  }

  confirm(code: string): Observable<{}> {
    return this.http.post<{}>(CONFIRM_URL, {
      code,
    });
  }

  resetPassword(email: string): Observable<{}> {
    return this.http.post<{}>(RESET_PASSWORD_URL, {
      email,
    });
  }

  resetPassword2(code: string, password: string): Observable<{}> {
    return this.http.put<{}>(RESET_PASSWORD_URL, {
      code,
      password,
    });
  }

  refreshToken(): Observable<{}> {
    return this.http.post<LoginResponse>(REFRESH_URL, {
        refresh_token: localStorage.getItem('refresh-token'),
      })
      .pipe(
        map(this.doLogin, this),
      );
  }

  private doLogin(res: LoginResponse): {} {
    this.token = res.access_token;
    localStorage.setItem('access-token', res.access_token);
    localStorage.setItem('refresh-token', res.refresh_token);
    return {};
  }
}
