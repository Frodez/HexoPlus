import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import jsyaml from 'js-yaml';
import { Server } from 'net';
import StreamZip from 'node-stream-zip';
import { basename, join } from 'path';
import { ConfigService } from '../config/config.service';
import { AppDataService } from '../config/data.service';
import { ElectronService } from '../electron/electron.service';
import { UIService } from '../ui/ui.service';

@Injectable({
  providedIn: 'root'
})
export class HexoService {

  hexoContext: any;

  runServer:(args: any) => Promise<Server>;

  server: Server;

  serverStatus: boolean = false;

  runClean:(args: any) => Promise<any>;

  runGenerate:(args: any) => Promise<any>;

  constructor(public router: Router, private electronService: ElectronService, private configService: ConfigService, public dataService: AppDataService, public uiService: UIService) {
    this.refreshContext();
  }

  /**
   * 刷新配置
   */
  refreshContext(): void {
    if(!this.hexoContext) {
      const location = this.dataService.data.projectPath;
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
      }
    } catch(error) {
      this.uiService.error(error);
    } finally {
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

  private setContext(location: string) {
    //init
    const Hexo = require('hexo/lib/hexo/index.js');
    this.hexoContext = new Hexo(location);
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/header'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/gzip'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/logger'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/route'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/static'));
    this.hexoContext.extend.filter.register('server_middleware', require('hexo-server/lib/middlewares/redirect'));
    const initPromise = this.hexoContext.init() as Promise<any>;
    initPromise.then(()=> {
      const loadConfig:(hexo: any) => Promise<any> = require('hexo/lib/hexo/load_config');
      return loadConfig(this.hexoContext) as Promise<any>;
    }).then(() => {
      debugger;
      this.runServer = require('hexo-server/lib/server.js').bind(this.hexoContext);
      this.runClean = require('hexo/lib/plugins/console/clean.js').bind(this.hexoContext);
      this.runGenerate = require('hexo/lib/plugins/console/generate.js').bind(this.hexoContext);
      //finally
      this.dataService.setProjectPath(location);
      console.log(this.hexoContext);
    });
  }

  /**
   * 清除配置
   */
  clear(): void {
    this.stop();
    this.hexoContext = null;
    this.runServer = null;
    this.runClean = null;
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
        const path = value.filePaths[0];
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
          zip.extract(null, path, (error: any) => {
            if(error) {
              console.error(error);
              this.uiService.error(error);
            } else {
              console.log(path);
              this.uiService.success('SUCCESS.OPERATE');
            }
            this.uiService.closeOverlaySpinner();
            zip.close((err) => {
              const config = this.loadConfigYml(path);
              config.title = this.configService.config.defaultSiteName;
              config.author = this.configService.config.defaultAuthorName;
              console.log(config);
              this.saveConfigYml(config, path);
              if(this.configService.config.initAndLoad) {
                this.setContext(path);
              }
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
      this.serverStatus = true;
      this.server = app;
      this.uiService.success('SUCCESS.OPERATE');
      this.uiService.success('http://localhost:' + args.port);
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
        this.hexoContext.unwatch();
        this.server = null;
        this.dataService.persist();
        this.serverStatus = false;
      } catch (error) {
        console.error(error);
        this.uiService.error(error);
      } finally {
        this.uiService.closeOverlaySpinner();
        this.router.navigateByUrl('welcome');
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
    return jsyaml.safeLoad(readFileSync(configPath).toString());
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

  async clean() {
    try {
      this.uiService.showOverlaySpinner();
      await this.runClean({});
    } catch (error) {
      console.error(error);
      this.uiService.error(error);
    } finally {
      this.uiService.closeOverlaySpinner();
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

  async generate() {
    try {
      this.uiService.showOverlaySpinner();
      await this.runGenerate({});
    } catch (error) {
      console.error(error);
      this.uiService.error(error);
    } finally {
      this.uiService.closeOverlaySpinner();
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

}