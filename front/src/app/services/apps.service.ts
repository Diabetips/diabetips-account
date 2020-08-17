import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { App } from '@app/models/app';

import { environment } from '@environment';

const APPS_URL = `${environment.apiUrl}/v1/users/me/apps`;

@Injectable({
  providedIn: 'root'
})
export class AppsService {

  constructor(private http: HttpClient) {}

  getApps(): Observable<App[]> {
    return this.http.get<App[]>(APPS_URL);
  }
}
