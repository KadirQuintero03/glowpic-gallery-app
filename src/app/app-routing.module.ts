import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ExplorerComponent } from './pages/explorer/explorer.component';
import { AuthGuard } from './auth/auth.guard';

// Rutas protegidas: ni /home ni /galeria (ni sus subrutas) son accesibles
// sin haber completado el login en dos pasos (teléfono + código). AuthGuard
// redirige a /login si no hay sesión activa.
const galleryRoutes: Routes = [
  { path: 'explorer', component: ExplorerComponent },
  { path: '', redirectTo: 'explorer', pathMatch: 'full' },  // Redirigir por defecto al explorer
];

const routes: Routes = [
  { path: '', redirectTo: 'mainpage', pathMatch: 'full' },  // Redirige a la página de inicio por defecto
  { path: 'mainpage', component: MainPageComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],  // Subrutas dentro de home, protegidas
    children: galleryRoutes,
  },
  {
    // Alias de la galería: /galeria y sus subrutas también quedan protegidas
    path: 'galeria',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: galleryRoutes,
  },
  { path: '**', redirectTo: 'login' }  // Ruta en caso de error
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }