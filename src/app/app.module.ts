import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import 'reflect-metadata';
import '../polyfills';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { LayoutModule } from './layout/layout.module';
import { EditorModule } from './modules/editor/editor.module';
import { ViewerModule } from './modules/viewer/viewer.module';
import { WelcomeModule } from './modules/welcome/welcome.module';
import { SharedModule } from './shared/shared.module';

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
