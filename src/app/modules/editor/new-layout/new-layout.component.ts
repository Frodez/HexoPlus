import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Config } from '../../../core/services/config/config.service';
import { HexoService } from '../../../core/services/hexo/hexo.service';

@Component({
  selector: 'app-new-layout',
  templateUrl: './new-layout.component.html',
})
export class NewLayoutComponent implements OnInit {
  layoutForm: FormGroup;
  response: {
    title: string;
    layout: string;
  };

  constructor(public dialogRef: MatDialogRef<NewLayoutComponent>, @Inject(MAT_DIALOG_DATA) public data: Config, public hexoService: HexoService) {
    this.response = {
      title: '',
      layout: data.defaultLayout
    }
  }

  ngOnInit(): void {
    this.layoutForm = new FormGroup({
      'title': new FormControl(this.response.title, [Validators.required]),
      'layout': new FormControl(this.response.layout, [Validators.required])
    })
  }

  confirm() {
    if(this.layoutForm.valid) {
      this.dialogRef.close(this.layoutForm.value);
    }
  }

}