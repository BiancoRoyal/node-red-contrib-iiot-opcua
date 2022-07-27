const helperExtensions = require('../../test-helper-extensions')

module.exports = {
  
  "testWriteFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "n1wrf1",
      "type": "OPCUA-IIoT-Inject",
      "z": "c872ebc86181e41c",
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
      "x": 160,
      "y": 180,
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
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 390,
      "y": 240,
      "wires": []
    },
    {
      "id": "n3wrf1",
      "type": "function",
      "z": "c872ebc86181e41c",
      "name": "",
      "func": "msg.payload.valuesToWrite = [12345.22]\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 380,
      "y": 180,
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
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 630,
      "y": 240,
      "wires": []
    },
    {
      "id": "n5wrf1",
      "type": "OPCUA-IIoT-Write",
      "z": "c872ebc86181e41c",
      "connector": "c1wrf1",
      "name": "TestWrite",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": true,
      "x": 620,
      "y": 180,
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
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 870,
      "y": 220,
      "wires": []
    },
    {
      "id": "n7wrf1",
      "type": "OPCUA-IIoT-Response",
      "z": "c872ebc86181e41c",
      "name": "TestWriteResponse",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 890,
      "y": 160,
      "wires": [
        [
          "n8wrf1"
        ]
      ]
    },
    {
      "id": "n8wrf1",
      "type": "helper",
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 1090,
      "y": 160,
      "wires": []
    },
    {
      "id": "s1wrf1",
      "type": "OPCUA-IIoT-Server",
      "z": "c872ebc86181e41c",
      "port": "51972",
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
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "c1wrf1",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51972/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "NONE",
      "name": "LOCAL DEMO SERVER",
      "showErrors": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "60000",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": ""
    }
  ] ),

  "testWriteWithoutValuesToWriteFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "n1wrf2",
      "type": "OPCUA-IIoT-Inject",
      "z": "c872ebc86181e41c",
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
      "x": 160,
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
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 390,
      "y": 240,
      "wires": []
    },
    {
      "id": "n3wrf2",
      "type": "OPCUA-IIoT-Write",
      "z": "c872ebc86181e41c",
      "connector": "c1wrf2",
      "name": "TestWrite",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": true,
      "x": 380,
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
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 630,
      "y": 240,
      "wires": []
    },
    {
      "id": "n5wrf2",
      "type": "OPCUA-IIoT-Response",
      "z": "c872ebc86181e41c",
      "name": "TestWriteResponse",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 650,
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
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 850,
      "y": 180,
      "wires": []
    },
    {
      "id": "s1wrf2",
      "type": "OPCUA-IIoT-Server",
      "z": "c872ebc86181e41c",
      "port": "51973",
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
      "x": 370,
      "y": 120,
      "wires": [
        []
      ]
    },
    {
      "id": "c1wrf2",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51973/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "NONE",
      "name": "LOCAL DEMO SERVER",
      "showErrors": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "60000",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": ""
    }
  ] ),

  "testWriteNodeToBeLoadedWithServer":  helperExtensions.cleanFlowPositionData(  [
    {
      "id": "34d2c6bc.43275b",
      "type": "OPCUA-IIoT-Write",
      "z": "c872ebc86181e41c",
      "connector": "d35ceb8e.d06aa8",
      "name": "TestWrite",
      "justValue": false,
      "showStatusActivities": false,
      "showErrors": true,
      "x": 240,
      "y": 140,
      "wires": [
        []
      ]
    },
    {
      "id": "s1wrf2",
      "type": "OPCUA-IIoT-Server",
      "z": "c872ebc86181e41c",
      "port": "55392",
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
      "x": 250,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "d35ceb8e.d06aa8",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:55392/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "NONE",
      "name": "TESTSERVER",
      "showErrors": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "60000",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": ""
    }
  ] )
}