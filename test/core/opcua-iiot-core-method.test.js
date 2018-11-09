/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

jest.setTimeout(5000)

describe('OPC UA Core Method', function () {
  let coreMethod = require('../../src/core/opcua-iiot-core-method')

  describe('getArgumentDefinition', function () {
    it('should return Error object, if none value is present', function (done) {
      coreMethod.getArgumentDefinition(null, null).catch(function (err) {
        expect(err.message).toBe('Method Argument Definition Session Not Valid')
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreMethod.getArgumentDefinition(null, null).catch(function (err) {
        expect(err.message).toBe('Method Argument Definition Session Not Valid')
        done()
      })).toBeInstanceOf(Promise)
    })
  })

  describe('callMethods', function () {
    it('should be truthy on wrong message missing all', function (done) {
      expect(coreMethod.invalidMessage({bianco: {iiot: {handleMethodWarn: (text) => {}}}}, {})).toBeTruthy()
      done()
    })

    it('should be truthy on wrong message missing methodId, inputArguments, methodType', function (done) {
      expect(coreMethod.invalidMessage({bianco: {iiot: {handleMethodWarn: (text) => {}}}}, {objectId: 1})).toBeTruthy()
      done()
    })

    it('should be truthy on wrong message missing inputArguments, methodType', function (done) {
      expect(coreMethod.invalidMessage({bianco: {iiot: {handleMethodWarn: (text) => {}}}}, {objectId: 1, methodId: 1})).toBeTruthy()
      done()
    })

    it('should be truthy on wrong message missing methodType', function (done) {
      expect(coreMethod.invalidMessage({bianco: {iiot: {handleMethodWarn: (text) => {}}}}, {objectId: 1, methodId: 1, inputArguments: {}})).toBeTruthy()
      done()
    })

    it('should be false on filled message', function (done) {
      expect(coreMethod.invalidMessage({bianco: {iiot: {handleMethodWarn: (text) => {}}}}, {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1})).toBeFalsy()
      done()
    })

    it('should fill new message', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {objectId: 2, methodId: 2, inputArguments: {}, methodType: 2} }
      const msgResult = {objectId: 2, methodId: 2, inputArguments: {}, methodType: 2, nodetype: 'method', payload: {objectId: 2, methodId: 2, inputArguments: {}, methodType: 2}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should fill new message without objectId', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {methodId: 2, inputArguments: {}, methodType: 2} }
      const msgResult = {objectId: 1, methodId: 2, inputArguments: {}, methodType: 2, nodetype: 'method', payload: {methodId: 2, inputArguments: {}, methodType: 2}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should fill new message without objectId, methodId', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {inputArguments: {}, methodType: 2} }
      const msgResult = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 2, nodetype: 'method', payload: {inputArguments: {}, methodType: 2}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should fill new message without objectId, methodId, inputArguments', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {methodType: 2} }
      const msgResult = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 2, nodetype: 'method', payload: {methodType: 2}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should fill new message without parameters', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {} }
      const msgResult = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, nodetype: 'method', payload: {}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should return Error object, if none value is present', function (done) {
      coreMethod.callMethods(null, null).catch(function (err) {
        expect(err.message).toBe('Methods Call Session Not Valid')
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreMethod.callMethods(null, null).catch(function (err) {
        expect(err.message).toBe('Methods Call Session Not Valid')
        done()
      })).toBeInstanceOf(Promise)
    })
  })

  describe('buildMessagesFromMethodCalls', function () {
    it('should return Error object, if none value is present', function (done) {
      coreMethod.buildMessagesFromMethodCalls(null).catch(function (err) {
        expect(err.message).toBe('Methods Call Results To Messages Session Not Valid')
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreMethod.buildMessagesFromMethodCalls(null).catch(function (err) {
        expect(err.message).toBe('Methods Call Results To Messages Session Not Valid')
        done()
      })).toBeInstanceOf(Promise)
    })
  })
})
