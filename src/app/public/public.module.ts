import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { PublicRouting } from './public.routing';
import { WrapperComponent } from './wrapper/wrapper.component';
import { MapComponent } from './map/map.component';


@NgModule({
  declarations: [WrapperComponent, MapComponent],
  imports: [
    CommonModule,
    SharedModule,
    PublicRouting
  ]
})
export class PublicModule { }
