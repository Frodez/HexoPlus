import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { EditorComponent } from './editor.component';
import { VditorComponent } from './vditor/vditor.component';
import { NewLayoutComponent } from './new-layout/new-layout.component';
import { PublishDraftComponent } from './publish-draft/publish-draft.component';

@NgModule({
  declarations: [EditorComponent, VditorComponent, NewLayoutComponent, PublishDraftComponent],
  imports: [CommonModule, SharedModule]
})
export class EditorModule {}
