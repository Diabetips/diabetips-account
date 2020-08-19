import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from '@app/app-routing.module';

import { AppComponent } from '@app/app.component';
import { AlertComponent } from '@app/components/alert/alert.component';
import { AppsComponent } from '@app/components/apps/apps.component';
import { FormsComponent } from '@app/components/forms/forms.component';
import { HomeComponent } from '@app/components/home/home.component';
import { NavbarComponent } from '@app/components/navbar/navbar.component';
import { LogoutComponent } from '@app/components/logout/logout.component';
import { OAuthComponent } from '@app/components/oauth/oauth.component';
import { ProfileComponent } from '@app/components/profile/profile.component';

import { AuthInterceptor } from '@app/utils/auth-interceptor';

@NgModule({
  declarations: [
    AppComponent,

    AlertComponent,
    AppsComponent,
    FormsComponent,
    HomeComponent,
    LogoutComponent,
    NavbarComponent,
    OAuthComponent,
    ProfileComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    LayoutModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
