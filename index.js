"use strict";

var events = require('events');
var Promise = require('bluebird');


module.exports = EventEmitter;
EventEmitter.EventEmitter = EventEmitter;

/**
 * @constructor
 */
function EventEmitter() {
    events.EventEmitter.call(this);
}

EventEmitter.prototype = Object.create(events.EventEmitter.prototype);
EventEmitter.prototype.constructor = EventEmitter;


/**
 * @param {String} type
 * @param {...mixed} [args]
 * @return {Promise<boolean>}
 */
EventEmitter.prototype.emitAsyncParallel = Promise.method(function() {
    var len = arguments.length + 1;
    var args = new Array(len + 1);
    args[0] = 'map';

    for (var i = 0, len = len; i < len; i++) {
        args[i + 1] = arguments[i];
    }

    return emit.apply(this, args);
});

/**
 * @param {String} type
 * @param {...mixed} [args]
 * @return {Promise<boolean>}
 */
EventEmitter.prototype.emitAsync = Promise.method(function() {
    var len = arguments.length + 1;
    var args = new Array(len);
    args[0] = 'each';

    for (var i = 0, len = len; i < len; i++) {
        args[i + 1] = arguments[i];
    }

    return emit.apply(this, args);
});
EventEmitter.prototype.emitAsyncSeries = EventEmitter.prototype.emitAsync;

/**
 * @param {String} method - execution method either 'each' or 'map'
 * @param {String} type - event type
 * @param {...mixed} [args]
 * @return {Promise<boolean>}
 */
function emit(method, type) {
    var er, handler, len, args, i, events, promise, self;
    var doError = (type === 'error');

    self = this;
    events = this._events;
    if (events)
        doError = (doError && events.error == null);
    else if (!doError) {
        return false;
    }

    // If there is no 'error' event listener then throw.
    if (doError) {
        if (arguments.length > 2)
            er = arguments[2];
        if (er instanceof Error) {
            throw er; // Unhandled 'error' event
        } else {
            // At least give some kind of context to the user
            var err = new Error('Unhandled "error" event. (' + er + ')');
            err.context = er;
            throw err;
        }
    }

    handler = events[type];

    if (!handler)
        return false;

    var isFn = typeof handler === 'function';
    var promiseCandidate = null;

    len = arguments.length;
    args = new Array(len - 2);
    for (i = 2; i < len; i++)
        args[i - 2] = arguments[i];

    if (isFn)
        promiseCandidate = handler.apply(this, args);
    else {
        var listeners = arrayClone(handler, handler.length);
        promiseCandidate = Promise[method](listeners, function(handler) {
            return handler.apply(self, args);
        });
    }

    if (promiseCandidate && typeof promiseCandidate.then === 'function') {
        return promiseCandidate.then(function() {
            return true;
        });
    } else {
        return Promise.resolve(true);
    }
}

function arrayClone(arr, n) {
    var copy = new Array(n);
    for (var i = 0; i < n; ++i)
        copy[i] = arr[i];
    return copy;
}
