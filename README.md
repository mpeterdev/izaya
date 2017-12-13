# Izaya

A logging library which writes to a mongoDB instance

## Getting Started

#### Setup

Require the library and initialize it. The most basic setup takes only a MongoDB connection string as described [here](https://docs.mongodb.com/manual/reference/connection-string/)
```javascript
var Log = require('izaya');

Log.init({
	url        : 'http://localhost:27017/MyDatabase'
});
```

This will cause a collection by the default name of `logs` to be created the first time a write is performed.

#### Writing logs

There multiple logging functions available right off the bat, and more can be added dynamically. The most basic log content which can be provided is a string. An informative log might take advantage of the standard log level `info`
```javascript
Log.info('something normal happened');
```
while we have the escalated `warn` and `error` levels for less acceptable behavior
```javascript
Log.warn('something concerning happened');
Log.error('something bad happened');
```

<!-- ## Functions

### init
#### parameters
- `collection` The name for the MongoDB collection to which the default functions write
- `capSize` Create the default collection as as a [MongoDB Capped Collection](https://docs.mongodb.com/manual/core/capped-collections/) which will not exceed this size (provided in bytes). A normal collection cannot be converted to a capped collection, and vice versa, so the collection must not already exist in the database for this parameter to have an effect -->

## Changelog

### 0.0.2
- changed `created` metadata field to a true date object so it can be queried


## This documentation is still in progress...
