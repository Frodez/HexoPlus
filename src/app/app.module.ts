import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core/core.module';

import { AppRoutingModule } from './app-routing.module';

import { SharedModule } from './shared/shared.module';
import { EditorModule } from './modules/editor/editor.module';
import { ViewerModule } from './modules/viewer/viewer.module';
import { WelcomeModule } from './modules/welcome/welcome.module';
import { LayoutModule } from './layout/layout.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SharedModule,
    CoreModule,
    LayoutModule,
    EditorModule,
    ViewerModule,
    WelcomeModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
