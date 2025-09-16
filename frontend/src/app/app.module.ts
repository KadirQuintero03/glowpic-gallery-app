import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { ArchivedComponent } from './pages/archived/archived.component';
import { PrivateFolderComponent } from './pages/private-folder/private-folder.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { AlbumsComponent } from './pages/albums/albums.component';
import { HeaderComponent } from './shared/header/header.component';
import { NavComponent } from './shared/nav/nav.component';
import { PicturesComponent } from './pages/pictures/pictures.component';
import { UserConfigComponent } from './model/user-config/user-config.component';
import { UserProfileComponent } from './model/user-profile/user-profile.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MainPageComponent } from './pages/main-page/main-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    ArchivedComponent,
    PrivateFolderComponent,
    FavoritesComponent,
    AlbumsComponent,
    HeaderComponent,
    NavComponent,
    PicturesComponent,
    UserConfigComponent,
    UserProfileComponent,
    MainPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
