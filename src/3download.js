var fs = require('fs');
var Ignore = require("fstream-ignore");
var Aws = require("aws-sdk");
var Semver = require("semver");
var fstream = require("fstream");
var tar = require("tar");
var zlib = require("zlib");
var Q = require("q");
Q.longStackSupport = true;
var colors = require('colors');
var Parse = require('parse').Parse;
var mime = require('mime')
var Path = require('path');


//TODO: Must request this variables in a Safe Way

// *****************
// CLI
// *****************
var _3download;

_3download = (function(){

  var app = { name: "", username: "" };
  var username = "";
  var packageInfo = "";
  var stages = []

  function _3download( options ) {
    app = options;
  }

  // Upload App Flow
  _3download.prototype.downloadApp = function( ){

    console.info("We will download the App from 3VOT App Store".yellow)
    
    var deferred = Q.defer();

    Parse.initialize( "IOcg1R4TxCDCPVsxAwLHkz8MPSOJfj2lZwdL4BU4", "jOr74Zy7C8VbatIvxoNyt2c03B9hPY7Hc32byA78" );
    Aws.config.update( { accessKeyId: 'AKIAIHNBUFKPBA2LINFQ', secretAccessKey: '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' } );
    
    this.checkPackage()
    .then( this.validatePackage )
    .then( this.downloadPackage )
    .then( function(){ return deferred.resolve()  })
    .fail( function(error){ 
      console.error("Error Downloading Package and/or App".red)
      console.error(error);
      console.error("The last line contains Error Info".red.bold);
      return deferred.reject(error);
    })
    
    return deferred.promise;
  }


  //
  // Parms: Profile from ValidateProfile
  // Returns: Promise
  // Desc: Requests the Package Master Object from 3VOT Platform
  _3download.prototype.checkPackage= function(profile){
    var Packages = Parse.Object.extend("Packages");
    var packageQuery = new Parse.Query(Packages);
    packageQuery.equalTo("username", app.username);
    packageQuery.equalTo("name", app.name);
    console.info("Validating Package Information".grey);
    stages.push["checkPackage"]  
    return packageQuery.find();
  }

  //
  // Parms: Package Results
  // Returns: Promise
  // Desc: Checks that the Package to be uploaded is valid and it's version number is incremental.
  _3download.prototype.validatePackage= function(results){
    if(results.length == 0) return Q.fcall(function () {
         throw new Error( "We could not find the package " + app.name + " from " + app.username );
     });
    packageInfo = results[0]
    return packageInfo
  }

  //
  // Parms: 
  // Returns: Promise
  // Desc: Uploads the Package tar.gz file to 3VOT Distibuted File Server
  _3download.prototype.downloadPackage= function (packageInfo){
    console.info("Downloading Package to 3VOT App Store".yellow)
    var deferred = Q.defer();
    var s3 = new Aws.S3();
    
    var params = {Bucket: 'source.3vot.com', Key: app.username + '/' + app.name  + "_" +  packageInfo.attributes.version  + '.3vot' };
    
    var stream = s3.getObject(params).createReadStream().pipe(zlib.createGunzip() ).pipe( tar.Extract( Path.join( process.cwd(), 'apps'  ) ) );
    
    stream.on("error", function(error){ deferred.reject(error) })
    
    stream.on("end", function(){ 
      console.info("Adjusting the package.json for your Profile".yellow)
      
      var pck = require( Path.join( process.cwd(), "apps", app.name, "package.json" )  );
      var _3vot = require( Path.join( process.cwd(), "3vot.json" )  )
      pck.profile = _3vot.profile;
      fs.writeFile( Path.join( process.cwd(), "apps", app.name, "package.json" ), JSON.stringify(pck,null,'\t') , function(){
        deferred.resolve();
      });
      
    });

    return deferred.promise;
  }

  return _3download;
})();

module.exports = _3download;