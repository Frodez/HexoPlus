import { Injectable } from '@angular/core';
import ElectronStore from 'electron-store';
import { ElectronService } from '../electron/electron.service';
import { ConfigService } from './config.service';

export class AppData {

  public prevFile: {
    file: string,
    data: string
  };

  public projectPath: string;

  constructor() {}

}

@Injectable({
  providedIn: 'root'
})
export class AppDataService {

  private store: ElectronStore = new ElectronStore();

  private appData: AppData;

  constructor(private electronService: ElectronService, private configService: ConfigService) {
    this.electronService.remote.app.on('before-quit', () => {
      this.electronService.remote.dialog.showErrorBox('111', '222');
      this.handle();
    });
  }

  private handle() {
    if(this.configService.config.loadHistoryAppData) {
      this.persist();
    } else {
      this.clearAppData();
    }
  }

  get data(): AppData {
    if(!this.appData) {
      if(this.configService.config.loadHistoryAppData) {
        this.appData = this.store.get('app-data');
      }
      if(!this.appData) {
        this.appData = new AppData();
      }
    }
    return this.appData;
  }

  public clearAppData() {
    this.store.delete('app-data');
  }

  public persist() {
    this.store.set('app-data', this.data);
  }

  public setPrevFile(prevFile: {file: string, data: string}) {
    this.data.prevFile = prevFile;
    this.handle();
  }

  public setProjectPath(path: string) {
    this.data.projectPath = path;
    this.handle();
  }

}