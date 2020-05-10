import { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';


export function transform(translateService: TranslateService, errors: ValidationErrors): Observable<string> {
  let ob: Observable<string> = of('');
  Object.keys(errors).forEach((key, index)=> {
    const translateRes = translateService.get("ERROR.VALIDATE." + key.toUpperCase(), errors[key]) as Observable<string>;
    ob = ob.pipe(concatMap(x => translateRes.pipe(map(y => x + '\n' + y))));
  });
  return ob;
}