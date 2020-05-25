import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfigService, langs } from './core/services/config/config.service';
import { ElectronService } from './core/services/electron/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  routerEvents: Subscription;

  constructor(
    public router: Router,
    public electronService: ElectronService,
    private translateService: TranslateService,
    private configService: ConfigService,
    ) {
    translateService.addLangs(langs)
    translateService.setDefaultLang(configService.config.defaultLang);
    translateService.use(configService.config.defaultLang);
    /*
    console.log('AppConfig', AppConfig);
    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
    */
  }
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
