import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WrapperComponent } from './wrapper/wrapper.component';

const ROUTES: Routes = [
  {
    path: '', component: WrapperComponent,
    children: [
      { path: ':network', component: WrapperComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class DashboardRouting {}
