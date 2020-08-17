import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '@app/components/home/home.component';
import { FormsComponent, FormsComponentMode } from '@app/components/forms/forms.component';
import { LogoutComponent } from '@app/components/logout/logout.component';

import { AuthGuard } from '@app/utils/auth-guard';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: FormsComponent, data: { mode: FormsComponentMode.LOGIN } },
  { path: 'register', component: FormsComponent, data: { mode: FormsComponentMode.REGISTER } },
  { path: 'confirm', component: FormsComponent, data: { mode: FormsComponentMode.CONFIRM } },
  { path: 'reset-password', component: FormsComponent, data: { mode: FormsComponentMode.RESET_PASSWORD } },
  { path: 'logout', component: LogoutComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
