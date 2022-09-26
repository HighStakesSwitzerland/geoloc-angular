import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';

const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MapComponent
  },
  {
    path: ':network',
    component: MapComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class PublicRouting {}
