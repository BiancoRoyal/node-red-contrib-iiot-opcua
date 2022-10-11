
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testNodeFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "5199fbd4.d70cec",
      "type": "tab",
      "label": "Node Test Flow",
      "disabled": false,
      "info": ""
    },
    {
      "id": "53aa4e70.57ae7",
      "type": "OPCUA-IIoT-Response",
      "z": "5199fbd4.d70cec",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 720,
      "y": 180,
      "wires": [
        [
          "4354a9923dabe949"
        ]
      ]
    },
    {
      "id": "d661a888.37c9b8",
      "type": "OPCUA-IIoT-Node",
      "z": "5199fbd4.d70cec",
      "injectType": "listen",
      "nodeId": "ns=0;i=2277",
      "datatype": "NodeId",
      "value": "",
      "name": "",
      "topic": "",
      "showErrors": false,
      "x": 330,
      "y": 160,
      "wires": [
        [
          "a8972b2d.2013f"
        ]
      ]
    },
    {
      "id": "4602cdb3.217b64",
      "type": "OPCUA-IIoT-Node",
      "z": "5199fbd4.d70cec",
      "injectType": "listen",
      "nodeId": "ns=1;s=TestReadWrite",
      "datatype": "NodeId",
      "value": "",
      "name": "",
      "topic": "",
      "showErrors": false,
      "x": 330,
      "y": 320,
      "wires": [
        [
          "a8972b2d.2013f"
        ]
      ]
    },
    {
      "id": "7b9f4f56.422f58",
      "type": "inject",
      "z": "5199fbd4.d70cec",
      "name": "test1 sub",
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
      "onceDelay": "5",
      "topic": "testTopic1",
      "payload": "",
      "payloadType": "date",
      "x": 180,
      "y": 120,
      "wires": [
        [
          "d661a888.37c9b8"
        ]
      ]
    },
    {
      "id": "9935e96d.7c4588",
      "type": "inject",
      "z": "5199fbd4.d70cec",
      "name": "test2 sub",
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
      "onceDelay": "5",
      "topic": "testTopic2",
      "payload": "",
      "payloadType": "date",
      "x": 180,
      "y": 280,
      "wires": [
        [
          "4602cdb3.217b64"
        ]
      ]
    },
    {
      "id": "a8972b2d.2013f",
      "type": "OPCUA-IIoT-Listener",
      "z": "5199fbd4.d70cec",
      "connector": "b98f961f.940bf",
      "action": "subscribe",
      "queueSize": 10,
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 500,
      "y": 240,
      "wires": [
        [
          "53aa4e70.57ae7",
          "9df04321.80beb",
          "4178fe5e.f20bd",
          "9902563b094d0417"
        ]
      ]
    },
    {
      "id": "9df04321.80beb",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "5199fbd4.d70cec",
      "nodeId": "ns=0;i=2277",
      "datatype": "UInt32",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": true,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "",
      "showErrors": false,
      "x": 730,
      "y": 300,
      "wires": [
        [
          "5163093453399f1b"
        ]
      ]
    },
    {
      "id": "4178fe5e.f20bd",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "5199fbd4.d70cec",
      "nodeId": "ns=1;s=TestReadWrite",
      "datatype": "Double",
      "fixedValue": true,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": true,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "",
      "showErrors": false,
      "x": 760,
      "y": 240,
      "wires": [
        [
          "c7d02068b47b0c9d"
        ]
      ]
    },
    {
      "id": "2c8443488e3080ca",
      "type": "OPCUA-IIoT-Server",
      "z": "5199fbd4.d70cec",
      "port": "51400",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "Server",
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
      "registerServerMethod": 1,
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": 1000,
      "x": 490,
      "y": 140,
      "wires": [
        []
      ]
    },
    {
      "id": "4354a9923dabe949",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1000,
      "y": 180,
      "wires": []
    },
    {
      "id": "c7d02068b47b0c9d",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "helper 2",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1000,
      "y": 240,
      "wires": []
    },
    {
      "id": "5163093453399f1b",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "helper 3",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1000,
      "y": 300,
      "wires": []
    },
    {
      "id": "92a01d8fd09ef676",
      "type": "inject",
      "z": "5199fbd4.d70cec",
      "name": "test1 unsub",
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
      "onceDelay": "10",
      "topic": "testTopic1",
      "payload": "",
      "payloadType": "date",
      "x": 170,
      "y": 200,
      "wires": [
        [
          "d661a888.37c9b8"
        ]
      ]
    },
    {
      "id": "c3b257305670140a",
      "type": "inject",
      "z": "5199fbd4.d70cec",
      "name": "test2 unsub",
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
      "onceDelay": "10",
      "topic": "testTopic2",
      "payload": "",
      "payloadType": "date",
      "x": 170,
      "y": 360,
      "wires": [
        [
          "4602cdb3.217b64"
        ]
      ]
    },
    {
      "id": "9902563b094d0417",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "helper 4",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 720,
      "y": 360,
      "wires": []
    },
    {
      "id": "b98f961f.940bf",
      "type": "OPCUA-IIoT-Connector",
      "z": "5199fbd4.d70cec",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51400/",
      "endpointMustExist": false,
      "keepSessionAlive": true,
      "loginEnabled": false,
      "name": "LOCAL DEMO SERVER",
      "showErrors": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "individualCerts": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "60000",
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