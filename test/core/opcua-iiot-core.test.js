/*
 The BSD 3-Clause License for none commercial use and Open Source Projects
 SLA with yearly Subscription for commercial use and Closed Source Projects - incl. Support see https://bianco-royal.space/supporter.html

 Copyright 2017,2018,2020,2021 - Klaus Landsdorf (https://bianco-royal.space/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

jest.setTimeout(5000)

describe('OPC UA Core', function () {
  let assert = require('chai').assert
  let expect = require('chai').expect
  let core = require('../../src/core/opcua-iiot-core')
  let isWindows = /^win/.test(core.os.platform())

  describe('get the name of a time unit', function () {
    it('should return the right string when the value is present', function (done) {
      assert.equal('msec.', core.getTimeUnitName('ms'))
      assert.equal('sec.', core.getTimeUnitName('s'))
      assert.equal('min.', core.getTimeUnitName('m'))
      assert.equal('h.', core.getTimeUnitName('h'))
      done()
    })

    it('should return nothing when the value is not present', function (done) {
      assert.equal('', core.getTimeUnitName('sec'))
      assert.equal('', core.getTimeUnitName('hour'))
      done()
    })
  })

  describe('calculate time in milliseconds by a time unit', function () {
    it('should return the right msec. transformation when the value is present', function (done) {
      assert.equal(1, core.calcMillisecondsByTimeAndUnit(1, 'ms'))
      done()
    })

    it('should return the right msec. transformation when the value is present', function (done) {
      assert.equal(1000, core.calcMillisecondsByTimeAndUnit(1, 's'))
      done()
    })

    it('should return the right msec. transformation when the value is present', function (done) {
      assert.equal(60000, core.calcMillisecondsByTimeAndUnit(1, 'm'))
      done()
    })

    it('should return the right msec. transformation when the value is present', function (done) {
      assert.equal(3600000, core.calcMillisecondsByTimeAndUnit(1, 'h'))
      done()
    })

    it('should return 10 sec. when the value is not present', function (done) {
      assert.equal(10000, core.calcMillisecondsByTimeAndUnit(1, 'hour'))
      done()
    })

    it('should return 10 sec. when the value is not present', function (done) {
      assert.equal(10000, core.calcMillisecondsByTimeAndUnit(1, 'msec.'))
      done()
    })
  })

  describe('core path functions', function () {
    it('should return the right string for the node-opcua path', function (done) {
      let path = require.resolve('node-opcua')

      if (isWindows) {
        path = path.replace('\\index.js', '')
      } else {
        path = path.replace('/index.js', '')
      }
      assert.equal(path, core.getNodeOPCUAPath())
      done()
    })

    it('should return the right string for the node-opcua-client path', function (done) {
      let path = require.resolve('node-opcua-client')

      if (isWindows) {
        path = path.replace('\\index.js', '')
      } else {
        path = path.replace('/index.js', '')
      }
      assert.equal(path, core.getNodeOPCUAClientPath())
      done()
    })

    it('should return the right string for the node-opcua-server path', function (done) {
      let path = require.resolve('node-opcua-server')

      if (isWindows) {
        path = path.replace('\\index.js', '')
      } else {
        path = path.replace('/index.js', '')
      }
      assert.equal(path, core.getNodeOPCUAServerPath())
      done()
    })
  })

  describe('core build functions', function () {
    it('should return the right string for the topic in message build', function (done) {
      let msg = core.buildBrowseMessage('TestTopic')
      assert.equal('TestTopic', msg.topic)
      done()
    })

    it('should return the right string for converting to Int32', function (done) {
      let result = core.toInt32(16)
      assert.equal(16, result)
      done()
    })

    it('should return the right namesapce zero from msg topic', function (done) {
      let result = core.parseNamspaceFromMsgTopic({payload: '', topic: 'ns=0;i=85'})
      assert.equal('0', result)
      done()
    })

    it('should return the right namesapce five from msg topic', function (done) {
      let result = core.parseNamspaceFromMsgTopic({payload: '', topic: 'ns=1;s=TestReadWrite'})
      assert.equal('1', result)
      done()
    })

    it('should return the right namesapce two from msg topic', function (done) {
      let result = core.parseNamspaceFromMsgTopic({payload: '', topic: 'ns=2;b=TestReadWrite'})
      assert.equal('2', result)
      done()
    })

    it('should return the right identifier zero from numeric msg topic', function (done) {
      let result = core.parseIdentifierFromMsgTopic({payload: '', topic: 'ns=0;i=85'})
      assert(result)
      let resultExpected = { identifier: 85, type: core.nodeOPCUAId.NodeIdType.NUMERIC }
      expect(result).to.deep.equal(resultExpected)
      done()
    })

    it('should return the right identifier five from string msg topic', function (done) {
      let result = core.parseIdentifierFromMsgTopic({payload: '', topic: 'ns=1;s=TestReadWrite'})
      assert(result)
      let resultExpected = { identifier: 'TestReadWrite', type: core.nodeOPCUAId.NodeIdType.STRING }
      expect(result).to.deep.equal(resultExpected)
      done()
    })

    it('should return the right identifier two from byte string msg topic', function (done) {
      let result = core.parseIdentifierFromMsgTopic({payload: '', topic: 'ns=2;b=M/RbkPCxe45TX=='})
      assert(result)
      let resultExpected = { identifier: 'M/RbkPCxe45TX==', type: core.nodeOPCUAId.NodeIdType.BYTESTRING }
      expect(result).to.deep.equal(resultExpected)
      done()
    })

    it('should return the right identifier two from GUID msg topic', function (done) {
      let result = core.parseIdentifierFromMsgTopic({payload: '', topic: 'ns=2;g=034595a-545i-5e456-64f4-ab345e456cb3'})
      assert(result)
      let resultExpected = { identifier: '034595a-545i-5e456-64f4-ab345e456cb3', type: core.nodeOPCUAId.NodeIdType.GUID }
      expect(result).to.deep.equal(resultExpected)
      done()
    })
  })

  describe('core helper functions', function () {
    it('should return true if message includes BadSession', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a BadSession Test!')), true)
      done()
    })

    it('should return false if message not includes BadSession', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a Test!')), false)
      done()
    })

    it('should return true if message includes some of BadSession', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a BadSession Test!')), true)
      done()
    })

    it('should return true if message includes some of Session', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a Session Test!')), true)
      done()
    })

    it('should return true if message includes some of Transaction', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a Transaction Test!')), true)
      done()
    })

    it('should return true if message includes some of Connection', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a Connection Test!')), true)
      done()
    })

    it('should return true if message includes some of timeout', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a timeout Test!')), true)
      done()
    })

    it('should return true if message not includes Invalid Channel', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a Invalid Channel Test!')), true)
      done()
    })

    it('should return false if message not includes Invalid Channel', function (done) {
      assert.equal(core.isSessionBad(new Error('That is a Test!')), false)
      done()
    })

    it('should return value of available memory', function (done) {
      expect(core.availableMemory()).is.greaterThan(0)
      done()
    })

    it('should return array of nodes to read', function (done) {
      expect(core.buildNodesToRead({payload: '', nodesToRead: ['ns=4;s=TestReadWrite']})).to.be.an('array').that.does.include('ns=4;s=TestReadWrite')
      done()
    })

    it('should return array of nodes to write', function (done) {
      expect(core.buildNodesToRead({payload: '', nodesToWrite: ['ns=4;s=TestReadWrite']})).to.be.an('array').that.does.include('ns=4;s=TestReadWrite')
      done()
    })

    it('should return array of nodes from addressSpaceItems', function (done) {
      expect(core.buildNodesToRead({payload: '', addressSpaceItems: [{name: '', nodeId: 'ns=4;s=TestReadWrite', datatypeName: ''}]})).to.be.an('array').that.does.include('ns=4;s=TestReadWrite')
      done()
    })

    it('should return array of nodes to read in payload', function (done) {
      expect(core.buildNodesToRead({ payload: { nodesToRead: ['ns=4;s=TestReadWrite'] } })).to.be.an('array').that.does.include('ns=4;s=TestReadWrite')
      done()
    })

    it('should return array of nodes to write in payload', function (done) {
      expect(core.buildNodesToRead({ payload: { nodesToWrite: ['ns=4;s=TestReadWrite'] } })).to.be.an('array').that.does.include('ns=4;s=TestReadWrite')
      done()
    })

    it('should return array of nodes in payload from addressSpaceItems', function (done) {
      expect(core.buildNodesToRead({ payload: { addressSpaceItems: [{ name: '', nodeId: 'ns=4;s=TestReadWrite', datatypeName: '' }] } })).to.be.an('array').that.does.include('ns=4;s=TestReadWrite')
      done()
    })

    it('should return array of nodes to listen from payload of addressSpaceItems', function (done) {
      let addressSapceItem = {name: '', nodeId: 'ns=4;s=TestReadWrite', datatypeName: ''}
      expect(core.buildNodesToListen({ addressSpaceItems: [addressSapceItem] })).to.be.an('array').that.does.include(addressSapceItem)
      done()
    })

    it('should return array of nodes to listen from payload of addressItemsToRead', function (done) {
      let addressSapceItem = {name: '', nodeId: 'ns=4;s=TestReadWrite', datatypeName: ''}
      expect(core.buildNodesToListen({ addressItemsToRead: [addressSapceItem] })).to.be.an('array').that.does.include(addressSapceItem)
      done()
    })

    it('should set node initial state init', function (done) {
      let node = {}
      core.setNodeStatusTo = function (node, state) {
        if (state === 'connecting') {
          done()
        }
      }
      core.setNodeInitalState('INITOPCUA', node)
    })

    it('should set node initial state open', function (done) {
      let node = {
        bianco: {
          iiot: {
            opcuaClient: null,
            opcuaSession: null
          }
        },
        connector: {
          bianco: {
            iiot: {
              opcuaClient: {},
              opcuaSession: {}
            }
          }
        }
      }
      core.setNodeStatusTo = function (node, state) {
        if (state === 'connected' && node.opcuaClient === node.connector.opcuaClient) {
          done()
        }
      }
      core.setNodeInitalState('OPEN', node)
    })

    it('should set node initial state locked', function (done) {
      let node = {}
      core.setNodeStatusTo = function (node, state) {
        if (state === 'locked') {
          done()
        }
      }
      core.setNodeInitalState('LOCKED', node)
    })

    it('should set node initial state sessionactive', function (done) {
      let node = {
        bianco: {
          iiot: {
            opcuaClient: null,
            opcuaSession: null
          }
        },
        connector: {
          bianco: {
            iiot: {
              opcuaClient: {},
              opcuaSession: {}
            }
          }
        }
      }
      core.setNodeStatusTo = function (node, state) {
        if (state === 'active' && node.bianco.iiot.opcuaSession === node.connector.bianco.iiot.opcuaSession) {
          done()
        }
      }
      core.setNodeInitalState('SESSIONACTIVE', node)
    })

    it('should set node initial state unlocked', function (done) {
      let node = {}
      core.setNodeStatusTo = function (node, state) {
        if (state === 'unlocked') {
          done()
        }
      }
      core.setNodeInitalState('UNLOCKED', node)
    })

    it('should set node initial state unknown', function (done) {
      let node = {}
      core.setNodeStatusTo = function (node, state) {
        if (state === 'waiting') {
          done()
        }
      }
      core.setNodeInitalState('', node)
    })

    it('should return array of nodes to listen from payload of addressItemsToRead instead of addressSpaceItems', function (done) {
      let addressSapceItem = {name: '', nodeId: 'ns=4;s=TestReadWrite', datatypeName: ''}
      let addressSapceItem2 = {name: '', nodeId: 'ns=4;s=TestNotUsedItem', datatypeName: ''}
      expect(core.buildNodesToListen({
        addressSpaceItems: [addressSapceItem2],
        addressItemsToRead: [addressSapceItem]
      })).to.be.an('array').that.does.include(addressSapceItem)
      done()
    })
  })

  describe('converting', function () {
    it('should build new variant Float', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Float
      let parsedValue = parseFloat(22.2)
      let variantFromString = core.buildNewVariant('Float', '22.2')
      let variantFromString2 = core.buildNewVariant('Float', '22.2')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 22.2)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant Double', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Double
      let parsedValue = parseFloat(22.2)
      let variantFromString = core.buildNewVariant('Double', '22.2')
      let variantFromString2 = core.buildNewVariant('Double', '22.2')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 22.2)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant UInt16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt16
      let parsedValue = new Uint16Array([220])[0]
      let variantFromString = core.buildNewVariant('UInt16', '220')
      let variantFromString2 = core.buildNewVariant('UInt16', '220')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 220)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant UInt32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt32
      let parsedValue = new Uint32Array([33220])[0]
      let variantFromString = core.buildNewVariant('UInt32', '33220')
      let variantFromString2 = core.buildNewVariant('UInt32', '33220')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 33220)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant Int32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int32
      let parsedValue = parseInt('33220')
      let variantFromString = core.buildNewVariant('Int32', '33220')
      let variantFromString2 = core.buildNewVariant('Int32', '33220')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 33220)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant Int16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int16
      let parsedValue = parseInt('33220')
      let variantFromString = core.buildNewVariant('Int16', '33220')
      let variantFromString2 = core.buildNewVariant('Int16', '33220')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 33220)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant Int64', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int64
      let parsedValue = parseInt('833999220')
      let variantFromString = core.buildNewVariant('Int64', '833999220')
      let variantFromString2 = core.buildNewVariant('Int64', '833999220')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 833999220)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant Boolean', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let parsedValue = true
      let variantFromString = core.buildNewVariant('Boolean', 'true')
      let variantFromString2 = core.buildNewVariant('Boolean', '1')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 1)
      let variantFromNumberObject = core.buildNewVariant(dataTypeOPCUA, true)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromNumberObject)
      expect(variantFromObject).to.deep.equal(variantFromNumberObject)
      done()
    })

    it('should build new variant LocalizedText', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.LocalizedText
      let parsedValue = JSON.parse('[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]')
      let variantFromString = core.buildNewVariant('LocalizedText', '[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]')
      let variantFromString2 = core.buildNewVariant('LocalizedText', '[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, '[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]')
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant DateTime', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.DateTime
      let parsedValue = new Date(1522274988816)
      let variantFromString = core.buildNewVariant('DateTime', 1522274988816)
      let variantFromString2 = core.buildNewVariant('DateTime', 1522274988816)
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, 1522274988816)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant String', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.String
      let parsedValue = 'Hello World!'
      let variantFromString = core.buildNewVariant('String', parsedValue)
      let variantFromString2 = core.buildNewVariant('String', parsedValue)
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, parsedValue)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })
  })

  describe('convertingArray', function () {
    it('should build new variant array Float', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Float
      let parsedValue = [parseFloat(22.2), parseFloat(24.5), parseFloat(0.0), parseFloat(-12.1)]
      let variantFromString = core.buildNewVariant('Float', ['22.2', '24.5', '0.0', '-12.1'], 'Array')
      let variantFromString2 = core.buildNewVariant('Float', ['22.2', '24.5', '0.0', '-12.1'], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [22.2, 24.5, 0.0, -12.1], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array Double', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Double
      let parsedValue = [parseFloat(22.2), parseFloat(24.5), parseFloat(0.0), parseFloat(-12.1)]
      let variantFromString = core.buildNewVariant('Double', ['22.2', '24.5', '0.0', '-12.1'], 'Array')
      let variantFromString2 = core.buildNewVariant('Double', ['22.2', '24.5', '0.0', '-12.1'], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [22.2, 24.5, 0.0, -12.1], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array UInt16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt16
      let parsedValue = new Uint16Array([220, 255, 0, 10])
      let variantFromString = core.buildNewVariant('UInt16', ['220', '255', '0', '10'], 'Array')
      let variantFromString2 = core.buildNewVariant('UInt16', ['220', '255', '0', '10'], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [220, 255, 0, 10], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array UInt32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt32
      let parsedValue = new Uint32Array([33220, 255, 0, 4294967295])
      let variantFromString = core.buildNewVariant('UInt32', ['33220', '255', '0', '4294967295'], 'Array')
      let variantFromString2 = core.buildNewVariant('UInt32', ['33220', '255', '0', '4294967295'], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [33220, 255, 0, 4294967295], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array Int32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int32
      let parsedValue = [parseInt('33220'), parseInt('-2147483648'), parseInt('0'), parseInt('2147483647')]
      let variantFromString = core.buildNewVariant('Int32', ['33220', '-2147483648', '0', '2147483647'], 'Array')
      let variantFromString2 = core.buildNewVariant('Int32', ['33220', '-2147483648', '0', '2147483647'], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [33220, -2147483648, 0, 2147483647], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array Int16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int16
      let parsedValue = [parseInt('33220'), parseInt('-32768'), parseInt('0'), parseInt('32767')]
      let variantFromString = core.buildNewVariant('Int16', ['33220', '-32768', '0', '32767'], 'Array')
      let variantFromString2 = core.buildNewVariant('Int16', ['33220', '-32768', '0', '32767'], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [33220, -32768, 0, 32767], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array Int64', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int64
      let parsedValue = [parseInt('833999220'), parseInt('-9007199254740992'), parseInt('0'), parseInt('9007199254740991')]
      let variantFromString = core.buildNewVariant('Int64', ['833999220', '-9007199254740992', '0', '9007199254740991'], 'Array')
      let variantFromString2 = core.buildNewVariant('Int64', ['833999220', '-9007199254740992', '0', '9007199254740991'], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [833999220, -9007199254740992, 0, 9007199254740991], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array Boolean', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let parsedValue = [true, false, false, true]
      let variantFromString = core.buildNewVariant('Boolean', ['true', 'false', 'false', 'true'], 'Array')
      let variantFromString2 = core.buildNewVariant('Boolean', ['1', '0', '0', '1'], 'Array')
      let variantFromString3 = core.buildNewVariant('Boolean', [true, false, false, true], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [1, 0, 0, 1], 'Array')
      let variantFromNumberObject = core.buildNewVariant(dataTypeOPCUA, [true, false, false, true], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString2).to.deep.equal(variantFromString3)
      expect(variantFromString).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromNumberObject)
      expect(variantFromObject).to.deep.equal(variantFromNumberObject)
      done()
    })

    it('should build new variant array LocalizedText', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.LocalizedText
      let parsedValue = [JSON.parse('[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]'), JSON.parse('[{"text":"World", "locale":"en"}, {"text":"Welt", "locale":"de"}]')]
      let variantFromString = core.buildNewVariant('LocalizedText', ['[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]', '[{"text":"World", "locale":"en"}, {"text":"Welt", "locale":"de"}]'], 'Array')
      let variantFromString2 = core.buildNewVariant('LocalizedText', ['[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]', '[{"text":"World", "locale":"en"}, {"text":"Welt", "locale":"de"}]'], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, ['[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]', '[{"text":"World", "locale":"en"}, {"text":"Welt", "locale":"de"}]'], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array DateTime', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.DateTime
      let parsedValue = [new Date(1522274988816), new Date(1522274978816)]
      let variantFromString = core.buildNewVariant('DateTime', [1522274988816, 1522274978816], 'Array')
      let variantFromString2 = core.buildNewVariant('DateTime', [1522274988816, 1522274978816], 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [1522274988816, 1522274978816], 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant array String', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.String
      let parsedValue = ['Hello World!', 'Hello All!']
      let variantFromString = core.buildNewVariant('String', parsedValue, 'Array')
      let variantFromString2 = core.buildNewVariant('String', parsedValue, 'Array')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, parsedValue, 'Array')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Array, value: parsedValue}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should fail if nonarray value is provided', function (done) {
      expect(() => {
        core.buildNewVariant('UInt16', 10, 'Array')
      }).to.throw()
      expect(() => {
        core.buildNewVariant('String', 'Hello World!', 'Array')
      }).to.throw()
      done()
    })
  })

  describe('convertingArray', function () {
    it('should build new variant matrix Float', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Float
      let parsedValue = [parseFloat(22.2), parseFloat(24.5), parseFloat(0.0), parseFloat(-12.1)]
      let variantFromString = core.buildNewVariant('Float', [['22.2', '24.5'], ['0.0', '-12.1']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('Float', [['22.2', '24.5'], ['0.0', '-12.1']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[22.2, 24.5], [0.0, -12.1]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix Double', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Double
      let parsedValue = [parseFloat(22.2), parseFloat(24.5), parseFloat(0.0), parseFloat(-12.1)]
      let variantFromString = core.buildNewVariant('Double', [['22.2', '24.5'], ['0.0', '-12.1']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('Double', [['22.2', '24.5'], ['0.0', '-12.1']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[22.2, 24.5], [0.0, -12.1]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix UInt16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt16
      let parsedValue = new Uint16Array([220, 255, 0, 10])
      let variantFromString = core.buildNewVariant('UInt16', [['220', '255'], ['0', '10']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('UInt16', [['220', '255'], ['0', '10']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[220, 255], [0, 10]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix UInt32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt32
      let parsedValue = new Uint32Array([33220, 255, 0, 4294967295])
      let variantFromString = core.buildNewVariant('UInt32', [['33220', '255'], ['0', '4294967295']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('UInt32', [['33220', '255'], ['0', '4294967295']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[33220, 255], [0, 4294967295]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix Int32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int32
      let parsedValue = [parseInt('33220'), parseInt('-2147483648'), parseInt('0'), parseInt('2147483647')]
      let variantFromString = core.buildNewVariant('Int32', [['33220', '-2147483648'], ['0', '2147483647']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('Int32', [['33220', '-2147483648'], ['0', '2147483647']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[33220, -2147483648], [0, 2147483647]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix Int16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int16
      let parsedValue = [parseInt('33220'), parseInt('-32768'), parseInt('0'), parseInt('32767')]
      let variantFromString = core.buildNewVariant('Int16', [['33220', '-32768'], ['0', '32767']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('Int16', [['33220', '-32768'], ['0', '32767']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[33220, -32768], [0, 32767]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix Int64', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int64
      let parsedValue = [parseInt('833999220'), parseInt('-9007199254740992'), parseInt('0'), parseInt('9007199254740991')]
      let variantFromString = core.buildNewVariant('Int64', [['833999220', '-9007199254740992'], ['0', '9007199254740991']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('Int64', [['833999220', '-9007199254740992'], ['0', '9007199254740991']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[833999220, -9007199254740992], [0, 9007199254740991]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix Boolean', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let parsedValue = [true, false, false, true]
      let variantFromString = core.buildNewVariant('Boolean', [['true', 'false'], ['false', 'true']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('Boolean', [['1', '0'], ['0', '1']], 'Matrix')
      let variantFromString3 = core.buildNewVariant('Boolean', [[true, false], [false, true]], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[1, 0], [0, 1]], 'Matrix')
      let variantFromNumberObject = core.buildNewVariant(dataTypeOPCUA, [[true, false], [false, true]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString2).to.deep.equal(variantFromString3)
      expect(variantFromString).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromNumberObject)
      expect(variantFromObject).to.deep.equal(variantFromNumberObject)
      done()
    })

    it('should build new variant matrix LocalizedText', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.LocalizedText
      let parsedValue = [JSON.parse('[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]'), JSON.parse('[{"text":"World", "locale":"en"}, {"text":"Welt", "locale":"de"}]')]
      let variantFromString = core.buildNewVariant('LocalizedText', [['[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]'], ['[{"text":"World", "locale":"en"}, {"text":"Welt", "locale":"de"}]']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('LocalizedText', [['[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]'], ['[{"text":"World", "locale":"en"}, {"text":"Welt", "locale":"de"}]']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [['[{"text":"Hello", "locale":"en"}, {"text":"Hallo", "locale":"de"}]'], ['[{"text":"World", "locale":"en"}, {"text":"Welt", "locale":"de"}]']], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 1]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 1]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix DateTime', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.DateTime
      let parsedValue = [new Date(1522274988816), new Date(1522274978816)]
      let variantFromString = core.buildNewVariant('DateTime', [[1522274988816],[ 1522274978816]], 'Matrix')
      let variantFromString2 = core.buildNewVariant('DateTime', [[1522274988816],[ 1522274978816]], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [[1522274988816],[ 1522274978816]], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 1]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 1]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should build new variant matrix String', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.String
      let parsedValue = ['Hello World!', 'Hello All!']
      let variantFromString = core.buildNewVariant('String', [['Hello World!'], ['Hello All!']], 'Matrix')
      let variantFromString2 = core.buildNewVariant('String', [['Hello World!'], ['Hello All!']], 'Matrix')
      let variantFromObject = core.buildNewVariant(dataTypeOPCUA, [['Hello World!'], ['Hello All!']], 'Matrix')
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 1]}).to.deep.equal(variantFromString)
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 1]}).to.deep.equal(variantFromObject)
      expect(variantFromString).to.deep.equal(variantFromString2)
      expect(variantFromString).to.deep.equal(variantFromObject)
      done()
    })

    it('should fail if nonarray value is provided', function (done) {
      expect(() => {
        core.buildNewVariant('UInt16', 10, 'Matrix')
      }).to.throw()
      expect(() => {
        core.buildNewVariant('String', 'Hello World!', 'Matrix')
      }).to.throw()
      done()
    })

    it('should fail on zero size dimensions', function (done) {
      expect(() => {
        core.buildNewVariant('UInt16', [[]], 'Matrix')
      }).to.throw()
      done()
    })

    it('should fail if dimensions are not equal in all rows', function (done) {
      expect(() => {
        core.buildNewVariant('UInt16', [[0, 1, 2], [1, 8]], 'Matrix')
      }).to.throw()
      done()
    })

    it('should fail if infered dimensions do not match given dimensions', function (done) {
      expect(() => {
        core.buildNewVariant('UInt16', [[0, 1], [1, 8]], 'Matrix', [4])
      }).to.throw()
      done()
    })

    it('should use the given dimension when passing a flat array', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt16
      let parsedValue = new Uint16Array([0, 1, 1, 8])
      let variant = core.buildNewVariant('UInt16', [0, 1, 1, 8], 'Matrix', [2, 2])
      expect({dataType: dataTypeOPCUA, arrayType: core.nodeOPCUA.VariantArrayType.Matrix, value: parsedValue, dimensions: [2, 2]}).to.deep.equal(variant)
      done()
    })
  })

  describe('converting DataValue by DataType', function () {
    it('should convert NodeId to string', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.NodeId
      let value = {value: 'test'}
      let variantFromString = core.convertDataValueByDataType(value, 'NodeId')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).to.deep.equal('test')
      expect(variantFromObject).to.deep.equal('test')
      done()
    })

    it('should convert NodeIdType to string', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.NodeIdType
      let value = {value: 'test'}
      let variantFromString = core.convertDataValueByDataType(value, 'NodeIdType')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).to.deep.equal('test')
      expect(variantFromObject).to.deep.equal('test')
      done()
    })

    it('should convert ByteString to string', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.ByteString
      let value = {value: 'test'}
      let variantFromString = core.convertDataValueByDataType(value, 'ByteString')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).to.deep.equal('test')
      expect(variantFromObject).to.deep.equal('test')
      done()
    })

    it('should convert Byte Boolean True to number', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Byte
      let value = {value: true}
      let variantFromString = core.convertDataValueByDataType(value, 'Byte')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 1)
      assert.equal(variantFromObject, 1)
      done()
    })

    it('should convert Byte Boolean False to number', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Byte
      let value = {value: false}
      let variantFromString = core.convertDataValueByDataType(value, 'Byte')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 0)
      assert.equal(variantFromObject, 0)
      done()
    })

    it('should convert Byte number 0 to number', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Byte
      let value = {value: 0}
      let variantFromString = core.convertDataValueByDataType(value, 'Byte')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 0)
      assert.equal(variantFromObject, 0)
      done()
    })

    it('should convert Byte number 1 to number', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Byte
      let value = {value: 1}
      let variantFromString = core.convertDataValueByDataType(value, 'Byte')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 1)
      assert.equal(variantFromObject, 1)
      done()
    })

    it('should convert QualifiedName to string', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.QualifiedName
      let value = {value: 'test'}
      let variantFromString = core.convertDataValueByDataType(value, 'QualifiedName')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).to.deep.equal('test')
      expect(variantFromObject).to.deep.equal('test')
      done()
    })

    it('should convert LocalizedText to string', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.LocalizedText
      let value = {value: 'test'}
      let variantFromString = core.convertDataValueByDataType(value, 'LocalizedText')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).to.deep.equal('test')
      expect(variantFromObject).to.deep.equal('test')
      done()
    })

    it('should convert Float NaN', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Float
      let value = {value: 'Hallo'}
      let variantFromString = core.convertDataValueByDataType(value, 'Float')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 'Hallo')
      assert.equal(variantFromObject, 'Hallo')
      done()
    })

    it('should convert to parsed Float', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Float
      let value = {value: 12.34}
      let variantFromString = core.convertDataValueByDataType(value, 'Float')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 12.34)
      assert.equal(variantFromObject, 12.34)
      done()
    })

    it('should convert Double NaN', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Double
      let value = {value: 'Hallo'}
      let variantFromString = core.convertDataValueByDataType(value, 'Double')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 'Hallo')
      assert.equal(variantFromObject, 'Hallo')
      done()
    })

    it('should convert Double to parsed Float', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Double
      let value = {value: 92233720368547758.34}
      let variantFromString = core.convertDataValueByDataType(value, 'Double')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 92233720368547758.34)
      assert.equal(variantFromObject, 92233720368547758.34)
      done()
    })

    it('should convert to parsed UInt16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt16
      let value = {value: 65000}
      let variantFromString = core.convertDataValueByDataType(value, 'UInt16')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 65000)
      assert.equal(variantFromObject, 65000)
      done()
    })

    it('should convert to parsed UInt32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt32
      let value = {value: 165000}
      let variantFromString = core.convertDataValueByDataType(value, 'UInt32')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 165000)
      assert.equal(variantFromObject, 165000)
      done()
    })

    it('should convert to parsed Int16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int16
      let value = {value: -65000}
      let variantFromString = core.convertDataValueByDataType(value, 'Int16')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, -65000)
      assert.equal(variantFromObject, -65000)
      done()
    })

    it('should convert to parsed Int32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int32
      let value = {value: -165000}
      let variantFromString = core.convertDataValueByDataType(value, 'Int32')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, -165000)
      assert.equal(variantFromObject, -165000)
      done()
    })

    it('should convert to parsed Int64', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int64
      let value = {value: -21474836483}
      let variantFromString = core.convertDataValueByDataType(value, 'Int64')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, -21474836483)
      assert.equal(variantFromObject, -21474836483)
      done()
    })

    it('should convert Boolean True', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let value = {value: true}
      let variantFromString = core.convertDataValueByDataType(value, 'Boolean')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, true)
      assert.equal(variantFromObject, true)
      done()
    })

    it('should convert Boolean False', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let value = {value: false}
      let variantFromString = core.convertDataValueByDataType(value, 'Boolean')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, false)
      assert.equal(variantFromObject, false)
      done()
    })

    it('should convert String', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.String
      let value = {value: 'false'}
      let variantFromString = core.convertDataValueByDataType(value, 'String')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 'false')
      assert.equal(variantFromObject, 'false')
      done()
    })

    it('should convert String with toString', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.String
      let value = {value: false}
      let variantFromString = core.convertDataValueByDataType(value, 'String')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      assert.equal(variantFromString, 'false')
      assert.equal(variantFromObject, 'false')
      done()
    })

    it('should convert Unknown', function (done) {
      let value = {value: false}
      let variantFromString = core.convertDataValueByDataType(value, 'Unknown')
      let variantFromObject = core.convertDataValueByDataType(value, null)
      assert.equal(variantFromString, false)
      assert.equal(variantFromObject, false)
      done()
    })
  })

  describe('Variant values', function () {
    it('should get Float', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Float
      let value = {value: 12345.67}
      let variantFromString = core.convertDataValueByDataType(value, 'Float')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).to.deep.equal(12345.67)
      expect(variantFromObject).to.deep.equal(12345.67)
      done()
    })

    it('should get Double', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Double
      let value = {value: 1234567.89}
      let variantFromString = core.convertDataValueByDataType(value, 'Double')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(1234567.89)
      expect(variantFromObject).is.equal(1234567.89)
      done()
    })

    it('should get UInt16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt16
      let value = {value: 65000}
      let variantFromString = core.convertDataValueByDataType(value, 'UInt16')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(65000)
      expect(variantFromObject).is.equal(65000)
      done()
    })

    it('should get UInt32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.UInt32
      let value = {value: 265000}
      let variantFromString = core.convertDataValueByDataType(value, 'UInt32')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(265000)
      expect(variantFromObject).is.equal(265000)
      done()
    })

    it('should get Int16', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int16
      let value = {value: -65000}
      let variantFromString = core.convertDataValueByDataType(value, 'Int16')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(-65000)
      expect(variantFromObject).is.equal(-65000)
      done()
    })

    it('should get Int32', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int32
      let value = {value: -265000}
      let variantFromString = core.convertDataValueByDataType(value, 'Int32')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(-265000)
      expect(variantFromObject).is.equal(-265000)
      done()
    })

    it('should get Int64', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Int64
      let value = {value: -21474836483}
      let variantFromString = core.convertDataValueByDataType(value, 'Int64')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(-21474836483)
      expect(variantFromObject).is.equal(-21474836483)
      done()
    })

    it('should get Boolean', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let value = {value: true}
      let variantFromString = core.convertDataValueByDataType(value, 'Boolean')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(true)
      expect(variantFromObject).is.equal(true)
      done()
    })

    it('should get Boolean', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let value = {value: false}
      let variantFromString = core.convertDataValueByDataType(value, 'Boolean')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(false)
      expect(variantFromObject).is.equal(false)
      done()
    })

    it('should get Boolean object false', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let value = {'value': {'dataType': 'Boolean', 'arrayType': 'Scalar', 'value': false}}
      let variantFromString = core.convertDataValueByDataType(value, 'Boolean')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).to.deep.equal({'dataType': 'Boolean', 'arrayType': 'Scalar', 'value': false})
      expect(variantFromObject).to.deep.equal({'dataType': 'Boolean', 'arrayType': 'Scalar', 'value': false})
      done()
    })

    it('should get Boolean object true', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.Boolean
      let value = {'value': {'dataType': 'Boolean', 'arrayType': 'Scalar', 'value': true}}
      let variantFromString = core.convertDataValueByDataType(value, 'Boolean')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).to.deep.equal({'dataType': 'Boolean', 'arrayType': 'Scalar', 'value': true})
      expect(variantFromObject).to.deep.equal({'dataType': 'Boolean', 'arrayType': 'Scalar', 'value': true})
      done()
    })

    it('should get DateTime', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.DateTime
      let dateValue = new Date()
      let value = {value: dateValue}
      let variantFromString = core.convertDataValueByDataType(value, 'DateTime')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal(dateValue)
      expect(variantFromObject).is.equal(dateValue)
      done()
    })

    it('should get String', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.String
      let value = {value: 'Hallo Welt!'}
      let variantFromString = core.convertDataValueByDataType(value, 'String')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal('Hallo Welt!')
      expect(variantFromObject).is.equal('Hallo Welt!')
      done()
    })

    it('should get String from number', function (done) {
      let dataTypeOPCUA = core.nodeOPCUA.DataType.String
      let value = {value: 22.33}
      let variantFromString = core.convertDataValueByDataType(value, 'String')
      let variantFromObject = core.convertDataValueByDataType(value, dataTypeOPCUA)
      expect(variantFromString).is.equal('22.33')
      expect(variantFromObject).is.equal('22.33')
      done()
    })

    it('should handle null item on check for unset state', function (done) {
      expect(core.checkItemForUnsetState({ activateUnsetFilter: true }, null)).is.equal(0)
      done()
    })

    it('should handle null item value on check for unset state', function (done) {
      expect(core.checkItemForUnsetState({ activateUnsetFilter: true }, {value: null})).is.equal(0)
      done()
    })

    it('should handle null item value on check for unset state', function (done) {
      expect(core.checkItemForUnsetState({ activateUnsetFilter: true }, {value: 1})).is.equal(1)
      done()
    })
  })
})
