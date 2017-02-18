/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   05-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 19-02-2017
*/

import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { AccelerometerService } from '../../providers/accelerometer-service';
import { CompassService } from '../../providers/compass-service';
import { GeolocationService } from '../../providers/geolocation-service';
import { GoogleMapService } from '../../providers/google-map-service';
import { GooglePlaceService } from '../../providers/google-place-service';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  pin:any[] = [];
  dataStatus:number = 0;
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
    private _googleMapService: GoogleMapService,
    private _googlePlaceService: GooglePlaceService
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

  initezAR():void{
    let win:any = window;
    if (win.ezar) {
        let ezar: any = win.ezar;
        ezar.initializeVideoOverlay(
            ()=> {
             ezar.getBackCamera().start();
            },
            (err)=> {
            //alert('unable to init ezar: ' + err);
            console.log('unable to init ezar: ' + err);
        });
    } else {
        //alert('Unable to detect the ezAR plugin');
        console.log('Unable to detect the ezAR plugin');
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
    // assign data to display
    this.userAcceleration = data;
    console.log('userAcceleration-> ', data)
    if(this.userAcceleration.y > 5){
        // stay on AR page
        if(this.azElement.nativeElement.className.indexOf('fadeOut') > -1){
          this.azElement.nativeElement.classList.remove('fadeOut')
          this.azElement.nativeElement.classList.add('fadeIn')

          this.topElement.nativeElement.classList.remove('fadeIn')
          this.topElement.nativeElement.classList.add('fadeOut')
        }
    } else {
        // pop Google Map Page
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

  compassResult(data):void{
    //console.log('compassResult-> ', data)
    if(data.error){
      this.log.push("Error onCompas");
      return;
    }
    // print data result
    this.userDirection = data.direction;
    // calculateDirection of each pinPoints with data.degree
    this.calculateDirection(data.degree);
  }
  /* Eof Compass Methode */

  /* Bof - Geolocation Methode */
  // startGeolocation with GeolocationService Observable
  startGeolocation():void{
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
  geolocationResult(data):void {
    //console.log('geolocationResult',data);
    if(!data.position) {
      this.log.push("Error onGeolocation")
      return
    }
    // test if user have move more than 5 meters
    if(this.userLocation){
      let distance:number = this.calculateDistance(this.userLocation.position.lat, this.userLocation.position.lng, data.position.lat, data.position.lng);
      console.log('check distance-> ',distance )
      if (distance <= 15) {
        // Stop load data
        console.log('stop load data')
        return;
      }
    }
    // asign user location to display
    this.userLocation = data;
    this.loadData(data.position)
    if(google){
      this.loadGoogleMapData(data.position)
    }
  }
  /* Eof - Geolocation Methode */

  /* Bof - googleMap Methode */
  loadGoogleSDK():void{
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

  loadGoogleMapData(userPosition):void{
    console.log('loadGoogleMapData')
    // check if map is alerady loaded and in case update user position
    // with updateUserMarkerPos(this.userLocation.position)
    // else load & set all Gmap data
    if(this._googleMapService.gmapEnable === false){
      console.log('create user position on map-> ', this._googleMapService.gmapEnable)
      this._googleMapService.setupMap(userPosition,this.mapElement); // TODO need native geoposition ready
      this._googleMapService.addUserMarker(userPosition) // add blue gps marker for user position
    }
    else {
      console.log('update user position-> ', this._googleMapService.gmapEnable)
      this._googleMapService.updateUserMarkerPos(userPosition)
    }
    console.log('add all places position-> ', this._googleMapService.gmapEnable)
    for(var i=0; i< this.pin.length; i++){
        this.addToDOMList(i); // add to google map page liste item
        this._googleMapService.addMarker(i,this.pin); // google map markers placement
    }
  }

  addToDOMList(i:number):void{
    // TODO
  }
  /* Eof - googleMap Methode */


  /* ########################### */
  /* Bof - HomePage Core Methode */
  calculateDirection(degree:number):void{
    //console.log('calculateDirection degree-> ', degree)
    let detected:number = 0;
    this.spots = []
    //document.getElementById('spot').innerHTML = '';
    for(var i=0;i<this.pin.length;i++){
        if(Math.abs(this.pin[i].bearing - degree) <= 20){
            let away:number, fontSize:string, fontColor:string;
            // varry font size based on distance from gps location
            if(this.pin[i].distance.miles>1500 || this.pin[i].distance.meter > 2414010){
                away = this.pin[i].distance;
                fontSize = "16";
                fontColor = "#ccc";
            } else if(this.pin[i].distance.miles >500 || this.pin[i].distance.meter > 804670){
                away = this.pin[i].distance;
                fontSize = "24";
                fontColor = "#ddd";
            } else {
                away = this.pin[i].distance;
                fontSize = "30";
                fontColor = "#eee";
            }
            let move:number = ((this.pin[i].bearing - degree) * 5)+50;
            let spot:Object = {
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
  loadData(position):void{
      console.log('load data position-> ', position);
      // set params query
      let parmUrl:Object = {
        location: {
          lat: position.lat,
          lng: position.lng
        },
        radius: '500'
      }
      // run request query with params
      this._googlePlaceService.getData('nearbysearch', parmUrl)
        .then((response:any)=>{
          // clean previous data array
          this.pin = []
          return response
        })
        .then((response:any) => {
          response.map(place => {
            console.log(place)
            // add new place in data array
            this.pin.push(place)
          })
        })
        .then(_=>{
          // calacule distance relative between user position and each pin element
          this.pin.map(place => {
            this.relativePosition(place,position);
          })
        })
        .then(_=> {
          /// create marker
          if(this._geolocationService.myLat && this._geolocationService.myLng){
            this.loadGoogleMapData({lat: this._geolocationService.myLat,lng: this._geolocationService.myLng});
          }
        })
        .then(_=>{
          this.dataStatus = 1;
        })
  }

  // calulate distance and bearing value for each of the points wrt gps lat/lng
  relativePosition(pin,position):void{
      let pinLat:number = pin.lat;
      let pinLng:number = pin.lng;
      let dLat:number = (position.lat-pinLat)* Math.PI / 180;
      let dLon:number = (position.lng-pinLng)* Math.PI / 180;
      let lat1:number = pinLat * Math.PI / 180;
      let lat2:number = position.lat * Math.PI / 180;
      let y:number = Math.sin(dLon) * Math.cos(lat2);
      let x:number = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
      let bearing:number = Math.atan2(y, x) * 180 / Math.PI;
      bearing = bearing + 180;
      pin['bearing'] = bearing;

      let a:number = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      let c:number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      let distance:Object = {
        miles: 3958.76  * c,
        meter: (3958.76  * c) * 1609.34
      };
      pin['distance'] = distance;
  }

  // Calculates the distance between two GPS points
  calculateDistance(lat1:number, long1:number, lat2:number, long2:number):number {
      return 11*10000*Math.sqrt(Math.pow(lat1-lat2,2)+Math.pow(long1-long2,2))
  }

  /* Eof - HomePage Core Methode */

}
