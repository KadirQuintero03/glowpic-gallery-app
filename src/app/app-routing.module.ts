import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { LoginComponent } from '@features/auth/pages/login/login.component';
import { ExplorerComponent } from '@features/gallery/pages/explorer/explorer.component';
import { HomeComponent } from '@features/gallery/pages/home/home.component';
import { MainPageComponent } from '@features/landing/pages/main-page/main-page.component';

const galleryRoutes: Routes = [
  { path: 'explorer', component: ExplorerComponent },
  { path: '', redirectTo: 'explorer', pathMatch: 'full' },
];

const routes: Routes = [
  { path: '', redirectTo: 'mainpage', pathMatch: 'full' },
  { path: 'mainpage', component: MainPageComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: galleryRoutes,
  },
  {
    path: 'galeria',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: galleryRoutes,
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }