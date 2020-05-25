import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { writeFile, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { promisify } from 'util';
import { ConfigService } from '../../core/services/config/config.service';
import { AppDataService } from '../../core/services/config/data.service';
import { ElectronService } from '../../core/services/electron/electron.service';
import { HexoService } from '../../core/services/hexo/hexo.service';
import { UIService } from '../../core/services/ui/ui.service';
import { NewLayoutComponent } from './new-layout/new-layout.component';
import { PublishDraftComponent } from './publish-draft/publish-draft.component';
import { VditorComponent } from './vditor/vditor.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {

  private write = promisify(writeFile);

  currentFile: string;

  get isDraft() {
    return this.currentFile && dirname(this.currentFile).indexOf('drafts') !== -1;
  }

  @ViewChild('container') container: ElementRef;

  @ViewChild(VditorComponent) vditor: VditorComponent;

  constructor(
    private router: Router,
    public hexoService: HexoService,
    public dialog: MatDialog,
    public electronService: ElectronService,
    public configService: ConfigService,
    public appDataService: AppDataService,
    public uiService: UIService) {
    //this.vditor在ngAfterViewInit时才会生成,故只能分开
    const prevFile = this.appDataService.data.prevFile;
    if(prevFile) {
      this.currentFile = prevFile.file;
    }
  }

  ngAfterViewInit(): void {
    const prevFile = this.appDataService.data.prevFile;
    if(prevFile && this.vditor) {
      //由于angular的生命周期,currentFile在此处设置会再次触发变更检测,导致再次更新页面并触发本方法,形成循环
      this.vditor.text = prevFile.data;
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    const value = this.vditor?.text;
    this.appDataService.setPrevFile({file: this.currentFile, data: value});
    if(this.configService.config.autoSave) {
      if(this.currentFile) {
        console.log(value);
        writeFileSync(this.currentFile, value);
      }
    }
  }

  async openLayout() {
    const files = await this.electronService.readFilesAsStringByDialog({
      defaultPath: this.hexoService.hexoContext.source_dir,
      filters:[{
        name: 'markdown files',
        extensions: ['md']
      }]
    });
    try {
      this.uiService.showOverlaySpinner();
      if(files.length != 1) {
        this.uiService.error('ERROR.ONLY_ONE_FILE');
        return;
      }
      this.appDataService.setPrevFile(files[0]);
      this.currentFile = files[0].file;
      this.vditor.text = files[0].data;
    } catch (error) {
      console.error(error);
      this.uiService.error(error);
    } finally {
      this.uiService.closeOverlaySpinner();
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

  async newLayout() {
    const result: {title: string, layout: string} = await this.dialog.open(NewLayoutComponent, {
      width: '50%',
      disableClose: true,
      data: this.configService.config
    }).afterClosed().toPromise();
    if(result) {
      try {
        this.uiService.showOverlaySpinner();
        const file = await this.hexoService.createArticle(result.title, result.layout);
        this.appDataService.setPrevFile({
          file: file.path,
          data: file.content
        });
        this.vditor.text = file.content;
        this.currentFile = file.path;
      } catch (error) {
        console.error(error);
        this.uiService.error(error);
      } finally {
        this.uiService.closeOverlaySpinner();
        window.dispatchEvent(new Event('resize'));//refresh the window
      }
    }
  }

  async save() {
    if(this.currentFile) {
      const value = this.vditor.text;
      try {
        this.uiService.showOverlaySpinner();
        this.appDataService.setPrevFile({
          file: this.currentFile,
          data: value
        });
        await this.write(this.currentFile, value);
        this.uiService.success('SUCCESS.OPERATE');
      } catch (error) {
        console.error(error);
        this.uiService.error(error);
      } finally {
        this.uiService.closeOverlaySpinner();
        window.dispatchEvent(new Event('resize'));//refresh the window
      }
    }
  }

  async saveAs() {
    try {
      const res = await this.electronService.remote.dialog.showSaveDialog({
        defaultPath: join(this.hexoService.hexoContext.base_dir, this.hexoService.hexoContext.source_dir),
        filters:[{
          name:'markdown files',
          extensions: ['md']
        }]
      });
      if(!res.canceled) {
        const value = this.vditor.text;
        this.uiService.showOverlaySpinner();
        this.appDataService.setPrevFile({
          file: res.filePath,
          data: value
        });
        await this.write(res.filePath, value);
        this.uiService.success('SUCCESS.OPERATE');
      }
    } catch (error) {
      console.error(error);
      this.uiService.error(error);
    } finally {
      this.uiService.closeOverlaySpinner();
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

  async publish() {
    const layout: string = (await this.dialog.open(PublishDraftComponent, {
      width: '50%',
      disableClose: true,
      data: this.configService.config
    }).afterClosed().toPromise()).layout;
    try {
      this.uiService.showOverlaySpinner();
      const filename = basename(this.currentFile, '.md');
      const res = await this.hexoService.publishDraft(filename, layout);
      this.appDataService.setPrevFile({
        file: res.path,
        data: res.content
      });
      this.vditor.text = res.content;
      this.currentFile = res.path;
    } catch (error) {
      console.error(error);
      this.uiService.error(error);
    } finally {
      this.uiService.closeOverlaySpinner();
      window.dispatchEvent(new Event('resize'));//refresh the window
    }
  }

}
