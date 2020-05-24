import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ViewerComponent } from './viewer.component';

@NgModule({
  declarations: [ViewerComponent],
  imports: [CommonModule, SharedModule]
})
export class ViewerModule {}