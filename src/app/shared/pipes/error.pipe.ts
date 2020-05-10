import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

@Pipe({ name: 'errors' })
export class ErrorsPipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(errors: ValidationErrors): Observable<string> {
    let ob: Observable<string> = of('');
    Object.keys(errors).forEach((key, index)=> {
      const translateRes = this.translateService.get("ERROR.VALIDATE." + key.toUpperCase(), errors[key]) as Observable<string>;
      ob = ob.pipe(concatMap(x => translateRes.pipe(map(y => x + '\n' + y))));
    });
    return ob;
  }
}