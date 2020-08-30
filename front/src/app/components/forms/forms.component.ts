import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService } from '@app/services/alert.service';
import { AuthService } from '@app/services/auth.service';
import { CustomValidators } from '@app/utils/custom-validators';

export enum FormsComponentMode {
  LOGIN = 'login',
  REGISTER = 'register',
  CONFIRM = 'confirm',
  RESET_PASSWORD = 'reset-password',
}

@Component({
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit {

  mode: FormsComponentMode = null;
  form: FormGroup;
  showPassword = false;
  showPasswordConfirm = false;
  locked = false;
  invalidCode = false;

  private redirectUrl: string;
  private submit: () => void;

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.route.data
      .subscribe((d) => {
        this.mode = d.mode || FormsComponentMode.LOGIN;
      });
    this.route.queryParams.subscribe((params) => {
      this.redirectUrl = params.redirectUrl;
      switch (this.mode) {
        case FormsComponentMode.LOGIN:
          this.title.setTitle('Connexion');
          this.initLogin();
          break;
        case FormsComponentMode.REGISTER:
          this.title.setTitle('Inscription');
          this.initRegister();
          break;
        case FormsComponentMode.CONFIRM:
          this.title.setTitle('Confirmation adresse email');
          this.initConfirm();
          break;
        case FormsComponentMode.RESET_PASSWORD:
          this.title.setTitle('Réinitialisation mot de passe');
          this.initResetPassword();
          break;
        default:
          throw Error('invalid mode: ' + this.mode);
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid || this.locked) {
      return;
    }
    this.alertService.clear();
    this.locked = true;
    this.submit();
  }

  private initLogin(): void {
    this.form = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
    });

    this.submit = () => {
      this.authService.login(
        this.form.get('email').value,
        this.form.get('password').value
      ).subscribe(() => {
          this.router.navigateByUrl(this.redirectUrl);
        }, (err) => {
          this.locked = false;
          if (err instanceof HttpErrorResponse) {
            switch (err.error.error) {
              case 'invalid_grant':
                this.alertService.error('Adresse email ou mot de passe incorrect.');
                return;
            }
          }
          this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
        });
    };
  }

  private initRegister(): void {
    const invite = this.route.snapshot.queryParams.invite;

    this.form = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, Validators.compose([
        Validators.required,
        Validators.email])],
      password: [null, Validators.compose([
        Validators.required,
        Validators.minLength(8),
        CustomValidators.patternValidator(/[A-Z]/, { uppercaseRequired: true }),
        CustomValidators.patternValidator(/[a-z]/, { lowercaseRequired: true }),
        CustomValidators.patternValidator(/[0-9]/, { digitRequired: true }),
      ])],
      passwordConfirm: null,
      invite: [invite, Validators.required],
    }, {
      validators: this.passwordConfirmValidator,
    });

    this.submit = () => {
      this.authService.register({
        email: this.form.get('email').value,
        password: this.form.get('password').value,
        first_name: this.form.get('firstName').value,
        last_name: this.form.get('lastName').value,
        lang: 'fr',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        invite: this.form.get('invite').value,
      }).subscribe(() => {
          this.alertService.success('Votre compte a bien été créé !', {
            keepAfterNavigate: true,
            autoDismissSecs: 5,
          });
          this.router.navigate(['/']);
        }, (err) => {
          this.locked = false;
          if (err instanceof HttpErrorResponse) {
            switch (err.error.error) {
              case 'email_conflict':
                this.alertService.error('Adresse email déjà utilisée par un autre compte.');
                return;
            }
          }
          this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
        });
    };
  }

  private initConfirm(): void {
    const code = this.route.snapshot.queryParams.code;
    if (code == null) {
      this.invalidCode = true;
    }
    this.form = this.fb.group({
      code: [code, Validators.required],
    });

    this.submit = () => {
      this.authService.confirm(
        this.form.get('code').value,
      ).subscribe(() => {
        this.alertService.success('Votre adresse email a bien été vérifiée !', {
          keepAfterNavigate: true,
          autoDismissSecs: 5,
        });
        this.router.navigate(['/']);
      }, (err) => {
        this.locked = false;
        if (err instanceof HttpErrorResponse) {
          switch (err.error.error) {
            case 'invalid_code':
              this.invalidCode = true;
              break;
            default:
              this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
          }
        }
      });
    };

    setTimeout(() => this.onSubmit(), 0);
  }

  private initResetPassword(): void {
    const code = this.route.snapshot.queryParams.code;

    if (code == null) {
      this.form = this.fb.group({
        email: [null, Validators.compose([
          Validators.required,
          Validators.email])],
      });
    } else {
      this.form = this.fb.group({
        code: [code, Validators.required],
        password: [null, Validators.compose([
          Validators.required,
          Validators.minLength(8),
          CustomValidators.patternValidator(/[A-Z]/, { uppercaseRequired: true }),
          CustomValidators.patternValidator(/[a-z]/, { lowercaseRequired: true }),
          CustomValidators.patternValidator(/[0-9]/, { digitRequired: true }),
        ])],
        passwordConfirm: null,
      }, {
        validators: this.passwordConfirmValidator,
      });
    }

    this.submit = () => {
      if (this.form.get('code') == null) {
        this.authService.resetPassword(
          this.form.get('email').value,
        ).subscribe(() => {
          this.alertService.success(
            'Votre demande a bien été enregistrée. ' +
            'Un email a été envoyé à l\'adresse indiquée ' +
            'contenant un lien vous permettant de changer votre mot de passe.', {
            keepAfterNavigate: true,
          });
          this.router.navigate(['/login']);
        }, (err) => {
          this.locked = false;
          this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
        });
      } else {
        this.authService.resetPassword2(
          this.form.get('code').value,
          this.form.get('password').value,
        ).subscribe(() => {
          this.alertService.success(
            'Votre nouveau mot de passe a bien été enregistré !', {
            keepAfterNavigate: true,
          });
          this.router.navigate(['/login']);
        }, (err) => {
          this.locked = false;
          switch (err.error.error) {
            case 'invalid_code':
              this.alertService.error('Ce lien de réinitialisation est invalide ou a déjà été utilisé.', {
                keepAfterNavigate: true,
              });
              this.router.navigate(['/reset-password']);
              break;
            default:
              this.alertService.error('Erreur inconnue. Veuillez réessayer plus tard.');
          }
        });
      }
    };
  }

  private passwordConfirmValidator(control: AbstractControl): void {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');
    if (
      password.value &&
      passwordConfirm.value &&
      password.value !== passwordConfirm.value) {
      passwordConfirm.setErrors({ confirmMismatched: true });
    }
  }
}
