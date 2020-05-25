import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Config, langs } from '../../../core/services/config/config.service';
import { ElectronService } from '../../../core/services/electron/electron.service';
import { UIService } from '../../../core/services/ui/ui.service';
import { transform } from '../../utils/error';
import { validPortForForm } from '../../utils/validPort';

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
      'defaultLayout': new FormControl(this.data.defaultLayout, [Validators.required]),
      'defaultSiteName': new FormControl(this.data.defaultSiteName, [Validators.required]),
      'defaultAuthorName': new FormControl(this.data.defaultAuthorName, [Validators.required])
    });
  }

  confirm() {
    if(this.configForm.valid) {
      this.dialogRef.close(this.configForm.value);
    } else {
      Object.keys(this.configForm.controls).forEach((key) => {
        const control = this.configForm.get(key);
        if(control.errors) {
          transform(this.translateService, control.errors).subscribe((value) => this.uiService.error(value));
        }
      })
    }
  }

  getRandomPort() {
    return Math.floor(Math.random() * (32768 - 1025 + 1)) + 1025;// [1025, 32768]
  }

  setRandomPort() {
    const ctrl = this.configForm.get('defaultServerPort');
    ctrl.setValue(this.getRandomPort());
    ctrl.markAsTouched();
  }

}