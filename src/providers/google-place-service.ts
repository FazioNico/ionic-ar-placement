/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   14-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 15-02-2017
*/



import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
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
  urlEnpoint:any = {
    nearbysearch: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?',
    textsearch: 'https://maps.googleapis.com/maps/api/place/textsearch/json?',
    radarsearch: 'https://maps.googleapis.com/maps/api/place/radarsearch/output?'
  }

  constructor(public http : Http) {
  }

  /*
    Use params like this:
    let parmUrl = {
      location: '-33.8670522,151.1957362',
      radius: '500',
      type: 'food',
      name: 'cruise'
    }
    getData('nearbysearch', parmUrl)
  */
  getData(url:string,parmUrl:Object):Observable<Response>{

    let paramsReady:string = Object.keys(parmUrl).map((key)=>{
      return `${encodeURIComponent(key)}=${encodeURIComponent(parmUrl[key])}`;
    }).join('&');
    let queryUrl:string = `${this.urlEnpoint[url]}${paramsReady}&key=${this.apiKey}`;

    return this.http.get(queryUrl)
      .map(res => res.json())
      .map( res => {
        //console.log(res);
        return res.results
      })
  }
}
