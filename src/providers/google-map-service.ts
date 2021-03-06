/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   06-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 19-02-2017
*/

import { Injectable, EventEmitter } from '@angular/core';
import { ElementRef } from '@angular/core';
import { GMAP_API_KEY } from './apikey-config';

declare var google;

/*
  Generated class for the GoogleMapService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GoogleMapService extends EventEmitter<any> {

  apiKey:string = GMAP_API_KEY || ''; // add you own API KEY
  mapInitialised:boolean = false;
  markersArray:any[] = [];
  bounds:any;
  map:any;
  infoWindow:any;
  gpsUserMarker:any;
  gmapEnable: boolean = false;

  constructor() {
    super()
  }

  /* Google Map loading & Initiallisation */
  loadGoogleMap():void{
     //this.addConnectivityListeners();
     if(typeof google == "undefined" || typeof google.maps == "undefined"){
       //console.log("Google maps JavaScript needs to be loaded.");
       if(navigator.onLine === true){
         //console.log("online, loading map");
         //Load the SDK with the callback
         window['mapInit'] = () => {
           this.initMap();
         }
         let script:HTMLScriptElement = document.createElement("script");
         script.id = "googleMaps";
         script.async = true;
         if(this.apiKey){
           script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&libraries=places&callback=mapInit';
         } else {
           script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
         }
         document.body.appendChild(script);
       }
     }
     else {
       if(navigator.onLine === true){
         //console.log("map ready");
         this.initMap();
       }
       else {
         this.disableMap();
       }
     }
  }

  /* Events Connectivity listener for Google Map */
  addConnectivityListeners():void{
     let onOnline = () => {
       setTimeout(()=> {
         if(typeof google == "undefined" || typeof google.maps == "undefined"){
           this.loadGoogleMap();
         }
         else {
           if(!this.mapInitialised){
             this.initMap();
           }
         }
       }, 1000);
     };
     let onOffline = ()=> {
       this.disableMap();
     };
     document.addEventListener('online', _=> onOnline, false);
     document.addEventListener('offline', _=> onOffline, false);
  }

  /* Google Map Core Methodes */
  disableMap():void{
    setTimeout(()=>{
      console.log('google API disable-> ', google)
      this.emit({
        result: false,
        message: 'google Map API disable'
      })
    },100)
  }

  initMap():void {
    this.mapInitialised = true;
    setTimeout(()=>{
      console.log('google API init-> ', google)
      this.bounds = new google.maps.LatLngBounds();
      this.infoWindow = new google.maps.InfoWindow();
      this.emit({
        result: true,
        message: 'google Map API init'
      })
    },100)
  }

  // setup google maps element
  setupMap(coords,mapElement:ElementRef):void{
    this.map = new google.maps.Map(mapElement.nativeElement, {
      center: {lat: coords.lat, lng: coords.lng},
      zoom: 8
    });
    mapElement.nativeElement.style.height = `${window.innerHeight}px`;
    this.gmapEnable = true;
  }

  // add blue gps marker for user position
  addUserMarker(position):void{
    this.markersArray = [];
    this.bounds = new google.maps.LatLngBounds();
    // add blue gps marker
    let icon:any = new google.maps.MarkerImage('http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png',new google.maps.Size(30, 28),new google.maps.Point(0,0),new google.maps.Point(9, 28));
    this.gpsUserMarker = new google.maps.Marker({position: new google.maps.LatLng(position.lat, position.lng), map: this.map, title: "My Position", icon:icon});
    this.bounds.extend(new google.maps.LatLng(position.lat, position.lng));
    this.markersArray.push(this.gpsUserMarker);
  }

  // add marker to map and in array
  addMarker(i:number, pin:Object):void{
    let marker:any;
    if(pin[i].icon){
      let image = {
        url: pin[i].icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(pin[i].lat, pin[i].lng),
        map: this.map,
        title: pin[i].name,
        icon: image,
        animation: google.maps.Animation.DROP
      });
    }
    else {
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(pin[i].lat, pin[i].lng),
        map: this.map,
        title: pin[i].name,
        animation: google.maps.Animation.DROP
      });
    }
    // add window box on click
    this.addOpenWindowEnvent(i,pin,marker)

    this.bounds.extend(new google.maps.LatLng(pin[i].lat, pin[i].lng));
  	this.markersArray.push(marker);

    // automatiquement du zoom de la carte afin que celle-ci affiche
    // l’ensemble des markers de la map (methode .fitBounds() de google Map API v3)
    this.map.fitBounds(this.bounds);
  }

  addOpenWindowEnvent(i:number, pin:Object, marker:any){
    let contentString:string = `
      <div>
        <p><b>${pin[i].name}</b></p>
        <hr/>
        <p>${pin[i].vicinity}</p>
      </div>`;
    google.maps.event.addListener(marker, 'click', ()=> {
      this.infoWindow.setContent(contentString);
      this.infoWindow.open(this.map, marker);
    });
  }

  updateUserMarkerPos(position:any):void{
    let newLatLng = new google.maps.LatLng(position.lat, position.lng);
    this.gpsUserMarker.setPosition(newLatLng);
  }

}
