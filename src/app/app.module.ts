import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthInterceptor } from '@core/interceptors/auth-interceptor';
import { LoginComponent } from '@features/auth/pages/login/login.component';
import { ExplorerComponent } from '@features/gallery/pages/explorer/explorer.component';
import { HomeComponent } from '@features/gallery/pages/home/home.component';
import { MainPageComponent } from '@features/landing/pages/main-page/main-page.component';
import { HeaderComponent } from '@layout/header/header.component';
import { NavComponent } from '@layout/nav/nav.component';
import { SettingsMenuComponent } from '@layout/settings-menu/settings-menu.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { FolderCardComponent } from '@shared/components/folder-card/folder-card.component';
import { UserConfigComponent } from '@shared/components/user-config/user-config.component';
import { UserProfileComponent } from '@shared/components/user-profile/user-profile.component';
import { FileSizePipe } from '@shared/pipes/file-size.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    HeaderComponent,
    NavComponent,
    UserConfigComponent,
    UserProfileComponent,
    MainPageComponent,
    ExplorerComponent,
    SettingsMenuComponent,
    FileSizePipe,
    EmptyStateComponent,
    FolderCardComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatIconModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }