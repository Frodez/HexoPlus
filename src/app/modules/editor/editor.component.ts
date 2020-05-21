import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { VditorComponent } from './vditor/vditor.component';
import { HexoService } from '../../core/services/hexo/hexo.service'
import { ConfigService } from '../../core/services/config/config.service';
import { AppDataService } from '../../core/services/config/data.service';
import { ElectronService } from '../../core/services/electron/electron.service';
import { writeFile, readFileSync, readFile, writeFileSync } from 'fs';
import { join } from 'path';
import { MatDialog } from '@angular/material/dialog';
import { NewLayoutComponent } from './new-layout/new-layout.component';
import * as Shell from "shelljs";
import { exec } from 'child_process';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {
  currentFile: string;

  get isDraft() {
    return this.currentFile && this.currentFile.indexOf('drafts') !== -1;
  }

  @ViewChild('container') container: ElementRef;

  @ViewChild(VditorComponent) vditor: VditorComponent;

  constructor(
    private router: Router,
    public hexoService: HexoService,
    public dialog: MatDialog,
    public electronService: ElectronService,
    public configService: ConfigService,
    public appDataService: AppDataService) {
    const prevFile = this.appDataService.data.prevFile;
    if(prevFile) {
      this.currentFile = prevFile.file;
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

  ngAfterViewInit(): void {
    const prevFile = this.appDataService.data.prevFile;
    if(prevFile && this.vditor) {
      this.vditor.text = prevFile.data;
    }
  }

  openLayout() {
    this.electronService.readFilesAsStringByDialog({
      defaultPath: this.hexoService.hexoContext.source_dir,
      filters:[{
        name: 'markdown files',
        extensions: ['md']
      }]
    }).then((value) => {
      if(value.length != 1) {
        this.electronService.error('ERROR.ONLY_ONE_FILE');
        return;
      }
      this.currentFile = value[0].file;
      this.vditor.text = value[0].data;
      window.dispatchEvent(new Event('resize'));//refresh the window
    }).catch((reason) => {
      if(reason) {
        this.electronService.error(reason);
      }
    });
  }

  newLayout() {
    this.dialog.open(NewLayoutComponent, {
      width: '50%',
      disableClose: true,
      data: this.configService.config
    }).afterClosed().subscribe((result: {title: string; layout: string}) => {
      if(result) {
        const path = this.hexoService.getLayoutPath(result.layout);
        Shell.cd(this.hexoService.hexoContext.base_dir);
        const command = 'hexo new' + ' ' + result.layout + ' ' + result.title;
        exec(command, (error, stdout, stderr) => {
          if(error) {
            this.electronService.error(error);
            return;
          }
          if(stdout) {
            const filePath = stdout.slice(stdout.indexOf(':') + 2).trim();
            const value = readFileSync(filePath).toString();
            this.vditor.text = value;
            this.currentFile = filePath;
            window.dispatchEvent(new Event('resize'));//refresh the window
          }
        });
      }
    })
  }

  save() {
    if(this.currentFile) {
      const value = this.vditor.text;
      console.log(value);
      writeFile(this.currentFile, value, (error)=> {
        if(error) {
          this.electronService.error(error);
        } else {
          this.electronService.success('SUCCESS.OPERATE')
        }
      });
    }
  }

  saveAs() {
    this.electronService.remote.dialog.showSaveDialog({
      defaultPath: join(this.hexoService.hexoContext.base_dir, this.hexoService.hexoContext.source_dir),
      filters:[{
        name:'markdown files',
        extensions: ['md']
      }]
    }).then((value) => {
      if(!value.canceled) {
        writeFile(value.filePath, this.vditor.text, (error)=> {
          if(error) {
            this.electronService.error(error);
          } else {
            this.electronService.success('SUCCESS.OPERATE')
          }
        });
      }
    }).catch((reason) => {
      if(reason) {
        this.electronService.error(reason);
      }
    });
  }

  publish() {

  }

}
