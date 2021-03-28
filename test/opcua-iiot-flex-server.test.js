/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2018,2019,2020,2021 Klaus Landsdorf (https://bianco-royal.space/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(10000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var flexServerNode = require('../src/opcua-iiot-flex-server')

var flexServerFlowNodes = [injectNode, functionNode, flexServerNode]

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlexServerFlow = [
  {
    'id': '85d5edb0.385143',
    'type': 'OPCUA-IIoT-Flex-Server',
    'port': '53454',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'DEMOSERVER',
    'showStatusActivities': false,
    'showErrors': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'delayToClose': 500,
    'addressSpaceScript': "function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n    // server = the created node-opcua server\n    // addressSpace = script placeholder\n    // eventObjects = to hold event variables in memory from this script\n    \n    // internal global sandbox objects are \n    // node = node of the flex server, \n    // coreServer = core iiot server object for debug and access to nodeOPCUA,\n    // and scriptObjects to hold variables and functions\n    const LocalizedText = coreServer.core.nodeOPCUA.LocalizedText\n    const namespace = addressSpace.getOwnNamespace()\n\n    coreServer.internalDebugLog('init dynamic address space')\n    node.warn('construct new address space for OPC UA')\n    \n    // from here - see the node-opcua docs how to build address sapces\n    let tanks = namespace.addObject({\n        browseName: 'Tanks',\n        description: 'The Object representing some tanks',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    let oilTankLevel = namespace.addVariable({\n        browseName: 'OilTankLevel',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Level', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the oil tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        eventSourceOf: tanks\n    })\n    \n    // ---------------------------------------------------------------------------------\n    // Let's create a exclusive Limit Alarm that automatically raise itself\n    // when the tank level is out of limit\n    // ---------------------------------------------------------------------------------\n    let exclusiveLimitAlarmType = addressSpace.findEventType('ExclusiveLimitAlarmType')\n    node.bianco.iiot.assert(exclusiveLimitAlarmType !== null)\n    \n    let oilTankLevelCondition = namespace.instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: oilTankLevel,\n        browseName: 'OilTankLevelCondition',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Level Condition', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Füllstand Bedingung', locale: 'de-DE'})\n        ],\n        description: 'ExclusiveLimitAlarmType Condition',\n        conditionName: 'OilLevelCondition',\n        optionals: [\n          'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: oilTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    // --------------------------------------------------------------\n    // Let's create a second letiable with no Exclusive alarm\n    // --------------------------------------------------------------\n    let gasTankLevel = namespace.addVariable({\n        browseName: 'GasTankLevel',\n        displayName: [\n          new LocalizedText({text: 'Gas Tank Level', locale: 'en-US'}),\n          new LocalizedText({text: 'Gas Tank Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the gas tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        eventSourceOf: tanks\n    })\n    \n    let nonExclusiveLimitAlarmType = addressSpace.findEventType('NonExclusiveLimitAlarmType')\n    node.bianco.iiot.assert(nonExclusiveLimitAlarmType !== null)\n    \n    let gasTankLevelCondition = namespace.instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: gasTankLevel,\n        browseName: 'GasTankLevelCondition',\n        displayName: [\n          new LocalizedText({text: 'Gas Tank Level Condition', locale: 'en-US'}),\n          new LocalizedText({text: 'Gas Tank Füllstand Bedingung', locale: 'de-DE'})\n        ],\n        description: 'NonExclusiveLimitAlarmType Condition',\n        conditionName: 'GasLevelCondition',\n        optionals: [\n          'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: gasTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    // variable with value\n    if(scriptObjects.testReadWrite === undefined || scriptObjects.testReadWrite === null) {\n            scriptObjects.testReadWrite = 1000.0\n    }\n    \n    let myVariables = namespace.addObject({\n        browseName: 'MyVariables',\n        description: 'The Object representing some variables',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    if(coreServer.core) {\n        namespace.addVariable({\n            componentOf: myVariables,\n            nodeId: 'ns=1;s=TestReadWrite',\n            browseName: 'TestReadWrite',\n            displayName: [\n                new LocalizedText({text: 'Test Read and Write', locale: 'en-US'}),\n                new LocalizedText({text: 'Test Lesen Schreiben', locale: 'de-DE'})\n            ],\n            dataType: 'Double',\n            value: {\n                get: function () {\n                    return new coreServer.core.nodeOPCUA.Variant({\n                        dataType: 'Double',\n                        value: scriptObjects.testReadWrite\n                    })\n                },\n                set: function (variant) {\n                    scriptObjects.testReadWrite = parseFloat(variant.value)\n                    return coreServer.core.nodeOPCUA.StatusCodes.Good\n                }\n            }\n            \n        })\n        \n        let memoryVariable = namespace.addVariable({\n            componentOf: myVariables,\n            nodeId: 'ns=1;s=free_memory',\n            browseName: 'FreeMemory',\n            displayName: [\n                new LocalizedText({text: 'Free Memory', locale: 'en-US'}),\n                new LocalizedText({text: 'ungenutzer RAM', locale: 'de-DE'})\n            ],\n            dataType: 'Double',\n            \n            value: {\n              get: function () {\n                return new coreServer.core.nodeOPCUA.Variant({\n                  dataType: 'Double',\n                  value: coreServer.core.availableMemory()\n                })\n              }\n            }\n        })\n        addressSpace.installHistoricalDataNode(memoryVariable)\n       \n    } else {\n        coreServer.internalDebugLog('coreServer.core needed for coreServer.core.nodeOPCUA')\n    }\n\n    // hold event objects in memory \n    eventObjects.oilTankLevel = oilTankLevel\n    eventObjects.oilTankLevelCondition = oilTankLevelCondition\n    \n    eventObjects.gasTankLevel = gasTankLevel\n    eventObjects.gasTankLevelCondition = gasTankLevelCondition\n    \n    done()\n}",
    'wires': [
      [
      ]
    ]
  }
]

var testFlexServerWithUserAndISA95 = [
  {
    'id': '16093040.5dab23',
    'type': 'OPCUA-IIoT-Flex-Server',
    'port': '54350',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'DEMOSERVERWITHUSERANDISA95',
    'showStatusActivities': false,
    'showErrors': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [
      {
        'name': 'test',
        'password': 'pwd1234'
      }
    ],
    'xmlsets': [
      {
        'name': 'ISA95',
        'path': 'public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml'
      }
    ],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'delayToClose': 500,
    'addressSpaceScript': "function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n    // server = the created node-opcua server\n    // addressSpace = script placeholder\n    // eventObjects = to hold event variables in memory from this script\n    \n    // internal global sandbox objects are \n    // node = node of the flex server, \n    // coreServer = core iiot server object for debug and access to nodeOPCUA,\n    // and scriptObjects to hold variables and functions\n    const LocalizedText = coreServer.core.nodeOPCUA.LocalizedText\n    const namespace = addressSpace.getOwnNamespace()\n\n    coreServer.internalDebugLog('init dynamic address space')\n    node.warn('construct new address space for OPC UA')\n    \n    // from here - see the node-opcua docs how to build address sapces\n    let tanks = namespace.addObject({\n        browseName: 'Tanks',\n        description: 'The Object representing some tanks',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    let oilTankLevel = namespace.addVariable({\n        browseName: 'OilTankLevel',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Level', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the oil tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        eventSourceOf: tanks\n    })\n    \n    // ---------------------------------------------------------------------------------\n    // Let's create a exclusive Limit Alarm that automatically raise itself\n    // when the tank level is out of limit\n    // ---------------------------------------------------------------------------------\n    let exclusiveLimitAlarmType = addressSpace.findEventType('ExclusiveLimitAlarmType')\n    node.bianco.iiot.assert(exclusiveLimitAlarmType !== null)\n    \n    let oilTankLevelCondition = namespace.instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: oilTankLevel,\n        browseName: 'OilTankLevelCondition',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Level Condition', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Füllstand Bedingung', locale: 'de-DE'})\n        ],\n        description: 'ExclusiveLimitAlarmType Condition',\n        conditionName: 'OilLevelCondition',\n        optionals: [\n          'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: oilTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    // --------------------------------------------------------------\n    // Let's create a second letiable with no Exclusive alarm\n    // --------------------------------------------------------------\n    let gasTankLevel = namespace.addVariable({\n        browseName: 'GasTankLevel',\n        displayName: [\n          new LocalizedText({text: 'Gas Tank Level', locale: 'en-US'}),\n          new LocalizedText({text: 'Gas Tank Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the gas tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        eventSourceOf: tanks\n    })\n    \n    let nonExclusiveLimitAlarmType = addressSpace.findEventType('NonExclusiveLimitAlarmType')\n    node.bianco.iiot.assert(nonExclusiveLimitAlarmType !== null)\n    \n    let gasTankLevelCondition = namespace.instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: gasTankLevel,\n        browseName: 'GasTankLevelCondition',\n        displayName: [\n          new LocalizedText({text: 'Gas Tank Level Condition', locale: 'en-US'}),\n          new LocalizedText({text: 'Gas Tank Füllstand Bedingung', locale: 'de-DE'})\n        ],\n        description: 'NonExclusiveLimitAlarmType Condition',\n        conditionName: 'GasLevelCondition',\n        optionals: [\n          'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: gasTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    // variable with value\n    if(scriptObjects.testReadWrite === undefined || scriptObjects.testReadWrite === null) {\n            scriptObjects.testReadWrite = 1000.0\n    }\n    \n    let myVariables = namespace.addObject({\n        browseName: 'MyVariables',\n        description: 'The Object representing some variables',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    if(coreServer.core) {\n        namespace.addVariable({\n            componentOf: myVariables,\n            nodeId: 'ns=1;s=TestReadWrite',\n            browseName: 'TestReadWrite',\n            displayName: [\n                new LocalizedText({text: 'Test Read and Write', locale: 'en-US'}),\n                new LocalizedText({text: 'Test Lesen Schreiben', locale: 'de-DE'})\n            ],\n            dataType: 'Double',\n            value: {\n                get: function () {\n                    return new coreServer.core.nodeOPCUA.Variant({\n                        dataType: 'Double',\n                        value: scriptObjects.testReadWrite\n                    })\n                },\n                set: function (variant) {\n                    scriptObjects.testReadWrite = parseFloat(variant.value)\n                    return coreServer.core.nodeOPCUA.StatusCodes.Good\n                }\n            }\n            \n        })\n        \n        let memoryVariable = namespace.addVariable({\n            componentOf: myVariables,\n            nodeId: 'ns=1;s=free_memory',\n            browseName: 'FreeMemory',\n            displayName: [\n                new LocalizedText({text: 'Free Memory', locale: 'en-US'}),\n                new LocalizedText({text: 'ungenutzer RAM', locale: 'de-DE'})\n            ],\n            dataType: 'Double',\n            \n            value: {\n              get: function () {\n                return new coreServer.core.nodeOPCUA.Variant({\n                  dataType: 'Double',\n                  value: coreServer.core.availableMemory()\n                })\n              }\n            }\n        })\n        addressSpace.installHistoricalDataNode(memoryVariable)\n       \n    } else {\n        coreServer.internalDebugLog('coreServer.core needed for coreServer.core.nodeOPCUA')\n    }\n\n    // hold event objects in memory \n    eventObjects.oilTankLevel = oilTankLevel\n    eventObjects.oilTankLevelCondition = oilTankLevelCondition\n    \n    eventObjects.gasTankLevel = gasTankLevel\n    eventObjects.gasTankLevelCondition = gasTankLevelCondition\n    \n    done()\n}",
    'wires': [
      []
    ]
  }
]

describe('OPC UA Flex Server node Unit Testing', function () {
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

  describe('Flex Server node', function () {
    it('should be loaded', function (done) {
      helper.load(flexServerFlowNodes, testFlexServerFlow,
        () => {
          let nodeUnderTest = helper.getNode('85d5edb0.385143')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('server_running', () => {
            expect(nodeUnderTest.name).toBe('DEMOSERVER')
            expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
            expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
            expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
            setTimeout(done, 4000)
          })
        }
      )
    })

    it('should be loaded with user and ISA95 NodeSet XML', function (done) {
      helper.load(flexServerFlowNodes, testFlexServerWithUserAndISA95,
        () => {
          let nodeUnderTest = helper.getNode('16093040.5dab23')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('server_running', () => {
            expect(nodeUnderTest.name).toBe('DEMOSERVERWITHUSERANDISA95')
            expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
            expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
            expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
            setTimeout(done, 4000)
          })
        }
      )
    })
  })
})
