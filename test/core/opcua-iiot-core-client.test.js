/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

describe('OPC UA Core Client', function () {
  let assert = require('chai').assert
  let expect = require('chai').expect
  let coreClient = require('../../src/core/opcua-iiot-core-client')

  describe('write', function () {
    it('should return Error object, if none value is present', function (done) {
      coreClient.write(null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Write', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreClient.write(null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Write', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('read', function () {
    it('should return Error object, if none value is present', function (done) {
      coreClient.read(null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Read', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreClient.read(null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Read', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('readVariableValue', function () {
    it('should return Error object, if none value is present', function (done) {
      coreClient.readVariableValue(null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Read Variable Value', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreClient.readVariableValue(null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Read Variable Value', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('readHistoryValue', function () {
    it('should return Error object, if none value is present', function (done) {
      coreClient.readHistoryValue(null, null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Read History Value', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreClient.readHistoryValue(null, null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Read History Value', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('readAllAttributes', function () {
    it('should return Error object, if none value is present', function (done) {
      coreClient.readAllAttributes(null, null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Read All Attributes', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreClient.readAllAttributes(null, null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Read All Attributes', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('basic functions', function () {
    it('should stringify formattedt', function (done) {
      let objectData = {test: 'test', testFolder: {name: ''}}
      let sut = coreClient.stringifyFormatted(objectData)
      assert.equal(sut, JSON.stringify(objectData, null, 2))
      done()
    })
  })
})
