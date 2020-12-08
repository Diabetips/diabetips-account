import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DeactivateAccountDialog } from '@app/dialogs/deactivate-account/deactivate-account.component';
import { AlertService } from '@app/services/alert.service';
import { UserService } from '@app/services/user.service';
import { CustomValidators } from '@app/utils/custom-validators';

@Component({
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy{

  form: FormGroup;

  showPassword = false;
  locked = false;

  private userSub: Subscription;

  constructor(
    private alertService: AlertService,
    private userService: UserService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Mon compte');

    this.form = this.fb.group({
      email: [null, Validators.email],
      password: [null, Validators.compose([
        Validators.minLength(8),
        CustomValidators.patternValidator(/[A-Z]/, { uppercaseRequired: true }),
        CustomValidators.patternValidator(/[a-z]/, { lowercaseRequired: true }),
        CustomValidators.patternValidator(/[0-9]/, { digitRequired: true }),
      ])],
    });

    this.userSub = this.userService.getUser()
      .subscribe((user) => {
        this.form.get('email').setValue(user.email);
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  onSubmit(): void {
    if (!this.form.valid || this.locked) {
      return;
    }
    this.alertService.clear();
    this.locked = true;

    this.userService.updateUser({
      email: this.form.get('email').value,
      password: this.form.get('password').value,
    }).subscribe(() => {
      this.locked = false;
      this.alertService.success('Modifications enregistrées');
    }, () => {
      this.locked = false;
      this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
    });
  }

  showDeactivateAccountDialog(): void {
    const dialogRef = this.dialog.open(DeactivateAccountDialog);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result) {
        this.userService.deactivateUser().subscribe(() => {
          this.router.navigate(['/logout']);
        });
      }
    });
  }

}
