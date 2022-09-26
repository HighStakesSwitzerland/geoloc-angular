import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'dashboard-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit, OnDestroy {

  loadingTable: boolean = true;
  networksData: any;
  networks = [];
  selectedNetwork: any;
  tableData = [];
  active: Number = 0;
  inActive: Number = 0;
  jailed: Number = 0;
  timerRef;
  lastUpdated = 0;
  totalPeers:Number = 0;
  cols: any[];
  constructor(
    private appService: AppService,
    private router: Router
  ) {}

  async ngOnInit() {

    this.cols = [
      { field: 'moniker', header: 'Moniker' },
      { field: 'nodeId', header: 'Node Id' },
      { field: 'chain', header: 'Chain' },
      { field: 'country', header: 'Country' },
      { field: 'isp', header: 'ISP' },
      { field: 'as', header: 'Data Center' }
    ];

    await this.initNetworks();
    await this.updateData();
    await this.initTableData();
  }

  async initTableData() {

    const list = await this.appService.listNetworks();
    let allNetworks = [];
    for (let name in list) {
      list[name] = list[name].map(v => ({...v, chain: name}));
      allNetworks = allNetworks.concat(list[name]);
    }

    this.tableData = allNetworks;
  }

  async initNetworks() {

    const networkIcons = this.appService.mapNetworkIcons;

    const route = this.router.routerState.snapshot.url.split('/');
    const network = (route.length > 2) ? route.pop() : undefined;

    this.networks = [{ name: 'All Networks', value: 'all', icon: '' }];

    this.networksData = await this.appService.listNetworks();

    for (const key of Object.keys(this.networksData)) {
      const item = networkIcons.find(item => key.search(item.name)> -1);

      this.networks.push({
        name: key,
        value: key,
        icon: (item) ? item['icon'] : false
      })
    }

    this.selectedNetwork = this.networks[0];

    if (network) {
      if (!Object.keys(this.networksData).includes(network)) {
        this.router.navigate(['/dashboard']);
      }
      else {
        this.selectedNetwork = this.networks.find(item => item.name === network);
      }
    }

  }

  async updateData() {

    this.loadingTable = true;
    let allNetworks = [];
    let chains = [];

    if(this.selectedNetwork.value === 'all') {
      for (let name in this.networksData) {
        this.networksData[name] = this.networksData[name].map(v => ({...v, chain: name}));
        allNetworks = allNetworks.concat(this.networksData[name]);
      }
      chains = this.networks.map(item => item.icon.split('.')[0]);
      chains.shift();
    } else {

      allNetworks = allNetworks.concat(this.networksData[this.selectedNetwork.value]);
      allNetworks = allNetworks.map(v => ({...v, chain: this.selectedNetwork.value}));
      chains = [this.selectedNetwork.icon.split('.')[0]];
    }

    this.tableData = allNetworks;

    
    if (this.selectedNetwork.value === 'all') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate([`/dashboard/${this.selectedNetwork.name}`]);
    }
    
    const validators = await this.appService.listChains(chains);
    this.totalPeers = validators.length;
    console.log(validators);
    
    const { BOND_STATUS_BONDED, BOND_STATUS_UNBONDED } = this.appService.groupBy(validators, 'status');

    this.active = (BOND_STATUS_BONDED)? BOND_STATUS_BONDED.length : 0;
    this.inActive = (BOND_STATUS_UNBONDED) ? BOND_STATUS_UNBONDED.length : 0;

    const jailed = this.appService.groupBy(validators, 'jailed')['true'];
    this.jailed = (jailed) ? jailed.length : 0;

    clearInterval(this.timerRef);
    this.loadingTable = false;
    this.startTimer();
  }

  startTimer() {
    this.lastUpdated = 0;
    this.timerRef = setInterval(() => {
      this.lastUpdated +=1;
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timerRef);
  }

}
