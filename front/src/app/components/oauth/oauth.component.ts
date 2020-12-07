import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';

import { App } from '@app/models/app';
import { OAuthClient } from '@app/models/oauth-client';
import { User } from '@app/models/user';
import { AppsService } from '@app/services/apps.service';
import { OAuthService } from '@app/services/oauth.service';
import { UserService } from '@app/services/user.service';
import { AuthScopes, AuthScopesData, AuthScopesImplicit } from '@app/utils/auth-scopes';

@Component({
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss'],
})
export class OAuthComponent implements OnInit, OnDestroy {

  clientId: string;
  redirectUri: string;
  responseType: string;
  scopes: string[];

  error: string;
  client: OAuthClient;
  user: User;
  userPictureUrl: SafeUrl;
  scopeCategories: { text: string, icon: string, scopes: string }[];
  locked = false;

  private userSub: Subscription;
  private pictureSub: Subscription;

  constructor(
    private appsService: AppsService,
    private oauthService: OAuthService,
    private userService: UserService,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.queryParams.client_id;
    if (!this.clientId) {
      this.error = 'Missing client_id';
      return;
    }

    this.userSub = this.userService.getUser()
      .subscribe((user) => { this.user = user; });

    this.pictureSub = this.userService.getUserPicture()
      .subscribe((picture) => {
        this.userPictureUrl = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(picture));
      });

    forkJoin([
      this.oauthService.getClient(this.clientId),
      this.appsService.getApps(true)])
      .subscribe(([client, apps]) => {
        const paramRedirectUri = this.route.snapshot.queryParams.redirect_uri;
        if (paramRedirectUri && paramRedirectUri !== client.redirect_uri) {
          this.error = 'Mismatched redirect_uri';
          return;
        }

        try {
          new URL(client.redirect_uri);
        } catch (e) {
          this.error = 'Invalid redirect_uri';
          return;
        }

        this.redirectUri = client.redirect_uri;
        if (!this.checkParams()) {
          return;
        }

        if (!this.route.snapshot.queryParams.prompt && this.clientIsAlreadyAuthorized(client, apps)) {
          return this.accept();
        }

        this.client = client;
      }, (err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.error.error === 'app_not_found') {
            this.error = 'Invalid client_id';
            return;
          }
        }
        this.error = 'Failed to get client info';
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.pictureSub.unsubscribe();
  }

  accept(): void {
    if (this.locked) {
      return;
    }
    this.locked = true;
    this.oauthService.authorize(this.clientId, this.responseType, this.scopes.join(' '))
      .subscribe((res) => {
        this.doRedirect(new URLSearchParams(res as any));
      }, (err) => {
        const error = new URLSearchParams();
        if (err instanceof HttpErrorResponse && err.status === 400) {
          error.set('error', err.error.error);
          error.set('error_description', err.error.error_description);
        } else {
          error.set('error', 'server_error');
          error.set('error_description', 'Authorization failed');
        }
        this.doRedirect(error);
      });
  }

  reject(): void {
    const error = new URLSearchParams();
    error.set('error', 'access_denied');
    this.doRedirect(error);
  }

  clientLogo(): Observable<string> {
    return this.appsService.getAppLogo(this.client.appid);
  }

  private checkParams(): boolean {
    try {
      this.responseType = this.route.snapshot.queryParams.response_type;
      if (!this.responseType) { throw new Error('Missing response_type'); }
      if (this.responseType !== 'code' && this.responseType !== 'token') { throw new Error('Invalid response_type'); }

      const scope = this.route.snapshot.queryParams.scope;
      this.scopes = scope ? scope.split(' ') : AuthScopesImplicit;
      this.scopes.forEach((s) => {
        if (!AuthScopes.includes(s)) { throw new Error('Invalid scope'); }
      });

      this.scopeCategories = [];
      Object.keys(AuthScopesData).forEach((c) => {
        const scopes = Object.keys(AuthScopesData[c]).filter((s) => s !== '_' && this.scopes.includes(c + (s !== '' ? ':' + s : '')));
        if (scopes.length !== 0) {
          this.scopeCategories.push({
            ...AuthScopesData[c]._,
            scopes: scopes.filter((s) => s !== '').map((s) => AuthScopesData[c][s]).join(', '),
          });
        }
      });
    } catch (err) {
      const error = new URLSearchParams();
      error.set('error', 'invalid_request');
      error.set('error_description', err.message);
      this.doRedirect(error);
      return false;
    }
    return true;
  }

  private doRedirect(params: URLSearchParams): void {
    const state = this.route.snapshot.queryParams.state;
    if (state) {
      params.set('state', state);
    }

    const url = new URL(this.redirectUri);
    if (this.responseType === 'token') {
      url.hash = params.toString();
    } else {
      params.forEach((val, key) => {
        url.searchParams.set(key, val);
      });
    }
    window.location.href = url.toString();
  }

  private clientIsAlreadyAuthorized(client: OAuthClient, apps: App[]): boolean {
    return apps.some((app) => app.appid === client.appid && this.scopes.every((s) => app.scopes.includes(s)));
  }
}
