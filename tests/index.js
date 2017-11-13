var sinon          = require('sinon');
var chai           = require('chai');
var sinonChai      = require("sinon-chai");
var chaiAsPromised = require('chai-as-promised');
var Promise        = require('bluebird');

var EventEmitter = require('../index.js');

var expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

describe('EventEmitter', function() {
    beforeEach(function() {
        this.emitter = new EventEmitter();
    });

    it('should bind `emitAsync` alias to the `emitAsyncSeries` method', function() {
        this.emitter.emitAsync.should.be.equal(this.emitter.emitAsyncSeries);
    });

    ['emitAsyncSeries', 'emitAsyncParallel'].forEach(function(method) {
        describe(`${method}`, function() {

            before(function() {
                var promiseMethod = null;
                if (method === 'emitAsyncSeries') {
                    promiseMethod = 'each';
                } else {
                    promiseMethod = 'map';
                }
                this.methodSpy = sinon.spy(Promise, promiseMethod);

            });

            after(function() {
                this.methodSpy.restore();
            });

            it('should return resolved promise with false boolean value', function() {

                return this.emitter[method]('event').should.become(false);
            });

            it('should return resolved promise with true boolean value', function() {
                this.emitter.on('event', sinon.spy());

                return this.emitter[method]('event').should.become(true);
            });

            it('should return resolved promise with true boolean value (2)', function() {
                this.emitter.on('event', function() {
                    return new Promise(function(resolve) {
                        setTimeout(resolve, 50);
                    });
                });

                return this.emitter[method]('event').should.become(true);
            });

            it('should execute registered listeners in series in order they were registered.', function() {
                var self = this;

                var resolveSpy1 = sinon.spy(function resolveSpy1(fn){
                    return fn();
                });
                var resolveSpy3 = sinon.spy(function resolveSpy3(fn) {
                    return fn();
                });

                var spy1 = sinon.spy(function() {
                    return new Promise(function(resolve) {
                        setTimeout(function() {
                            resolveSpy1(resolve);
                        }, 50);
                    });
                });
                var spy2 = sinon.spy();
                var spy3 = sinon.spy(function() {
                    return new Promise(function(resolve) {
                        setTimeout(function() {
                            resolveSpy3(resolve);
                        }, 10);
                    });
                });

                this.emitter.on('event', spy1);
                this.emitter.on('event', spy2);
                this.emitter.on('event', spy3);

                var args = [
                    'event',
                    {data: 'value'},
                    'data string',
                    true
                ];

                return this.emitter[method].apply(this.emitter, args)
                    .should.be.fulfilled.then(function() {
                        resolveSpy1.should.have.been.calledOnce;
                        resolveSpy3.should.have.been.calledOnce;
                        spy1.should.have.been.calledOnce;
                        spy2.should.have.been.calledOnce;
                        spy3.should.have.been.calledOnce;

                        self.methodSpy.should.have.been.calledOnce;

                        spy1.should.have.been.calledWith(args[1], args[2], args[3]);
                        spy2.should.have.been.calledWith(args[1], args[2], args[3]);
                        spy3.should.have.been.calledWith(args[1], args[2], args[3]);

                        if (method === 'emitAsyncSeries') {
                            resolveSpy1.should.have.been.calledBefore(resolveSpy3);
                        } else {
                            resolveSpy3.should.have.been.calledBefore(resolveSpy1);
                        }

                        spy1.should.have.been.calledBefore(spy2);
                        spy2.should.have.been.calledBefore(spy3);
                    });
            });

            it('should return resolved promise with false boolean value', function() {

                this.emitter._events = null;
                return this.emitter[method]('event').should.become(false);
            });

            it('should return rejected primse with an Error when the `error` event is asynchronously emitted but has no listeners', function() {

                var err = new Error;
                return this.emitter[method]('error', err).should.be.rejectedWith(err);
            });

            it('should return rejected primse with an Error when the `error` event is called with no arguments and asynchronously emitted but has no listeners', function() {
                return this.emitter[method]('error').should.be.rejectedWith(Error);
            });

            it('should call event listener with correct context (this) object if event has single listener', function() {
                var spy = sinon.spy();
                this.emitter.on('data', spy);

                return this.emitter[method]('data').bind(this).then(function() {
                    spy.should.have.been.calledOnce;
                    spy.should.have.been.always.calledOn(this.emitter);
                });
            });

            it('should call event listeners with correct context (this) object if event has multiple listeners', function() {
                var spy = sinon.spy();
                this.emitter.on('data', spy);
                this.emitter.on('data', sinon.spy());//we don't care about second spy

                return this.emitter[method]('data').bind(this).then(function() {
                    spy.should.have.been.calledOnce;
                    spy.should.have.been.always.calledOn(this.emitter);
                });
            });
        });
    });

});
