import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable, Subscription } from 'rxjs';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { SettingComponent } from '../setting/setting.component';
import { ConfigService } from '../../../core/services/config/config.service';
import { BrowserWindow } from 'electron';
import { ElectronService } from '../../../core/services/electron/electron.service';
import { HexoService } from '../../../core/services/hexo/hexo.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  toggle:boolean = true;
  currentLang: string;

  @Output() toggleSidebarForMe: EventEmitter<any> = new EventEmitter();

  constructor(public electronService: ElectronService, public translateService: TranslateService, public dialog: MatDialog, public configService: ConfigService) {
  }

  ngOnInit(): void {
    this.currentLang = this.translateService.currentLang;
  }

  ngOnDestroy(): void {
  }

  toggleSidebar() {
    this.toggleSidebarForMe.emit();
    this.toggle = !this.toggle;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  }

  openSetting() {
    this.dialog.open(SettingComponent, {
      width: '66%',
      disableClose: true,
      data: this.configService.config
    }).afterClosed().subscribe(result => {
      if(result) {
        this.configService.saveConfig(result);
      }
    });
  }

}