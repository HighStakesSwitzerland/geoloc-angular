import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRouting } from './dashboard.routing';
import { SharedModule } from '../shared/shared.module';
import { WrapperComponent } from './wrapper/wrapper.component';

@NgModule({
  declarations: [WrapperComponent],
  imports: [
    CommonModule,
    DashboardRouting,
    SharedModule
  ]
})
export class DashboardModule { }
