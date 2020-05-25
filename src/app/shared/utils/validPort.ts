import { AbstractControl, ValidationErrors } from "@angular/forms";
import { createServer } from "net";
import { from, merge, Observable, of, timer } from "rxjs";
import { debounceTime, first, switchMap } from "rxjs/operators";
import { toIntTen } from './typeutil';

/**
 * 检查端口是否可用
 * @param port
 */
let lock = false;

export async function validPort(port: number): Promise<boolean> {
  if(port < 1 || port > 65535) {
    return Promise.resolve(false);
  }
  if(port == 4200) {
    //the port of angular service is 4200
    return Promise.resolve(false);
  }
  const server = createServer().listen(port);
  return new Promise((resolve) => {
    server.on("listening", () => {
      server.close();
      resolve(true);
    });
    server.on("error", (err) => {
      console.log(err);
      server.close();
      resolve(false);
    });
  });
}

/**
 * 检查端口是否可用的异步验证器版本,可用于表单验证
 */
export function validPortForForm(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
  if(!ctrl.valueChanges) {
    return of(null);
  }
  //因为初始化表单时也会使用本方法进行一次验证,此时valueChanges没有发送值,该Observable一直未结束使得表单一直处于pending状态
  //故在此加入一个timer,保证该Observable在初始化表单后一定会发送一次值
  return merge(ctrl.valueChanges, timer(50)).pipe(
    debounceTime(150),
    // 只能用switchMap,不能用map,详见https://rxjs-cn.github.io/learn-rxjs-operators/operators/transformation/switchmap.html
    switchMap((): Observable<ValidationErrors | null> => {
      const num = toIntTen(ctrl.value);
      const validPromise = validPort(num);
      return from(validPromise.then(valid => valid ? null : {PORT_HAS_BEEN_USED: false} as ValidationErrors));
    }),
    first()
  );
}