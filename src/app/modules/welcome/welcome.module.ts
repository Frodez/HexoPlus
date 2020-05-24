import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { WelcomeComponent } from './welcome.component';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [CommonModule, SharedModule]
})
export class WelcomeModule {}