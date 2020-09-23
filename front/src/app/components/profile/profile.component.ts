import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { DeactivateAccountDialog } from '@app/dialogs/deactivate-account/deactivate-account.component';
import { AlertService } from '@app/services/alert.service';
import { UserService } from '@app/services/user.service';
import { CustomValidators } from '@app/utils/custom-validators';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {

  form: FormGroup;

  pictureUrl?: SafeUrl;

  showPassword = false;
  locked = false;

  private userSub: Subscription;
  private pictureSub: Subscription;

  constructor(
    private alertService: AlertService,
    private userService: UserService,
    private domSanitizer: DomSanitizer,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Mon profil');

    this.form = this.fb.group({
      firstName: null,
      lastName: null,
      timezone: null,
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
        this.form.get('firstName').setValue(user.first_name);
        this.form.get('lastName').setValue(user.last_name);
        this.form.get('email').setValue(user.email);
      });

    this.pictureSub = this.userService.getUserPicture()
      .subscribe((picture) => {
        this.pictureUrl = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(picture));
      });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.pictureSub.unsubscribe();
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
        first_name: this.form.get('firstName').value,
        last_name: this.form.get('lastName').value,
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
