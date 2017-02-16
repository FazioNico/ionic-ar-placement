/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   14-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 16-02-2017
*/



import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable }   from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

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
  apiEnpoint:any = {
    nearbysearch: 'nearbySearch',
    textsearch: 'textSearch',
    radarSearch: 'radarsearch'
  }
  service:any;

  constructor(public http : Http) {
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
  getData(url:string,parmUrl:any){

    // let paramsReady:string = Object.keys(parmUrl).map((key)=>{
    //   return `${encodeURIComponent(key)}=${encodeURIComponent(parmUrl[key])}`;
    // }).join('&');

    this.service = new google.maps.places.PlacesService(document.createElement('div'));
    let position = new google.maps.LatLng(parmUrl.location.lat,parmUrl.location.lng);
    let request = {
      location: position,
      radius: parmUrl.radius
    };
    console.log('request->', url, request, parmUrl)
    let map = new google.maps.Map(document.createElement('div'))
    // return promise
    return new Promise((resolve,reject)=>{
      this.service[this.apiEnpoint[url]](request, (results,status) =>{
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          // resolve promise with results on OK status
          resolve(results);
        }else {
          // reject promise otherwise
          reject(status);
        }
      });
    });
  }

}
