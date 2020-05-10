import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { TranslateService } from '@ngx-translate/core';

import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor(private translateService: TranslateService, private toastr: ToastrService) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }

  async readFilesAsStringByDialog(options?:Electron.OpenDialogOptions): Promise<Array<{file: string, data: string}>> {
    try {
      if(options) {
        options.properties = ['openFile'];
      } else {
        options = {properties: ['openFile']};
      }
      const filePaths = await this.remote.dialog.showOpenDialog(options).then((value) => {
        return value.canceled ? Promise.reject() : value.filePaths;
      });
      if (!filePaths || filePaths.length === 0) {
        return Promise.reject('ERROR.LOADING_CONFIG');
      }
      const res = new Array<{file: string, data: string}>();
      for(let i = 0; i < filePaths.length; i++) {
        const fileName = filePaths[i];
        res.push({file: fileName, data: readFileSync(fileName).toString()});
      }
      return res;
    } catch(e) {
      return Promise.reject(e);
    }
  }

  error(errorMsg: any): void {
    if(typeof(errorMsg) === 'string') {
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

  success(message: any): void {
    if(typeof(message) === 'string') {
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

  info(message: any): void {
    if(typeof(message) === 'string') {
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
