import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';

const ROUTES: Routes = [

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: '',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES, { preloadingStrategy: NoPreloading })],
  exports: [RouterModule]
})

export class AppRouting {}
