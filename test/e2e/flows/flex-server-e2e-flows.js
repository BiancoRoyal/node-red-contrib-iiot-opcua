const helperExtension = require("../../helper/test-helper-extensions")

module.exports = {
  "testFlexServerWriteZeroFlow": helperExtension.cleanFlowPositionData([
    {
      "id": "ab85b94cb3e90f4c",
      "type": "tab",
      "label": "Test Flow Zero Value Bug",
      "disabled": false,
      "info": "There was a bug on value zero (0, 0.00 etc).",
      "env": []
    },
    {
      "id": "5e520ca8cd57e8da",
      "type": "OPCUA-IIoT-Flex-Server",
      "z": "ab85b94cb3e90f4c",
      "port": "55380",
      "endpoint": "UA/NodeREDFlexIIoTServer",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": true,
      "showErrors": true,
      "allowAnonymous": true,
      "individualCerts": false,
      "isAuditing": false,
      "serverDiscovery": true,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "registerServerMethod": "2",
      "discoveryServerEndpointUrl": "opc.tcp://localhost:4840/",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": 1000,
      "addressSpaceScript": "function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n    // server = the created node-opcua server\n    // addressSpace = script placeholder\n    // eventObjects = to hold event variables in memory from this script\n    \n    // internal global sandbox objects are \n    // node = node of the flex server, \n    // coreServer = core iiot server object for debug and access to nodeOPCUA,\n    // and scriptObjects to hold variables and functions\n    const LocalizedText = opcua.LocalizedText;\n    const namespace = addressSpace.getOwnNamespace();\n\n    coreServer.internalDebugLog('init dynamic address space');\n    node.warn('construct new address space for OPC UA');\n    \n    // from here - see the node-opcua docs how to build address sapces\n    let tanks = namespace.addObject({\n        browseName: 'Tanks',\n        description: 'The Object representing some tanks',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    });\n    \n    let oilTankLevel = namespace.addVariable({\n        browseName: 'OilTankLevel',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Level', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the oil tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        eventSourceOf: tanks\n    });\n    \n    // ---------------------------------------------------------------------------------\n    // Let's create a exclusive Limit Alarm that automatically raise itself\n    // when the tank level is out of limit\n    // ---------------------------------------------------------------------------------\n    let exclusiveLimitAlarmType = addressSpace.findEventType('ExclusiveLimitAlarmType');\n    if (exclusiveLimitAlarmType === null) \n    {\n        throw new Error('Flex Server: Couldn\\'t find ExclusiveLimitAlarmType');\n    }\n    \n    let oilTankLevelCondition = namespace.instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: oilTankLevel,\n        browseName: 'OilTankLevelCondition',\n        displayName: [\n          new LocalizedText({text: 'Oil Tank Level Condition', locale: 'en-US'}),\n          new LocalizedText({text: 'Öl Tank Füllstand Bedingung', locale: 'de-DE'})\n        ],\n        description: 'ExclusiveLimitAlarmType Condition',\n        conditionName: 'OilLevelCondition',\n        optionals: [\n          'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: oilTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    });\n    \n    // --------------------------------------------------------------\n    // Let's create a second letiable with no Exclusive alarm\n    // --------------------------------------------------------------\n    let gasTankLevel = namespace.addVariable({\n        browseName: 'GasTankLevel',\n        displayName: [\n          new LocalizedText({text: 'Gas Tank Level', locale: 'en-US'}),\n          new LocalizedText({text: 'Gas Tank Füllstand', locale: 'de-DE'})\n        ],\n        description: 'Fill level in percentage (0% to 100%) of the gas tank',\n        propertyOf: tanks,\n        dataType: 'Double',\n        eventSourceOf: tanks\n    });\n    \n    let nonExclusiveLimitAlarmType = addressSpace.findEventType('NonExclusiveLimitAlarmType');\n    if (nonExclusiveLimitAlarmType === null) \n    {\n        throw new Error('Flex Server: Couldn\\'t find NonExclusiveLimitAlarmType');\n    }\n    \n    let gasTankLevelCondition = namespace.instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: gasTankLevel,\n        browseName: 'GasTankLevelCondition',\n        displayName: [\n          new LocalizedText({text: 'Gas Tank Level Condition', locale: 'en-US'}),\n          new LocalizedText({text: 'Gas Tank Füllstand Bedingung', locale: 'de-DE'})\n        ],\n        description: 'NonExclusiveLimitAlarmType Condition',\n        conditionName: 'GasLevelCondition',\n        optionals: [\n          'ConfirmedState', 'Confirm' // confirm state and confirm Method\n        ],\n        inputNode: gasTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    });\n    \n    // variable with value\n    if(scriptObjects.testReadWrite === undefined || scriptObjects.testReadWrite === null) {\n            scriptObjects.testReadWrite = 1000.0\n    }\n    \n    let myVariables = namespace.addObject({\n        browseName: 'MyVariables',\n        description: 'The Object representing some variables',\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    });\n    \n    // if(coreServer.core) {\n    namespace.addVariable({\n        componentOf: myVariables,\n        nodeId: 'ns=1;s=TestReadWrite',\n        browseName: 'TestReadWrite',\n        displayName: [\n            new LocalizedText({text: 'Test Read and Write', locale: 'en-US'}),\n            new LocalizedText({text: 'Test Lesen Schreiben', locale: 'de-DE'})\n        ],\n        dataType: 'Double',\n        value: {\n            get: function () {\n                return new opcua.Variant({\n                    dataType: 'Double',\n                    value: scriptObjects.testReadWrite\n                })\n            },\n            set: function (variant) {\n                scriptObjects.testReadWrite = parseFloat(variant.value)\n                return opcua.StatusCodes.Good\n            }\n        }\n        \n    });\n    \n       \n    // } else {\n    //     coreServer.internalDebugLog('coreServer.core needed for opcua');\n    // }\n\n    // hold event objects in memory \n    eventObjects.oilTankLevel = oilTankLevel;\n    eventObjects.oilTankLevelCondition = oilTankLevelCondition;\n    \n    eventObjects.gasTankLevel = gasTankLevel;\n    eventObjects.gasTankLevelCondition = gasTankLevelCondition;\n    \n    done()\n}",
      "x": 490,
      "y": 140,
      "wires": [
        []
      ]
    },
    {
      "id": "eb8821b3450d4da8",
      "type": "OPCUA-IIoT-Write",
      "z": "ab85b94cb3e90f4c",
      "connector": "6b2e16c825f6072c",
      "name": "",
      "justValue": false,
      "showStatusActivities": true,
      "showErrors": true,
      "x": 570,
      "y": 240,
      "wires": [
        [
          "fe3c32681ca3545d"
        ]
      ]
    },
    {
      "id": "e891f445f03b4766",
      "type": "OPCUA-IIoT-Node",
      "z": "ab85b94cb3e90f4c",
      "injectType": "write",
      "nodeId": "ns=1;s=TestReadWrite",
      "datatype": "Double",
      "value": "",
      "name": "",
      "topic": "",
      "showErrors": true,
      "x": 430,
      "y": 240,
      "wires": [
        [
          "eb8821b3450d4da8"
        ]
      ]
    },
    {
      "id": "8e5d0566d613c07c",
      "type": "inject",
      "z": "ab85b94cb3e90f4c",
      "name": "1.0",
      "props": [
        {
          "p": "payload"
        }
      ],
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": "4",
      "topic": "",
      "payload": "1.0",
      "payloadType": "num",
      "x": 290,
      "y": 200,
      "wires": [
        [
          "e891f445f03b4766"
        ]
      ]
    },
    {
      "id": "ee9ec40541512e35",
      "type": "inject",
      "z": "ab85b94cb3e90f4c",
      "name": "0.0",
      "props": [
        {
          "p": "payload"
        }
      ],
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": "5",
      "topic": "",
      "payload": "0.0",
      "payloadType": "num",
      "x": 290,
      "y": 280,
      "wires": [
        [
          "e891f445f03b4766"
        ]
      ]
    },
    {
      "id": "0aa58651e59086d6",
      "type": "OPCUA-IIoT-Read",
      "z": "ab85b94cb3e90f4c",
      "attributeId": "13",
      "maxAge": 1,
      "depth": 1,
      "connector": "6b2e16c825f6072c",
      "name": "",
      "justValue": true,
      "showStatusActivities": true,
      "showErrors": true,
      "parseStrings": false,
      "historyDays": 1,
      "x": 570,
      "y": 380,
      "wires": [
        [
          "f82a189319618699"
        ]
      ]
    },
    {
      "id": "a284a314ab2f0992",
      "type": "OPCUA-IIoT-Node",
      "z": "ab85b94cb3e90f4c",
      "injectType": "read",
      "nodeId": "ns=1;s=TestReadWrite",
      "datatype": "Double",
      "value": "",
      "name": "",
      "topic": "",
      "showErrors": true,
      "x": 430,
      "y": 380,
      "wires": [
        [
          "0aa58651e59086d6"
        ]
      ]
    },
    {
      "id": "62c7228f0ffef518",
      "type": "inject",
      "z": "ab85b94cb3e90f4c",
      "name": "READ",
      "props": [
        {
          "p": "payload"
        }
      ],
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": "6",
      "topic": "",
      "payload": "true",
      "payloadType": "bool",
      "x": 290,
      "y": 380,
      "wires": [
        [
          "a284a314ab2f0992"
        ]
      ]
    },
    {
      "id": "f82a189319618699",
      "type": "helper",
      "z": "ab85b94cb3e90f4c",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 720,
      "y": 380,
      "wires": []
    },
    {
      "id": "fe3c32681ca3545d",
      "type": "helper",
      "z": "ab85b94cb3e90f4c",
      "name": "helper 2",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 720,
      "y": 240,
      "wires": []
    },
    {
      "id": "6b2e16c825f6072c",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:55380/",
      "endpointMustExist": false,
      "keepSessionAlive": true,
      "loginEnabled": false,
      "name": "LOCAL SERVER",
      "showErrors": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "individualCerts": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "",
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": "",
      "requestedSessionTimeout": "",
      "connectionStartDelay": "",
      "reconnectDelay": "",
      "maxBadSessionRequests": "10"
    }
  ])
}