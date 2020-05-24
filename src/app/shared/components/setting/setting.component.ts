import {Component, Inject, OnInit} from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { langs, Config } from '../../../core/services/config/config.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ElectronService } from '../../../core/services/electron/electron.service';
import { transform } from '../../utils/error';
import { TranslateService } from '@ngx-translate/core';
import { UIService } from '../../../core/services/ui/ui.service';
import { validPort, validPortForForm } from '../../utils/validPort';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
})
export class SettingComponent implements OnInit {
  langs: string[];
  configForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SettingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Config,
    public electronService: ElectronService,
    public translateService: TranslateService,
    public uiService: UIService) {
    this.langs = langs;
  }

  ngOnInit(): void {
    this.configForm = new FormGroup({
      'defaultLang': new FormControl(this.data.defaultLang, [Validators.required]),
      'autoSave': new FormControl(this.data.autoSave),
      'initAndLoad': new FormControl(this.data.initAndLoad),
      'loadHistoryAppData': new FormControl(this.data.loadHistoryAppData),
      'defaultServerPort': new FormControl(this.data.defaultServerPort, [Validators.required, Validators.min(1025), Validators.max(32768)], validPortForForm),
      'defaultLayout': new FormControl(this.data.defaultLayout, [Validators.required])
    });
  }

  confirm() {
    console.log(this.configForm);
    if(this.configForm.valid) {
      this.dialogRef.close(this.configForm.value);
    } else {
      Object.keys(this.configForm.controls).forEach((key) => {
        const control = this.configForm.get(key);
        if(control.errors) {
          console.log({key, value: control.errors});
          transform(this.translateService, control.errors).subscribe((value) => this.uiService.error(value));
        }
      })
    }
  }

}