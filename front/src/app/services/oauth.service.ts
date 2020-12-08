import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OAuthClient } from '@app/models/oauth-client';
import { environment } from '@environment';

const AUTHORIZE_URL = `${environment.apiUrl}/v1/auth/authorize`;
const CLIENT_URL = `${environment.apiUrl}/v1/auth/client`;

interface AuthCodeRes {
  code: string;
}

interface AuthTokenRes {
  access_token: string;
  type: string;
  expires_in: number;
}

type AuthorizationRes = AuthCodeRes | AuthTokenRes;

@Injectable({
  providedIn: 'root'
})
export class OAuthService {

  constructor(private http: HttpClient) {}

  getClient(clientId: string): Observable<OAuthClient> {
    return this.http.get<OAuthClient>(`${CLIENT_URL}/${clientId}`);
  }

  authorize(clientId: string, responseType: string, scope: string): Observable<AuthorizationRes> {
    let body = new HttpParams()
      .set('response_type', responseType)
      .set('client_id', clientId);
    if (scope) {
      body = body.set('scope', scope);
    }

    return this.http.post<AuthorizationRes>(AUTHORIZE_URL, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
  }
}
