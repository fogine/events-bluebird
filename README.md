# events-bluebird

[![Build Status](https://travis-ci.org/fogine/events-bluebird.svg?branch=master)](https://travis-ci.org/fogine/events-bluebird)  [![Test Coverage](https://codeclimate.com/github/fogine/events-bluebird/badges/coverage.svg)](https://codeclimate.com/github/fogine/events-bluebird/coverage)  

This is a lightweight wrapper for native [node events](https://github.com/nodejs/node/blob/master/lib/events.js).  
Adds `EventEmitter.prototype.emitAsyncSeries` & `EventEmitter.prototype.emitAsyncParallel` methods. The API reflects native `EventEmitter` API with the following necessary changes:  
* Added methods return a Promise object which when fulfilled, returns `true` if the event had listeners, `false` otherwise
* node's deprecated [domain](https://nodejs.org/api/domain.html) feature is not supported

Installation
----------------------
`npm install events-bluebird`  

Example
---------------------
```javascript

var EventEmitter = require('events-bluebird').EventEmitter;

var emitter = new EventEmitter;

emitter.on('event', function(param) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            console.log('first');
            return resolve();
        }, 500);
    });
});

emitter.on('event', function(param) {
    console.log('later');
});

emitter.emitAsyncSeries('event', 'param').then(function(hadListeners) {
    console.log(hadListeners);//true
});

// Output:
// first
// later
// true
```


Tests
-------------------

`npm test`
