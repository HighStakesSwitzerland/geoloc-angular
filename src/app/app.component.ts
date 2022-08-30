import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
// import { Map, Control, DomUtil, ZoomAnimEvent , Layer, MapOptions, tileLayer, latLng } from 'leaflet';
import * as L from 'leaflet';
import { icon, latLng, marker } from 'leaflet';
import { AppService } from './app.service';
// import Chart from 'chart.js/auto';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label } from 'ng2-charts';
import * as pluginLabels from 'chartjs-plugin-piechart-outlabels';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MoreDetailsComponent } from './more-details/more-details.component';

// Chart.register(ChartDataLabels);
// Chart.register(ChartOutLabels);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DialogService]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  // markerClusterGroup: L.MarkerClusterGroup;
  markerClusterData: any = {};
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
  ref: DynamicDialogRef;
  pieChartOptions: ChartOptions;
  pieChartLabels: Label[];
  pieChartData: SingleDataSet;
  pieChartType: ChartType;
  pieChartLegend: boolean;
  pieChartPlugins = [];
  chartColors: Array<any>;

  constructor(
    private appService: AppService,
    private dialogService: DialogService
  ) {
  }

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

    this.dialogTableData = [
      { moniker: '00000', nodeId: '94e69330d6f4cfe221cdd2ce49ee141e53e5f200', chain: 'osmosis-1', country: 'Singapore', isp: 'Leaseweb Asia Pacific pte. ltd', as: 'AS59253 Leaseweb Asia Pacific pte. ltd.' },
      { moniker: '000fm', nodeId: 'cf84e3f178b32876dd1ea798a0c5d9b65e1f9dce', chain: 'osmosis-1', country: 'Pakistan', isp: 'Hetzner Online GmbH', as: 'AS24940 Hetzner Online GmbH' },
      { moniker: '00220', nodeId: 'a113a5c702ea29cdfbbe41a2d4d0b6956117ebad', chain: 'osmosis-1', country: 'India', isp: 'LeaseWeb Netherlands B.V.', as: 'AS24673 Hetzner Online GmbH' },
      { moniker: '00150', nodeId: '5895e0a5f496edd17d160c9be6619c3f5cc6e095', chain: 'osmosis-1', country: 'UK', isp: 'Hetzner', as: 'AS200295 Skoed Limited' },
      { moniker: '00rx6', nodeId: '54055b9619090603a218e352bb83cc4a1d764005', chain: 'osmosis-1', country: 'Canada', isp: 'Amazon.com, Inc.', as: 'AS60781 LeaseWeb Netherlands B.V.' }
    ];
    
    // this.initNetworks();
    // this.initChart();
    // for (const [key, value] of Object.entries(networks)) {
    //   ns.append(`<option value=${key}>${key}</option>`);
    // }
    // console.log(Object.keys(await this.appService.listNetworks()));
    // this.options = {
    //   layers:[tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     opacity: 0.7,
    //     maxZoom: 19,
    //     detectRetina: true,
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    //   })],
    //   zoom:1,
    //   center:latLng(0,0)
    // }
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

    // this.pieChartLabels = ['January', 'February', 'March'];
    // this.pieChartLabels = this.tableData.slice(0,6).map(item => item['country']);
    // this.pieChartData = [50445, 33655, 15900];
    // this.pieChartData = this.tableData.slice(0,6).map(item => item['nodes']);
    this.pieChartType = 'pie';
    this.pieChartLegend = true;
    this.pieChartPlugins = [pluginLabels];
    // this.chartColors = [
    //   { backgroundColor: this.appService.getRandomColors(this.tableData.slice(0,6).length) }
    // ];
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
        // offset: false,
        outlabels: {
          display: true,
          text: '%l %p',
          // text: '%l\n%p',
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

    const networkIcons = [
      { name: 'osmosis', icon: 'osmo.svg' },
      { name: 'desmos', icon: 'dsm.svg' },
      { name: 'sifchain', icon: 'sifchain.svg' },
      { name: 'pio-mainnet', icon: 'pio-mainnet.png' }
    ];

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

    // console.log(this.networks.data);
    // for (const [key, obj] of Object.entries(this.networks['names'])) {
    //   L.markerClusterGroup({ removeOutsideVisibleBounds: true });
      
    //   const value = obj['value'];
    //   if (value !== 'all') {
        
    //     // console.log(this.networks.data[value]);
    //     this.networks.data[value].forEach(function (item) {
          
    //       let markerIcon = L.icon({
    //         iconUrl: 'assets/markers/core-1.png'
    //       });
    //       L.marker([item.lat, item.lon], {
    //         icon: markerIcon,
    //       }).addTo(this.map);

    //       // const markerIcon = L.icon({
    //       //   iconUrl: 'assets/markers/core-1.png'
    //       // });
    //       // console.log(item);
    //       // const coordinates = L.latLng([item.lat, item.lon]);
    //       // const lastLayer = marker(coordinates).setIcon(markerIcon);
    //       // this.markerClusterGroup.addLayer(lastLayer);
    //       // L.marker(coordinates, {
    //       //   icon: markerIcon
    //       // }).addTo(this.map);
    //       // markerClusterGroups[key].addLayer(
    //         // L.marker([location.lat, location.lon], {
    //         //   icon: L.icon({
    //         //     iconUrl: "images/markers/" + key + ".png",
    //         //   }),
    //         //   properties: location,
    //         //   belongs_to: key,
    //         // })
    //       // );
    //     });
    //   }
    // }


    // let markerIcon = L.icon({
    //   iconUrl: 'assets/markers/core-1.png'
    // });
    // L.marker([48.208, 16.373], {
    //       icon: markerIcon,
    // }).addTo(this.map);
  }
  
  async ngAfterViewInit() {
    await this.initMap();
    await this.initNetworks();
    await this.updateTable();
    await this.initChart();
  }

  updateTable(): void {

    let allNetworks = [];
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
  }

  openModal() {
    
    this.ref = this.dialogService.open(MoreDetailsComponent, {
      header: 'All Networks',
      width: '60%',
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      styleClass: 'dialog-more-details',
      baseZIndex: 10000
  });

  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }

}
