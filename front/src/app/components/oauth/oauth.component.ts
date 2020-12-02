import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { OAuthService } from '@app/services/oauth.service';

@Component({
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss'],
})
export class OAuthComponent implements OnInit {

  clientId: string;
  redirectUri: string;
  error: string;

  constructor(
    private oauthService: OAuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.queryParams.client_id;
    if (!this.clientId) {
      this.error = 'Missing client_id';
      return;
    }
    this.oauthService.getClient(this.clientId)
      .subscribe((client) => {
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

        // TODO: proper consent screen
        this.accept();
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

  accept(): void {
    this.oauthService.authorize(this.clientId,
      this.route.snapshot.queryParams.response_type,
      this.route.snapshot.queryParams.scope)
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

  private checkParams(): boolean {
    try {
      const responseType = this.route.snapshot.queryParams.response_type;
      if (!responseType) { throw new Error('Missing response_type'); }
      if (responseType !== 'code' && responseType !== 'token') { throw new Error('Invalid response_type'); }
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
    if (this.route.snapshot.queryParams.response_type === 'token') {
      url.hash = params.toString();
    } else {
      params.forEach((val, key) => {
        url.searchParams.set(key, val);
      })
    }
    window.location.href = url.toString();
  }
}
