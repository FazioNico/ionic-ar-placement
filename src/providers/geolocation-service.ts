/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   06-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 13-02-2017
*/

import { Injectable, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/map';

import { Geolocation } from 'ionic-native';

/*
  Generated class for the GeolocationService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GeolocationService extends EventEmitter<any> {

  watchGeoID:any;
  myLat:number;
  myLng:number;

  constructor() {
    super()
  }

  startGeolocation(){
    this.watchGeoID = Geolocation.watchPosition();
    console.log('test2 -> ', this.watchGeoID)
    this.watchGeoID.subscribe(
      (data) => {
        // data can be a set of coordinates, or an error (if an error occurred).
        // data.coords.latitude
        // data.coords.longitude
        this.onGeoSuccess(data)
      },
      err => this.onGeoError('startGeolocation Error: location not available')
    );
  }

  // Stop watching the geolocation
  stopGeolocation() {
      if (this.watchGeoID) {
          this.watchGeoID.unsubscribe()
          this.watchGeoID = null;
      }
  }

  // onSuccess: Get the current location
  onGeoSuccess(position) {
    if(!position.coords) {
      this.onGeoError('No position find');
      return
    }
    //console.log('geolocalisation success', position)
    this.myLat = position.coords.latitude;
    this.myLng = position.coords.longitude;
    // emit coordinates
    this.emit({
      position: {lat:this.myLat, lng: this.myLng}
    });
  }

  // onError: Failed to get the location
  onGeoError(err) {
    this.emit({
      error: err
    });
    //this.stopGeolocation() // TODO: check if trow error on enable
  }

}