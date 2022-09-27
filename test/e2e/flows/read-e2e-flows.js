const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testReadFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "384813a208ca8aa5",
      "type": "tab",
      "label": "Test Read Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1rdf1",
      "type": "OPCUA-IIoT-Inject",
      "z": "384813a208ca8aa5",
      "injectType": "read",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicRead",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "TestName",
      "addressSpaceItems": [
        {
          "name": "ServerStatus",
          "nodeId": "ns=0;i=2256",
          "datatypeName": ""
        }
      ],
      "x": 210,
      "y": 180,
      "wires": [
        [
          "n2rdf1",
          "n3rdf1"
        ]
      ]
    },
    {
      "id": "n2rdf1",
      "type": "helper",
      "z": "384813a208ca8aa5",
      "active": true,
      "x": 430,
      "y": 240,
      "wires": []
    },
    {
      "id": "n3rdf1",
      "type": "OPCUA-IIoT-Read",
      "z": "384813a208ca8aa5",
      "attributeId": 0,
      "maxAge": 1,
      "depth": 1,
      "connector": "c1rdf1",
      "name": "ReadAll",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "x": 420,
      "y": 180,
      "wires": [
        [
          "n4rdf1",
          "n5rdf1"
        ]
      ]
    },
    {
      "id": "n4rdf1",
      "type": "helper",
      "z": "384813a208ca8aa5",
      "active": true,
      "x": 650,
      "y": 240,
      "wires": []
    },
    {
      "id": "n5rdf1",
      "type": "OPCUA-IIoT-Response",
      "z": "384813a208ca8aa5",
      "name": "TestResponse",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 660,
      "y": 180,
      "wires": [
        [
          "n6rdf1"
        ]
      ]
    },
    {
      "id": "n6rdf1",
      "type": "helper",
      "z": "384813a208ca8aa5",
      "active": true,
      "x": 870,
      "y": 180,
      "wires": []
    },
    {
      "id": "s1rdf1",
      "type": "OPCUA-IIoT-Server",
      "z": "384813a208ca8aa5",
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
      "id": "c1rdf1",
      "type": "OPCUA-IIoT-Connector",
      "z": "384813a208ca8aa5",
      "discoveryUrl": "",
      "endpoint": "",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "NONE",
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

  "testReadHistoryRangeFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "281a910dd4b5ce4e",
      "type": "tab",
      "label": "Test Read History Range Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "b6e5bc66.864128",
      "type": "OPCUA-IIoT-Inject",
      "z": "281a910dd4b5ce4e",
      "injectType": "read",
      "payload": "{\"historyStart\":0,\"historyEnd\":0}",
      "payloadType": "json",
      "topic": "TestTopicRead1",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;s=free_memory",
          "datatypeName": ""
        }
      ],
      "x": 150,
      "y": 260,
      "wires": [
        [
          "ed779eb9.7b89"
        ]
      ]
    },
    {
      "id": "5ab9594f.f9358",
      "type": "OPCUA-IIoT-Inject",
      "z": "281a910dd4b5ce4e",
      "injectType": "read",
      "payload": "{\"historyStart\":0,\"historyEnd\":0}",
      "payloadType": "json",
      "topic": "TestTopicRead2",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "5",
      "name": "",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;s=free_memory",
          "datatypeName": ""
        }
      ],
      "x": 150,
      "y": 180,
      "wires": [
        [
          "cb36ad39.f475b8"
        ]
      ]
    },
    {
      "id": "cb36ad39.f475b8",
      "type": "function",
      "z": "281a910dd4b5ce4e",
      "name": "",
      "func": "let startDate = new Date()\nlet historyStart = new Date()\nhistoryStart.setDate(startDate.getDate() - 2)\nlet historyEnd = new Date()\n\nmsg.payload.historyStart = historyStart\nmsg.payload.historyEnd = historyEnd\n\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "x": 300,
      "y": 180,
      "wires": [
        [
          "ed779eb9.7b89"
        ]
      ]
    },
    {
      "id": "ed779eb9.7b89",
      "type": "OPCUA-IIoT-Read",
      "z": "281a910dd4b5ce4e",
      "attributeId": "130",
      "maxAge": 1,
      "depth": 1,
      "connector": "ef9763f4.0e6728",
      "name": "Read History",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "historyDays": "",
      "x": 490,
      "y": 260,
      "wires": [
        [
          "37d1d8fb.5f4908",
          "dd2554f4.e88bd8"
        ]
      ]
    },
    {
      "id": "37d1d8fb.5f4908",
      "type": "OPCUA-IIoT-Response",
      "z": "281a910dd4b5ce4e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 680,
      "y": 260,
      "wires": [
        [
          "nr1h"
        ]
      ]
    },
    {
      "id": "nr1h",
      "type": "helper",
      "z": "281a910dd4b5ce4e",
      "x": 870,
      "y": 260,
      "wires": []
    },
    {
      "id": "dd2554f4.e88bd8",
      "type": "OPCUA-IIoT-Response",
      "z": "281a910dd4b5ce4e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateFilters": false,
      "filters": [],
      "x": 690,
      "y": 200,
      "wires": [
        [
          "nr2h"
        ]
      ]
    },
    {
      "id": "nr2h",
      "type": "helper",
      "z": "281a910dd4b5ce4e",
      "x": 870,
      "y": 200,
      "wires": []
    },
    {
      "id": "920108b3.753a68",
      "type": "OPCUA-IIoT-Server",
      "z": "281a910dd4b5ce4e",
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
      "registerServerMethod": "1",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "x": 350,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "ef9763f4.0e6728",
      "type": "OPCUA-IIoT-Connector",
      "z": "281a910dd4b5ce4e",
      "discoveryUrl": "",
      "endpoint": "",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "NONE",
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

  "testReadFlexServerFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "ad80e5af2d463666",
      "type": "tab",
      "label": "Test Read Flex Server Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1rdf3",
      "type": "OPCUA-IIoT-Inject",
      "z": "ad80e5af2d463666",
      "injectType": "read",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicRead",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "TestName",
      "addressSpaceItems": [
        {
          "name": "ServerStatus",
          "nodeId": "ns=0;i=2256",
          "datatypeName": ""
        }
      ],
      "x": 210,
      "y": 180,
      "wires": [
        [
          "n2rdf3",
          "n3rdf3"
        ]
      ]
    },
    {
      "id": "n2rdf3",
      "type": "helper",
      "z": "ad80e5af2d463666",
      "x": 430,
      "y": 240,
      "wires": []
    },
    {
      "id": "n3rdf3",
      "type": "OPCUA-IIoT-Read",
      "z": "ad80e5af2d463666",
      "attributeId": 0,
      "maxAge": 1,
      "depth": 1,
      "connector": "c1rdf3",
      "name": "ReadAll",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "historyDays": "",
      "x": 420,
      "y": 180,
      "wires": [
        [
          "n4rdf3",
          "n5rdf3"
        ]
      ]
    },
    {
      "id": "n4rdf3",
      "type": "helper",
      "z": "ad80e5af2d463666",
      "x": 690,
      "y": 240,
      "wires": []
    },
    {
      "id": "n5rdf3",
      "type": "OPCUA-IIoT-Response",
      "z": "ad80e5af2d463666",
      "name": "TestResponse",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 700,
      "y": 180,
      "wires": [
        [
          "n6rdf3"
        ]
      ]
    },
    {
      "id": "n6rdf3",
      "type": "helper",
      "z": "ad80e5af2d463666",
      "x": 890,
      "y": 180,
      "wires": []
    },
    {
      "id": "s1rdf3",
      "type": "OPCUA-IIoT-Flex-Server",
      "z": "ad80e5af2d463666",
      "port": "",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "DEMOFLEXSERVER",
      "showStatusActivities": false,
      "showErrors": false,
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
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": 500,
      "addressSpaceScript": "function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n  done()\n}",
      "x": 320,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "c1rdf3",
      "type": "OPCUA-IIoT-Connector",
      "z": "ad80e5af2d463666",
      "discoveryUrl": "",
      "endpoint": "",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "NONE",
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