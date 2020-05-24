import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from "@angular/cdk/portal";
import { Injectable } from "@angular/core";
import { MatSpinner } from '@angular/material/progress-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
  })
export class UIService {

  private overlaySpinnerRef: OverlayRef;

  constructor(private translateService: TranslateService, private toastr: ToastrService, private overlay: Overlay) {
    this.overlaySpinnerRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    });
  }

  showOverlaySpinner(): MatSpinner {
    if(this.overlaySpinnerRef.hasAttached()) {
      console.log('duplicated overlay spinner!');
      return;
    }
    const instance = this.overlaySpinnerRef.attach(new ComponentPortal(MatSpinner)).instance;
    return instance;
  }

  closeOverlaySpinner() {
    this.overlaySpinnerRef.detach();
  }

  /**
   * 在app屏幕内发送错误消息
   * @param errorMsg
   */
  error(errorMsg: any): void {
    if(!errorMsg) {
      this.toastr.error('');
    } else if(typeof(errorMsg) === 'string') {
      this.translateService.get(errorMsg as string).subscribe((res) => {
        this.toastr.error(res);
      },(error) => {
        console.log(error);
      });
    } else if(errorMsg instanceof Error) {
      this.toastr.error((errorMsg as Error).message);
    } else {
      this.toastr.error(errorMsg.toString());
    }
  }

  /**
   * 在app屏幕内发送成功消息
   * @param errorMsg
   */
  success(message: any): void {
    if(!message) {
      this.toastr.success('');
    } else if(typeof(message) === 'string') {
      this.translateService.get(message as string).subscribe((res) => {
        this.toastr.success(res);
      },(error) => {
        console.log(error);
      });
    } else if(message instanceof Error) {
      this.toastr.success((message as Error).message);
    } else {
      this.toastr.success(message.toString());
    }
  }

  /**
   * 在app屏幕内发送消息
   * @param errorMsg
   */
  info(message: any): void {
    if(!message) {
      this.toastr.info('');
    } else if(typeof(message) === 'string') {
      this.translateService.get(message as string).subscribe((res) => {
        this.toastr.info(res);
      },(error) => {
        console.log(error);
      });
    } else if(message instanceof Error) {
      this.toastr.info((message as Error).message);
    } else {
      this.toastr.info(message.toString());
    }
  }

}