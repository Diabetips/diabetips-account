import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '@app/components/home/home.component';
import { FormsComponent, FormsComponentMode } from '@app/components/forms/forms.component';
import { LogoutComponent } from '@app/components/logout/logout.component';

import { AuthGuard } from '@app/utils/auth-guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: HomeComponent,
  }, {
    path: 'login',
    canActivate: [AuthGuard],
    component: FormsComponent,
    data: { mode: FormsComponentMode.LOGIN, authGuardLoggedIn: true },
  }, {
    path: 'register',
    canActivate: [AuthGuard],
    component: FormsComponent,
    data: { mode: FormsComponentMode.REGISTER, authGuardLoggedIn: true },
  }, {
    path: 'reset-password',
    canActivate: [AuthGuard],
    component: FormsComponent,
    data: { mode: FormsComponentMode.RESET_PASSWORD, authGuardLoggedIn: true },
  }, {
    path: 'confirm',
    component: FormsComponent,
    data: { mode: FormsComponentMode.CONFIRM },
  },
  {
    path: 'logout',
    canActivate: [AuthGuard],
    component: LogoutComponent,
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
