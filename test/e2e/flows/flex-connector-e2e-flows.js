
const helperExtensions = require("../../helper/test-helper-extensions")

module.exports = {

  "testFlexConnectorFlow": helperExtensions.cleanFlowPositionData( [
    {
      "id": "43f579ee9bc767ef",
      "type": "tab",
      "label": "Test Flex-Connector Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "65015785.dec638",
      "type": "inject",
      "z": "43f579ee9bc767ef",
      "name": "wrong endpoint",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 4,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"localhost:55189\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 580,
      "y": 160,
      "wires": [
        [
          "n1fc"
        ]
      ]
    },
    {
      "id": "17fad322.b448d5",
      "type": "inject",
      "z": "43f579ee9bc767ef",
      "name": "86",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 4,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"opc.tcp://localhost:55186/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 610,
      "y": 220,
      "wires": [
        [
          "n1fc"
        ]
      ]
    },
    {
      "id": "25bd13e0.8f1a94",
      "type": "inject",
      "z": "43f579ee9bc767ef",
      "name": "89",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 8,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"opc.tcp://localhost:55189/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 610,
      "y": 340,
      "wires": [
        [
          "n1fc"
        ]
      ]
    },
    {
      "id": "5d542501.b7ddf4",
      "type": "inject",
      "z": "43f579ee9bc767ef",
      "name": "87",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 12,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"opc.tcp://localhost:55187/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 610,
      "y": 280,
      "wires": [
        [
          "n1fc"
        ]
      ]
    },
    {
      "id": "2d7ff055.23044",
      "type": "inject",
      "z": "43f579ee9bc767ef",
      "name": "wrong port",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 16,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"opc.tcp://localhost:12345/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 590,
      "y": 100,
      "wires": [
        [
          "n1fc"
        ]
      ]
    },
    {
      "id": "n1fc",
      "type": "helper",
      "z": "43f579ee9bc767ef",
      "active": true,
      "x": 890,
      "y": 220,
      "wires": []
    }
  ] ),

  "testWithServersFlexConnector": helperExtensions.cleanFlowPositionData( [
    {
      "id": "ba5c9213738cfeae",
      "type": "tab",
      "label": "Test Flex-Connector with Servers",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "65015785.dec658",
      "type": "inject",
      "z": "ba5c9213738cfeae",
      "name": "wrong endpoint",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 4,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"localhost:51100\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 280,
      "y": 260,
      "wires": [
        [
          "14d54403.f94f14",
          "n1fcs"
        ]
      ]
    },
    {
      "id": "17fad322.b44855",
      "type": "inject",
      "z": "ba5c9213738cfeae",
      "name": "86",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 5,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"opc.tcp://localhost:51101/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 310,
      "y": 320,
      "wires": [
        [
          "14d54403.f94f14",
          "n1fcs"
        ]
      ]
    },
    {
      "id": "25bd13e0.8f1a54",
      "type": "inject",
      "z": "ba5c9213738cfeae",
      "name": "89",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 10,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"opc.tcp://localhost:51100/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 310,
      "y": 440,
      "wires": [
        [
          "14d54403.f94f14",
          "n1fcs"
        ]
      ]
    },
    {
      "id": "5d542501.b7dd54",
      "type": "inject",
      "z": "ba5c9213738cfeae",
      "name": "87",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 15,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"opc.tcp://localhost:51102/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 310,
      "y": 380,
      "wires": [
        [
          "14d54403.f94f14",
          "n1fcs"
        ]
      ]
    },
    {
      "id": "2d7ff055.23054",
      "type": "inject",
      "z": "ba5c9213738cfeae",
      "name": "wrong port",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 20,
      "topic": "",
      "payload": "{\"discoveryUrl\":null,\"endpoint\":\"opc.tcp://localhost:12345/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEXIBLE INJECTED SERVER\",\"showErrors\":true,\"publicCertificateFile\":null,\"privateKeyFile\":null,\"defaultSecureTokenLifetime\":0,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":false,\"strategyMaxRetry\":0,\"strategyInitialDelay\":0,\"strategyMaxDelay\":0,\"strategyRandomisationFactor\":0,\"requestedSessionTimeout\":0,\"connectionStartDelay\":0,\"reconnectDelay\":0}",
      "payloadType": "json",
      "x": 290,
      "y": 200,
      "wires": [
        [
          "14d54403.f94f14",
          "n1fcs"
        ]
      ]
    },
    {
      "id": "n1fcs",
      "type": "helper",
      "z": "ba5c9213738cfeae",
      "active": true,
      "x": 630,
      "y": 340,
      "wires": []
    },
    {
      "id": "14d54403.f94f14",
      "type": "OPCUA-IIoT-Flex-Connector",
      "z": "ba5c9213738cfeae",
      "name": "TestFlexConnectorEvents",
      "showStatusActivities": false,
      "showErrors": false,
      "connector": "494e76bd.d2c938",
      "x": 670,
      "y": 280,
      "wires": [
        [
          "n2fcs"
        ]
      ]
    },
    {
      "id": "n2fcs",
      "type": "helper",
      "z": "ba5c9213738cfeae",
      "active": true,
      "x": 910,
      "y": 280,
      "wires": []
    },
    {
      "id": "s3cs",
      "type": "OPCUA-IIoT-Server",
      "z": "ba5c9213738cfeae",
      "port": "52189",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": false,
      "allowAnonymous": true,
      "individualCerts": false,
      "isAuditing": false,
      "serverDiscovery": false,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "x": 1010,
      "y": 180,
      "wires": [
        []
      ]
    },
    {
      "id": "s1cs",
      "type": "OPCUA-IIoT-Server",
      "z": "ba5c9213738cfeae",
      "port": "52186",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": false,
      "allowAnonymous": true,
      "individualCerts": false,
      "isAuditing": false,
      "serverDiscovery": false,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "x": 830,
      "y": 180,
      "wires": [
        []
      ]
    },
    {
      "id": "s2cs",
      "type": "OPCUA-IIoT-Server",
      "z": "ba5c9213738cfeae",
      "port": "52187",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": false,
      "allowAnonymous": true,
      "individualCerts": false,
      "isAuditing": false,
      "serverDiscovery": false,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "x": 650,
      "y": 180,
      "wires": [
        []
      ]
    },
    {
      "id": "494e76bd.d2c938",
      "type": "OPCUA-IIoT-Connector",
      "z": "ba5c9213738cfeae",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:52189/",
      "keepSessionAlive": true,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL FLEX CONNECTOR",
      "showErrors": true,
      "individualCerts": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "60000",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": "",
      "requestedSessionTimeout": "",
      "connectionStartDelay": "",
      "reconnectDelay": "",
      "maxBadSessionRequests": ""
    }
  ] ),

  "flexConnectorSwitchingEndpointWithListenerFlow" : helperExtensions.cleanFlowPositionData( [
    {
      "id": "df56177cba9869b5",
      "type": "tab",
      "label": "Test Flex-Connector Switching Flow",
      "disabled": false,
      "info": "Endpoint with Listener",
      "env": []
    },
    {
      "id": "d0451f63.46605",
      "type": "OPCUA-IIoT-Flex-Connector",
      "z": "df56177cba9869b5",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "connector": "3fa097ed.9d44c8",
      "x": 660,
      "y": 300,
      "wires": [
        [
          "n1rcf1"
        ]
      ]
    },
    {
      "id": "n1rcf1",
      "type": "helper",
      "z": "df56177cba9869b5",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 890,
      "y": 300,
      "wires": []
    },
    {
      "id": "3dc74847.4013a8",
      "type": "OPCUA-IIoT-Inject",
      "z": "df56177cba9869b5",
      "injectType": "listen",
      "payload": "1000",
      "payloadType": "num",
      "topic": "",
      "repeat": "10",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "listen",
      "addressSpaceItems": [
        {
          "name": "BiancoRoyal",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        },
        {
          "name": "Tanks",
          "nodeId": "ns=1;i=1000",
          "datatypeName": ""
        },
        {
          "name": "Server",
          "nodeId": "ns=0;i=2253",
          "datatypeName": ""
        }
      ],
      "x": 400,
      "y": 180,
      "wires": [
        [
          "c23a2c6c.6a7ce8"
        ]
      ]
    },
    {
      "id": "c23a2c6c.6a7ce8",
      "type": "OPCUA-IIoT-Event",
      "z": "df56177cba9869b5",
      "eventType": "BaseEventType",
      "eventTypeLabel": "BaseEventType (i=2041)",
      "resultType": "all",
      "queueSize": "1000",
      "usingListener": true,
      "name": "Base Events",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 610,
      "y": 180,
      "wires": [
        [
          "f1fe3196.0de528"
        ]
      ]
    },
    {
      "id": "f1fe3196.0de528",
      "type": "OPCUA-IIoT-Listener",
      "z": "df56177cba9869b5",
      "connector": "3fa097ed.9d44c8",
      "action": "events",
      "queueSize": "100",
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 820,
      "y": 180,
      "wires": [
        [
          "83aeca59.3fb278"
        ]
      ]
    },
    {
      "id": "83aeca59.3fb278",
      "type": "OPCUA-IIoT-Response",
      "z": "df56177cba9869b5",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 1030,
      "y": 180,
      "wires": [
        [
          "4297091858c8e511"
        ]
      ]
    },
    {
      "id": "2cb0cd24.306542",
      "type": "OPCUA-IIoT-Server",
      "z": "df56177cba9869b5",
      "port": "51378",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": true,
      "allowAnonymous": true,
      "individualCerts": false,
      "isAuditing": false,
      "serverDiscovery": true,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "registerServerMethod": "1",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": "",
      "maxNodesPerBrowse": "",
      "delayToClose": "",
      "x": 390,
      "y": 440,
      "wires": [
        []
      ]
    },
    {
      "id": "aa425d42.e36488",
      "type": "OPCUA-IIoT-Flex-Server",
      "z": "df56177cba9869b5",
      "port": "51377",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": false,
      "showErrors": true,
      "allowAnonymous": true,
      "individualCerts": false,
      "isAuditing": false,
      "serverDiscovery": true,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "registerServerMethod": 1,
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "addressSpaceScript": "function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n    // server = the created node-opcua server\n    // addressSpace = script placeholder\n    // eventObjects = to hold event variables in memory from this script\n    \n    // internal global sandbox objects are \n    // node = node of the flex server, \n    // coreServer = core iiot server object for debug and access to nodeOPCUA,\n    // and scriptObjects to hold variables and functions\n    const LocalizedText = opcua.LocalizedText\n    const namespace = addressSpace.getOwnNamespace()\n\n    const namespace2 = addressSpace.registerNamespace(\"BiancoRoyal\")\n    coreServer.internalDebugLog(addressSpace.getNamespaceArray()[2])\n    \n    coreServer.internalDebugLog(\"init dynamic address space\")\n    node.warn(\"construct new address space for OPC UA\")\n    \n    // from here - see the node-opcua docs how to build address sapces\n    let tanks = namespace.addObject({\n        browseName: \"Tanks\",\n        description: \"The Object representing some tanks\",\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    let oilTankLevel = namespace.addVariable({\n        browseName: \"OilTankLevel\",\n        displayName: [\n          new LocalizedText({text: \"Oil Tank Level\", locale: \"en-US\"}),\n          new LocalizedText({text: \"Öl Tank Füllstand\", locale: \"de-DE\"})\n        ],\n        description: \"Fill level in percentage (0% to 100%) of the oil tank\",\n        propertyOf: tanks,\n        dataType: \"Double\",\n        eventSourceOf: tanks\n    })\n    \n    // ---------------------------------------------------------------------------------\n    // Let\"s create a exclusive Limit Alarm that automatically raise itself\n    // when the tank level is out of limit\n    // ---------------------------------------------------------------------------------\n    let exclusiveLimitAlarmType = addressSpace.findEventType(\"ExclusiveLimitAlarmType\")\n    let oilTankLevelCondition = namespace.instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: oilTankLevel,\n        browseName: \"OilTankLevelCondition\",\n        displayName: [\n          new LocalizedText({text: \"Oil Tank Level Condition\", locale: \"en-US\"}),\n          new LocalizedText({text: \"Öl Tank Füllstand Bedingung\", locale: \"de-DE\"})\n        ],\n        description: \"ExclusiveLimitAlarmType Condition\",\n        conditionName: \"OilLevelCondition\",\n        optionals: [\n          \"ConfirmedState\", \"Confirm\" // confirm state and confirm Method\n        ],\n        inputNode: oilTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    // --------------------------------------------------------------\n    // Let\"s create a second letiable with no Exclusive alarm\n    // --------------------------------------------------------------\n    let gasTankLevel = namespace.addVariable({\n        browseName: \"GasTankLevel\",\n        displayName: [\n          new LocalizedText({text: \"Gas Tank Level\", locale: \"en-US\"}),\n          new LocalizedText({text: \"Gas Tank Füllstand\", locale: \"de-DE\"})\n        ],\n        description: \"Fill level in percentage (0% to 100%) of the gas tank\",\n        propertyOf: tanks,\n        dataType: \"Double\",\n        eventSourceOf: tanks\n    })\n    \n    // byte variable with value\n    if(scriptObjects.oilTankNumber === undefined || scriptObjects.oilTankNumber === null) {\n            scriptObjects.oilTankNumber = 100\n    }\n    \n    let oilTankNumber = namespace.addVariable({\n        nodeId: \"s=OilTankNumber\",\n        browseName: \"OilTankNumber\",\n        displayName: [\n          new LocalizedText({text: \"Oil Tank Number\", locale: \"en-US\"}),\n          new LocalizedText({text: \"Öl Tank Nummer\", locale: \"de-DE\"})\n        ],\n        description: \"Number of the oil tank\",\n        propertyOf: tanks,\n        dataType: \"Byte\",\n        value: {\n            get: function () {\n                return new opcua.Variant({\n                    dataType: \"Byte\",\n                    value: scriptObjects.oilTankNumber\n                })\n            },\n            set: function (variant) {\n                scriptObjects.oilTankNumber = variant.value\n                return opcua.StatusCodes.Good\n            }\n        }\n    })\n    \n    let nonExclusiveLimitAlarmType = addressSpace.findEventType(\"NonExclusiveLimitAlarmType\")\n    \n    if (nonExclusiveLimitAlarmType === null) throw new Error(\"nonExclusiveLimitAlarmType Error Message\")\n\n    let gasTankLevelCondition = namespace.instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {\n        componentOf: tanks,\n        conditionSource: gasTankLevel,\n        browseName: \"GasTankLevelCondition\",\n        displayName: [\n          new LocalizedText({text: \"Gas Tank Level Condition\", locale: \"en-US\"}),\n          new LocalizedText({text: \"Gas Tank Füllstand Bedingung\", locale: \"de-DE\"})\n        ],\n        description: \"NonExclusiveLimitAlarmType Condition\",\n        conditionName: \"GasLevelCondition\",\n        optionals: [\n          \"ConfirmedState\", \"Confirm\" // confirm state and confirm Method\n        ],\n        inputNode: gasTankLevel,   // the letiable that will be monitored for change\n        highHighLimit: 0.9,\n        highLimit: 0.8,\n        lowLimit: 0.2\n    })\n    \n    // variable with value\n    if(scriptObjects.testReadWrite === undefined || scriptObjects.testReadWrite === null) {\n            scriptObjects.testReadWrite = 1000.0\n    }\n    \n    let myVariables = namespace.addObject({\n        browseName: \"MyVariables\",\n        description: \"The Object representing some variables\",\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n    \n    if(coreServer.core) {\n        namespace.addVariable({\n            componentOf: myVariables,\n            nodeId: \"ns=1;s=TestReadWrite\",\n            browseName: \"TestReadWrite\",\n            displayName: [\n                new LocalizedText({text: \"Test Read and Write\", locale: \"en-US\"}),\n                new LocalizedText({text: \"Test Lesen Schreiben\", locale: \"de-DE\"})\n            ],\n            dataType: \"Double\",\n            value: {\n                get: function () {\n                    return new opcua.Variant({\n                        dataType: \"Double\",\n                        value: scriptObjects.testReadWrite\n                    })\n                },\n                set: function (variant) {\n                    scriptObjects.testReadWrite = parseFloat(variant.value)\n                    return opcua.StatusCodes.Good\n                }\n            }\n            \n        })\n        \n        let memoryVariable = namespace.addVariable({\n            componentOf: myVariables,\n            nodeId: \"ns=1;s=free_memory\",\n            browseName: \"FreeMemory\",\n            displayName: [\n                new LocalizedText({text: \"Free Memory\", locale: \"en-US\"}),\n                new LocalizedText({text: \"ungenutzer RAM\", locale: \"de-DE\"})\n            ],\n            dataType: \"Double\",\n            \n            value: {\n              get: function () {\n                return new opcua.Variant({\n                  dataType: \"Double\",\n                  value: coreServer.core.availableMemory()\n                })\n              }\n            }\n        })\n        addressSpace.installHistoricalDataNode(memoryVariable)\n       \n    } else {\n        coreServer.internalDebugLog(\"coreServer.core needed for opcua\")\n    }\n    \n    // custom namespace ns=2\n    let boilers = namespace2.addObject({\n        browseName: \"Boilers\",\n        description: \"The Object representing some boilers\",\n        organizedBy: addressSpace.rootFolder.objects,\n        notifierOf: addressSpace.rootFolder.objects.server\n    })\n\n    let boilersSum = namespace2.addVariable({\n        browseName: \"BoilersSum\",\n        displayName: [\n          new LocalizedText({text: \"Boilers sum of all fill levels\", locale: \"en-US\"}),\n          new LocalizedText({text: \"Boiler Summe aller Füllstand\", locale: \"de-DE\"})\n        ],\n        description: \"Fill level in percentage (0% to 100%) of the boilers\",\n        propertyOf: boilers,\n        dataType: \"Double\"\n    })\n    \n    // hold event objects in memory \n    eventObjects.oilTankLevel = oilTankLevel\n    eventObjects.oilTankLevelCondition = oilTankLevelCondition\n    \n    eventObjects.gasTankLevel = gasTankLevel\n    eventObjects.gasTankLevelCondition = gasTankLevelCondition\n    \n    done()\n}\n",
      "x": 650,
      "y": 440,
      "wires": [
        []
      ]
    },
    {
      "id": "29ea174.7a305e8",
      "type": "inject",
      "z": "df56177cba9869b5",
      "name": "Server 77",
      "props": [
        {
          "p": "payload"
        },
        {
          "p": "topic",
          "vt": "str"
        }
      ],
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": "7",
      "topic": "",
      "payload": "{\"endpoint\":\"opc.tcp://localhost:51377/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEX SERVER\",\"showErrors\":true,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":true}",
      "payloadType": "json",
      "x": 420,
      "y": 340,
      "wires": [
        [
          "d0451f63.46605"
        ]
      ]
    },
    {
      "id": "33ea174.7a305e4",
      "type": "inject",
      "z": "df56177cba9869b5",
      "name": "back to Server 77",
      "props": [
        {
          "p": "payload"
        },
        {
          "p": "topic",
          "vt": "str"
        }
      ],
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": "18",
      "topic": "",
      "payload": "{\"endpoint\":\"opc.tcp://localhost:51377/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL FLEX SERVER\",\"showErrors\":true,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":true}",
      "payloadType": "json",
      "x": 390,
      "y": 260,
      "wires": [
        [
          "d0451f63.46605"
        ]
      ]
    },
    {
      "id": "b21f8ce6.df5e5",
      "type": "inject",
      "z": "df56177cba9869b5",
      "name": "Server 78",
      "props": [
        {
          "p": "payload"
        },
        {
          "p": "topic",
          "vt": "str"
        }
      ],
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": "14",
      "topic": "",
      "payload": "{\"endpoint\":\"opc.tcp://localhost:51378/\",\"keepSessionAlive\":false,\"securityPolicy\":\"None\",\"securityMode\":\"None\",\"name\":\"LOCAL DEMO SERVER\",\"showErrors\":true,\"endpointMustExist\":false,\"autoSelectRightEndpoint\":true}",
      "payloadType": "json",
      "x": 420,
      "y": 300,
      "wires": [
        [
          "d0451f63.46605"
        ]
      ]
    },
    {
      "id": "c2b587d2.ca35b",
      "type": "OPCUA-IIoT-Listener",
      "z": "df56177cba9869b5",
      "connector": "3fa097ed.9d44c8",
      "action": "subscribe",
      "queueSize": 10,
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 820,
      "y": 120,
      "wires": [
        [
          "8e135446.6ae95"
        ]
      ]
    },
    {
      "id": "905cd825.902ff",
      "type": "OPCUA-IIoT-Browser",
      "z": "df56177cba9869b5",
      "connector": "3fa097ed.9d44c8",
      "nodeId": "ns=1;i=1234",
      "name": "Bianco Royal",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": true,
      "sendNodesToBrowser": false,
      "multipleOutputs": false,
      "recursiveBrowse": false,
      "recursiveDepth": "",
      "delayPerMessage": "",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 610,
      "y": 120,
      "wires": [
        [
          "c2b587d2.ca35b"
        ]
      ]
    },
    {
      "id": "d6d12d0f.d9097",
      "type": "OPCUA-IIoT-Inject",
      "z": "df56177cba9869b5",
      "injectType": "inject",
      "payload": "{\"interval\":250,\"queueSize\":10,\"options\":{\"requestedPublishingInterval\":500,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":5,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "",
      "repeat": "9",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "Start Abo",
      "addressSpaceItems": [],
      "x": 390,
      "y": 120,
      "wires": [
        [
          "905cd825.902ff"
        ]
      ]
    },
    {
      "id": "8e135446.6ae95",
      "type": "OPCUA-IIoT-Response",
      "z": "df56177cba9869b5",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 1030,
      "y": 120,
      "wires": [
        [
          "dd849771605fb2a7"
        ]
      ]
    },
    {
      "id": "dd849771605fb2a7",
      "type": "helper",
      "z": "df56177cba9869b5",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1230,
      "y": 120,
      "wires": []
    },
    {
      "id": "4297091858c8e511",
      "type": "helper",
      "z": "df56177cba9869b5",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1230,
      "y": 180,
      "wires": []
    },
    {
      "id": "3fa097ed.9d44c8",
      "type": "OPCUA-IIoT-Connector",
      "z": "df56177cba9869b5",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51377/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "EVENT CLIENT 77",
      "showErrors": false,
      "individualCerts": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": "",
      "requestedSessionTimeout": "",
      "connectionStartDelay": "",
      "reconnectDelay": "",
      "maxBadSessionRequests": ""
    }
  ] )
}