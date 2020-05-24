import { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

/**
 * error管道的纯函数版本
 * @param translateService
 * @param errors
 */
export function transform(translateService: TranslateService, errors: ValidationErrors): Observable<string> {
  let ob: Observable<string> = of('');
  Object.keys(errors).forEach((key, index)=> {
    // 比如max约束，会被转换为ERROR.VALIDATE.MAX进行翻译，其约束下的字段作为参数
    const name = "ERROR.VALIDATE." + key.toUpperCase();
    console.log({key: name, value: errors[key]});
    const translateRes = translateService.get(name, errors[key]) as Observable<string>;
    ob = ob.pipe(concatMap(x => translateRes.pipe(map(y => x + '\n' + y))));
  });
  return ob;
}