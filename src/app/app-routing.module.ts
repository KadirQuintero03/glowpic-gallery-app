import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ExplorerComponent } from './pages/explorer/explorer.component';

const routes: Routes = [
  { path: '', redirectTo: 'mainpage', pathMatch: 'full' },  // Redirige a la página de inicio por defecto
  { path: 'mainpage', component: MainPageComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'home', component: HomeComponent, children: [  // Subrutas dentro de home
      { path: 'explorer', component: ExplorerComponent },
      { path: '', redirectTo: 'explorer', pathMatch: 'full' }  // Redirigir por defecto al explorer
    ]
  },
  { path: '**', redirectTo: 'login' }  // Ruta en caso de error
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }