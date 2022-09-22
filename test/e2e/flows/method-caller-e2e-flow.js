const helperExtensions = require('../../test-helper-extensions')

module.exports = {

  "testMethodFlowPayload":  helperExtensions.cleanFlowPositionData(  [
    {
      "id": "n1mcf1",
      "type": "OPCUA-IIoT-Inject",
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
      "wires": [
        [
          "n2mcf1",
          "n3mcf1"
        ]
      ]
    },
    {id: "n2mcf1", type: "helper"},
    {
      "id": "n3mcf1",
      "type": "OPCUA-IIoT-Method-Caller",
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
      "wires": [
        [
          "n4mcf1",
          "n5mcf1",
          "n51mcf1"
        ]
      ]
    },
    {id: "n4mcf1", type: "helper"},
    {
      "id": "n5mcf1",
      "type": "OPCUA-IIoT-Response",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "wires": [
        ["n6mcf1"]
      ]
    },
    {
      "id": "n51mcf1",
      "type": "OPCUA-IIoT-Response",
      "name": "",
      "compressedStruct": true,
      "showStatusActivities": false,
      "showErrors": false,
      "wires": [["n7mcf1"]]
    },
    {id: "n6mcf1", type: "helper"},
    {id: "n7mcf1", type: "helper"},
    {
      "id": "c1mcf1",
      "type": "OPCUA-IIoT-Connector",
      "z": "",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51976/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL DEMO SERVER",
      "showErrors": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "60000",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false
    },
    {
      "id": "s1mcf1",
      "type": "OPCUA-IIoT-Server",
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
      "isAuditing": false,
      "serverDiscovery": false,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "wires": [[]]
    }
  ] ),

  "testMethodInjectFlowPayload":  helperExtensions.cleanFlowPositionData(  [
    {
      "id": "n1mcf2",
      "type": "inject",
      "name": "TestName",
      "topic": "TestTopicMethod",
      "payload": "23456",
      "payloadType": "num",
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": "3",
      "wires": [
        [
          "n2mcf2",
          "n3mcf2"
        ]
      ]
    },
    {id: "n2mcf2", type: "helper"},
    {
      "id": "n3mcf2",
      "type": "function",
      "name": "bark six times with volume twelve",
      "func": "msg.payload = {\n    objectId: \"ns=1;i=1234\",\n    methodId: \"ns=1;i=12345\",\n    inputArguments: [\n        " +
        "{name: \"barks\", dataType:\"UInt32\", value:\"6\"},\n        {name: \"volume\", dataType:\"UInt32\", value:\"12\"}\n    ],\n    " +
        "methodType: \"basic\"\n}\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "wires": [
        [
          "n4mcf2",
          "n5mcf2"
        ]
      ]
    },
    {id: "n4mcf2", type: "helper"},
    {
      "id": "n5mcf2",
      "type": "OPCUA-IIoT-Method-Caller",
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
      "wires": [
        [
          "n6mcf2",
          "n7mcf2"
        ]
      ]
    },
    {id: "n6mcf2", type: "helper"},
    {
      "id": "n7mcf2",
      "type": "OPCUA-IIoT-Response",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateFilters": false,
      "filters": [],
      "wires": [
        ["n8mcf2"]
      ]
    },
    {id: "n8mcf2", type: "helper"},
    {
      "id": "c1mcf2",
      "type": "OPCUA-IIoT-Connector",
      "z": "",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51977/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
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
    },
    {
      "id": "s1mcf2",
      "type": "OPCUA-IIoT-Server",
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
      "isAuditing": false,
      "serverDiscovery": false,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "wires": [[]]
    }
  ] )
}