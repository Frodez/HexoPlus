import { Injectable } from '@angular/core';
import { execSync } from 'child_process';
import * as ElectronStore from 'electron-store';
import { Server } from 'net';
import { join, dirname } from 'path';
import { ConfigService } from '../config/config.service';
import { AppDataService } from '../config/data.service';
import { ElectronService } from '../electron/electron.service';
import PathUtils from '../../../shared/utils/path';
import decompress from 'decompress';
const Hexo = require('hexo/lib/hexo/index.js');

@Injectable({
  providedIn: 'root'
})
export class HexoService {

  store: ElectronStore = new ElectronStore();

  hexoContext: any;

  runServer:(args: any) => Promise<Server>;

  server: Server;

  constructor(private electronService: ElectronService, private configService: ConfigService, public dataService: AppDataService) {
    this.refreshFile();
  }

  async loadContext(): Promise<void> {
    try {
      const value = await this.electronService.remote.dialog.showOpenDialog({
        defaultPath: this.electronService.remote.app.getAppPath(),
        properties: ['openDirectory']
      });
      if(!value.canceled) {
        if(!value.filePaths || value.filePaths.length != 1) {
          this.electronService.error('ERROR.ONLY_ONE_FILE');
          return;
        }
        this.loadConfig(value.filePaths[0]);
        this.store.set('hexo-config-location', value.filePaths[0]);
        console.log(this.hexoContext);
      }
    } catch(error) {
      this.electronService.error(error);
    }
  }

  refreshFile(): void {
    if(!this.hexoContext) {
      this.loadConfig(this.store.get('hexo-config-location'));
    }
  }

  private loadConfig(location: string) {
    this.hexoContext = new Hexo(location);
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/header'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/gzip'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/logger'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/route'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/static'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/redirect'));
    this.hexoContext.init();
    this.runServer = require('hexo-server/lib/server.js').bind(this.hexoContext);
  }

  clear(): void {
    this.stop();
    this.hexoContext = null;
    this.runServer = null;
    this.store.delete('hexo-config-location');
  }

  get localUrl() {
    let url = this.hexoContext.config.url as string;
    const protocol = url.slice(0, url.indexOf(':'));
    return protocol + '://127.0.0.1:' + this.configService.config.defaultServerPort + this.hexoContext.config.root;
  }

  async init() {
    try {
      const value = await this.electronService.remote.dialog.showOpenDialog({
        defaultPath: this.electronService.remote.app.getAppPath(),
        properties: ['openDirectory']
      });
      if(!value.canceled) {
        if(!value.filePaths || value.filePaths.length != 1) {
          this.electronService.error('ERROR.ONLY_ONE_FILE');
          return;
        }
        const resource = PathUtils.resolvePath('init.zip');
        debugger;
        await decompress(resource, value.filePaths[0]);
        this.electronService.success('SUCCESS.OPERATE');
      }
    } catch(error) {
      console.log(error);
      this.electronService.error(error);
    }
  }

  getLayoutPath(layout: string) {
    let path = this.hexoContext.source_dir;
    if(layout == 'draft') {
      path = join(path, '_drafts');
    } else if(layout != 'page') {
      path = join(path, '_posts');
    }
    return path;
  }

  async run() {
    try {
      const args = {
        ip: this.configService.config.defaultServerPort
      };
      const app = await this.runServer(args);
      this.server = app;
      this.electronService.success('SUCCESS.OPERATE');
    } catch(error) {
      this.electronService.error(error);
    } finally {
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

  stop() {
    if(this.server) {
      this.server.unref();
      this.server.close((err) => {
        if(err) {
          this.electronService.error(err);
        } else {
          this.server = null;
          this.dataService.persist();
        }
      });
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

}