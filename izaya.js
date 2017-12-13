var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var _ = require('underscore');

var dbConfigs = {};
var mongoURL;

var logLevels = ['info', 'warn', 'error'];

_.each(logLevels, (level) => {
	exports[level] = _.partial(logAtLevel, null, level);
});

/**
 * Initialize this library to log to a default collection
 * @param  {Object} config Properties of the mongo collection to use for default
 *                         log functions
 * @return void
 */
exports.init = function(config){
	assert(config.url, 'No URL provided');
	assert(!config.cappedMax || config.cappedSize, "Must specify a cappedSize for capped collections");
	dbConfigs.default = {
		collection : config.collection || 'logs',
		capSize    : config.cappedSize,
		capMax     : config.cappedMax
	};
	mongoURL = config.url;
};

/**
 * Add a another namespace for logging to an additional collection
 * @param {String} namespace            extension of module name to place logging
 *                                      functions under
 * @param {String} additionalCollection name of new collection in database
 * @param {Object} config               configuration for collection
 * @param {Boolean} inherit             whether to inherit config properties
 *                                      from default
 * @return void
 */
exports.addCollection = function(namespace, additionalCollection, config, inherit){
	assert(additionalCollection, 'Collection name must be provided');
	assert(!exports[namespace], 'Namespace is already in use');
	assert.notEqual('default', namespace, 'Cannot use "default" namespace as it would override base config options');

	// build log level functions object and export
	exports[namespace] = _.reduce(logLevels, (memo, level) => {
		memo[level] = _.partial(logAtLevel, namespace, level);
		return memo;
	}, {});

	config = config || {};

	if (inherit){
		dbConfigs[namespace] = _.defaults(config, {collection: additionalCollection}, dbConfigs.default);
	} else {
		dbConfigs[namespace] = _.defaults(config, {collection: additionalCollection});
	}
};

/**
 * Execute creation of log(s) with the provided log level
 * @param  {String}        level    Log level
 * @param  {Array|Object}  content  Object(s) with content for logs
 * @param  {Function}      callback
 * @return void
 */
function logAtLevel(logSet, level, content, callback){
	if (!_.isString(content) && !_.isObject(content) && !_.isArray(content)){
		if (_.isFunction(callback)){
			callback(new Error('Log must be a string, object, or array of objects'));
		}
		return;
	}
	// convert string to document object
	if (_.isString(content)){
		content = {message : content};
	}
	// convert single doc to an array so that we can always use insertMany
	if (!_.isArray(content)){
		content = [content];
	}

	var created = new Date();

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
			if (_.isFunction(callback)){
				callback(err);
			}
			return;
		}

		logCollection.insertMany(logItems, (err, result) => {
			db.close();
			if (_.isFunction(callback)){
				callback(err, result);
			}
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
