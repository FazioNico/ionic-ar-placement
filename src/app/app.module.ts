/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   05-02-2017
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 07-02-2017
*/

import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';

import { AccelerometerService } from '../providers/accelerometer-service';
import { CompassService } from '../providers/compass-service';
import { GeolocationService } from '../providers/geolocation-service';
import { GoogleMapService } from '../providers/google-map-service';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AccelerometerService,
    CompassService,
    GeolocationService,
    GoogleMapService
  ]
})
export class AppModule {}
