var fs = require('fs');
var Path = require("path")
var archiver = require('archiver');
var request = require("superagent")
var fs = require("fs")
var Q = require("q")
var WalkDir = require("3vot-cloud/utils/walk")
var Transform = require("../utils/transform")
var Log = require("3vot-cloud/utils/log")

var zipPath

var promptOptions = {
	app_name: null,
	session: null,
	version: null
}

var tempVars = {}

function execute(options, vars){
	Log.debug("Uploading Static Assets", "actions/salesforce/staticUpload", 22)
  var deferred = Q.defer();
  promptOptions = options;
  tempVars = vars;

  zipPath = Path.join(process.cwd(), "tmp", promptOptions.package.name + ".zip" )

  transform();

  packApp()
  .then( upload )
  .then( deferred.resolve )
  .fail( deferred.reject );

  return deferred.promise;
}

function transform(){
	var apps = WalkDir( Path.join( process.cwd(), promptOptions.package.threevot.distFolder ) );

  apps.forEach( function(path){
  	var body = ""
  	if(path.name == "3vot.js" ) body = Transform.readByType(path.path, "_3vot", {});
  	else body = Transform.readByType(path.path, "sf", promptOptions);
     
    fs.writeFileSync(path.path,body);
	});
}

function packApp(){
	var deffered = Q.defer();
	
	fs.mkdir( Path.dirname(zipPath), function(err){
		var output = fs.createWriteStream(zipPath);
		var archive = archiver('zip');

		output.on('close', function() {
			return deffered.resolve()
		});

		archive.on('error', function(err) {
		  return deffered.reject(err);
		})

		archive.pipe(output);

		archive.bulk([
		  { expand: true, cwd: promptOptions.package.threevot.distFolder, src: ['*.*','**','**/**'] }
		]);

		archive.finalize();
	});

	return deffered.promise;
}

function upload(){

	var deffered = Q.defer();
	var zip = fs.readFileSync(zipPath);
	var zip64 =  new Buffer(zip).toString('base64');
	var url = tempVars.session.instance_url + '/services/data/v30.0/tooling/sobjects/StaticResource/'

	request.post(url)
	.set('Authorization', 'Bearer ' + tempVars.session.access_token)
	.set('Content-Type', 'application/json')
	.send({ 'Name': promptOptions.package.name + "_" + promptOptions.package.threevot.version , Body: zip64, ContentType: "application/zip", CacheControl: "Public"  })

	.end(function(err,res){
		if(err){
			return deffered.reject(err);
		}
		if(res.body.success) return deffered.resolve(res.body);
		return deffered.reject(JSON.stringify(res.body));
	});

	return deffered.promise;

}

module.exports = execute;