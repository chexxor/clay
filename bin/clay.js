#!/usr/bin/env node

require("coffee-script/register")
var argv = require('optimist').argv;
var Path = require('path')
var prompt = require("prompt")
var fs = require("fs");
var Q = require("q");
var colors = require('colors');

var ProfileQ = require("./profile")

var Server = require("../app/actions/server")

var Salesforce = require("./salesforce")

var App = require("./app")

var _3Model = require("3vot-model")

var Log = require("3vot-cloud/utils/log")
var Stat = require("3vot-cloud/utils/stats")

Log.setLevel("INFO");

//_3Model.Model.host = "http://localhost:3002/v1"

_3Model.Model.host = "http://threevot-api.herokuapp.com/v1"

Log.debug("LOAD PACKAGE CAN INCLUDE OPTIONS TO LOAD 3VOT or APP PACKAGE AUTOMATICALLY AND DONT DO IT IN ACTIONS", "bin/cli", 36)
console.log("-- 3VOT DIGITAL CONTENT CLOUD --")

// *****************
// CLI
// *****************
var callback = function(){
  Log.info("---- 3VOT ----")
}

if(argv.l){
  Log.setLevel("DEBUG2");
}

if(argv.d){
  _3Model.Model.host = "http://localhost:3002/v1"
}

if(argv.v){
  var pathToPackage =  Path.join(Path.dirname(fs.realpathSync(__filename)), '../package.json');
  var pck  = require(pathToPackage);
  console.log(pck.version);
}
else if( argv.h ){
  var pkg = require("../package.json")
  console.log("" + pkg.name + " " + pkg.version + "\n\nUsage: " + pkg.name + " [options] [command]\n\nCommands:\n\n  server         Start the development server. Use -n to run in Nitrous\n  profile        Profile actions to setup enviroment  \n  app            Manage Application Livecycle\n  store          Manage de Appearance of the 3VOT Profile\n  salesforce     Setup and Deploy Apps to Salesforce.com\n\nOptions:\n\n  -l,    run in debug mode, showing all console output\n  -h,    output usage information\n  -v,    output the version number\n  -u,    Updates your 3VOT Profile\n\nProfile Actions:\n  3vot profile:create        Registers a new profile in the 3VOT Platform and creates the project structure\n  \n  3vot profile:setup         Creates the project folder and installs all dependencies.\n                              ( Windows Note: it's posible that users will need to run npm install manually )\n\n  3vot profile:publish       Publishes an App to the 3VOT Profile Main Page\n\n  3vot profile:update        Updates the Profile Page to Latest Version ( only required before v: 0.3.31 )\n\nSalesforce Actions:\n  3vot salesforce:setup      Connects to Salesforce and saves the username and security key\n  \n  3vot salesforce:dev        Creates and Uploads a Visualforce page used for local development\n  \n  3vot salesforce:upload     Uploads an app to 3VOT Digital Content Cloud, creates a Visualforce Page and links both\n\n\nApp Actions\n  3vot app:template          Downloads an Application based on a Template\n\n  3vot app:create            Registers a new App on the Platform using current credits and creates folder structure\n\n  3vot app:static            Registers a new Static App on the Platform using current credits and creates folder structure\n\n  3vot app:upload            Uploads the Code of the new app and uploads the app as a demo\n  \n  3vot app:clone             Clones an App from the 3VOT Platform Marketplace and downloads its source code\n  \n  3vot app:publish           Publishes a Demo App to your 3VOT Profile\n  \n  3vot app:build             Builds the development version of the App ( Used in manual operation )\n  \n  3vot app:install           Installs the NPM and Bower Dependencies of the App ( Used in Manual Operation )\n  \nStore Actions\n  3vot store:create          Creates a new Store in on your 3VOT Profile Page\n\n  3vot store:list            List all Stores and Apps in your 3VOT Profile\n  \n  3vot store:app:add         Adds an App to the specified store referenced by store name\n  \n  3vot store:app:remove      Removes an App from the Store\n\n  3vot store:destroy         Removes a Store from your 3VOT Profile\n  \n  3vot store:generate        Updates your 3VOT Profile APP JSON Data Store with all Apps in Stores ( this occurs automatically )\n");
}
else{
  if(argv.u){ callback = Store.generate }

  else if( argv._.indexOf("prepare") > -1 ){ App.template(); }

  else if( argv._.indexOf("template") > -1 ){ App.template(); }
  
  else if( argv._.indexOf("make") > -1 ){ App.create(); }

  else if( argv._.indexOf("send") > -1 ){ App.upload(callback); }

  else if( argv._.indexOf("copy") > -1 ){ App.download(); }

  else if( argv._.indexOf("build") > -1 ){ App.build(); }

  else if( argv._.indexOf("install") > -1 ){ App.install(); }

  else{    
    Log.info("Command not found: Use 3vot -h for help", "bin/3cli", 124)
  }
}
