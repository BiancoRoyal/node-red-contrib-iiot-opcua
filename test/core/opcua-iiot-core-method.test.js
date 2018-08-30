/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

describe('OPC UA Core Method', function () {
  let assert = require('chai').assert
  let expect = require('chai').expect
  let coreMethod = require('../../src/core/opcua-iiot-core-method')

  describe('getArgumentDefinition', function () {
    it('should return Error object, if none value is present', function (done) {
      coreMethod.getArgumentDefinition(null, null).catch(function (err) {
        assert.equal('Method Argument Definition Session Not Valid', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreMethod.getArgumentDefinition(null, null).catch(function (err) {
        assert.equal('Method Argument Definition Session Not Valid', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('callMethods', function () {
    it('should return Error object, if none value is present', function (done) {
      coreMethod.callMethods(null, null).catch(function (err) {
        assert.equal('Methods Call Session Not Valid', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreMethod.callMethods(null, null).catch(function (err) {
        assert.equal('Methods Call Session Not Valid', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('buildMessagesFromMethodCalls', function () {
    it('should return Error object, if none value is present', function (done) {
      coreMethod.buildMessagesFromMethodCalls(null).catch(function (err) {
        assert.equal('Methods Call Results To Messages Session Not Valid', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreMethod.buildMessagesFromMethodCalls(null).catch(function (err) {
        assert.equal('Methods Call Results To Messages Session Not Valid', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })
})
