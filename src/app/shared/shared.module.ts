import { FullscreenOverlayContainer, OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastrModule } from 'ngx-toastr';
import { PageNotFoundComponent } from './components/';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SettingComponent } from './components/setting/setting.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ResizeDirective } from './directives/resize.directive';
import { ErrorsPipe } from './pipes/error.pipe';
import { SafeHtmlPipe, SafeResourceUrlPipe, SafeScriptPipe, SafeUrlPipe } from './pipes/safehtml.pipe';

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
