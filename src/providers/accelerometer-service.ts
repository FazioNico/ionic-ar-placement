/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   06-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 08-02-2017
*/

import { Injectable, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/map';

import { DeviceMotion, DeviceMotionAccelerationData } from 'ionic-native';

/*
  Generated class for the AccelerometerService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AccelerometerService extends EventEmitter<any> {

  watchAccelerometerID:any;

  constructor() {
    super()
    //console.log('Hello AccelerometerService Provider');
  }

  // Start checking the accelerometer
  detectAccelerometer():void {
    // Get the device current acceleration
    let accelerationReady:boolean = false;
    DeviceMotion.getCurrentAcceleration()
    .then(
      (acceleration: DeviceMotionAccelerationData) => {
        accelerationReady = true
        //console.log('getCurrentAcceleration-> ',acceleration)
      },
      (error: any) => {console.log('Error: getCurrentAcceleration-> ',error)}
    )
    .then(_=>{
      if(accelerationReady === true ){
        this.startAccelerometer();
      }
      else {
        this.emit('Error: getCurrentAcceleration');
      }
    });
  }

  startAccelerometer():void{
    // Watch device acceleration
    this.watchAccelerometerID = DeviceMotion.watchAcceleration()
    .subscribe(
      (acceleration: DeviceMotionAccelerationData) => {
        this.onAccelerometerSuccess(acceleration)
      },
      err => {
        this.onAccelerometerError(err)
      }
    );
  }

  // Stop checking the accelerometer
  stopAccelerometer():void {
    if (this.watchAccelerometerID) {
        this.watchAccelerometerID.unsubscribe();
        this.watchAccelerometerID = null;
    }
  }

  // onSuccess: Get current accelerometer values
  onAccelerometerSuccess(acceleration):void {
    //console.log('watchAcceleration-> ',acceleration);
    this.emit(acceleration);
  }

  // onError: Failed to get the acceleration
  onAccelerometerError(err):void {
    console.log('onAccelerometerError-> ',err);
    this.emit('Error: getCurrentAcceleration');
  }
}
