var assert = require("assert")
var should = require("should")
var Parse = require('parse').Parse;
var Path = require("path");
var rimraf = require("rimraf");
var http = require("http")

Parse.initialize( "IOcg1R4TxCDCPVsxAwLHkz8MPSOJfj2lZwdL4BU4", "jOr74Zy7C8VbatIvxoNyt2c03B9hPY7Hc32byA78" );

var fs = require("fs")
var _3setup = require("../src/3setup")
var _3download = require("../src/3download")
var _3dev = require("../src/3dev")
var _3install = require("../src/3install")

var Path = require("path")

describe('3VOT Setup', function(){
  
  before(function remove(done){
    rimraf(  Path.join( process.cwd(), "3vot_cli_test" ) , function(err){
      done();
    })
  })

  it('should scaffold files and install npm modules', function(done){

    this.timeout(90000);
    
    var options= { key: "0" };
    var folderName = "3vot_cli_test";
    
    _3setup.setup( options )
    .then( function(){

      try{  

        var _3vot = fs.readFileSync( Path.join( process.cwd() , "3vot.json"), "utf-8");

        var pck = fs.statSync( Path.join( process.cwd(), "package.json"));
        var gitIgnore = fs.statSync( Path.join( process.cwd(), ".gitignore"));

        var apps = fs.statSync( Path.join( process.cwd(), "apps"));

        var deps = fs.statSync( Path.join( process.cwd(), "apps" , "dependencies"));

        var tmp = fs.statSync( Path.join( process.cwd(), "tmp"));

        var node_modules = fs.statSync( Path.join( process.cwd(), "node_modules"));

        _3vot = JSON.parse(_3vot);
        _3vot.key.should.equal("0");
        _3vot.profile.should.equal("cli_test");

        pck.isFile().should.equal(true);

        gitIgnore.isFile().should.equal(true);

        apps.isDirectory().should.equal(true);
        deps.isDirectory().should.equal(true);
        tmp.isDirectory().should.equal(true);

        node_modules.isDirectory().should.equal(true);
        
        done();

      }
      catch(err){
        console.log(err);
      }
      
    })
    .fail( function(err){ throw err }  )

  });
  
  
});  