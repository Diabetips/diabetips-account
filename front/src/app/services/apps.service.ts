import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { App } from '@app/models/app';

import { environment } from '@environment';

const APPS_URL = `${environment.apiUrl}/v1/auth/apps`;
const USER_APPS_URL = `${environment.apiUrl}/v1/users/me/apps`;

@Injectable({
  providedIn: 'root'
})
export class AppsService {

  constructor(private http: HttpClient) {}

  getApps(): Observable<App[]> {
    return this.http.get<App[]>(USER_APPS_URL);
  }

  getAppLogo(app: App): Observable<string> {
    return of(`${APPS_URL}/${app.appid}/logo`);
  }

  revokeApp(app: App): Observable<undefined> {
    return this.http.delete<undefined>(`${USER_APPS_URL}/${app.appid}`);
  }
}
