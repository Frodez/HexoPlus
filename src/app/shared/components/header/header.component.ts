import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../../core/services/config/config.service';
import { ElectronService } from '../../../core/services/electron/electron.service';
import { SettingComponent } from '../setting/setting.component';

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