import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

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