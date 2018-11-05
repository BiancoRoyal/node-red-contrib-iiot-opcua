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

jest.setTimeout(40000)

var injectNode = require('node-red/nodes/core/core/20-inject')
var inputNode = require('../../src/opcua-iiot-flex-connector')
var connectorNode = require('../../src/opcua-iiot-connector')
var serverNode = require('../../src/opcua-iiot-server')
var flexServerNode = require('../../src/opcua-iiot-flex-server')
var responseNode = require('../../src/opcua-iiot-response')
var listenerNode = require('../../src/opcua-iiot-listener')
var eventNode = require('../../src/opcua-iiot-event')
var browserNode = require('../../src/opcua-iiot-browser')
var injectIIoTNode = require('../../src/opcua-iiot-inject')

var flexConnectorNodes = [injectNode, injectIIoTNode, inputNode, connectorNode, serverNode, flexServerNode, responseNode, listenerNode, eventNode, browserNode]

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlexConnectorFlow = [
  {
    'id': '65015785.dec638',
    'type': 'inject',
    'name': 'wrong endpoint',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"localhost:55189","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 2,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {
    'id': '17fad322.b448d5',
    'type': 'inject',
    'name': '86',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55186/","keepSessionAlive":false,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 4,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {
    'id': '25bd13e0.8f1a94',
    'type': 'inject',
    'name': '89',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55189/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 8,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {
    'id': '5d542501.b7ddf4',
    'type': 'inject',
    'name': '87',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55187/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 12,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {
    'id': '2d7ff055.23044',
    'type': 'inject',
    'name': 'wrong port',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:12345/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 16,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {id: 'n1fc', type: 'helper'}
]

var testWithServersFlexConnector = [
  {
    'id': '65015785.dec658',
    'type': 'inject',
    'name': 'wrong endpoint',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"localhost:52189","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 2,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {
    'id': '17fad322.b44855',
    'type': 'inject',
    'name': '86',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:52186/","keepSessionAlive":false,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 5,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {
    'id': '25bd13e0.8f1a54',
    'type': 'inject',
    'name': '89',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:52189/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 10,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {
    'id': '5d542501.b7dd54',
    'type': 'inject',
    'name': '87',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:52187/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 15,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {
    'id': '2d7ff055.23054',
    'type': 'inject',
    'name': 'wrong port',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:12345/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 20,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {id: 'n1fcs', type: 'helper'},
  {
    'id': '14d54403.f94f14',
    'type': 'OPCUA-IIoT-Flex-Connector',
    'name': 'TestFlexConnectorEvents',
    'showStatusActivities': false,
    'showErrors': false,
    'connector': '494e76bd.d2c938',
    'wires': [
      [
        'n2fcs'
      ]
    ]
  },
  {id: 'n2fcs', type: 'helper'},
  {
    'id': '494e76bd.d2c938',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:52189/',
    'keepSessionAlive': true,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL FLEX CONNECTOR',
    'showErrors': true,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '60000',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': ''
  },
  {
    'id': 's3cs',
    'type': 'OPCUA-IIoT-Server',
    'port': '52189',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  },
  {
    'id': 's1cs',
    'type': 'OPCUA-IIoT-Server',
    'port': '52186',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  },
  {
    'id': 's2cs',
    'type': 'OPCUA-IIoT-Server',
    'port': '52187',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

var flexConnectorSwitchingEndpointWithListenerFlow = [
  {
    'id': 'd0451f63.46605',
    'type': 'OPCUA-IIoT-Flex-Connector',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'connector': '3fa097ed.9d44c8',
    'wires': [
      []
    ]
  },
  {
    'id': 'c23a2c6c.6a7ce8',
    'type': 'OPCUA-IIoT-Event',
    'eventType': 'BaseEventType',
    'eventTypeLabel': 'BaseEventType (i=2041)',
    'resultType': 'all',
    'queueSize': '1000',
    'usingListener': true,
    'name': 'Base Events',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'f1fe3196.0de528'
      ]
    ]
  },
  {
    'id': '3dc74847.4013a8',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '100',
    'payloadType': 'num',
    'topic': '',
    'repeat': '8',
    'crontab': '',
    'once': true,
    'startDelay': '4',
    'name': 'listen with 200 ms',
    'addressSpaceItems': [
      {
        'name': 'BiancoRoyal',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      },
      {
        'name': 'Tanks',
        'nodeId': 'ns=1;i=1000',
        'datatypeName': ''
      },
      {
        'name': 'Server',
        'nodeId': 'ns=0;i=2253',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'c23a2c6c.6a7ce8'
      ]
    ]
  },
  {
    'id': 'f1fe3196.0de528',
    'type': 'OPCUA-IIoT-Listener',
    'connector': '3fa097ed.9d44c8',
    'action': 'events',
    'queueSize': '100',
    'name': '',
    'topic': '',
    'justValue': true,
    'useGroupItems': false,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        '83aeca59.3fb278'
      ]
    ]
  },
  {
    'id': '2cb0cd24.306542',
    'type': 'OPCUA-IIoT-Server',
    'port': '51378',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': '',
    'maxNodesPerBrowse': '',
    'delayToClose': 2000,
    'wires': [
      []
    ]
  },
  {
    'id': 'aa425d42.e36488',
    'type': 'OPCUA-IIoT-Flex-Server',
    'port': '51377',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': 1,
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'addressSpaceScript': "function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n    // server = the created node-opcua server\n    // addressSpace = script placeholder\n    // eventObjects = to hold event variables in memory from this script\n    \n    // internal global sandbox objects are \n    // node = node of the flex server, \n    // coreServer = core iiot server object for debug and access to nodeOPCUA,\n    // and scriptObjects to hold variables and functions\n    const LocalizedText = coreServer.core.nodeOPCUA.LocalizedText\n    const namespace = addressSpace.getOwnNamespace()\n\n    const namespace2 = addressSpace.registerNamespace(\"BiancoRoyal\")\n    coreServer.internalDebugLog(addressSpace.getNamespaceArray()[2])\n    \n    coreServer.internalDebugLog('init dynamic address space')\n    node.warn('construct new address space for OPC UA')\n    \n    // from here - see the node-opcua docs how to build address sapces\n    let tanks = namespace.addObject({\n        browseName: 'Tanks',\n        description: 'The Object representing some tanks',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    let oilTankLevel = namespace.addVariable({\n        browseName: 'OilTankLevel',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Level', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the oil tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        eventSourceOf: tanks\n    })\n    \n    // ---------------------------------------------------------------------------------\n    // Let's create a exclusive Limit Alarm that automatically raise itself\n    // when the tank level is out of limit\n    // ---------------------------------------------------------------------------------\n    let exclusiveLimitAlarmType = addressSpace.findEventType('ExclusiveLimitAlarmType')\n    node.assert(exclusiveLimitAlarmType !== null)\n    \n    let oilTankLevelCondition = namespace.instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: oilTankLevel,\n        browseName: 'OilTankLevelCondition',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Level Condition', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Füllstand Bedingung', locale: 'de-DE'})\n        ],\n        description: 'ExclusiveLimitAlarmType Condition',\n        conditionName: 'OilLevelCondition',\n        optionals: [\n          'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: oilTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    // --------------------------------------------------------------\n    // Let's create a second letiable with no Exclusive alarm\n    // --------------------------------------------------------------\n    let gasTankLevel = namespace.addVariable({\n        browseName: 'GasTankLevel',\n        displayName: [\n          new LocalizedText({text: 'Gas Tank Level', locale: 'en-US'}),\n          new LocalizedText({text: 'Gas Tank Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the gas tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        eventSourceOf: tanks\n    })\n    \n    // byte variable with value\n    if(scriptObjects.oilTankNumber === undefined || scriptObjects.oilTankNumber === null) {\n            scriptObjects.oilTankNumber = 100\n    }\n    \n    let oilTankNumber = namespace.addVariable({\n        nodeId: \"s=OilTankNumber\",\n        browseName: 'OilTankNumber',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Number', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Nummer', locale: 'de-DE'})\n        ],\n        description: 'Number of the oil tank',\n        propertyOf: tanks,\n        dataType: 'Byte',\n        value: {\n            get: function () {\n                return new coreServer.core.nodeOPCUA.Variant({\n                    dataType: 'Byte',\n                    value: scriptObjects.oilTankNumber\n                })\n            },\n            set: function (variant) {\n                scriptObjects.oilTankNumber = variant.value\n                return coreServer.core.nodeOPCUA.StatusCodes.Good\n            }\n        }\n    })\n    \n    let nonExclusiveLimitAlarmType = addressSpace.findEventType('NonExclusiveLimitAlarmType')\n    node.assert(nonExclusiveLimitAlarmType !== null)\n    \n    let gasTankLevelCondition = namespace.instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: gasTankLevel,\n        browseName: 'GasTankLevelCondition',\n        displayName: [\n          new LocalizedText({text: 'Gas Tank Level Condition', locale: 'en-US'}),\n          new LocalizedText({text: 'Gas Tank Füllstand Bedingung', locale: 'de-DE'})\n        ],\n        description: 'NonExclusiveLimitAlarmType Condition',\n        conditionName: 'GasLevelCondition',\n        optionals: [\n          'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: gasTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    // variable with value\n    if(scriptObjects.testReadWrite === undefined || scriptObjects.testReadWrite === null) {\n            scriptObjects.testReadWrite = 1000.0\n    }\n    \n    let myVariables = namespace.addObject({\n        browseName: 'MyVariables',\n        description: 'The Object representing some variables',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    if(coreServer.core) {\n        namespace.addVariable({\n            componentOf: myVariables,\n            nodeId: 'ns=1;s=TestReadWrite',\n            browseName: 'TestReadWrite',\n            displayName: [\n                new LocalizedText({text: 'Test Read and Write', locale: 'en-US'}),\n                new LocalizedText({text: 'Test Lesen Schreiben', locale: 'de-DE'})\n            ],\n            dataType: 'Double',\n            value: {\n                get: function () {\n                    return new coreServer.core.nodeOPCUA.Variant({\n                        dataType: 'Double',\n                        value: scriptObjects.testReadWrite\n                    })\n                },\n                set: function (variant) {\n                    scriptObjects.testReadWrite = parseFloat(variant.value)\n                    return coreServer.core.nodeOPCUA.StatusCodes.Good\n                }\n            }\n            \n        })\n        \n        let memoryVariable = namespace.addVariable({\n            componentOf: myVariables,\n            nodeId: 'ns=1;s=free_memory',\n            browseName: 'FreeMemory',\n            displayName: [\n                new LocalizedText({text: 'Free Memory', locale: 'en-US'}),\n                new LocalizedText({text: 'ungenutzer RAM', locale: 'de-DE'})\n            ],\n            dataType: 'Double',\n            \n            value: {\n              get: function () {\n                return new coreServer.core.nodeOPCUA.Variant({\n                  dataType: 'Double',\n                  value: coreServer.core.availableMemory()\n                })\n              }\n            }\n        })\n        addressSpace.installHistoricalDataNode(memoryVariable)\n       \n    } else {\n        coreServer.internalDebugLog('coreServer.core needed for coreServer.core.nodeOPCUA')\n    }\n    \n    // custom namespace ns=2\n    let boilers = namespace2.addObject({\n        browseName: 'Boilers',\n        description: 'The Object representing some boilers',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n\n    let boilersSum = namespace2.addVariable({\n        browseName: 'BoilersSum',\n        displayName: [\n          new LocalizedText({text: 'Boilers sum of all fill levels', locale: 'en-US'}),\n          new LocalizedText({text: 'Boiler Summe aller Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the boilers',\n        propertyOf: boilers,\n        dataType: 'Double'\n    })\n    \n    // hold event objects in memory \n    eventObjects.oilTankLevel = oilTankLevel\n    eventObjects.oilTankLevelCondition = oilTankLevelCondition\n    \n    eventObjects.gasTankLevel = gasTankLevel\n    eventObjects.gasTankLevelCondition = gasTankLevelCondition\n    \n    done()\n}\n",
    'wires': [
      []
    ]
  },
  {
    'id': '83aeca59.3fb278',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      []
    ]
  },
  {
    'id': '29ea174.7a305e8',
    'type': 'inject',
    'name': 'Server 77',
    'topic': '',
    'payload': '{"endpoint":"opc.tcp://localhost:51377/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEX SERVER","showErrors":true,"endpointMustExist":false,"autoSelectRightEndpoint":true}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '8',
    'wires': [
      [
        'd0451f63.46605', 'n1rcf1'
      ]
    ]
  },
  {
    'id': '33ea174.7a305e4',
    'type': 'inject',
    'name': 'back to Server 77',
    'topic': '',
    'payload': '{"endpoint":"opc.tcp://localhost:51377/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEX SERVER","showErrors":true,"endpointMustExist":false,"autoSelectRightEndpoint":true}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '18',
    'wires': [
      [
        'd0451f63.46605', 'n1rcf1'
      ]
    ]
  },
  {id: 'n1rcf1', type: 'helper'},
  {
    'id': 'b21f8ce6.df5e5',
    'type': 'inject',
    'name': 'Server 78',
    'topic': '',
    'payload': '{"endpoint":"opc.tcp://localhost:51378/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL DEMO SERVER","showErrors":true,"endpointMustExist":false,"autoSelectRightEndpoint":true}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '14',
    'wires': [
      [
        'd0451f63.46605'
      ]
    ]
  },
  {
    'id': 'c2b587d2.ca35b',
    'type': 'OPCUA-IIoT-Listener',
    'connector': '3fa097ed.9d44c8',
    'action': 'subscribe',
    'queueSize': 10,
    'name': '',
    'topic': '',
    'justValue': true,
    'useGroupItems': false,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        '8e135446.6ae95'
      ]
    ]
  },
  {
    'id': '905cd825.902ff',
    'type': 'OPCUA-IIoT-Browser',
    'connector': '3fa097ed.9d44c8',
    'nodeId': 'ns=1;i=1234',
    'name': 'Bianco Royal',
    'justValue': true,
    'sendNodesToRead': false,
    'sendNodesToListener': true,
    'sendNodesToBrowser': false,
    'singleBrowseResult': true,
    'recursiveBrowse': false,
    'recursiveDepth': '',
    'delayPerMessage': '',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'c2b587d2.ca35b'
      ]
    ]
  },
  {
    'id': 'd6d12d0f.d9097',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '{"interval":250,"queueSize":10,"options":{"requestedPublishingInterval":500,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":5,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': '',
    'repeat': '9',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Start Abo',
    'addressSpaceItems': [],
    'wires': [
      [
        '905cd825.902ff'
      ]
    ]
  },
  {
    'id': '8e135446.6ae95',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      []
    ]
  },
  {
    'id': '3fa097ed.9d44c8',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51377/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'EVENT CLIENT 77',
    'showErrors': false,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': '',
    'maxBadSessionRequests': ''
  }
]

