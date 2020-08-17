import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@app/models/user';
import { AuthService } from '@app/services/auth.service';

import { environment } from '@environment';

const USER_URL = `${environment.apiUrl}/v1/users/me`;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user?: User;

  constructor(
    private authService: AuthService,
    private http: HttpClient) {}

  getUser(): Observable<User> {
    if (this.user) {
      return of(this.user);
    }
    if (this.authService.token) {
      return this.http.get<User>(USER_URL)
        .pipe(map((user) => this.user = user));
    }
    return of(null);
  }

  updateUser(user: Partial<User>): Observable<User> {
    return this.http.put<User>(USER_URL, user)
      .pipe(map((user) => this.user = user));
  }

  deleteUser(): Observable<{}> {
    return this.http.delete<null>(USER_URL)
      .pipe(map(() => {
        this.user = null;
        return {};
      }));
  }
}
