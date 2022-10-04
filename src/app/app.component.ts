import {Component} from '@angular/core';
import {DialogService} from 'primeng/dynamicdialog';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DialogService]
})
export class AppComponent {

}
