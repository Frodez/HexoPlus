import { Injectable } from '@angular/core';
import * as ElectronStore from 'electron-store';
import { ConfigService } from './config.service';

export class AppData {

  public prevFile: {
    file: string,
    data: string
  };

  constructor() {}

}

@Injectable({
  providedIn: 'root'
})
export class AppDataService {

  private store: ElectronStore = new ElectronStore();

  private appData: AppData;

  constructor(private configService: ConfigService) {}

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
  }

}