import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { TranslateService } from '@ngx-translate/core';

import { ToastrService } from 'ngx-toastr';
import { dirname, join } from 'path';

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

  /**
   * 打开对话框读取文件
   */
  async readFilesAsStringByDialog(options?: Electron.OpenDialogOptions): Promise<Array<{file: string, data: string}>> {
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

  /**
   * 获取正确的资源路径(仅限于自带资源)
   * @param relativePath
   */
  resourcePath(relativePath: string): string {
    let dir = this.remote.app.getAppPath();
    if(this.remote.app.isPackaged) {
      dir = dirname(dir);
    }
    return join(dir, 'static', relativePath);
  }

}
