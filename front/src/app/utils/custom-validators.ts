import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static patternValidator(pattern: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!control.value) {
        return null;
      }
      return pattern.test(control.value) ? null : error;
    };
  }
}
