/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 DATATRONiQ GmbH (https://datatroniq.com)
 * Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(20000)

var functionNode = require('@node-red/nodes/core/function/10-function')
var injectNode = require('../../src/opcua-iiot-inject')
var inputNode = require('../../src/opcua-iiot-server-aso')
var serverNode = require('../../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testASOFlow = [
  {
    'id': '7cb85115.7635',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestVariables',
    'browsename': 'TestVariables',
    'displayname': 'Test Variables',
    'objecttype': 'FolderType',
    'datatype': 'FolderType',
    'value': '',
    'referenceNodeId': 'ns=0;i=85',
    'referencetype': 'Organizes',
    'name': 'Folder',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': 'a6b95606.c28608',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '7cb85115.7635'
      ]
    ]
  },
  {
    'id': 'df12586a.41bba8',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestDateTime',
    'browsename': 'TestDateTime',
    'displayname': 'Test DateTime',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'DateTime',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'DateTime',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '142d03b7.58bb0c',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'df12586a.41bba8'
      ]
    ]
  },
  {
    'id': '8e9ace0.0c2453',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestBoolean',
    'browsename': 'TestBoolean',
    'displayname': 'Test Boolean',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Boolean',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'Boolean',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '8ef94f3f.8052d',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'true',
    'payloadType': 'bool',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '8e9ace0.0c2453'
      ]
    ]
  },
  {
    'id': 'ab785570.b3e7e8',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestDouble',
    'browsename': 'TestDouble',
    'displayname': 'Test Double',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Double',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'Double',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '35d895d5.7f9dea',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '10.2',
    'payloadType': 'num',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'ab785570.b3e7e8'
      ]
    ]
  },
  {
    'id': '1ae186da.38bfb9',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestUInt16',
    'browsename': 'TestUInt16',
    'displayname': 'Test UInt16',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'UInt16',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'UInt16',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '73286053.bb709',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '65000',
    'payloadType': 'num',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '1ae186da.38bfb9'
      ]
    ]
  },
  {
    'id': 'b1416f4e.5054b',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestUInt32',
    'browsename': 'TestUInt32',
    'displayname': 'Test UInt32',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'UInt32',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'UInt32',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '21856943.170fd6',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '125000',
    'payloadType': 'num',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'b1416f4e.5054b'
      ]
    ]
  },
  {
    'id': 'fdd7ec62.28318',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestUInt64',
    'browsename': 'TestUInt64',
    'displayname': 'Test UInt64',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'UInt64',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'UInt64',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '892c9cb9.f542c',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '125000000',
    'payloadType': 'num',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'fdd7ec62.28318'
      ]
    ]
  },
  {
    'id': 'f6328ad1.cbcea8',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestString',
    'browsename': 'TestString',
    'displayname': 'Test String',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'String',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'String',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '67196dfe.975454',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'Hello IIoT World!',
    'payloadType': 'str',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'f6328ad1.cbcea8'
      ]
    ]
  },
  {
    'id': 'c15f96da.044178',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestInt16',
    'browsename': 'TestInt16',
    'displayname': 'Test Int16',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Int16',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'Int16',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '46255f43.f17ce',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '-6000',
    'payloadType': 'num',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'c15f96da.044178'
      ]
    ]
  },
  {
    'id': 'ad5f7bc5.03f188',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestInt32',
    'browsename': 'TestInt32',
    'displayname': 'Test Int32',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Int32',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'Int32',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': '1ea642ab.c2547d',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '-165000',
    'payloadType': 'num',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'ad5f7bc5.03f188'
      ]
    ]
  },
  {
    'id': 'cd42f3a8.d5494',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '[{"text":"Hallo Welt!","locale":"de"},{"text":"Hello World!","locale":"en"},{"text":"Bonjour Monde!","locale":"fr"}]',
    'payloadType': 'json',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2',
    'name': 'JSON',
    'addressSpaceItems': [],
    'wires': [
      [
        'b85ce203.ecaec'
      ]
    ]
  },
  {
    'id': 'b85ce203.ecaec',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestLocalizedText',
    'browsename': 'TestLocalizedText',
    'displayname': 'Test LocalizedText',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'LocalizedText',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestVariables',
    'referencetype': 'Organizes',
    'name': 'LocalizedText',
    'wires': [
      [
        'ea022228.85657'
      ]
    ]
  },
  {
    'id': 'ea022228.85657',
    'type': 'function',
    'name': 'thru',
    'func': '\nreturn msg;',
    'outputs': 1,
    'noerr': 0,
    'wires': [
      [
        'n4', 's1cf5'
      ]
    ]
  },
  {id: 'n4', type: 'helper'},
  {
    'id': 's1cf5',
    'type': 'OPCUA-IIoT-Server',
    'port': '51798',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [['n5']]
  },
  {id: 'n5', type: 'helper'}
]

beforeAll(function (done) {
  helper.startServer(function () {
    done()
  })
})

afterEach(function (done) {
  helper.unload().then(function () {
    done()
  }).catch(function () {
    done()
  })
})

afterAll(function (done) {
  helper.stopServer(function () {
    done()
  })
})

describe('Address Space Operation node e2e Testing', function () {
  it('should get a message with payload', function (done) {
    helper.load([injectNode, functionNode, inputNode, serverNode], testASOFlow, function () {
      let n4 = helper.getNode('n4')
      let test = 0
      n4.on('input', function (msg) {
        expect(msg.nodetype).toBe('inject')
        expect(msg.injectType).toBe('ASO')

        switch (msg.payload.datatype) {
          case 'FolderType':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestVariables')
            test ^= 1
            break
          case 'DateTime':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestDateTime')
            test ^= 2
            break
          case 'Boolean':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestBoolean')
            test ^= 4
            break
          case 'Double':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestDouble')
            test ^= 8
            break
          case 'UInt16':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt16')
            test ^= 16
            break
          case 'UInt32':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt32')
            test ^= 32
            break
          case 'UInt64':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt64')
            test ^= 64
            break
          case 'String':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestString')
            test ^= 128
            break
          case 'Int16':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestInt16')
            test ^= 256
            break
          case 'Int32':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestInt32')
            test ^= 512
            break
          case 'LocalizedText':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestLocalizedText')
            test ^= 1024
            break
          default:
            break
        }

        if (test === Math.pow(2, 11) - 1) {
          done()
        }
      })
    })
  })

  it('should verify an inject message for address space operation', function (done) {
    helper.load([injectNode, functionNode, inputNode, serverNode], testASOFlow, function () {
      let n4 = helper.getNode('n4')
      let test = 0
      n4.on('input', function (msg) {
        expect(msg.nodetype).toBe('inject')
        expect(msg.injectType).toBe('ASO')

        switch (msg.payload.datatype) {
          case 'FolderType':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestVariables')
            expect(msg.payload.browsename).toBe('TestVariables')
            test ^= 1
            break
          case 'DateTime':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestDateTime')
            test ^= 2
            break
          case 'Boolean':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestBoolean')
            test ^= 4
            break
          case 'Double':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestDouble')
            test ^= 8
            break
          case 'UInt16':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt16')
            test ^= 16
            break
          case 'UInt32':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt32')
            test ^= 32
            break
          case 'UInt64':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt64')
            test ^= 64
            break
          case 'String':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestString')
            test ^= 128
            break
          case 'Int16':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestInt16')
            test ^= 256
            break
          case 'Int32':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestInt32')
            test ^= 512
            break
          case 'LocalizedText':
            expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestLocalizedText')
            test ^= 1024
            break
          default:
            break
        }

        if (test === Math.pow(2, 11) - 1) {
          done()
        }
      })
    })
  })
})
