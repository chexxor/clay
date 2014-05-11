require('coffee-script/register')
rimraf = require("rimraf");
var Path = require("path")
var fs = require("fs")
var Q = require("q");

var argv = require('optimist').argv;


_3Model = require("3vot-model")
_3Model.Model.host = "http://localhost:3002/v1"
//_3Model.Model.host = "http://threevot-api.herokuapp.com/v1"


var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');

// First, you need to instantiate a Mocha instance.
var mocha = new Mocha;

// Then, you need to use the method "addFile" on the mocha
// object for each file.

var request = require("superagent")

/*
request.get(_3Model.Model.host + "/prepare_test").end(function(err, res){
  if(err) return console.log("Error" + err )
  if(res.status > 250) return console.log(res.body)
  if( !res.body.security ) return executeTest("all")
  process.env.public_dev_key = res.body.security.public_dev_key
  executeTest( getTestName() )
})
*/

function createDir(){
	rimraf(Path.join( process.cwd(), "3vot_test" ), function(){
		
		try{
 			fs.mkdirSync( Path.join( process.cwd(), '3vot_test' ));
		}
		catch(e){
		
		}
	  var projectPath = Path.join( process.cwd() , '3vot_test' );
	  process.chdir( projectPath );
	
		executeTest( getTestName() )
		
	})
  

}

function executeTest(name){
	
 	if(name == "all" || name == "prepare") mocha.addFile('../tests/prepare_spec.coffee')
//  if(name == "all" || name == "profile spec") mocha.addFile('./tests/integration/action_profile_setup_spec.coffee');
//  if(name == "all" || name == "app") mocha.addFile('./tests/integration/action_app_spec.coffee');
//  if(name == "all" || name == "store") mocha.addFile('./tests/integration/action_store_spec.coffee');

  // Now, you can run the tests.
  mocha.run(function(failures){
    process.on('exit', function () {
      process.exit(failures);
    });
  });
}

function getTestName(){
  if(argv.prepare) return "prepare"
  
  return "all"
}

createDir()
