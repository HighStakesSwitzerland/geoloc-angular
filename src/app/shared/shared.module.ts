import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';
import { ChartsModule } from 'ng2-charts';
import { SidebarModule } from 'primeng/sidebar';

const MODULES = [
  FormsModule,
  ChartsModule,
  LeafletMarkerClusterModule,
  SidebarModule,
  DropdownModule,
  ButtonModule,
  InputTextModule,
  DialogModule,
  TableModule
];

@NgModule({
  declarations: [],
  imports: [ CommonModule, ...MODULES ],
  exports: [ ...MODULES ],
  providers: []
})
export class SharedModule { }
