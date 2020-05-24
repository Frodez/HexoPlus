import { AbstractControl, ValidationErrors } from "@angular/forms";
import { createServer } from "net";
import { from, Observable, of } from "rxjs";
import { catchError, first, switchMap } from "rxjs/operators";
import { toIntTen } from './typeutil';

/**
 * 检查端口是否可用
 * @param port
 */
export async function validPort(port: number): Promise<boolean> {
  if(port < 1 || port > 65535) {
    return Promise.resolve(false);
  }
  if(port == 4200) {
    //the port of angular service is 4200
    return Promise.resolve(false);
  }
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
 * 检查端口是否可用的异步验证器版本,可用于表单验证
 */
export function validPortForForm(ctrl: AbstractControl): Observable<ValidationErrors | null> {
  if(!ctrl.valueChanges) {
    return of(null);
  }
  return ctrl.valueChanges.pipe(
    // 只能用switchMap,不能用map,详见https://rxjs-cn.github.io/learn-rxjs-operators/operators/transformation/switchmap.html
    switchMap((value: any): Observable<ValidationErrors | null> => {
      const num = toIntTen(value);
      const validPromise = validPort(num);
      return from(validPromise.then(valid => valid ? null : {PORT_HAS_BEEN_USED: false} as ValidationErrors));
    }),
    catchError(() => of(null)),
    first()
  );
}