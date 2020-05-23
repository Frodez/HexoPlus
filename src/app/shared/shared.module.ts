import { NgModule, Type, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

// NG Translate
import { TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HttpClient } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OverlayModule, OverlayContainer, FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { ToastrModule } from 'ngx-toastr';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { PageNotFoundComponent } from './components/';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SettingComponent } from './components/setting/setting.component';

import { ResizeDirective } from './directives/resize.directive';
import { ErrorsPipe } from './pipes/error.pipe';
import { SafeUrlPipe, SafeResourceUrlPipe, SafeHtmlPipe, SafeScriptPipe } from './pipes/safehtml.pipe';

import { RouterModule } from '@angular/router';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const MODULES: Array<Type<any> | ModuleWithProviders<{}> | any[]> = [
  CommonModule,
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
    }
  }),
  FormsModule,
  ReactiveFormsModule,
  BrowserAnimationsModule,
  MatButtonModule,
  MatSidenavModule,
  MatDividerModule,
  MatCardModule,
  MatTableModule,
  MatToolbarModule,
  MatMenuModule,
  MatIconModule,
  MatListModule,
  MatSelectModule,
  MatDialogModule,
  MatTabsModule,
  MatSlideToggleModule,
  MatCheckboxModule,
  MatInputModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  OverlayModule,
  FlexLayoutModule,
  ToastrModule.forRoot(),
  RouterModule
];

const SHARES: Array<Type<any> | any[]> = [
  HeaderComponent,
  FooterComponent,
  SidebarComponent,
  PageNotFoundComponent,
  SettingComponent,
  ResizeDirective,
  ErrorsPipe,
  SafeUrlPipe,
  SafeResourceUrlPipe,
  SafeHtmlPipe,
  SafeScriptPipe
];

@NgModule({
  providers: [{
    provide: OverlayContainer, useClass: FullscreenOverlayContainer
  }],
  declarations: SHARES,
  imports: MODULES,
  exports: [
    MODULES,
    SHARES
  ]
})
export class SharedModule {}
