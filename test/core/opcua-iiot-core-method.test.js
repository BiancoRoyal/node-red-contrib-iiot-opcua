/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

jest.setTimeout(5000)

describe('OPC UA Core Method', function () {
  let {default: coreMethod} = require('../../src/core/opcua-iiot-core-method')

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
      expect(coreMethod.invalidMessage({iiot: {}}, {payload: {}}, (text) => {})).toBeTruthy()
      done()
    })

    it('should be truthy on wrong message missing methodId, inputArguments, methodType', function (done) {
      expect(coreMethod.invalidMessage({iiot: {}}, {payload: {objectId: 1}}, (text) => {})).toBeTruthy()
      done()
    })

    it('should be truthy on wrong message missing inputArguments, methodType', function (done) {
      expect(coreMethod.invalidMessage({iiot: {}}, {payload: {objectId: 1, methodId: 1}}, (text) => {})).toBeTruthy()
      done()
    })

    it('should be truthy on wrong message missing methodType', function (done) {
      expect(coreMethod.invalidMessage({iiot: {}}, {payload: {objectId: 1, methodId: 1, inputArguments: {}}}, (text) => {})).toBeTruthy()
      done()
    })

    it('should be false on filled message', function (done) {
      expect(coreMethod.invalidMessage({iiot: {}}, {payload: {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1}}, (text) => {})).toBeFalsy()
      done()
    })

    it('should fill new message', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {objectId: 2, methodId: 2, inputArguments: {}, methodType: 2} }
      const msgResult = {payload: {objectId: 2, methodId: 2, inputArguments: {}, methodType: 2, nodetype: 'method'}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should fill new message without objectId', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {methodId: 2, inputArguments: {}, methodType: 2} }
      const msgResult = {payload: {methodId: 2, inputArguments: {}, methodType: 2, nodetype: 'method', objectId: 1}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should fill new message without objectId, methodId', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {inputArguments: {}, methodType: 2} }
      const msgResult = {payload: {inputArguments: {}, methodType: 2, nodetype: 'method', objectId: 1, methodId: 1}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should fill new message without objectId, methodId, inputArguments', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {methodType: 2} }
      const msgResult = {payload: {methodType: 2, nodetype: 'method', objectId: 1, methodId: 1, inputArguments: {}}}
      expect(coreMethod.buildCallMessage(node, msg)).toEqual(msgResult)
      done()
    })

    it('should fill new message without parameters', function (done) {
      const node = {objectId: 1, methodId: 1, inputArguments: {}, methodType: 1, handleMethodWarn: (text) => {}}
      const msg = { payload: {} }
      const msgResult = {payload: {nodetype: 'method', objectId: 1, methodId: 1, inputArguments: {}, methodType: 1}}
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
