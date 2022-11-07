const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testFilterReadFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "0fb1b31bf37daed3",
      "type": "tab",
      "label": "Test Filter Read Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "ac8b3930.dce72",
      "type": "OPCUA-IIoT-Inject",
      "z": "0fb1b31bf37daed3",
      "injectType": "read",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;s=TestReadWrite",
          "datatypeName": ""
        },
        {
          "name": "",
          "nodeId": "ns=1;s=Counter",
          "datatypeName": ""
        }
      ],
      "x": 130,
      "y": 140,
      "wires": [
        [
          "264129c0.ffc7c6"
        ]
      ]
    },
    {
      "id": "264129c0.ffc7c6",
      "type": "OPCUA-IIoT-Read",
      "z": "0fb1b31bf37daed3",
      "attributeId": "0",
      "maxAge": 1,
      "depth": 1,
      "connector": "370c0d61.becf9a",
      "name": "",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "historyDays": "",
      "x": 310,
      "y": 140,
      "wires": [
        [
          "14bba4a7.aa0f1b"
        ]
      ]
    },
    {
      "id": "14bba4a7.aa0f1b",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "0fb1b31bf37daed3",
      "nodeId": "ns=1;s=TestReadWrite",
      "datatype": "Double",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": "1",
      "justValue": false,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "",
      "showErrors": false,
      "x": 520,
      "y": 140,
      "wires": [
        [
          "72c83822.3e81d8"
        ]
      ]
    },
    {
      "id": "72c83822.3e81d8",
      "type": "OPCUA-IIoT-Response",
      "z": "0fb1b31bf37daed3",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 760,
      "y": 140,
      "wires": [
        [
          "n1frf1"
        ]
      ]
    },
    {
      "id": "n1frf1",
      "type": "helper",
      "z": "0fb1b31bf37daed3",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 970,
      "y": 140,
      "wires": []
    },
    {
      "id": "5c9db1b6.2b4488",
      "type": "OPCUA-IIoT-Server",
      "z": "0fb1b31bf37daed3",
      "port": "49100",
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
      "users": [
        {
          "name": "peter",
          "password": "peter"
        }
      ],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "registerServerMethod": "1",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": "",
      "maxNodesPerBrowse": "",
      "delayToClose": "",
      "x": 190,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "370c0d61.becf9a",
      "type": "OPCUA-IIoT-Connector",
      "z": "0fb1b31bf37daed3",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49100/",
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

  "testListenerFilterFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "926c2ada66c3ba0c",
      "type": "tab",
      "label": "Test Listener Filter Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "b8ff62e0.eccb98",
      "type": "OPCUA-IIoT-Inject",
      "z": "926c2ada66c3ba0c",
      "injectType": "listen",
      "payload": "{ \"interval\": 250, \"queueSize\": 10 }",
      "payloadType": "json",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "Start Abo",
      "addressSpaceItems": [
        {
          "name": "Counter",
          "nodeId": "ns=1;s=Counter",
          "datatypeName": ""
        },
        {
          "name": "FullCounter",
          "nodeId": "ns=1;s=FullCounter",
          "datatypeName": ""
        },
        {
          "name": "",
          "nodeId": "ns=1;s=TestReadWrite",
          "datatypeName": ""
        },
        {
          "name": "",
          "nodeId": "ns=0;i=2277",
          "datatypeName": ""
        }
      ],
      "x": 140,
      "y": 220,
      "wires": [
        [
          "6e640595.cecfa4"
        ]
      ]
    },
    {
      "id": "6e640595.cecfa4",
      "type": "OPCUA-IIoT-Listener",
      "z": "926c2ada66c3ba0c",
      "connector": "670d2f00.3b53d",
      "action": "subscribe",
      "queueSize": 10,
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 320,
      "y": 220,
      "wires": [
        [
          "c9b90a13.153d8",
          "b784203d.460118",
          "ea3839ac.fb08c",
          "771dd0d1.f27d5"
        ]
      ]
    },
    {
      "id": "c9b90a13.153d8",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "926c2ada66c3ba0c",
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
      "x": 570,
      "y": 340,
      "wires": [
        [
          "n1frf2"
        ]
      ]
    },
    {
      "id": "n1frf2",
      "type": "helper",
      "z": "926c2ada66c3ba0c",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 810,
      "y": 340,
      "wires": []
    },
    {
      "id": "b784203d.460118",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "926c2ada66c3ba0c",
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
      "x": 580,
      "y": 260,
      "wires": [
        [
          "n2frf2"
        ]
      ]
    },
    {
      "id": "n2frf2",
      "type": "helper",
      "z": "926c2ada66c3ba0c",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 810,
      "y": 260,
      "wires": []
    },
    {
      "id": "ea3839ac.fb08c",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "926c2ada66c3ba0c",
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
      "x": 560,
      "y": 160,
      "wires": [
        [
          "n3frf2"
        ]
      ]
    },
    {
      "id": "n3frf2",
      "type": "helper",
      "z": "926c2ada66c3ba0c",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 810,
      "y": 160,
      "wires": []
    },
    {
      "id": "771dd0d1.f27d5",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "926c2ada66c3ba0c",
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
      "x": 550,
      "y": 80,
      "wires": [
        [
          "n4frf2"
        ]
      ]
    },
    {
      "id": "n4frf2",
      "type": "helper",
      "z": "926c2ada66c3ba0c",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 810,
      "y": 80,
      "wires": []
    },
    {
      "id": "5c9db1b6.2b4433",
      "type": "OPCUA-IIoT-Server",
      "z": "926c2ada66c3ba0c",
      "port": "49200",
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
      "users": [
        {
          "name": "peter",
          "password": "peter"
        }
      ],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "registerServerMethod": "1",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": "",
      "maxNodesPerBrowse": "",
      "delayToClose": "",
      "x": 150,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "670d2f00.3b53d",
      "type": "OPCUA-IIoT-Connector",
      "z": "926c2ada66c3ba0c",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49200/",
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

  "testCrawlerFilterFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "771d188e5d1cab5f",
      "type": "tab",
      "label": "Test Crawler Filter Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "651594be.d15a94",
      "type": "OPCUA-IIoT-Inject",
      "z": "771d188e5d1cab5f",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "inject",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;i=1001",
          "datatypeName": ""
        }
      ],
      "x": 150,
      "y": 180,
      "wires": [
        [
          "fb606b23.b773c8"
        ]
      ]
    },
    {
      "id": "fb606b23.b773c8",
      "type": "OPCUA-IIoT-Crawler",
      "z": "771d188e5d1cab5f",
      "connector": "9428fd82.ba05b8",
      "name": "",
      "justValue": true,
      "singleResult": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "nodeClass",
          "value": "Method"
        },
        {
          "name": "nodeClass",
          "value": "ObjectType*"
        },
        {
          "name": "typeDefinition",
          "value": "ns=0;i=58"
        },
        {
          "name": "nodeId",
          "value": "ns=0;*"
        }
      ],
      "delayPerMessage": "0.5",
      "timeout": "",
      "x": 340,
      "y": 180,
      "wires": [
        [
          "3025bc7e.1aabac"
        ]
      ]
    },
    {
      "id": "3025bc7e.1aabac",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "771d188e5d1cab5f",
      "nodeId": "ns=1;i=1002",
      "datatype": "",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": false,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "",
      "showErrors": false,
      "x": 550,
      "y": 180,
      "wires": [
        [
          "n1crf3"
        ]
      ]
    },
    {
      "id": "n1crf3",
      "type": "helper",
      "z": "771d188e5d1cab5f",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "true",
      "targetType": "full",
      "statusVal": "",
      "statusType": "auto",
      "x": 750,
      "y": 180,
      "wires": []
    },
    {
      "id": "5c9db1b6.2b2233",
      "type": "OPCUA-IIoT-Server",
      "z": "771d188e5d1cab5f",
      "port": "49400",
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
      "users": [
        {
          "name": "peter",
          "password": "peter"
        }
      ],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "registerServerMethod": "1",
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": "",
      "maxNodesPerBrowse": "",
      "delayToClose": "",
      "x": 150,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "9428fd82.ba05b8",
      "type": "OPCUA-IIoT-Connector",
      "z": "771d188e5d1cab5f",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49400/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL CRAWLER SERVER",
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
  ]),

  "testBrowserReadFilterFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "f907d5d45a2f32aa",
      "type": "tab",
      "label": "Test Browser Read Filter Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "e41b31a770aae974",
      "type": "OPCUA-IIoT-Inject",
      "z": "f907d5d45a2f32aa",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 183,
      "y": 276,
      "wires": [
        [
          "a56f06c60c748adc"
        ]
      ]
    },
    {
      "id": "a56f06c60c748adc",
      "type": "OPCUA-IIoT-Browser",
      "z": "f907d5d45a2f32aa",
      "nodeId": "",
      "name": "",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToBrowser": false,
      "sendNodesToListener": false,
      "multipleOutputs": false,
      "showStatusActivities": false,
      "showErrors": false,
      "recursiveBrowse": false,
      "recursiveDepth": 1,
      "delayPerMessage": 0.2,
      "connector": "adcdcb3b6536f1a0",
      "x": 331,
      "y": 276,
      "wires": [
        [
          "33a45514d924a66f"
        ]
      ]
    },
    {
      "id": "94f643951fbe1db3",
      "type": "OPCUA-IIoT-Read",
      "z": "f907d5d45a2f32aa",
      "attributeId": 0,
      "maxAge": 1,
      "depth": 1,
      "connector": "adcdcb3b6536f1a0",
      "name": "",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "historyDays": 1,
      "x": 654,
      "y": 275,
      "wires": [
        [
          "920deb27a882f242"
        ]
      ]
    },
    {
      "id": "33a45514d924a66f",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "f907d5d45a2f32aa",
      "nodeId": "ns=1;s=Pressure",
      "datatype": "",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": false,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "Result Filter",
      "showErrors": false,
      "x": 500,
      "y": 276,
      "wires": [
        [
          "94f643951fbe1db3"
        ]
      ]
    },
    {
      "id": "920deb27a882f242",
      "type": "helper",
      "z": "f907d5d45a2f32aa",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 797,
      "y": 275,
      "wires": []
    },
    {
      "id": "1da9bda808ddfb0f",
      "type": "OPCUA-IIoT-Server",
      "z": "f907d5d45a2f32aa",
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
      "registerServerMethod": 1,
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": 1000,
      "x": 155,
      "y": 111,
      "wires": [
        []
      ]
    },
    {
      "id": "adcdcb3b6536f1a0",
      "type": "OPCUA-IIoT-Connector",
      "z": "f907d5d45a2f32aa",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:55388/",
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