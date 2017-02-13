/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   05-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 13-02-2017
*/

import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { AccelerometerService } from '../../providers/accelerometer-service';
import { CompassService } from '../../providers/compass-service';
import { GeolocationService } from '../../providers/geolocation-service';
import { GoogleMapService } from '../../providers/google-map-service';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  pin:any = [
      //{"name":"Miami", "lat":"25.788969", "lng":"-80.226439"},
      {"name":"École de Commerce Emilie Gourd", "lat":"46.1937510", "lng":"6.1680810"},
      {"name":"Migros Rieu", "lat":"46.1919780", "lng":"6.1640420"},
      {"name":"Ateliers Nomades", "lat":"46.1910980", "lng":"6.1357960"},
      {"name":"Denner Rieu", "lat":"46.1940520", "lng":"6.1660530"},
      {"name":"La Florance", "lat":"46.1917560", "lng":"6.1690610"}
  ];
  dataStatus:number = 0;

  ///
  log:any[] = [];
  userAcceleration:any;
  userLocation:any;
  userDirection:any;
  spots:any[] = [];

  @ViewChild('azView') azElement: ElementRef;
  @ViewChild('topView') topElement: ElementRef;
  @ViewChild('map') mapElement: ElementRef;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    private _accelerometerService: AccelerometerService,
    private _compassService: CompassService,
    private _geolocationService: GeolocationService,
    private _googleMapService: GoogleMapService
  ) {
    this.loadGoogleSDK();
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //initialize ezAR videoOverlay plugin and start back camera
      this.initezAR();
      this.startGeolocation();
      this.detectAccelerometer();
      this.startCompass(); // need geoposition data ready
    });

  }

  initezAR(){
    let win: any = window;
    if (win.ezar) {
        let ezar: any = win.ezar;
        ezar.initializeVideoOverlay(
            ()=> {
             ezar.getBackCamera().start();
            },
            (err)=> {
            //alert('unable to init ezar: ' + err);
        });
    } else {
        //alert('Unable to detect the ezAR plugin');
    }
  }

  /* Bof Accelerometer Methode */
  // Start checking the accelerometer
  detectAccelerometer():void {
    this._accelerometerService.detectAccelerometer()
    this._accelerometerService.subscribe(
      data => this.AccelerometerResult(data)
    )
  }

  AccelerometerResult(data:any):void{
    // throw error
    if(!data.y && !data.x && !data.y){
      this.log.push("onAccelerometerError Error.")
      this.topElement.nativeElement.classList.add('fadeIn')
      this.topElement.nativeElement.classList.remove('fadeOut')

      this.azElement.nativeElement.classList.add('fadeOut')
      this.azElement.nativeElement.classList.remove('fadeIn')
      return;
    }
    // display result
    //let acceleration = data;
    // assign data to display
    this.userAcceleration = data;
    console.log('userAcceleration-> ', data)
    if(this.userAcceleration.y > 5){
        // TODO: stay on AR page
        if(this.azElement.nativeElement.className.indexOf('fadeOut') > -1){
          this.azElement.nativeElement.classList.remove('fadeOut')
          this.azElement.nativeElement.classList.add('fadeIn')

          this.topElement.nativeElement.classList.remove('fadeIn')
          this.topElement.nativeElement.classList.add('fadeOut')
        }
    } else {
        // TODO: pop Google Map Page
        if(this.topElement.nativeElement.className.indexOf('fadeOut') > -1){
          this.topElement.nativeElement.classList.remove('fadeOut')
          this.topElement.nativeElement.classList.add('fadeIn')

          this.azElement.nativeElement.classList.remove('fadeIn')
          this.azElement.nativeElement.classList.add('fadeOut')
        }
    }
  }
  /* Eof Accelerometer Methode */

  /* Bof Compass Methode */
  // Start watching the compass
  startCompass() {
    console.log('start compass')
    this._compassService.startCompass()
    this._compassService.subscribe(
      data => {
        this.compassResult(data)
      }
    )
  }

  compassResult(data){
    //console.log('compassResult-> ', data)
    if(data.error){
      this.log.push("Error onCompas");
      return;
    }
    // print data result
    this.userDirection = data.direction;
    document.getElementById('compass').innerHTML = data.degree + "<br>" + data.direction;
    //document.getElementById('direction').innerHTML = data.direction;
    // calculateDirection of each pinPoints with data.degree
    this.calculateDirection(data.degree);
  }
  /* Eof Compass Methode */

  /* Bof - Geolocation Methode */
  // startGeolocation with GeolocationService Observable
  startGeolocation(){
    this._geolocationService.startGeolocation()
    this._geolocationService.subscribe(
      data => {
        this.geolocationResult(data)
      },
      err => {
        this.geolocationResult(err)
      }
    );
  }

  // Geolocation onSuccess: Get the current location
  geolocationResult(data) {
    //console.log('geolocationResult',data);
    if(!data.position) {
      this.log.push("Error onGeolocation")
      return
    }
    // asign user location to display
    this.userLocation = data;
    //document.getElementById('geolocation').innerHTML = 'Latitude: ' + data.position.lat + '<br />' + 'Longitude: ' + data.position.lng;
    this.loadData(data.position)
    if(google){
      this.loadGoogleMapData(data.position)
    }
  }
  /* Eof - Geolocation Methode */

  /* Bof - googleMap Methode */
  loadGoogleSDK(){
    this._googleMapService.loadGoogleMap()
    this._googleMapService.subscribe(
      data => {
        if(!data.result){
          console.log('error with google map sdk -> ', data);
          this.log.push("Error with google map sdk");
          return;
        }
        console.log('google map sdk ready-> ', data, google);
        let myLat = this._geolocationService.myLat
        let myLng = this._geolocationService.myLng
        if(myLat && myLng){
          this.loadGoogleMapData({lat: myLat,lng: myLng});
        }
      },
      err => {
        console.log('error with google map sdk -> ', err);
        this.log.push("Error with google map sdk");
      }
    )
  }

  loadGoogleMapData(userPosition){
    console.log('loadGoogleMapData')
    this._googleMapService.setupMap(userPosition,this.mapElement); // TODO need native geoposition ready
    this._googleMapService.addUserMarker(userPosition) // add blue gps marker for user position
    for(var i=0; i< this.pin.length; i++){
        this.addToDOMList(i); // add to google map page liste item
        this._googleMapService.addMarker(i,this.pin); // google map markers placement
    }
  }

  addToDOMList(i){
    let listItems = document.getElementsByName('listItems')
    for (let j = 0; j < listItems.length; j++) {
        listItems[j].insertAdjacentHTML('beforeend', `<div class="item">${this.pin[i].name}</div>`)
    }
  }
  /* Eof - googleMap Methode */


  /* ########################### */
  /* Bof - HomePage Core Methode */
  calculateDirection(degree){
    //console.log('calculateDirection degree-> ', degree)
    let detected = 0;
    this.spots = []
    //document.getElementById('spot').innerHTML = '';
    for(var i=0;i<this.pin.length;i++){
        if(Math.abs(this.pin[i].bearing - degree) <= 20){
            let away, fontSize, fontColor;
            // varry font size based on distance from gps location
            if(this.pin[i].distance.feet>1500 || this.pin[i].distance.meter > 457){
                away = this.pin[i].distance;
                fontSize = "16";
                fontColor = "#ccc";
            } else if(this.pin[i].distance.feet >500 || this.pin[i].distance.meter > 131){
                away = this.pin[i].distance;
                fontSize = "24";
                fontColor = "#ddd";
            } else {
                away = this.pin[i].distance;
                fontSize = "30";
                fontColor = "#eee";
            }
            let move = ((this.pin[i].bearing - degree) * 5)+50;
            let spot = {
              id: i,
              pin: this.pin[i],
              fontSize: fontSize,
              fontColor: fontColor,
              away: away,
              move: move.toFixed(0)
            }
            //console.log('test-> ', spot.away, spot.move)
            // asign pin to array to display visible pins
            this.spots.push(spot)
            detected = 1;
        } else {
            if(!detected){
              // clean array to display -> no pins
              this.spots = []
            }
        }
    }
  }

  // get data from API and store in array, add to list view and create markers on map, calculate
  loadData(position){
      console.log('load data position-> ', position);
      // calacule distance relative between user position and each pin element
      for(var i=0; i< this.pin.length; i++){
          this.relativePosition(i,position);
      }
      this.dataStatus = 1;
  }

  // calulate distance and bearing value for each of the points wrt gps lat/lng
  relativePosition(i,position){
      let pinLat = this.pin[i].lat;
      let pinLng = this.pin[i].lng;
      let dLat = (position.lat-pinLat)* Math.PI / 180;
      let dLon = (position.lng-pinLng)* Math.PI / 180;
      let lat1 = pinLat * Math.PI / 180;
      let lat2 = position.lat * Math.PI / 180;
      let y = Math.sin(dLon) * Math.cos(lat2);
      let x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
      let bearing = Math.atan2(y, x) * 180 / Math.PI;
      bearing = bearing + 180;
      this.pin[i]['bearing'] = bearing;

      let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      let distance = {
        feet: 3958.76  * c,
        meter: (3958.76  * c) * 0.3048
      };
      this.pin[i]['distance'] = distance;
  }
  /* Eof - HomePage Core Methode */

}
