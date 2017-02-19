/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   06-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 19-02-2017
*/

import { Injectable, EventEmitter } from '@angular/core';
import { DeviceOrientation, DeviceOrientationCompassHeading } from 'ionic-native';

import { Observable }   from 'rxjs/Observable';
/*
  Generated class for the CompassService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class CompassService extends EventEmitter<Object> {

  directions:string[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  watchCompassID:Observable<DeviceOrientationCompassHeading>;

  constructor() {
    super()
  }
  // Start watching the compass
  startCompass():void {
    // Get the device current compass heading
    DeviceOrientation.getCurrentHeading()
      .then(
        (data: DeviceOrientationCompassHeading) => {
          console.log('getCurrentHeading',data)
          if(!data.magneticHeading){
            this.onCompassError('cordova not available')
          }
          this.watchCompass();
        },
        (error: any) => this.onCompassError('cordova not available')
      )
      .catch(err => this.onCompassError('CurrentHeading not available'));
  }

  // Watch the device compass heading change
  watchCompass():void{
    this.watchCompassID = DeviceOrientation.watchHeading()
    this.watchCompassID.subscribe(
      (data: DeviceOrientationCompassHeading) => {
        this.onCompassSuccess(data)
      },
      err => {
        this.onCompassError(err)
      }
    );
  }
  // Stop watching the compass
  stopCompass():void {
    if (this.watchCompassID) {
      //this.watchCompassID.unsubscribe();
      this.watchCompassID = null;
    }
  }

  // Compass onSuccess: Get the current heading
  onCompassSuccess(heading:DeviceOrientationCompassHeading):void {
    //console.log('compass success: heading-> ', heading)
    let magneticDataReady:any =  heading.magneticHeading / 45;
    let direction:string = this.directions[Math.abs(parseInt(magneticDataReady) + 1)];
    let degree:number = heading.magneticHeading;

    this.emit({
      success: true,
      direction:direction,
      degree: degree
    });

  }

  // Compass onError: Get the current error
  onCompassError(error):void{
    console.log('Error startCompass-> ', error)
    this.emit({error:'Error: startCompass DeviceOrientationCompassHeading'});
    this.stopCompass()
  }
}
