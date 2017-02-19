<!--
@Author: Nicolas Fazio <webmaster-fazio>
@Date:   08-02-2017
@Email:  contact@nicolasfazio.ch
@Last modified by:   webmaster-fazio
@Last modified time: 19-02-2017
-->

# Ionic 2 AR Geo-located
Using augmented reality in a Ionic 2 Framework multi-platform application to display Google Places API pins around user.

## Overview
This application using [ezAR](https://www.ezartech.com/) to display a Google Places API geo coordonnates point list around user in a augmented reality frame.

Each geo coordonnates point will display on screen only if the mobile's user is oriented in the good direction.

This app is a integration of this ezAR [cities project](https://github.com/ezartech/ezar-cities), into a Ionic 2 Framework

## Screenshot
<img src="https://raw.githubusercontent.com/ezartech/ezar-cities/master/screenshot1.jpg">

## Prerequisites
- NVM - [Download](https://github.com/creationix/nvm) & Install Node Version Manage
- NodeJS v7 - Download & Install Node.js and the npm package manager with NVM `$ nvm install node 7`.
- [Typescript](https://www.npmjs.com/package/typescript) Latest stable version install in Global `$ npm install -g typescript`
- [Ionic 2](https://ionicframework.com/) & [Cordova](https://cordova.apache.org/) - Latest stable version install in Global `$ npm install -g ionic cordova`
- And you should also have git installed to a better working flow.


## Quick start
- open this project in your IDE and install all node_modules from IDE CLI `$ nvm use 7.2`, `$ npm install`
- run project (server+client side) with `$ ionic build ios`
- enable geolocation on your IOS device
- then deploy on your IOS device with Xcode
- run application

## About author
Hi, i'm a Front-end developper living in Geneva Switzerland and i build hybrid mobile & web applications for almost 15 years. You can follow me on Twitter @FazioNico or checkout my own website http://nicolasfazio.ch
