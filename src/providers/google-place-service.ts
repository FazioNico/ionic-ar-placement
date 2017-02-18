/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   14-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 18-02-2017
*/

import { Injectable } from '@angular/core';
import { GPLACE_API_KEY } from './apikey-config';

declare var google;

/*
  Generated class for the GoogleMapService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class GooglePlaceService {

  apiKey:string = GPLACE_API_KEY;
  apiEnpoint:Object = {
    nearbysearch: 'nearbySearch',
    textsearch: 'textSearch',
    radarSearch: 'radarsearch'
  }
  service:any;

  constructor() {
  }

  /*
    Use params like this:
    let parmUrl = {
      location: {
        lat: -33.8670522,
        lng: 151.1957362
      },
      radius: '500'
      type: 'food',
      name: 'cruise'
    }
    getData('nearbysearch', parmUrl)
  */
  getData(url:string,parmUrl:any):Promise<any>{

    // let paramsReady:string = Object.keys(parmUrl).map((key)=>{
    //   return `${encodeURIComponent(key)}=${encodeURIComponent(parmUrl[key])}`;
    // }).join('&');

    this.service = new google.maps.places.PlacesService(document.createElement('div'));
    let position:any = new google.maps.LatLng(parmUrl.location.lat,parmUrl.location.lng);
    let request:Object = {
      location: position,
      radius: parmUrl.radius
    };
    console.log('request->', url, request, parmUrl)
    // return promise
    return new Promise((resolve,reject)=>{
      this.service[this.apiEnpoint[url]](request, (results,status) =>{
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          // resolve promise with results on OK status
          // formate place element with geoposition
          let places:Object[] = [];
          results.map(place => {
            place.lat = place.geometry.location.lat(),
            place.lng = place.geometry.location.lng()
            return place;
          })
          .filter( place => {
            // remove place city name
            return place.types.indexOf("locality") === -1;
          })
          .filter( place => {
            // remove place sub locality name
            return place.types.indexOf('sublocality') === -1;
          })
          .map(place => places.push(place))
          resolve(places);
        }else {
          // reject promise otherwise
          reject(status);
        }
      });
    });
  }

}
