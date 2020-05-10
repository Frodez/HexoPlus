import { Injectable } from '@angular/core';
import { execSync } from 'child_process';
import * as ElectronStore from 'electron-store';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { extname, join } from 'path';
import { ConfigService } from '../config/config.service';
import { AppDataService } from '../config/data.service';
import { ElectronService } from '../electron/electron.service';
import { HexoShellService } from './shell.service';



@Injectable({
  providedIn: 'root'
})
export class HexoService {

  store: ElectronStore = new ElectronStore();

  constructor(private electronService: ElectronService, public hexoShell: HexoShellService, private configService: ConfigService, public dataService: AppDataService) {
    this.refreshFile();
  }

  loadFile(): void {
    this.electronService.readFilesAsStringByDialog({
      defaultPath: this.rootPath,
      filters:[
        {name: 'yaml configuration', extensions: ['yml', 'yaml']
      }]
    }).then((value) => {
      if(value.length != 1) {
        this.electronService.error('ERROR.ONLY_ONE_FILE');
      }
      this.loadConfig(value[0].file, value[0].data);
    }).catch((reason) => {
      if(reason) {
        console.error(reason);
        this.electronService.error(reason);
      }
    });
  }

  refreshFile(): void {
    if(this.hasHexo) {
      this.loadConfig(this.store.get('hexo-config-location'));
    }
  }

  private loadConfig(location: string, hexoConfig?: any) {
    try {
      if(!this.validateFilePath(location)) {
        this.electronService.error('ERROR.LOADING_CONFIG');
        return;
      }
      const data = hexoConfig ? load(hexoConfig) : load(readFileSync(location).toString());
      if(!this.validateConfig(data)) {
        this.electronService.error('ERROR.LOADING_CONFIG');
        return;
      }
      this.store.set('hexo-config', data);
      this.store.set('hexo-config-location', location);
    } catch(e) {
      console.error(e);
      this.electronService.error(e);
    }
  }

  clear(): void {
    this.store.delete('hexo-config-location');
    this.store.delete('hexo-config');
  }

  validateFilePath(file: string): boolean {
    try {
      const affix = extname(file);
      return affix === '.yaml' || affix === '.yml';
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  validateConfig(data: any): boolean {
    try {
      if(!data.title) {
        return false;
      }
      if(!data.author) {
        return false;
      }
      if(!data.url) {
        return false;
      }
      if(!data.root) {
        return false;
      }
      if(!data.source_dir) {
        return false;
      }
      if(!data.public_dir) {
        return false;
      }
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  get hasHexo(): boolean {
    return this.store.has('hexo-config-location') && this.store.has('hexo-config');
  }

  get hexo(): any {
    return this.store.get('hexo-config');
  }

  get rootPath(): string {
    return this.hasHexo ? this.genRootPath(this.store.get('hexo-config-location')) : undefined;
  }

  private genRootPath(configFilePath: string): string {
    return configFilePath ? configFilePath.slice(0, configFilePath.lastIndexOf('\\')) : undefined;
  }

  get localUrl() {
    let url = this.hexo.url as string;
    const protocol = url.slice(0, url.indexOf(':'));
    return protocol + '://localhost:' + this.configService.config.defaultServerPort + this.hexo.root;
  }

  init() {
    this.electronService.remote.dialog.showOpenDialog({
      defaultPath: this.rootPath,
      properties: ['openDirectory']
    }).then((value)=> {
      if(!value.canceled) {
        if(!value.filePaths || value.filePaths.length != 1) {
          this.electronService.error('ERROR.ONLY_ONE_FILE');
          return;
        }
        execSync('hexo init '+ value.filePaths[0]);
        if(this.configService.config.initAndLoad) {
          const configFilePath = join(value.filePaths[0], '_config.yml');
          this.loadConfig(configFilePath);
        }
      }
    });
  }

  getLayoutPath(rootPath: string, layout: string) {
    let path = rootPath;
    if(layout == 'page') {
      path = join(path, this.hexo.source_dir);
    } else if(layout == 'draft') {
      path = join(path, this.hexo.source_dir, '_drafts');
    } else {
      path = join(path, this.hexo.source_dir, '_posts');
    }
    return path;
  }

  run() {
    this.hexoShell.run(this.rootPath);
    setTimeout(() => {
      if(this.hexoShell.isServed) {
        this.electronService.success('SUCCESS.OPERATE');
      }
    }, 500);
  }

  stop() {
    this.hexoShell.stop();
    this.dataService.persist();
  }

}