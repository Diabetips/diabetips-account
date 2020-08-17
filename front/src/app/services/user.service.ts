import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '@environment';

import { User } from '@app/models/user';

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user?: User;
  token?: string;

  private loginUrl = `${environment.backUrl}/login`;
  private logoutUrl = `${environment.backUrl}/logout`;
  private refreshUrl = `${environment.backUrl}/refresh`;
  private registerUrl = `${environment.backUrl}/register`;
  private confirmUrl = `${environment.backUrl}/confirm`;
  private resetPasswordUrl = `${environment.backUrl}/reset-password`;

  private userUrl = `${environment.apiUrl}/v1/users/me`;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('access-token');
  }

  getUser(): Observable<User> {
    if (this.user) {
      return of(this.user);
    }
    if (this.token) {
      return this.http.get<User>(this.userUrl)
        .pipe(map((user) => this.user = user));
    }
    return of(null);
  }

  login(email: string, password: string): Observable<{}> {
    return this.http.post<LoginResponse>(this.loginUrl, {
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

    this.user = null;
    this.token = null;
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');

    return this.http.post<null>(this.logoutUrl, req)
      .pipe(catchError((err) => {
        console.error('Backend logout failed:', err);
        return of({});
      }));
  }

  register(data: User): Observable<{}> {
    return this.http.post<LoginResponse>(this.registerUrl, data)
      .pipe(
        map(this.doLogin, this),
      );
  }

  confirm(code: string): Observable<{}> {
    return this.http.post<{}>(this.confirmUrl, {
      code,
    });
  }

  resetPassword(email: string): Observable<{}> {
    return this.http.post<{}>(this.resetPasswordUrl, {
      email,
    });
  }

  resetPassword2(code: string, password: string): Observable<{}> {
    return this.http.put<{}>(this.resetPasswordUrl, {
      code,
      password,
    });
  }

  refreshToken(): Observable<{}> {
    return this.http.post<LoginResponse>(this.refreshUrl, {
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
