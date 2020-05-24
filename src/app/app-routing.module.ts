import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { EditorComponent } from './modules/editor/editor.component';
import { ViewerComponent } from './modules/viewer/viewer.component';
import { WelcomeComponent } from './modules/welcome/welcome.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'edit',
        component: EditorComponent
      },
      {
        path: 'view',
        component: ViewerComponent
      },
      {
        path: 'welcome',
        component: WelcomeComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'welcome'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
