
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testBrowseFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "5199fbd4.d70cec",
      "type": "tab",
      "label": "Test Node Listener Flow",
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
      "x": 780,
      "y": 120,
      "wires": [
        [
          "b79f4f7c56fcb140"
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
      "x": 350,
      "y": 180,
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
      "name": "",
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
      "topic": "",
      "payload": "{ \"interval\": 500, \"queueSize\": 10 }",
      "payloadType": "json",
      "x": 170,
      "y": 160,
      "wires": [
        [
          "d661a888.37c9b8"
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
      "showErrors": true,
      "x": 520,
      "y": 240,
      "wires": [
        [
          "53aa4e70.57ae7",
          "e89f48d5.837be",
          "9df04321.80beb",
          "e2f10f45.b1d6c8",
          "9c7eb4a929396c62"
        ]
      ]
    },
    {
      "id": "e89f48d5.837be",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "5199fbd4.d70cec",
      "nodeId": "ns=1;s=FullCounter",
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
      "x": 810,
      "y": 240,
      "wires": [
        [
          "5789f1186c3c3c11"
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
      "x": 790,
      "y": 180,
      "wires": [
        [
          "a322998a81d748af"
        ]
      ]
    },
    {
      "id": "e2f10f45.b1d6c8",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "5199fbd4.d70cec",
      "nodeId": "ns=1;s=Counter",
      "datatype": "UInt16",
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
      "x": 800,
      "y": 300,
      "wires": [
        [
          "8bad11890c277af4"
        ]
      ]
    },
    {
      "id": "042b6ec66d2a63ef",
      "type": "inject",
      "z": "5199fbd4.d70cec",
      "name": "",
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
      "onceDelay": "9",
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 150,
      "y": 200,
      "wires": [
        [
          "d661a888.37c9b8"
        ]
      ]
    },
    {
      "id": "24447f36151cfdf2",
      "type": "OPCUA-IIoT-Node",
      "z": "5199fbd4.d70cec",
      "injectType": "listen",
      "nodeId": "ns=1;s=Counter",
      "datatype": "Int32",
      "value": "",
      "name": "",
      "topic": "",
      "showErrors": false,
      "x": 350,
      "y": 300,
      "wires": [
        [
          "a8972b2d.2013f",
          "429c3a5b1b97891e"
        ]
      ]
    },
    {
      "id": "f641937ccc88a669",
      "type": "inject",
      "z": "5199fbd4.d70cec",
      "name": "",
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
      "topic": "",
      "payload": "{ \"interval\": 2000, \"queueSize\": 10 }",
      "payloadType": "json",
      "x": 170,
      "y": 280,
      "wires": [
        [
          "24447f36151cfdf2"
        ]
      ]
    },
    {
      "id": "2454a579ac2c3720",
      "type": "inject",
      "z": "5199fbd4.d70cec",
      "name": "",
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
      "onceDelay": "9",
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 150,
      "y": 320,
      "wires": [
        [
          "24447f36151cfdf2"
        ]
      ]
    },
    {
      "id": "d46ffacc98d72867",
      "type": "OPCUA-IIoT-Server",
      "z": "5199fbd4.d70cec",
      "port": "55388",
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
      "x": 370,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "429c3a5b1b97891e",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 530,
      "y": 360,
      "wires": []
    },
    {
      "id": "8bad11890c277af4",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1030,
      "y": 300,
      "wires": []
    },
    {
      "id": "5789f1186c3c3c11",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1030,
      "y": 240,
      "wires": []
    },
    {
      "id": "a322998a81d748af",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1030,
      "y": 180,
      "wires": []
    },
    {
      "id": "b79f4f7c56fcb140",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1030,
      "y": 120,
      "wires": []
    },
    {
      "id": "9c7eb4a929396c62",
      "type": "helper",
      "z": "5199fbd4.d70cec",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 790,
      "y": 360,
      "wires": []
    },
    {
      "id": "b98f961f.940bf",
      "type": "OPCUA-IIoT-Connector",
      "z": "5199fbd4.d70cec",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:55388/",
      "keepSessionAlive": true,
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