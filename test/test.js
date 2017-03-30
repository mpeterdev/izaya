var assert = require('assert');
var should = require('should');
var izaya  = require('../izaya.js');
var MongoClient = require('mongodb').MongoClient;

var collection = 'test';
var dbURL = 'mongodb://127.0.0.1:27017/izaya';

describe('Izaya', () => {
	izaya.init({
		collection : 'test',
		url : dbURL
	});

	describe('#info()', () => {
		it('should be a function', () => {
			// should(izaya.info).be.a.Function();
			should.exist(izaya.info);
			izaya.info.should.be.a.Function();
		});
		it('should write an object with log level of info', (done) => {
			izaya.info({message : 'test info insert'}, function(err, result){
				should.not.exist(err);
				assert.equal(1, result.insertedCount);
				assert.equal('info', result.ops[0].level);
				done();
			});
		});
		it('should only allow string, object, and array log content', () => {
			izaya.info('test string', (err, result) => {
				should.not.exist(err);
			});
			izaya.info({message : 'test object'}, (err, result) => {
				should.not.exist(err);
			});
			izaya.info([{message : 'test array object 1'}, {message : 'test array object 2'}], (err, result) => {
				should.not.exist(err);
			});
			izaya.info(42, (err, result) => {
				should.exist(err);
			});
		});
	});
	describe('#warn()', () => {
		it('should write an object with log level of warn', (done) => {
			izaya.warn({message : 'test warn insert'}, function(err, result){
				should.not.exist(err);
				assert.equal(1, result.insertedCount);
				assert.equal('warn', result.ops[0].level);
				done();
			});
		});
	});
	describe('#error()', () => {
		it('should write an object with log level of error', (done) => {
			izaya.error({message : 'test error insert'}, function(err, result){
				should.not.exist(err);
				assert.equal(1, result.insertedCount);
				assert.equal('error', result.ops[0].level);
				done();
			});
		});
	});
	describe('#addCollection()', () => {
		it('should create a set of default log level functions under a given namespace', () => {
			izaya.addCollection('secondary', 'testSecondary');
			should.exist(izaya.secondary);
			izaya.secondary.should.be.an.Object();
			izaya.secondary.should.have.property('info').which.is.a.Function();
			izaya.secondary.should.have.property('warn').which.is.a.Function();
			izaya.secondary.should.have.property('error').which.is.a.Function();
		});
		it('should write to a secondary collection', (done) => {
			var time = new Date().getTime();
			izaya.secondary.info({time : time}, (err, result) => {
				should.not.exist(err);
				result.should.be.an.Object();
				result.should.have.the.property('insertedCount').which.is.exactly(1);
				MongoClient.connect(dbURL, (err, db) => {
					should.not.exist(err);
					should.exist(db);
					var secondCollection = db.collection('testSecondary');
					secondCollection.findOne({content : {time : time}}, {}, (err, doc) => {
						should.not.exist(err);
						should.exist(doc);
						doc.should.be.an.Object().with.property('content').with.property('time').which.is.exactly(time);
						done();
					});
				});
			});
		});
		it('should not be able to overwrite the default config', () => {
			should(()=>{izaya.addCollection('default', 'foo');}).throw('Cannot use "default" namespace as it would override base config options');
		});
	});
});