describe('OPC UA Flex Connector node e2e Testing', function () {
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

  describe('Flex Connector node', function () {
    it('should be loaded and get five injects', function (done) {
      helper.load(flexConnectorNodes, testFlexConnectorFlow,
        function () {
          let counter = 0
          let nodeUnderTest = helper.getNode('n1fc')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('input', (msg) => {
            counter++
            expect(msg.payload).toBeDefined()
            if (counter === 5) {
              done()
            }
          })
        })
    })

    it('should be loaded with connector, inject, and servers', function (done) {
      helper.load(flexConnectorNodes, testWithServersFlexConnector,
        function () {
          let counter = 0
          let nodeUnderTest = helper.getNode('n2fcs')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('input', (msg) => {
            counter++
            expect(msg.payload).toBeDefined()
            if (counter > 2) {
              setTimeout(done, 3000)
            }
          })
        })
    })

    it('should be loaded with listener, events, and servers', function (done) {
      helper.load(flexConnectorNodes, flexConnectorSwitchingEndpointWithListenerFlow,
        function () {
          let counter = 0
          let nodeUnderTest = helper.getNode('n1rcf1')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('input', (msg) => {
            counter++
            expect(msg.payload).toBeDefined()
            if (counter === 2) {
              setTimeout(done, 3000)
            }
          })
        })
    })
  })
})
