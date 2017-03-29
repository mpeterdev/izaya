var assert = require('assert');
var should = require('should');
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
    it('should be a function', () => {
      // should(izaya.info).be.a.Function();
      assert(izaya.info);
      izaya.info.should.be.a.Function();
    });
		it('should write an object with logLevel of info', (done)=>{
			izaya.init({
				collection : 'test',
				url : 'mongodb://127.0.0.1:27017/izaya'
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
		it('should write an object with logLevel of warn', (done)=>{
			izaya.init({
				collection : 'test',
				url : 'mongodb://127.0.0.1:27017/izaya'
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
		it('should write an object with logLevel of error', (done)=>{
			izaya.init({
				collection : 'test',
				url : 'mongodb://127.0.0.1:27017/izaya'
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
