import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { transform } from '../utils/error';

@Pipe({ name: 'errors' })
export class ErrorsPipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(errors: ValidationErrors): Observable<string> {
    return transform(this.translateService, errors);
  }
}