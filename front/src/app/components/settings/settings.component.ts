import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { AlertService } from '@app/services/alert.service';
import { UserService } from '@app/services/user.service';
import { Langs } from '@app/utils/langs';
import { Timezones } from '@app/utils/timezones';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {

  form: FormGroup;

  locked = false;

  langs: { id: string, name: string }[];
  timezones: string[];

  private userSub: Subscription;

  constructor(
    private alertService: AlertService,
    private userService: UserService,
    private fb: FormBuilder,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.langs = Object.keys(Langs).map((key) => ({
      id: key,
      name: Langs[key],
    }));
    this.timezones = Object.keys(Timezones);

    this.title.setTitle('Paramètres');

    this.form = this.fb.group({
      lang: [null, Validators.required],
      timezone: [null, Validators.required],
    });

    this.userSub = this.userService.getUser()
      .subscribe((user) => {
        this.form.get('lang').setValue(user.lang);
        this.form.get('timezone').setValue(user.timezone);
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
      lang: this.form.get('lang').value,
      timezone: this.form.get('timezone').value,
    }).subscribe(() => {
      this.locked = false;
      this.alertService.success('Modifications enregistrées');
    }, () => {
      this.locked = false;
      this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
    });
  }

  autodetectTimezone(): void {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (this.timezones.includes(tz)) {
      this.form.get('timezone').setValue(tz);
    }
  }



}
