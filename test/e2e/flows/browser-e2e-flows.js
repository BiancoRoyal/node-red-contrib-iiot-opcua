
const helperExtensions = require('../../test-helper-extensions')

module.exports = {

  "testBrowseFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "n1f1",
      "type": "OPCUA-IIoT-Inject",
      "z": "39d0838d2c1ef436",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicBrowse",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "Root",
      "addressSpaceItems": [],
      "x": 130,
      "y": 200,
      "wires": [
        [
          "n2f1",
          "n3f1"
        ]
      ]
    },
    {
      "id": "n2f1",
      "type": "helper",
      "z": "39d0838d2c1ef436",
      "active": true,
      "x": 330,
      "y": 260,
      "wires": []
    },
    {
      "id": "n3f1",
      "type": "OPCUA-IIoT-Browser",
      "z": "39d0838d2c1ef436",
      "connector": "c1f1",
      "nodeId": "ns=1;i=1234",
      "name": "TestBrowse",
      "justValue": false,
      "sendNodesToRead": false,
      "sendNodesToListener": false,
      "sendNodesToBrowser": false,
      "recursiveBrowse": false,
      "recursiveDepth": 1,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 330,
      "y": 200,
      "wires": [
        [
          "n5f1",
          "n4rf1",
          "14bba4a7.aa0f1b"
        ]
      ]
    },
    {
      "id": "14bba4a7.aa0f1b",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "39d0838d2c1ef436",
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
      "x": 620,
      "y": 280,
      "wires": [
        [
          "n21rf1"
        ]
      ]
    },
    {
      "id": "n21rf1",
      "type": "helper",
      "z": "39d0838d2c1ef436",
      "active": true,
      "x": 830,
      "y": 280,
      "wires": []
    },
    {
      "id": "n4rf1",
      "type": "OPCUA-IIoT-Response",
      "z": "39d0838d2c1ef436",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 580,
      "y": 200,
      "wires": [
        [
          "n3rf1"
        ]
      ]
    },
    {
      "id": "n3rf1",
      "type": "helper",
      "z": "39d0838d2c1ef436",
      "active": true,
      "x": 830,
      "y": 200,
      "wires": []
    },
    {
      "id": "n5f1",
      "type": "helper",
      "z": "39d0838d2c1ef436",
      "active": true,
      "x": 590,
      "y": 340,
      "wires": []
    },
    {
      "id": "s1f1",
      "type": "OPCUA-IIoT-Server",
      "z": "39d0838d2c1ef436",
      "port": "51958",
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
      "x": 330,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "c1f1",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51958/",
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
  ]),

  "testBrowseLevelsFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "n1f2",
      "type": "OPCUA-IIoT-Inject",
      "z": "51215e7496fccca5",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicBrowse",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "Root",
      "addressSpaceItems": [],
      "x": 210,
      "y": 200,
      "wires": [
        [
          "n2f2",
          "n3f2"
        ]
      ]
    },
    {
      "id": "n2f2",
      "type": "helper",
      "z": "51215e7496fccca5",
      "active": true,
      "x": 430,
      "y": 260,
      "wires": []
    },
    {
      "id": "n3f2",
      "type": "OPCUA-IIoT-Browser",
      "z": "51215e7496fccca5",
      "connector": "c1f2",
      "nodeId": "ns=1;i=1234",
      "name": "TestBrowse",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": false,
      "sendNodesToBrowser": true,
      "multipleOutputs": false,
      "recursiveBrowse": false,
      "recursiveDepth": 3,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 430,
      "y": 200,
      "wires": [
        [
          "n4f2",
          "n5f2"
        ]
      ]
    },
    {
      "id": "n4f2",
      "type": "helper",
      "z": "51215e7496fccca5",
      "active": true,
      "x": 690,
      "y": 260,
      "wires": []
    },
    {
      "id": "n5f2",
      "type": "OPCUA-IIoT-Browser",
      "z": "51215e7496fccca5",
      "connector": "c1f2",
      "nodeId": "",
      "name": "TestBrowseLevel2",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": true,
      "sendNodesToBrowser": false,
      "recursiveBrowse": false,
      "recursiveDepth": 1,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 710,
      "y": 200,
      "wires": [
        [
          "n6f2"
        ]
      ]
    },
    {
      "id": "n6f2",
      "type": "helper",
      "z": "51215e7496fccca5",
      "active": true,
      "x": 930,
      "y": 200,
      "wires": []
    },
    {
      "id": "s1f2",
      "type": "OPCUA-IIoT-Server",
      "z": "51215e7496fccca5",
      "port": "51959",
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
      "x": 430,
      "y": 120,
      "wires": [
        []
      ]
    },
    {
      "id": "c1f2",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51959/",
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
  ]),

  "testBrowseItemFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "n1f3",
      "type": "OPCUA-IIoT-Inject",
      "z": "39d7c16edf70208f",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicBrowse",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "Root",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 330,
      "y": 140,
      "wires": [
        [
          "n2f3",
          "n3f3"
        ]
      ]
    },
    {
      "id": "n2f3",
      "type": "helper",
      "z": "39d7c16edf70208f",
      "active": true,
      "x": 510,
      "y": 200,
      "wires": []
    },
    {
      "id": "n3f3",
      "type": "OPCUA-IIoT-Browser",
      "z": "39d7c16edf70208f",
      "connector": "c1f3",
      "nodeId": "",
      "name": "TestBrowse",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": false,
      "sendNodesToBrowser": false,
      "recursiveBrowse": false,
      "recursiveDepth": 1,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 510,
      "y": 140,
      "wires": [
        [
          "n5f3"
        ]
      ]
    },
    {
      "id": "n5f3",
      "type": "helper",
      "z": "39d7c16edf70208f",
      "active": true,
      "x": 750,
      "y": 140,
      "wires": []
    },
    {
      "id": "s1f3",
      "type": "OPCUA-IIoT-Server",
      "z": "39d7c16edf70208f",
      "port": "51960",
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
      "x": 510,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "c1f3",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51960/",
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
  ]),

  "testBrowserResponseResultFilterFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "21337b84.2a8c2c",
      "type": "OPCUA-IIoT-Inject",
      "z": "e2beb1148883f2d5",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "Root",
      "addressSpaceItems": [],
      "x": 130,
      "y": 320,
      "wires": [
        [
          "54c417f.8f6eee8"
        ]
      ]
    },
    {
      "id": "54c417f.8f6eee8",
      "type": "OPCUA-IIoT-Browser",
      "z": "e2beb1148883f2d5",
      "connector": "df5067f7.317428",
      "nodeId": "ns=1;i=1234",
      "name": "",
      "justValue": true,
      "sendNodesToRead": true,
      "sendNodesToListener": true,
      "sendNodesToBrowser": true,
      "recursiveBrowse": false,
      "recursiveDepth": "",
      "showStatusActivities": false,
      "showErrors": true,
      "x": 340,
      "y": 320,
      "wires": [
        [
          "29f70fe4.908768",
          "3b5f43b0.cb6b1c",
          "61fa9abd.d996d4",
          "d49ce601.91bc88",
          "dd4608.71f0c1f8",
          "21ddfba4.f81d6c",
          "8d4ecc1b.cf52f",
          "dae729d.4118f58",
          "f5ab27de.a2b94",
          "5aae2743.2bdad8"
        ]
      ]
    },
    {
      "id": "29f70fe4.908768",
      "type": "OPCUA-IIoT-Response",
      "z": "e2beb1148883f2d5",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 650,
      "y": 620,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "3b5f43b0.cb6b1c",
      "type": "OPCUA-IIoT-Response",
      "z": "e2beb1148883f2d5",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "nodeId",
          "value": "ns=1;s=PumpSpeed"
        }
      ],
      "x": 660,
      "y": 560,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "61fa9abd.d996d4",
      "type": "OPCUA-IIoT-Response",
      "z": "e2beb1148883f2d5",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "nodeId",
          "value": "ns=1;s=PumpSpeed"
        }
      ],
      "x": 660,
      "y": 500,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "d49ce601.91bc88",
      "type": "OPCUA-IIoT-Response",
      "z": "e2beb1148883f2d5",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": true,
      "negateFilter": true,
      "filters": [
        {
          "name": "nodeId",
          "value": "ns=1;s=PumpSpeed"
        }
      ],
      "x": 660,
      "y": 440,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "dd4608.71f0c1f8",
      "type": "OPCUA-IIoT-Response",
      "z": "e2beb1148883f2d5",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 660,
      "y": 380,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "21ddfba4.f81d6c",
      "type": "OPCUA-IIoT-Response",
      "z": "e2beb1148883f2d5",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 650,
      "y": 320,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "8d4ecc1b.cf52f",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "e2beb1148883f2d5",
      "nodeId": "ns=1;s=Pressure",
      "datatype": "",
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
      "x": 650,
      "y": 240,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "dae729d.4118f58",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "e2beb1148883f2d5",
      "nodeId": "ns=1;s=Pressure",
      "datatype": "Double",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": true,
      "withValueCheck": true,
      "minvalue": "0.5",
      "maxvalue": "0.2",
      "defaultvalue": "1",
      "topic": "",
      "name": "",
      "showErrors": false,
      "x": 650,
      "y": 180,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "f5ab27de.a2b94",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "e2beb1148883f2d5",
      "nodeId": "ns=1;s=Pressure",
      "datatype": "Double",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": true,
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
      "x": 650,
      "y": 120,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "5aae2743.2bdad8",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "e2beb1148883f2d5",
      "nodeId": "ns=1;s=Pressure",
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
      "x": 650,
      "y": 60,
      "wires": [
        [
          "n1f4"
        ]
      ]
    },
    {
      "id": "n1f4",
      "type": "helper",
      "z": "e2beb1148883f2d5",
      "active": true,
      "x": 910,
      "y": 340,
      "wires": []
    },
    {
      "id": "s1f4",
      "type": "OPCUA-IIoT-Server",
      "z": "e2beb1148883f2d5",
      "port": "51961",
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
      "x": 330,
      "y": 240,
      "wires": [
        []
      ]
    },
    {
      "id": "df5067f7.317428",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51961/",
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
      "autoSelectRightEndpoint": false
    }
  ])
}