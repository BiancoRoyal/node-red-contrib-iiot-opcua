/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2018 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

var assert = require('chai').assert
var inputNode = require('../src/opcua-iiot-flex-server')
var helper = require('node-red-contrib-test-helper')

var testFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Flex-Server",
    "port": "1997",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "DEMOSERVER",
    "showStatusActivities": false,
    "showErrors": false,
    "allowAnonymous": true,
    "isAuditing": false,
    "serverDiscovery": true,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "addressSpaceScript": "function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n    // server = the created node-opcua server\n   " +
    " // addressSpace = script placeholder\n    // eventObjects = to hold event variables in memory from this script\n    \n    " +
    "// internal global sandbox objects are \n    " +
    "// node = node of the flex server, \n    // coreServer = core iiot server object for debug and access to nodeOPCUA,\n    " +
    "// and scriptObjects to hold variables and functions\n    \n    // globals are to find on node.context().global and should be initialized here\n    " +
    "node.context().global.set(\"TestOPCUAVarValue\", {})\n    \n    coreServer.internalDebugLog('init dynamic address space')\n    " +
    "node.warn('construct new address space for OPC UA')\n    \n    // from here - see the node-opcua docs how to build address sapces\n    " +
    "let tanks = addressSpace.addObject({\n        browseName: 'Tanks',\n        description: 'The Object representing some tanks',\n        " +
    "organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    " +
    "let oilTankLevel = addressSpace.addVariable({\n        browseName: 'OilTankLevel',\n        displayName: 'Oil Tank Level',\n        " +
    "description: 'Fill level in percentage (0% to 100%) of the oil tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        " +
    "eventSourceOf: tanks\n    })\n    \n    // ---------------------------------------------------------------------------------\n    " +
    "// Let's create a exclusive Limit Alarm that automatically raise itself\n    // when the tank level is out of limit\n    " +
    "// ---------------------------------------------------------------------------------\n    " +
    "let exclusiveLimitAlarmType = addressSpace.findEventType('ExclusiveLimitAlarmType')\n    node.assert(exclusiveLimitAlarmType !== null)\n    \n    " +
    "let oilTankLevelCondition = addressSpace.instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {\n        componentOf: tanks,\n        " +
    "conditionSource: oilTankLevel,\n        browseName: 'OilTankLevelCondition',\n        displayName: 'Oil Tank Level Condition',\n        " +
    "description: 'ExclusiveLimitAlarmType Condition',\n        conditionName: 'OilLevelCondition',\n        optionals: [\n          " +
    "'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: oilTankLevel,   " +
    "// the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        " +
    "lowLimit: 0.2\n    })\n    \n    // --------------------------------------------------------------\n    " +
    "// Let's create a second letiable with no Exclusive alarm\n    // --------------------------------------------------------------\n    " +
    "let gasTankLevel = addressSpace.addVariable({\n        browseName: 'GasTankLevel',\n        displayName: 'Gas Tank Level',\n        " +
    "description: 'Fill level in percentage (0% to 100%) of the gas tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        " +
    "eventSourceOf: tanks\n    })\n    \n    let nonExclusiveLimitAlarmType = addressSpace.findEventType('NonExclusiveLimitAlarmType')\n    " +
    "node.assert(nonExclusiveLimitAlarmType !== null)\n    \n    " +
    "let gasTankLevelCondition = addressSpace.instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {\n        " +
    "componentOf: tanks,\n        conditionSource: gasTankLevel,\n        browseName: 'GasTankLevelCondition',\n        " +
    "displayName: 'Gas Tank Level Condition',\n        description: 'NonExclusiveLimitAlarmType Condition',\n        " +
    "conditionName: 'GasLevelCondition',\n        optionals: [\n          " +
    "'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        " +
    "inputNode: gasTankLevel,   // the letiable that will be monitored for change\n        " +
    "highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    " +
    "// variable with value\n    if(scriptObjects.testReadWrite === undefined || scriptObjects.testReadWrite === null) {\n            " +
    "scriptObjects.testReadWrite = 1000.0\n    }\n    \n    let myVariables = addressSpace.addObject({\n        " +
    "browseName: 'MyVariables',\n        description: 'The Object representing some variables',\n        " +
    "organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    " +
    "if(coreServer.core) {\n        addressSpace.addVariable({\n            componentOf: myVariables,\n            " +
    "nodeId: 'ns=4;s=TestReadWrite',\n            browseName: 'TestReadWrite',\n            " +
    "displayName: 'Test Read and Write',\n            dataType: 'Double',\n            " +
    "value: {\n                get: function () {\n                    " +
    "return new coreServer.core.nodeOPCUA.Variant({\n                        " +
    "dataType: 'Double',\n                        value: scriptObjects.testReadWrite\n                    })\n                " +
    "},\n                set: function (variant) {\n                    scriptObjects.testReadWrite = parseFloat(variant.value)\n                    " +
    "return coreServer.core.nodeOPCUA.StatusCodes.Good\n                }\n            }\n            \n        })\n        \n        " +
    "let memoryVariable = addressSpace.addVariable({\n            componentOf: myVariables,\n            " +
    "nodeId: 'ns=4;s=free_memory',\n            browseName: 'FreeMemory',\n            displayName: 'Free Memory',\n            " +
    "dataType: 'Double',\n            \n            value: {\n              get: function () {\n                " +
    "return new coreServer.core.nodeOPCUA.Variant({\n                  dataType: 'Double',\n                  " +
    "value: coreServer.core.availableMemory()\n                })\n              }\n            }\n        })\n        " +
    "addressSpace.installHistoricalDataNode(memoryVariable)\n        \n        " +
    "let globalValue = node.context().global.get(\"TestOPCUAVarValue\")\n        if(globalValue) {\n            " +
    "coreServer.internalDebugLog('init TestOPCUAVarValue in address space')\n            let testOPCUAVarValue = addressSpace.addVariable({\n                " +
    "componentOf: myVariables,\n                nodeId: 'ns=4;s=TestOPCUAVarValue',\n                browseName: 'TestOPCUAVarValue',\n                " +
    "displayName: 'Test OPC UA Variable Value',\n                dataType: 'Double',\n                \n                " +
    "value: {\n                  get: function () {\n                    return new coreServer.core.nodeOPCUA.Variant({\n                      " +
    "dataType: 'Double',\n                      value: node.context().global.get(\"TestOPCUAVarValue\").value\n                    })\n                  " +
    "},\n                  set: function (variant) {\n                      scriptObjects.testReadWrite = parseFloat(variant.value)\n                      " +
    "return coreServer.core.nodeOPCUA.StatusCodes.Good\n                  }\n                }\n            })\n            " +
    "addressSpace.installHistoricalDataNode(memoryVariable)\n        }\n    \n    } else {\n        " +
    "coreServer.internalDebugLog('coreServer.core needed for coreServer.core.nodeOPCUA')\n    }\n\n    // hold event objects in memory \n    " +
    "eventObjects.oilTankLevel = oilTankLevel\n    eventObjects.oilTankLevelCondition = oilTankLevelCondition\n    \n    " +
    "eventObjects.gasTankLevel = gasTankLevel\n    eventObjects.gasTankLevelCondition = gasTankLevelCondition\n    \n    " +
    "done()\n}",
    "wires": [[]]
  }
]

describe('OPC UA Flex Server node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Flex Server node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode], testFlowPayload,
        function () {
          let nodeUnderTest = helper.getNode('n1')
          nodeUnderTest.should.have.property('name', 'DEMOSERVER')
          nodeUnderTest.should.have.property('maxAllowedSessionNumber', 10)
          nodeUnderTest.should.have.property('maxNodesPerRead', 1000)
          nodeUnderTest.should.have.property('maxNodesPerBrowse', 2000)
          done()
        })
    })
  })
})
