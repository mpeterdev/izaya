var assert = require('assert');
var izaya = require('../izaya.js');

var collection = 'test';

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

describe('Izaya', ()=>{
	describe('#info()', ()=>{
		it('should write an object with logLevel of info', (done)=>{
			izaya.init({
				collectionName : 'test',
				url : 'mongodb://192.168.1.21:27017/izaya'
			});

			izaya.info({message : 'test info insert'}, function(err, result){
				assert.equal(null, err);
				assert.equal(1, result.insertedCount);
				assert.equal('info', result.ops[0].level);
				done();
			});
		});
	});
	describe('#warn()', ()=>{
		it('should write an object with logLevel of info', (done)=>{
			izaya.init({
				collectionName : 'test',
				url : 'mongodb://192.168.1.21:27017/izaya'
			});

			izaya.warn({message : 'test warn insert'}, function(err, result){
				assert.equal(null, err);
				assert.equal(1, result.insertedCount);
				assert.equal('warn', result.ops[0].level);
				done();
			});
		});
	});
	describe('#error()', ()=>{
		it('should write an object with logLevel of info', (done)=>{
			izaya.init({
				collectionName : 'test',
				url : 'mongodb://192.168.1.21:27017/izaya'
			});

			izaya.error({message : 'test error insert'}, function(err, result){
				assert.equal(null, err);
				assert.equal(1, result.insertedCount);
				assert.equal('error', result.ops[0].level);
				done();
			});
		});
	});
});
