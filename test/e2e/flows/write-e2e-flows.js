const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testWriteFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "1390f66400457fe6",
      "type": "tab",
      "label": "Test Write Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1wrf1",
      "type": "OPCUA-IIoT-Inject",
      "z": "1390f66400457fe6",
      "injectType": "write",
      "payload": "12345.67",
      "payloadType": "num",
      "topic": "TestTopicWrite",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "TestReadWrite",
      "addressSpaceItems": [
        {
          "name": "TestReadWrite",
          "nodeId": "ns=1;s=TestReadWrite",
          "datatypeName": "Double"
        }
      ],
      "x": 160,
      "y": 220,
      "wires": [
        [
          "n2wrf1",
          "n3wrf1"
        ]
      ]
    },
    {
      "id": "n2wrf1",
      "type": "helper",
      "z": "1390f66400457fe6",
      "active": true,
      "x": 390,
      "y": 280,
      "wires": []
    },
    {
      "id": "n3wrf1",
      "type": "function",
      "z": "1390f66400457fe6",
      "name": "",
      "func": "msg.payload.valuesToWrite = [12345.22]\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 380,
      "y": 220,
      "wires": [
        [
          "n4wrf1",
          "n5wrf1"
        ]
      ]
    },
    {
      "id": "n4wrf1",
      "type": "helper",
      "z": "1390f66400457fe6",
      "active": true,
      "x": 630,
      "y": 280,
      "wires": []
    },
    {
      "id": "n5wrf1",
      "type": "OPCUA-IIoT-Write",
      "z": "1390f66400457fe6",
      "connector": "c1wrf1",
      "name": "TestWrite",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": true,
      "x": 620,
      "y": 220,
      "wires": [
        [
          "n6wrf1",
          "n7wrf1"
        ]
      ]
    },
    {
      "id": "n6wrf1",
      "type": "helper",
      "z": "1390f66400457fe6",
      "active": true,
      "x": 870,
      "y": 260,
      "wires": []
    },
    {
      "id": "n7wrf1",
      "type": "OPCUA-IIoT-Response",
      "z": "1390f66400457fe6",
      "name": "TestWriteResponse",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 890,
      "y": 200,
      "wires": [
        [
          "n8wrf1"
        ]
      ]
    },
    {
      "id": "n8wrf1",
      "type": "helper",
      "z": "1390f66400457fe6",
      "active": true,
      "x": 1090,
      "y": 200,
      "wires": []
    },
    {
      "id": "s1wrf1",
      "type": "OPCUA-IIoT-Server",
      "z": "1390f66400457fe6",
      "port": "50001",
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
      "x": 390,
      "y": 120,
      "wires": [
        []
      ]
    },
    {
      "id": "c1wrf1",
      "type": "OPCUA-IIoT-Connector",
      "z": "1390f66400457fe6",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:50001/",
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
  ]),

  "testWriteWithoutValuesToWriteFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "19152f4e3d25f8d0",
      "type": "tab",
      "label": "Test Write without Values to write Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1wrf2",
      "type": "OPCUA-IIoT-Inject",
      "z": "19152f4e3d25f8d0",
      "injectType": "write",
      "payload": "12345.67",
      "payloadType": "num",
      "topic": "TestTopicWrite",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "TestReadWrite",
      "addressSpaceItems": [
        {
          "name": "TestReadWrite",
          "nodeId": "ns=1;s=TestReadWrite",
          "datatypeName": "Double"
        }
      ],
      "x": 200,
      "y": 180,
      "wires": [
        [
          "n2wrf2",
          "n3wrf2"
        ]
      ]
    },
    {
      "id": "n2wrf2",
      "type": "helper",
      "z": "19152f4e3d25f8d0",
      "active": true,
      "x": 430,
      "y": 240,
      "wires": []
    },
    {
      "id": "n3wrf2",
      "type": "OPCUA-IIoT-Write",
      "z": "19152f4e3d25f8d0",
      "connector": "c1wrf2",
      "name": "TestWrite",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": true,
      "x": 420,
      "y": 180,
      "wires": [
        [
          "n4wrf2",
          "n5wrf2"
        ]
      ]
    },
    {
      "id": "n4wrf2",
      "type": "helper",
      "z": "19152f4e3d25f8d0",
      "active": true,
      "x": 670,
      "y": 240,
      "wires": []
    },
    {
      "id": "n5wrf2",
      "type": "OPCUA-IIoT-Response",
      "z": "19152f4e3d25f8d0",
      "name": "TestWriteResponse",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 690,
      "y": 180,
      "wires": [
        [
          "n6wrf2"
        ]
      ]
    },
    {
      "id": "n6wrf2",
      "type": "helper",
      "z": "19152f4e3d25f8d0",
      "active": true,
      "x": 890,
      "y": 180,
      "wires": []
    },
    {
      "id": "s1wrf2",
      "type": "OPCUA-IIoT-Server",
      "z": "19152f4e3d25f8d0",
      "port": "",
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
      "x": 410,
      "y": 120,
      "wires": [
        []
      ]
    },
    {
      "id": "c1wrf2",
      "type": "OPCUA-IIoT-Connector",
      "z": "19152f4e3d25f8d0",
      "discoveryUrl": "",
      "endpoint": "",
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

  "testWriteNodeToBeLoadedWithServer":  helperExtensions.cleanFlowPositionData(  [
    {
      "id": "311916e87bb45178",
      "type": "tab",
      "label": "Test Write Node to be loaded with Server",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "34d2c6bc.43275b",
      "type": "OPCUA-IIoT-Write",
      "z": "311916e87bb45178",
      "connector": "d35ceb8e.d06aa8",
      "name": "TestWrite",
      "justValue": false,
      "showStatusActivities": false,
      "showErrors": true,
      "x": 220,
      "y": 160,
      "wires": [
        [
          "6c817bf531523e3b"
        ]
      ]
    },
    {
      "id": "s1wrf2",
      "type": "OPCUA-IIoT-Server",
      "z": "311916e87bb45178",
      "port": "",
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
      "x": 230,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "6c817bf531523e3b",
      "type": "helper",
      "z": "311916e87bb45178",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 440,
      "y": 160,
      "wires": []
    },
    {
      "id": "d35ceb8e.d06aa8",
      "type": "OPCUA-IIoT-Connector",
      "z": "311916e87bb45178",
      "discoveryUrl": "",
      "endpoint": "",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "TESTSERVER",
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
  ] )
}