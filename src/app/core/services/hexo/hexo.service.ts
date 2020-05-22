import { Injectable } from '@angular/core';
import * as ElectronStore from 'electron-store';
import { existsSync } from 'fs';
import { Server } from 'net';
import StreamZip from 'node-stream-zip';
import { join } from 'path';
import { ConfigService } from '../config/config.service';
import { AppDataService } from '../config/data.service';
import { ElectronService } from '../electron/electron.service';
import { promisify } from 'util';
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

  refreshFile(): void {
    if(!this.hexoContext) {
      const location = this.store.get('hexo-config-location');
      if(location) {
        this.loadConfig(location);
      }
    }
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
        console.log(this.hexoContext);
      }
    } catch(error) {
      this.electronService.error(error);
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
    this.store.set('hexo-config-location', location);
  }

  clear(): void {
    this.stop();
    this.hexoContext = null;
    this.runServer = null;
    this.store.delete('hexo-config-location');
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
        const resource = this.electronService.resourcePath('init.zip');
        if(!existsSync(resource)) {
          this.electronService.error('ERROR.INVALID_PATH');
          return;
        }
        console.log(resource);
        const zip = new StreamZip({
          file: resource,
          storeEntries: true
        });
        zip.on('ready', () => {
          zip.extract(null, value.filePaths[0], (error: any) => {
            if(error) {
              console.error(error);
              this.electronService.error(error);
            } else {
              console.log(value.filePaths[0]);
              this.electronService.success('SUCCESS.OPERATE');
            }
            zip.close();
          });
        });
      }
    } catch(error) {
      console.error(error);
      this.electronService.error(error);
    }
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

  async stop() {
    if(this.server) {
      try {
        this.server.unref();
        await promisify(this.server.close)();
        this.server = null;
        this.dataService.persist();
      } catch (error) {
        this.electronService.error(error);
      } finally {
        window.dispatchEvent(new Event('resize'));//refresh the window
      }
    }
  }

  async createArticle(title: string, layout?: string) {
    return this.hexoContext.post.create({title, layout}) as Promise<{
      path: string,
      content: string
    }>;
  }

  get localUrl() {
    let url: string = this.hexoContext.config.url;
    const protocol = url.slice(0, url.indexOf(':'));
    return protocol + '://127.0.0.1:' + this.configService.config.defaultServerPort + this.hexoContext.config.root;
  }

  getLayoutPath(layout: string): string {
    let path: string = this.hexoContext.source_dir;
    if(layout == 'draft') {
      path = join(path, '_drafts');
    } else if(layout != 'page') {
      path = join(path, '_posts');
    }
    return path;
  }

}