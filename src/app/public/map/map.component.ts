import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label } from 'ng2-charts';
import * as pluginLabels from 'chartjs-plugin-piechart-outlabels';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

  markers: Array<any> = [];
  networks: any = {};
  totalNodes: Number = 0;
  selectedNetwork: any;
  countries = [];
  selectedCountry: any;
  tableData = [];
  dialogTableData = [];
  cols: any[];
  loadingMap: boolean = true;
  hideSidebar: boolean = false;
  showDiaglog: boolean = false;
  map;
  pieChartOptions: ChartOptions;
  pieChartLabels: Label[];
  pieChartData: SingleDataSet;
  pieChartType: ChartType;
  pieChartLegend: boolean;
  pieChartPlugins = [];
  chartColors: Array<any>;

  constructor(
    private appService: AppService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {

    this.countries = [
      { name: 'COUNTRY', groupBy: 'country' },
      { name: 'ISP', groupBy: 'isp' },
      { name: 'DATA_CENTER', groupBy: 'as' }
    ];
    this.selectedCountry = this.countries[0];

    this.cols = [
      { field: 'moniker', header: 'Moniker' },
      { field: 'nodeId', header: 'Node Id' },
      { field: 'chain', header: 'Chain' },
      { field: 'country', header: 'Country' },
      { field: 'isp', header: 'ISP' },
      { field: 'as', header: 'Data Center' }
    ];
  }

  initMap(): void {
    this.map = L.map('map', {
      center: [ 51.2, 7 ],
      zoom: 4
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; OpenStreetMap contributors'
    });
    tiles.addTo(this.map);
  }

  initChart():void {

    this.pieChartType = 'pie';
    this.pieChartLegend = true;
    this.pieChartPlugins = [pluginLabels];

    this.pieChartOptions = {
      rotation: 0.5 * Math.PI - (70 / 180) * Math.PI,
      responsive: true,
      maintainAspectRatio: true,
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 40,
          bottom: 30,
        },
      },
      legend: {
        display: false
      },
      plugins: {
        devicePixelRatio: -1,
        outlabels: {
          display: true,
          text: '%l %p',
          color: 'black',
          padding: 4,
          borderRadius: 4,
          stretch: 10,
          font: {
            resizable: true,
            minSize: 10,
            maxSize: 12
          }
        }
      }
    };
  }

  async initNetworks() {

    const networkIcons = this.appService.mapNetworkIcons;

    const { network } = this.activatedRoute.snapshot.params;
    
    this.networks['names'] = [{ name: 'All Networks', value: 'all', icon: '' }];
    this.networks['data'] = await this.appService.listNetworks();

    for (const key of Object.keys(this.networks['data'])) {
      const item = networkIcons.find(item => key.search(item.name)> -1);

      this.networks['names'].push({
        name: key,
        value: key,
        icon: (item) ? item['icon'] : false
      })
    }

    this.selectedNetwork = this.networks['names'][0];
    if (network) {
      if (!Object.keys(this.networks['data']).includes(network)) {
        this.router.navigate(['/']);
      }
      else {
        this.selectedNetwork = this.networks['names'].find(item => item.name === network);
      }
    }
  }
  
  async ngAfterViewInit() {
    setTimeout(async () => {
      await this.initMap();
      await this.initNetworks();
      await this.updateData();
      await this.initChart();
    });
  }

  updateData(): void {

    let allNetworks = [];

    
    this.markers.forEach(item => {
      item.removeFrom(this.map);
    });

    if(this.selectedNetwork.value === 'all') {
      for (let name in this.networks.data) {
        this.networks.data[name] = this.networks.data[name].map(v => ({...v, chain: name}));
        allNetworks = allNetworks.concat(this.networks.data[name]);
      }
    } else {

      allNetworks = allNetworks.concat(this.networks.data[this.selectedNetwork.value]);
      allNetworks = allNetworks.map(v => ({...v, chain: this.selectedNetwork.value}));
    }


    let formattedNodes = this.appService.groupBy(allNetworks, this.selectedCountry['groupBy']);

    this.tableData = [];
    for (let country in formattedNodes) {
      this.tableData.push({
        country: country,
        nodes: formattedNodes[country].length
      });
    }

    this.dialogTableData = allNetworks;
    this.totalNodes = allNetworks.length;

    const sliceBy = 4;
    let slicedData = this.tableData.slice(0,sliceBy);
    const others = this.tableData.slice(sliceBy, this.tableData.length);
    const otherNodesCount = others.map(item => item['nodes']).reduce((a, b) => a + b);
    this.pieChartLabels = slicedData.map(item => item['country']).concat(['Others']);
    this.pieChartData = slicedData.map(item => item['nodes']).concat([otherNodesCount]);
    this.chartColors = [
      { backgroundColor: this.appService.getRandomColors(slicedData.length+1) }
    ];


    allNetworks.forEach(item => {
      const markericon = L.icon({
        iconUrl: `assets/markers/${item.chain}.png`
      });
      this.markers.push(L.marker([item.lat, item.lon], {
        icon: markericon
      }).addTo(this.map).bindPopup(`
        <p><b>Moniker: </b>${item.moniker}</p>
        <p><b>NodeId: </b>${item.nodeId}</p>
        <p><b>Chain: </b>${item.chain}</p>
        <p><b>Country: </b>${item.country}</p>
        <p><b>ISP: </b>${item.isp}</p>
        <p><b>Data Center: </b>${item.as}</p>
      `));
    });

    this.loadingMap = false;

    if (this.selectedNetwork.value === 'all') {
      this.router.navigate(['/']);
    } else {
      this.router.navigate([this.selectedNetwork.name]);
    }
  }

  ngOnDestroy(): void {
    this.map.off();
    this.map.remove();
    this.map = undefined;
  }

}
