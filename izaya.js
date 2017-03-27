var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var _ = require('underscore');

var collectionName;
var mongoURL;
var capSize;
var capMax;

exports.init = function(config){
	assert(config.collectionName);
	assert(config.url, 'No URL provided');
	assert(!config.cappedMax || config.cappedSize, "Must specify a cappedSize for capped collections");
	collectionName = config.collectionName || 'logs';
	mongoURL       = config.url;
	capSize        = config.cappedSize;
	capMax         = config.cappedMax;
}

exports.info  = _.partial(logAtLevel, 'info');
exports.warn  = _.partial(logAtLevel, 'warn');
exports.error = _.partial(logAtLevel, 'error');

function logAtLevel(level, content, callback){
	// convert single doc to an array so that we can always use insertMany
	if (!_.isArray(content)){
		content = [content];
	}

	var created = new Date().toISOString();

	// add metadata to each log
	var logItems = _.map(content, (obj) => {
		return {
			created : created,
			level   : level,
			content : obj
		};
	})

	connectAndFetch((err, db, logCollection) => {
		if (err){
			callback(err);
			return;
		}

		logCollection.insertMany(logItems, (err, result) => {
			db.close();
			callback(err, result);
		});
	});
}

/**
* Connect to the database and retrieve the log collection
* @param  {Function} callback Function with err, db, and collection params. The
*                             db is passed back so that it can be closed later
* @return void
*/
function connectAndFetch(callback){
	MongoClient.connect(mongoURL, function(err, db) {
		if (err){
			callback(err);
			return;
		}
		var collection = db.createCollection(collectionName, {
			capped : capSize ? true : false,
			size : capSize,
			max : capMax
		}, (err, collection) => {
			if (err){
				callback(err);
				return;
			}
			callback(null, db, collection);

		});
		// callback(null, db, collection);
	});
}
