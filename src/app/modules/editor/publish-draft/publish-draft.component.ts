import {Component, Inject, OnInit} from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Config } from '../../../core/services/config/config.service';

@Component({
  selector: 'app-publish-draft',
  templateUrl: './publish-draft.component.html',
})
export class PublishDraftComponent implements OnInit {
  layoutForm: FormGroup;
  response: string;

  constructor(public dialogRef: MatDialogRef<PublishDraftComponent>, @Inject(MAT_DIALOG_DATA) public data: Config) {
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