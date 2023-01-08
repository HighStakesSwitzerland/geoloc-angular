import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NavigationEnd, Router} from "@angular/router";
import {filter, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public mapNetworkIcons: Array<MapNetworkIcons> = [
    /**
     * name is the pretty name of the chain used in urls
     * chainUrl is the url path to append to https://validators.cosmos.directory/chains/{chainUrl} to retrieve chain details
     * => make sure it's the correct url
     */
    {name: 'columbus', icon: 'terra-classic.svg', chainUrl: 'terra'},
    {name: 'osmosis', icon: 'osmosis.svg', chainUrl: 'osmosis'},
    {name: 'desmos', icon: 'desmos.svg', chainUrl: 'desmos'},
    {name: 'sifchain', icon: 'sifchain.svg', chainUrl: 'sifchain'},
    {name: 'pio-mainnet', icon: 'provenance.png', chainUrl: 'provenance'},
    {name: 'injective', icon: 'injective.png', chainUrl: 'injective'},
    {name: 'irishub', icon: 'iris.svg', chainUrl: 'irisnet'},
    {name: 'cosmos', icon: 'cosmos.svg', chainUrl: 'cosmoshub'},
    {name: 'fetchhub', icon: 'fetchai.png', chainUrl: 'fetchhub'},
    {name: 'core', icon: 'persistence.png', chainUrl: 'persistence'}

  ];

  private _currentNetwork: string | undefined;
  private _previousNetwork: string | undefined;

  constructor(private http: HttpClient, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this._previousNetwork = this._currentNetwork;
        this._currentNetwork = event.url.substring(event.url.lastIndexOf('/') + 1);
        // remove 'dashboard' as it's not a valid network name and breaks page switch from dashboard to map
        this._currentNetwork = "dashboard" == this._currentNetwork ? "" : this._currentNetwork;
      });
  }

  listNetworks(): Promise<ChainsNodeList> {
    //return this.http.get<any>('https://tools.highstakes.ch/geoloc-api/peers').toPromise();
    return this.http.get<any>('http://localhost:8090/api/peers').pipe(
      map((payload: ChainsNodeList) => {
        for (const chain in payload) {
          payload[chain].nodes.map(value => {
            if (value.last_seen === "0001-01-01T00:00:00Z") {
              value.last_seen = "Long ago";
            }
          })
        }
        return payload
      })
    ).toPromise();
  }

  async listChains(chains): Promise<any> {
    const httpCalls = [];
    for (let i = 0; i < chains.length; i++) {
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
    for (let i = 1; i <= count; i++) {

      let color = "#";
      for (let i = 0; i < 3; i++)
        color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
      colors.push(color);
    }
    return colors;
  }

  groupBy(arr: Array<any>, key: string): any {
    return arr.reduce((group, obj) => {
      const field = obj[key];
      group[field] = group[field] ?? [];
      group[field].push(obj);
      return group;
    }, {});
  }


  get currentNetwork(): string | undefined {
    return this._currentNetwork;
  }

  get previousNetwork(): string | undefined {
    return this._previousNetwork;
  }
}

export interface ChainsNodeList {
  [key: string]: {
    chainId: string;
    prettyName: string;
    nodes: Array<NodeDetail>;
  }
}

export interface NodeDetail {
  moniker: string;
  node_id: string;
  last_seen: string;
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  isp: string;
  org: string;
  as: string;
  // not from json but filled from javascript
  chain: string
}

export interface MapNetworkIcons {
  name: string;
  icon: string;
  chainUrl: string;
}
