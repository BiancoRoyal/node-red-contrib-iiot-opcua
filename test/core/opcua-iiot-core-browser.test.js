/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

jest.setTimeout(5000)

describe('OPC UA Core Browser', function () {
  let coreBrowser = require('../../src/core/opcua-iiot-core-browser')
  const events = require('events')

  describe('Core Browser unit test', function () {
    it('should return the objects root nodeId', function (done) {
      expect(coreBrowser.browseToRoot()).toBe(coreBrowser.core.OBJECTS_ROOT)
      done()
    })

    it('should return the default objects nodeId without root in payload request', function (done) {
      expect(coreBrowser.extractNodeIdFromTopic({payload: { }}, {})).toBe(null)
      done()
    })

    it('should return the default objects nodeId with empty root in payload request', function (done) {
      expect(coreBrowser.extractNodeIdFromTopic({payload: { actiontype: 'browse', root: {} }}, {})).toBe(coreBrowser.core.OBJECTS_ROOT)
      done()
    })

    it('should return the nodeId from root in payload request', function (done) {
      expect(coreBrowser.extractNodeIdFromTopic({payload: { actiontype: 'browse', root: { nodeId: 'ns=1;s=MyDemo' } }}, {})).toBe('ns=1;s=MyDemo')
      done()
    })

    it('should handle browse error', function (done) {
      let statusText = 'idle'
      let node = {
        showErrors: true,
        showStatusActivities: true,
        statusText: statusText,
        status: (state) => { statusText = state.text },
        error: (err, msg) => { coreBrowser.internalDebugLog(err.message) }
      }
      coreBrowser.browseErrorHandling(node, new Error('Error'), { payload: {} }, [])
      expect(statusText).toBe('error')
      done()
    })

    it('should return JSON from transformToEntry call', function (done) {
      expect(coreBrowser.transformToEntry({})).toBeDefined()
      done()
    })

    it('should return reference strings from transformToEntry call', function (done) {
      expect(coreBrowser.transformToEntry({
        referenceTypeId: { toString: () => { return '1234' } },
        isForward: true,
        nodeId: { toString: () => { return 'ns=1;s=MyDemo' } },
        browseName: { toString: () => { return '1:MyDemo' } },
        displayName: { toString: () => { return 'MyDemo' } },
        nodeClass: { toString: () => { return 'Object' } },
        typeDefinition: { toString: () => { return 'ns=1;i=68' } }
      })).toEqual({
        referenceTypeId: '1234',
        isForward: true,
        nodeId: 'ns=1;s=MyDemo',
        browseName: '1:MyDemo',
        displayName: 'MyDemo',
        nodeClass: 'Object',
        typeDefinition: 'ns=1;i=68'
      })
      done()
    })
  })
})
