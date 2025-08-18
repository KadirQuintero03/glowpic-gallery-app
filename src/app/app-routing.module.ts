import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AlbumsComponent } from './pages/albums/albums.component';
import { ArchivedComponent } from './pages/archived/archived.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { PrivateFolderComponent } from './pages/private-folder/private-folder.component';
import { PicturesComponent } from './pages/pictures/pictures.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirige al login por defecto
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, children: [  // Subrutas dentro de home
      { path: 'pictures', component: PicturesComponent },
      { path: 'albums', component: AlbumsComponent },
      { path: 'archived', component: ArchivedComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'private-folder', component: PrivateFolderComponent },
      { path: '', redirectTo: 'pictures', pathMatch: 'full' }  // Redirigir por defecto a pictures
    ]
  },
  { path: '**', redirectTo: 'login' }  // Ruta en caso de error
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
