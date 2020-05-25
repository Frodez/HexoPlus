import { Injectable } from '@angular/core';
import * as ElectronStore from 'electron-store';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import jsyaml from 'js-yaml';
import { Server } from 'net';
import StreamZip from 'node-stream-zip';
import { basename, join } from 'path';
import { ConfigService } from '../config/config.service';
import { AppDataService } from '../config/data.service';
import { ElectronService } from '../electron/electron.service';
import { UIService } from '../ui/ui.service';
const Hexo = require('hexo/lib/hexo/index.js');

@Injectable({
  providedIn: 'root'
})
export class HexoService {

  store: ElectronStore = new ElectronStore();

  hexoContext: any;

  runServer:(args: any) => Promise<Server>;

  server: Server;

  constructor(private electronService: ElectronService, private configService: ConfigService, public dataService: AppDataService, public uiService: UIService) {
    this.refreshContext();
  }

  /**
   * 刷新配置
   */
  refreshContext(): void {
    if(!this.hexoContext) {
      const location = this.store.get('hexo-config-location');
      if(location) {
        this.setContext(location);
      }
    }
  }

  /**
   * 加载配置
   */
  async loadContext(): Promise<void> {
    try {
      const value = await this.electronService.remote.dialog.showOpenDialog({
        defaultPath: this.electronService.remote.app.getAppPath(),
        properties: ['openDirectory']
      });
      if(!value.canceled) {
        if(!value.filePaths || value.filePaths.length != 1) {
          this.uiService.error('ERROR.ONLY_ONE_FILE');
          return;
        }
        this.setContext(value.filePaths[0]);
        //console.log(this.hexoContext.config.title);
        //console.log(this.hexoContext.config.author);
      }
    } catch(error) {
      this.uiService.error(error);
    } finally {
      window.dispatchEvent(new Event('resize'));//refresh the window
      //console.log(this.hexoContext.config.title);
      //console.log(this.hexoContext.config.author);
    }
  }

  private async setContext(location: string) {
    this.hexoContext = new Hexo(location);
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/header'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/gzip'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/logger'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/route'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/static'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/redirect'));
    await this.hexoContext.init();
    await require('hexo/lib/hexo/load_config')(this.hexoContext) as Promise<any>;
    console.log(this.hexoContext);
    this.runServer = require('hexo-server/lib/server.js').bind(this.hexoContext);
    this.store.set('hexo-config-location', location);
  }

  /**
   * 清除配置
   */
  clear(): void {
    this.stop();
    this.hexoContext = null;
    this.runServer = null;
    this.store.delete('hexo-config-location');
  }

  /**
   * 初始化配置
   */
  async init() {
    try {
      const value = await this.electronService.remote.dialog.showOpenDialog({
        defaultPath: this.electronService.remote.app.getAppPath(),
        properties: ['openDirectory']
      });
      if(!value.canceled) {
        if(!value.filePaths || value.filePaths.length != 1) {
          this.uiService.error('ERROR.ONLY_ONE_FILE');
          return;
        }
        const resource = this.electronService.resourcePath('init.zip');
        if(!existsSync(resource)) {
          this.uiService.error('ERROR.INVALID_PATH');
          return;
        }
        console.log(resource);
        const zip = new StreamZip({
          file: resource,
          storeEntries: true
        });
        zip.on('error', (error) => {
          console.error(error);
          this.uiService.error(error);
        });
        zip.on('ready', () => {
          this.uiService.showOverlaySpinner();
          window.dispatchEvent(new Event('resize'));//refresh the window
          zip.extract(null, value.filePaths[0], (error: any) => {
            if(error) {
              console.error(error);
              this.uiService.error(error);
            } else {
              console.log(value.filePaths[0]);
              this.uiService.success('SUCCESS.OPERATE');
            }
            this.uiService.closeOverlaySpinner();
            zip.close((err) => {
              const configPath = join(value.filePaths[0], '_config.yml');
              const config = jsyaml.safeLoad(readFileSync(configPath).toString());
              config.title = this.configService.config.defaultSiteName;
              config.author = this.configService.config.defaultAuthorName;
              console.log(config);
              writeFileSync(configPath, jsyaml.safeDump(config));
            });
          });
        });
      }
    } catch(error) {
      console.error(error);
      this.uiService.error(error);
    } finally {
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

  /**
   * 启动服务
   */
  async run() {
    try {
      this.uiService.showOverlaySpinner();
      const args = {
        port: this.configService.config.defaultServerPort
      };
      console.log(args);
      const app = await this.runServer(args);
      this.server = app;
      this.uiService.success('SUCCESS.OPERATE');
    } catch(error) {
      console.error(error);
      this.uiService.error(error);
    } finally {
      this.uiService.closeOverlaySpinner();
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

  /**
   * 关闭服务
   */
  async stop() {
    if(this.server) {
      try {
        this.uiService.showOverlaySpinner();
        this.server.unref();
        this.server.close();
        this.server = null;
        this.dataService.persist();
      } catch (error) {
        console.error(error);
        this.uiService.error(error);
      } finally {
        this.uiService.closeOverlaySpinner();
        window.dispatchEvent(new Event('resize'));//refresh the window
      }
    }
  }

  /**
   * 创建文章
   * @param title
   * @param layout
   */
  async createArticle(title: string, layout?: string) {
    return this.hexoContext.post.create({title, layout}) as Promise<{
      path: string,
      content: string
    }>;
  }

  /**
   * 发表草稿
   * @param layout
   */
  publishDraft(filename: string, layout?: string) {
    return this.hexoContext.post.publish({slug: filename, layout}) as Promise<{
      path: string,
      content: string
    }>;
  }

  /**
   * 获取服务本机地址
   */
  get localUrl() {
    let url: string = this.hexoContext.config.url;
    const protocol = url.slice(0, url.indexOf(':'));
    return protocol + '://127.0.0.1:' + this.configService.config.defaultServerPort + this.hexoContext.config.root;
  }

  /**
   * 获取所有布局
   */
  get layouts(): string[] {
    return readdirSync(this.hexoContext.scaffold_dir).filter((value) => value.endsWith('.md')).map((value) => basename(value, '.md'));
  }

  /**
   * 加载博客配置文件
   */
  loadConfigYml(path: string, configName: string = '_config.yml'):any {
    const configPath = join(path, configName);
    const config = jsyaml.safeLoad(readFileSync(configPath).toString());
  }

  /**
   * 保存博客配置文件
   * @param config
   * @param path
   * @param configName
   */
  saveConfigYml(config: any, path: string, configName: string = '_config.yml') {
    const configPath = join(path, configName);
    writeFileSync(configPath, jsyaml.safeDump(config));
  }

}