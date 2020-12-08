import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl, Title } from '@angular/platform-browser';
import { Subscription, forkJoin, Observable } from 'rxjs';

import { AlertService } from '@app/services/alert.service';
import { UserService } from '@app/services/user.service';
import { Timezones } from '@app/utils/timezones';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {

  form: FormGroup;

  pictureFile?: Blob;
  pictureUrl?: SafeUrl;

  locked = false;

  private userSub: Subscription;
  private pictureSub: Subscription;

  constructor(
    private alertService: AlertService,
    private userService: UserService,
    private domSanitizer: DomSanitizer,
    private fb: FormBuilder,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Mon profil');

    this.form = this.fb.group({
      firstName: null,
      lastName: null,
      lang: [null, Validators.required],
      timezone: [null, Validators.required],
    });

    this.userSub = this.userService.getUser()
      .subscribe((user) => {
        this.form.get('firstName').setValue(user.first_name);
        this.form.get('lastName').setValue(user.last_name);
        this.form.get('lang').setValue(user.lang);
        this.form.get('timezone').setValue(user.timezone);
      });

    this.pictureSub = this.userService.getUserPicture()
      .subscribe(this.setPicture.bind(this));
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

    const observables: Observable<any>[] = [];
    observables.push(this.userService.updateUser({
      first_name: this.form.get('firstName').value,
      last_name: this.form.get('lastName').value,
    }));
    if (this.pictureFile) {
      observables.push(this.userService.updateUserPicture(this.pictureFile));
    }

    forkJoin(observables)
      .subscribe(() => {
        this.locked = false;
        this.alertService.success('Modifications enregistrées');
      }, () => {
        this.locked = false;
        this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
      });
  }

  autodetectTimezone(): void {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (this.timezones().includes(tz)) {
      this.form.get('timezone').setValue(tz);
    }
  }

  timezones(): string[] {
    return Object.keys(Timezones);
  }

  setPicture(blob: Blob): void {
    if (!blob) {
      return;
    }
    this.pictureUrl = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  }

  onPictureEditClick(): void {
    const fileUpload = document.getElementById('pictureFile') as HTMLInputElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      this.pictureFile = file;
      this.setPicture(file);
    };
    fileUpload.click();
  }

  onPictureClearClick(): void {
    this.pictureFile = null;
    this.userService.deleteUserPicture()
      .subscribe(() => {
        this.alertService.success('Image de profil réinitialisée');
      });
  }

}
