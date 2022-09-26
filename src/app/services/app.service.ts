import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  mapNetworkIcons = [
    { name: 'osmosis', icon: 'osmosis.svg' },
    { name: 'desmos', icon: 'desmos.svg' },
    { name: 'sifchain', icon: 'sifchain.svg' },
    { name: 'pio-mainnet', icon: 'provenance.png' },
    { name: 'injective', icon: 'injective.png' }
  ];

  constructor(
    private http: HttpClient
  ) {}

  listNetworks(): Promise<any> {
    return this.http.get<any>('https://tools.highstakes.ch/geoloc-api/peers').toPromise();
  }

  async listChains(chains): Promise<any> {
    const httpCalls = [];
    for(let i = 0 ; i < chains.length ; i++) {
      httpCalls.push(
        this.http.get(`https://validators.cosmos.directory/chains/${chains[i]}`).toPromise()
      );
    }

    let chainValidators = Promise.all(httpCalls);
    let validators = (await chainValidators).map(item => item.validators);
    validators = [].concat.apply([], validators);

    return validators;
  }

  getRandomColors(count): Array<string> {
    
    const colors = [];
    for (let i=1 ; i<=count ; i++) {
      
      let color = "#";
      for (let i = 0; i < 3; i++)
        color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
      colors.push(color);
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