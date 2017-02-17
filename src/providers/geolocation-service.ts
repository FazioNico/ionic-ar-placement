/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   06-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 17-02-2017
*/

import { Injectable, EventEmitter } from '@angular/core';
import { Geolocation, Geoposition, PositionError } from 'ionic-native';

/*
  Generated class for the GeolocationService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GeolocationService extends EventEmitter<Object> {

  watchGeoID:any;
  myLat:number;
  myLng:number;

  constructor() {
    super()
  }

  startGeolocation():void {
    Geolocation.getCurrentPosition().then(pos => {
      this.watchGeoID = Geolocation.watchPosition();
      this.watchGeoID.subscribe(
        (data:Geoposition) => {
          // data can be a set of coordinates, or an error (if an error occurred).
          // data.coords.latitude
          // data.coords.longitude
          this.onGeoSuccess(data)
        },
        (err:PositionError) => this.onGeoError('startGeolocation Error: location not available')
      );
    }).catch(err=> {this.onGeoError('startGeolocation Error: location not available')});


  }

  // Stop watching the geolocation
  stopGeolocation():void  {
      if (this.watchGeoID) {
          this.watchGeoID.unsubscribe()
          this.watchGeoID = null;
      }
  }

  // onSuccess: Get the current location
  onGeoSuccess(position:Geoposition):void {
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
  onGeoError(err:any):void {
    console.log(err)
    this.emit({
      error: err
    });
    if(this.watchGeoID){
      this.stopGeolocation() // TODO: check if trow error on enable
    }

  }

}
