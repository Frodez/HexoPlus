import { AbstractControl, ValidationErrors } from "@angular/forms";
import { createServer } from "net";
import { catchError, debounceTime, first, switchMap } from "rxjs/operators";
import { toIntTen } from './typeutil';

/**
 * 检查端口是否可用
 * @param port
 */
export async function validPort(port: number): Promise<boolean> {
  const server = createServer().listen(port);
  return new Promise((resolve, reject) => {
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.once("error", (err) => {
      console.log(err);
      resolve(false);
    });
  });
}

/**
 * 这是AsyncValidatorFn的说明
 * A function that receives a control and returns a Promise or observable
 * that emits validation errors if present, otherwise null.
  export declare interface AsyncValidatorFn {
    (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
  }
 */
export function validPortForForm(ctrl: AbstractControl) {
  if(!ctrl.valueChanges) {
    return Promise.resolve(null);
  }
  return ctrl.valueChanges.pipe(
    debounceTime(300),
    // 只能用switchMap,不能用map,详见https://rxjs-cn.github.io/learn-rxjs-operators/operators/transformation/switchmap.html
    switchMap(async (value: any): Promise<ValidationErrors | null> => {
      const num = toIntTen(value);
      const valid = await validPort(num);
      return valid ? null : {PORT_HAS_BEEN_USED: false};
    }),
    catchError(() => Promise.resolve(null)),
    first()
  );
}