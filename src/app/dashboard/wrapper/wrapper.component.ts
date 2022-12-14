import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AppService, ChainsNodeList, NodeDetail} from 'src/app/services/app.service';

@Component({
  selector: 'dashboard-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit, OnDestroy {

  loadingTable: boolean = true;
  networksData: ChainsNodeList;
  networks = [];
  selectedNetwork: any;
  tableData = [];
  active: Number = 0;
  inActive: Number = 0;
  jailed: Number = 0;
  timerRef;
  lastUpdated = 0;
  totalValidators: Number = 0;
  cols: any[];

  constructor(public appService: AppService, private router: Router) {
  }

  async ngOnInit() {

    this.cols = [
      {field: 'moniker', header: 'Moniker'},
      {field: 'node_id', header: 'Node Id'},
      {field: 'chain', header: 'Chain'},
      {field: 'country', header: 'Country'},
      {field: 'isp', header: 'ISP'},
      {field: 'as', header: 'Data Center'},
      {field: 'last_seen', header: 'Last Seen'}
    ];

    await this.initNetworks();
    await this.updateData();
  }

  async initNetworks() {

    const networkIcons = this.appService.mapNetworkIcons;

    const route = this.router.routerState.snapshot.url.split('/');
    const network = (route.length > 2) ? route.pop() : undefined;

    this.networks = [{name: 'All Networks', value: 'all', icon: 'all.png'}];

    this.networksData = await this.appService.listNetworks();

    for (const key of Object.keys(this.networksData)) {
      const item = networkIcons.find(item => {
        return key.search(item.name) > -1;
      });

      this.networks.push({
        name: key,
        value: key,
        icon: item
      })
    }

    this.selectedNetwork = this.networks[0];

    if (network) {
      const found = this.networks.find(item => item.name.includes(network))
      if (found === undefined) {
        this.router.navigate(['/dashboard']).then();
      } else {
        this.selectedNetwork = found;
      }
    }

  }

  async updateData() {

    this.loadingTable = true;
    let allNetworks: Array<NodeDetail> = [];
    let chains = [];

    if (this.selectedNetwork.value === 'all') {
      for (let name in this.networksData) {
        this.networksData[name].nodes = this.networksData[name].nodes.map(v => ({...v, chain: name}));
        allNetworks = allNetworks.concat(this.networksData[name].nodes);
      }
      chains = this.networks.map(item => item.icon?.chainUrl);
      chains.shift();
    } else {
      allNetworks = allNetworks.concat(this.networksData[this.selectedNetwork.value].nodes);
      allNetworks = allNetworks.map(v => ({...v, chain: this.selectedNetwork.value}));
      chains = [this.selectedNetwork.icon?.chainUrl];
    }

    this.tableData = allNetworks;


    if (this.selectedNetwork.value === 'all') {
      this.router.navigate(['/dashboard']).then();
    } else {
      const routePrettyName = this.selectedNetwork.name.substring(0, this.selectedNetwork.name.lastIndexOf('-'));
      this.router.navigate([`/dashboard/${routePrettyName}`]).then();
    }

    const validators = await this.appService.listChains(chains);
    this.totalValidators = validators.length;

    const {BOND_STATUS_BONDED, BOND_STATUS_UNBONDED} = this.appService.groupBy(validators, 'status');

    this.active = (BOND_STATUS_BONDED) ? BOND_STATUS_BONDED.length : 0;
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
      this.lastUpdated += 1;
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timerRef);
  }

}
