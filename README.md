# events-bluebird

[![Build Status](https://travis-ci.org/fogine/events-bluebird.svg?branch=master)](https://travis-ci.org/fogine/events-bluebird)  [![Test Coverage](https://codeclimate.com/github/fogine/events-bluebird/badges/coverage.svg)](https://codeclimate.com/github/fogine/events-bluebird/coverage)  

This is a lightweight wrapper for native [node events](https://github.com/nodejs/node/blob/master/lib/events.js).  
Adds `EventEmitter.prototype.emitAsyncSeries` & `EventEmitter.prototype.emitAsyncParallel` methods. The API reflects native `EventEmitter` API with the following necessary changes:  
* Added methods returns a Promise object which when fulfilled, returns `true` if the event had listeners, `false` otherwise
* node's deprecated [domain](https://nodejs.org/api/domain.html) feature is not supported

Installation
----------------------
`npm install events-bluebird`  


Tests
-------------------

`npm test`
