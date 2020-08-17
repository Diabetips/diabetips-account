import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

import { User } from '@app/models/user';

import { environment } from '@environment';

const USER_URL = `${environment.apiUrl}/v1/users/me`;
const PICTURE_URL = `${environment.apiUrl}/v1/users/me/picture`;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSub = new BehaviorSubject<User>(null);
  private pictureSub = new BehaviorSubject<Blob>(null);

  constructor(private http: HttpClient) {}

  getUser(): Observable<User> {
    if (this.userSub.value == null) {
      return this.http.get<User>(USER_URL)
      .pipe(
        mergeMap((user) => {
          this.userSub.next(user);
          return this.userSub.asObservable();
        })
      );
    } else {
      return this.userSub.asObservable();
    }
  }

  updateUser(user: Partial<User>): Observable<User> {
    return this.http.put<User>(USER_URL, user)
      .pipe(
        tap((fullUser) => {
          this.userSub.next(fullUser);
        })
      );
  }

  deleteUser(): Observable<undefined> {
    return this.http.delete<undefined>(USER_URL)
      .pipe(
        tap(() => {
          this.userSub.next(null);
        })
      );
  }

  getUserPicture(): Observable<Blob> {
    if (this.pictureSub.value == null) {
      return this.http.get(PICTURE_URL, { responseType: 'blob' })
        .pipe(
          mergeMap((picture) => {
            this.pictureSub.next(picture);
            return this.pictureSub.asObservable();
          })
        );
    } else {
      return this.pictureSub.asObservable();
    }
  }

  updateUserPicture(picture: Blob): Observable<undefined> {
    return this.http.post<undefined>(PICTURE_URL, picture)
      .pipe(
        tap(() => {
          this.pictureSub.next(picture);
        })
      );
  }

  deleteUserPicture(): Observable<undefined> {
    return this.http.delete<undefined>(PICTURE_URL)
      .pipe(
        tap(() => {
          this.pictureSub.next(null);
        })
      );
  }
}
