var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var _ = require('underscore');

var logLevels = ['info', 'warn', 'error'];

var dbConfigs = {};
var mongoURL;

exports.init = function(config){
	assert(config.collection);
	assert(config.url, 'No URL provided');
	assert(!config.cappedMax || config.cappedSize, "Must specify a cappedSize for capped collections");
	dbConfigs.default = {
		collection : config.collection || 'logs',
		capSize    : config.cappedSize,
		capMax     : config.cappedMax
	};
	mongoURL = config.url;
};

_.each(logLevels, (level) => {
	exports[level] = _.partial(logAtLevel, null, level);
});

exports.addCollection = function(namespace, additionalCollection, config){
	assert(additionalCollection, 'Collection name must be provided');
	assert(!exports[namespace], 'Namespace is already in use');
	assert.notEqual('default', namespace, 'Cannot use "default" namespace as it would override base config options');
	exports[namespace] = _.reduce(logLevels, (memo, level) => {
		memo[level] = _.partial(logAtLevel, namespace, level);
	}, {});

	dbConfigs[namespace] = _.defaults(config, {collection: additionalCollection}, dbConfigs.default);

};

/**
 * Execute creation of log(s) with the provided log level
 * @param  {String}        level    Log level
 * @param  {Array|Object}  content  Object(s) with content for logs
 * @param  {Function}      callback
 * @return void
 */
function logAtLevel(logSet, level, content, callback){
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
	});

	connectAndFetch(logSet, (err, db, logCollection) => {
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
function connectAndFetch(logSet, callback){
	MongoClient.connect(mongoURL, function(err, db) {
		if (err){
			callback(err);
			return;
		}

		var fetchConfig = logSet ? dbConfigs[logSet] : dbConfigs.default;

		// capped collections require an explicit createCollection call, so we always
		// send a creation request, and it will simply fetch the collection if it
		// already exists
		var collection = db.createCollection(fetchConfig.collection, {
			capped : fetchConfig.capSize ? true : false,
			size   : fetchConfig.capSize,
			max    : fetchConfig.capMax
		}, (err, collection) => {
			if (err){
				callback(err);
				return;
			}
			callback(null, db, collection);

		});
	});
}
