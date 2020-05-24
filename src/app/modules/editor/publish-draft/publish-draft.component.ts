import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Config } from '../../../core/services/config/config.service';
import { HexoService } from '../../../core/services/hexo/hexo.service';

@Component({
  selector: 'app-publish-draft',
  templateUrl: './publish-draft.component.html',
})
export class PublishDraftComponent implements OnInit {
  layoutForm: FormGroup;
  response: string;

  constructor(public dialogRef: MatDialogRef<PublishDraftComponent>, @Inject(MAT_DIALOG_DATA) public data: Config, public hexoService: HexoService) {
    this.response = data.defaultLayout;
  }

  ngOnInit(): void {
    this.layoutForm = new FormGroup({
      'layout': new FormControl(this.response, [Validators.required])
    })
  }

  confirm() {
    if(this.layoutForm.valid) {
      this.dialogRef.close(this.layoutForm.value);
    }
  }

}