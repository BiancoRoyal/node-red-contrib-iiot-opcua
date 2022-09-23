const helperExtensions = require('../../test-helper-extensions')

module.exports = {

  "testMethodFlowPayload":  helperExtensions.cleanFlowPositionData(  [
    {
      "id": "58a97781fc4c607a",
      "type": "tab",
      "label": "Test Method Flow Payload",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1mcf1",
      "type": "OPCUA-IIoT-Inject",
      "z": "58a97781fc4c607a",
      "injectType": "inject",
      "payload": "12345",
      "payloadType": "num",
      "topic": "TestTopicMethod",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "",
      "addressSpaceItems": [],
      "x": 210,
      "y": 200,
      "wires": [
        [
          "n2mcf1",
          "n3mcf1"
        ]
      ]
    },
    {
      "id": "n2mcf1",
      "type": "helper",
      "z": "58a97781fc4c607a",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 470,
      "y": 260,
      "wires": []
    },
    {
      "id": "n3mcf1",
      "type": "OPCUA-IIoT-Method-Caller",
      "z": "58a97781fc4c607a",
      "connector": "c1mcf1",
      "objectId": "ns=1;i=1234",
      "methodId": "ns=1;i=12345",
      "methodType": "basic",
      "value": "",
      "justValue": true,
      "name": "",
      "showStatusActivities": false,
      "showErrors": true,
      "inputArguments": [
        {
          "name": "barks",
          "dataType": "UInt32",
          "value": "3"
        },
        {
          "name": "volume",
          "dataType": "UInt32",
          "value": "6"
        }
      ],
      "x": 480,
      "y": 200,
      "wires": [
        [
          "n4mcf1",
          "n5mcf1",
          "n51mcf1"
        ]
      ]
    },
    {
      "id": "n4mcf1",
      "type": "helper",
      "z": "58a97781fc4c607a",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 710,
      "y": 260,
      "wires": []
    },
    {
      "id": "n5mcf1",
      "type": "OPCUA-IIoT-Response",
      "z": "58a97781fc4c607a",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 700,
      "y": 200,
      "wires": [
        [
          "n6mcf1"
        ]
      ]
    },
    {
      "id": "n51mcf1",
      "type": "OPCUA-IIoT-Response",
      "z": "58a97781fc4c607a",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 700,
      "y": 140,
      "wires": [
        [
          "n7mcf1"
        ]
      ]
    },
    {
      "id": "n6mcf1",
      "type": "helper",
      "z": "58a97781fc4c607a",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 910,
      "y": 200,
      "wires": []
    },
    {
      "id": "n7mcf1",
      "type": "helper",
      "z": "58a97781fc4c607a",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 910,
      "y": 140,
      "wires": []
    },
    {
      "id": "s1mcf1",
      "type": "OPCUA-IIoT-Server",
      "z": "58a97781fc4c607a",
      "port": "51976",
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
      "x": 170,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "c1mcf1",
      "type": "OPCUA-IIoT-Connector",
      "z": "58a97781fc4c607a",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51976/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL DEMO SERVER",
      "showErrors": false,
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

  "testMethodInjectFlowPayload":  helperExtensions.cleanFlowPositionData(  [
    {
      "id": "d07219ad7642e42e",
      "type": "tab",
      "label": "Test Method Inject Flow Payload",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1mcf2",
      "type": "inject",
      "z": "d07219ad7642e42e",
      "name": "TestName",
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
      "onceDelay": "3",
      "topic": "TestTopicMethod",
      "payload": "23456",
      "payloadType": "num",
      "x": 130,
      "y": 180,
      "wires": [
        [
          "n2mcf2",
          "n3mcf2"
        ]
      ]
    },
    {
      "id": "n2mcf2",
      "type": "helper",
      "z": "d07219ad7642e42e",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 350,
      "y": 260,
      "wires": []
    },
    {
      "id": "n3mcf2",
      "type": "function",
      "z": "d07219ad7642e42e",
      "name": "bark six times with volume twelve",
      "func": "msg.payload = {\n    objectId: \"ns=1;i=1234\",\n    methodId: \"ns=1;i=12345\",\n    inputArguments: [\n{name: \"barks\", dataType:\"UInt32\", value:\"6\"},\n        {name: \"volume\", dataType:\"UInt32\", value:\"12\"}\n    ],\nmethodType: \"basic\"\n}\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 400,
      "y": 180,
      "wires": [
        [
          "n4mcf2",
          "n5mcf2"
        ]
      ]
    },
    {
      "id": "n4mcf2",
      "type": "helper",
      "z": "d07219ad7642e42e",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 690,
      "y": 260,
      "wires": []
    },
    {
      "id": "n5mcf2",
      "type": "OPCUA-IIoT-Method-Caller",
      "z": "d07219ad7642e42e",
      "connector": "c1mcf2",
      "objectId": "ns=1;i=1234",
      "methodId": "ns=1;i=12345",
      "methodType": "basic",
      "value": "",
      "justValue": false,
      "name": "",
      "showStatusActivities": false,
      "showErrors": true,
      "inputArguments": [
        {
          "name": "barks",
          "dataType": "UInt32",
          "value": "3"
        },
        {
          "name": "volume",
          "dataType": "UInt32",
          "value": "6"
        }
      ],
      "x": 680,
      "y": 180,
      "wires": [
        [
          "n6mcf2",
          "n7mcf2"
        ]
      ]
    },
    {
      "id": "n6mcf2",
      "type": "helper",
      "z": "d07219ad7642e42e",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 910,
      "y": 260,
      "wires": []
    },
    {
      "id": "n7mcf2",
      "type": "OPCUA-IIoT-Response",
      "z": "d07219ad7642e42e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 880,
      "y": 180,
      "wires": [
        [
          "n8mcf2"
        ]
      ]
    },
    {
      "id": "n8mcf2",
      "type": "helper",
      "z": "d07219ad7642e42e",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1070,
      "y": 180,
      "wires": []
    },
    {
      "id": "s1mcf2",
      "type": "OPCUA-IIoT-Server",
      "z": "d07219ad7642e42e",
      "port": "51977",
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
      "x": 130,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "c1mcf2",
      "type": "OPCUA-IIoT-Connector",
      "z": "d07219ad7642e42e",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51977/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL DEMO SERVER",
      "showErrors": false,
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
  ])
}