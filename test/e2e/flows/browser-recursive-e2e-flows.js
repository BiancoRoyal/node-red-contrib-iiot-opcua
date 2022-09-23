const helperExtensions = require('../../test-helper-extensions')
module.exports = {
  "testBrowseRecursiveASOFlow":  helperExtensions.cleanFlowPositionData([
    {
      "id": "fb6e1fb0f20c797a",
      "type": "tab",
      "label": "Test Browse Recursive ASO Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "aso0",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "s=TestFolderA",
      "browsename": "TestA",
      "displayname": "Test Folder A",
      "objecttype": "FolderType",
      "datatype": "",
      "value": "",
      "referenceNodeId": "ns=0;i=85",
      "referencetype": "Organizes",
      "name": "ASO Test Folder A",
      "x": 410,
      "y": 140,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "inject0",
      "type": "OPCUA-IIoT-Inject",
      "z": "fb6e1fb0f20c797a",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 140,
      "wires": [
        [
          "aso0"
        ]
      ]
    },
    {
      "id": "server",
      "type": "OPCUA-IIoT-Server",
      "z": "fb6e1fb0f20c797a",
      "port": "49888",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
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
      "registerServerMethod": "1",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": "",
      "maxNodesPerBrowse": "",
      "delayToClose": "",
      "x": 790,
      "y": 380,
      "wires": [
        []
      ]
    },
    {
      "id": "inject2",
      "type": "OPCUA-IIoT-Inject",
      "z": "fb6e1fb0f20c797a",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "5",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 200,
      "wires": [
        [
          "aso2",
          "aso7"
        ]
      ]
    },
    {
      "id": "aso2",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "s=TestFolderB",
      "browsename": "TestB",
      "displayname": "Test Folder B",
      "objecttype": "FolderType",
      "datatype": "",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderA",
      "referencetype": "Organizes",
      "name": "ASO Test Folder B",
      "x": 410,
      "y": 200,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "inject3",
      "type": "OPCUA-IIoT-Inject",
      "z": "fb6e1fb0f20c797a",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "6",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 300,
      "wires": [
        [
          "aso3",
          "aso8"
        ]
      ]
    },
    {
      "id": "aso3",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "s=TestFolderC",
      "browsename": "TestC",
      "displayname": "Test Folder C",
      "objecttype": "FolderType",
      "datatype": "",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderB",
      "referencetype": "Organizes",
      "name": "ASO Test Folder C",
      "x": 410,
      "y": 300,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "inject4",
      "type": "OPCUA-IIoT-Inject",
      "z": "fb6e1fb0f20c797a",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "7",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 400,
      "wires": [
        [
          "aso4",
          "aso9"
        ]
      ]
    },
    {
      "id": "aso4",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "s=TestFolderD",
      "browsename": "TestD",
      "displayname": "Test Folder D",
      "objecttype": "FolderType",
      "datatype": "",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderC",
      "referencetype": "Organizes",
      "name": "ASO Test Folder D",
      "x": 410,
      "y": 400,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "inject5",
      "type": "OPCUA-IIoT-Inject",
      "z": "fb6e1fb0f20c797a",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "8",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 500,
      "wires": [
        [
          "aso5",
          "aso10"
        ]
      ]
    },
    {
      "id": "aso5",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "s=TestFolderE",
      "browsename": "TestE",
      "displayname": "Test Folder E",
      "objecttype": "FolderType",
      "datatype": "",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderD",
      "referencetype": "Organizes",
      "name": "ASO Test Folder E",
      "x": 410,
      "y": 500,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "inject6",
      "type": "OPCUA-IIoT-Inject",
      "z": "fb6e1fb0f20c797a",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "9",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 600,
      "wires": [
        [
          "aso6",
          "aso11"
        ]
      ]
    },
    {
      "id": "aso6",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "s=TestFolderF",
      "browsename": "TestF",
      "displayname": "Test Folder F",
      "objecttype": "FolderType",
      "datatype": "",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderE",
      "referencetype": "Organizes",
      "name": "ASO Test Folder F",
      "x": 410,
      "y": 600,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "aso7",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "ns=1;s=TestDoubleA",
      "browsename": "TestDoubleA",
      "displayname": "Test Double A",
      "objecttype": "BaseDataVariableType",
      "datatype": "Double",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderA",
      "referencetype": "Organizes",
      "name": "Double A",
      "x": 380,
      "y": 240,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "aso8",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "ns=1;s=TestDoubleB",
      "browsename": "TestDoubleB",
      "displayname": "Test Double B",
      "objecttype": "BaseDataVariableType",
      "datatype": "Double",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderB",
      "referencetype": "Organizes",
      "name": "Double B",
      "x": 380,
      "y": 340,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "aso9",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "ns=1;s=TestDoubleC",
      "browsename": "TestDoubleC",
      "displayname": "Test Double C",
      "objecttype": "BaseDataVariableType",
      "datatype": "Double",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderC",
      "referencetype": "Organizes",
      "name": "Double C",
      "x": 380,
      "y": 440,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "aso10",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "ns=1;s=TestDoubleD",
      "browsename": "TestDoubleD",
      "displayname": "Test Double D",
      "objecttype": "BaseDataVariableType",
      "datatype": "Double",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderD",
      "referencetype": "Organizes",
      "name": "Double D",
      "x": 380,
      "y": 540,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "aso11",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "ns=1;s=TestDoubleE",
      "browsename": "TestDoubleE",
      "displayname": "Test Double E",
      "objecttype": "BaseDataVariableType",
      "datatype": "Double",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderE",
      "referencetype": "Organizes",
      "name": "Double E",
      "x": 380,
      "y": 640,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "aso12",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "fb6e1fb0f20c797a",
      "nodeId": "ns=1;s=TestDoubleF",
      "browsename": "TestDoubleF",
      "displayname": "Test Double F",
      "objecttype": "BaseDataVariableType",
      "datatype": "Double",
      "value": "",
      "referenceNodeId": "ns=1;s=TestFolderF",
      "referencetype": "Organizes",
      "name": "Double F",
      "x": 380,
      "y": 80,
      "wires": [
        [
          "server"
        ]
      ]
    },
    {
      "id": "inject7",
      "type": "OPCUA-IIoT-Inject",
      "z": "fb6e1fb0f20c797a",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 80,
      "wires": [
        [
          "aso12"
        ]
      ]
    },
    {
      "id": "browserInject",
      "type": "OPCUA-IIoT-Inject",
      "z": "fb6e1fb0f20c797a",
      "injectType": "listen",
      "payload": "{\"interval\":500,\"queueSize\":10,\"options\":{\"requestedPublishingInterval\":5000,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":5,\"publishingEnabled\":true,\"priority\":8}}",
      "payloadType": "json",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "11",
      "name": "",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;s=TestFolderA",
          "datatypeName": ""
        }
      ],
      "x": 130,
      "y": 780,
      "wires": [
        [
          "browser"
        ]
      ]
    },
    {
      "id": "browser",
      "type": "OPCUA-IIoT-Browser",
      "z": "fb6e1fb0f20c797a",
      "connector": "connector",
      "nodeId": "",
      "name": "",
      "justValue": false,
      "sendNodesToRead": true,
      "sendNodesToListener": true,
      "sendNodesToBrowser": true,
      "multipleOutputs": false,
      "recursiveBrowse": true,
      "recursiveDepth": "5",
      "delayPerMessage": "0.2",
      "showStatusActivities": true,
      "showErrors": true,
      "x": 400,
      "y": 780,
      "wires": [
        [
          "helperNode"
        ]
      ]
    },
    {
      "id": "helperNode",
      "type": "helper",
      "z": "fb6e1fb0f20c797a",
      "active": true,
      "x": 590,
      "y": 780,
      "wires": []
    },
    {
      "id": "connector",
      "type": "OPCUA-IIoT-Connector",
      "z": "fb6e1fb0f20c797a",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49888/",
      "keepSessionAlive": true,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL SERVER",
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
      "maxBadSessionRequests": "10"
    }
  ])
}