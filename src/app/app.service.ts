import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private http: HttpClient
  ) { }

  listNetworks(): Promise<any> {
    return this.http.get<any>('https://tools.highstakes.ch/geoloc-api/peers').toPromise();
  }

  getRandomColors(count): Array<string> {
    
    const colors = [];
    for (let i=1 ; i<=count ; i++) {
      
      let color = "#";
      for (let i = 0; i < 3; i++)
        color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
      colors.push(color);
      // colors.push(
      //   '#' + ('000000' + Math.floor(0x1000000 * Math.random()).toString(16)).slice(-6)
      // );
    }
    return colors;
  }

  groupBy (arr: Array<any>, key: string): any {
    return arr.reduce((group, obj) => {
      const field = obj[key];
      group[field] = group[field] ?? [];
      group[field].push(obj);
      return group;
    }, {});
  }
}
