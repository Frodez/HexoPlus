import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LayoutComponent } from './layout.component';

@NgModule({
  declarations:[
    LayoutComponent
  ],
  imports:[
    SharedModule,
    RouterModule
  ],
  exports:[
    LayoutComponent
  ]
})
export class LayoutModule {}