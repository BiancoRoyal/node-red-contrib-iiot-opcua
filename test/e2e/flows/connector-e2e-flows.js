const helperExtensions = require("../../test-helper-extensions")

module.exports = {

  "testConnectorBrowseFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "1f545f09faa793c4",
      "type": "tab",
      "label": "Test Connector Browse Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1cf1",
      "type": "OPCUA-IIoT-Inject",
      "z": "1f545f09faa793c4",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicBrowse",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "TestInject",
      "addressSpaceItems": [],
      "x": 280,
      "y": 180,
      "wires": [
        [
          "n2cf1",
          "n3cf1"
        ]
      ]
    },
    {
      "id": "n2cf1",
      "type": "helper",
      "z": "1f545f09faa793c4",
      "active": true,
      "x": 490,
      "y": 240,
      "wires": []
    },
    {
      "id": "n3cf1",
      "type": "OPCUA-IIoT-Browser",
      "z": "1f545f09faa793c4",
      "connector": "c1cf1",
      "nodeId": "ns=1;i=1234",
      "name": "TestBrowser",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": false,
      "sendNodesToBrowser": false,
      "multipleOutputs": false,
      "recursiveBrowse": false,
      "recursiveDepth": 1,
      "delayPerMessage": "",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 490,
      "y": 180,
      "wires": [
        [
          "n5cf1"
        ]
      ]
    },
    {
      "id": "n5cf1",
      "type": "helper",
      "z": "1f545f09faa793c4",
      "active": true,
      "x": 690,
      "y": 180,
      "wires": []
    },
    {
      "id": "s1cf1",
      "type": "OPCUA-IIoT-Server",
      "z": "1f545f09faa793c4",
      "port": "51962",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
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
      "x": 490,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "c1cf1",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51962/",
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
  ] ),

  "testConnectorReadFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "n1cf2",
      "type": "OPCUA-IIoT-Inject",
      "z": "6fceee54d88ab861",
      "injectType": "read",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicRead",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;s=Pressure",
          "datatypeName": ""
        }
      ],
      "x": 180,
      "y": 160,
      "wires": [
        [
          "n2cf2",
          "n3cf2"
        ]
      ]
    },
    {
      "id": "n2cf2",
      "type": "helper",
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 470,
      "y": 220,
      "wires": []
    },
    {
      "id": "n3cf2",
      "type": "OPCUA-IIoT-Read",
      "z": "6fceee54d88ab861",
      "attributeId": 0,
      "maxAge": 1,
      "depth": 1,
      "connector": "c1cf2",
      "name": "TestRead",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "x": 460,
      "y": 160,
      "wires": [
        [
          "n5cf2"
        ]
      ]
    },
    {
      "id": "n5cf2",
      "type": "helper",
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 670,
      "y": 160,
      "wires": []
    },
    {
      "id": "s1cf2",
      "type": "OPCUA-IIoT-Server",
      "z": "6fceee54d88ab861",
      "port": "51980",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
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
      "x": 470,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "c1cf2",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51980/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
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
  ] ),

  "testConnectorListenerFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "8380971bea0270cd",
      "type": "tab",
      "label": "Test Connector Listener Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1cf3",
      "type": "OPCUA-IIoT-Inject",
      "z": "8380971bea0270cd",
      "injectType": "listen",
      "payload": "{\"interval\":250,\"queueSize\":1,\"options\":{\"requestedPublishingInterval\":500,\"requestedLifetimeCount\":10,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":10,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "TestTopicListen",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "TestListen",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;s=FullCounter",
          "datatypeName": ""
        }
      ],
      "x": 270,
      "y": 160,
      "wires": [
        [
          "n2cf3",
          "n3cf3"
        ]
      ]
    },
    {
      "id": "n2cf3",
      "type": "helper",
      "z": "8380971bea0270cd",
      "active": true,
      "x": 530,
      "y": 220,
      "wires": []
    },
    {
      "id": "n3cf3",
      "type": "OPCUA-IIoT-Listener",
      "z": "8380971bea0270cd",
      "connector": "c1cf3",
      "action": "subscribe",
      "queueSize": 1,
      "name": "TestListener",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 530,
      "y": 160,
      "wires": [
        [
          "n5cf3"
        ]
      ]
    },
    {
      "id": "n5cf3",
      "type": "helper",
      "z": "8380971bea0270cd",
      "active": true,
      "x": 730,
      "y": 160,
      "wires": []
    },
    {
      "id": "s1cf3",
      "type": "OPCUA-IIoT-Server",
      "z": "8380971bea0270cd",
      "port": "51981",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
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
      "x": 530,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "c1cf3",
      "type": "OPCUA-IIoT-Connector",
      "z": "8380971bea0270cd",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51981/",
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
  ] ),

  "testConnectorWriteFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "1f545f09faa793c4",
      "type": "tab",
      "label": "Test Connector Write Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1cf4",
      "type": "OPCUA-IIoT-Inject",
      "z": "1f545f09faa793c4",
      "injectType": "write",
      "payload": "1000",
      "payloadType": "num",
      "topic": "TestTopicWrite",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "",
      "addressSpaceItems": [
        {
          "name": "Pressure",
          "nodeId": "ns=1;s=Pressure",
          "datatypeName": "Double"
        }
      ],
      "x": 280,
      "y": 140,
      "wires": [
        [
          "n2cf4",
          "n3cf4"
        ]
      ]
    },
    {
      "id": "n2cf4",
      "type": "helper",
      "z": "1f545f09faa793c4",
      "active": true,
      "x": 510,
      "y": 200,
      "wires": []
    },
    {
      "id": "n3cf4",
      "type": "OPCUA-IIoT-Write",
      "z": "1f545f09faa793c4",
      "connector": "c1cf4",
      "name": "TestWrite",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 500,
      "y": 140,
      "wires": [
        [
          "n5cf4"
        ]
      ]
    },
    {
      "id": "n5cf4",
      "type": "helper",
      "z": "1f545f09faa793c4",
      "active": true,
      "x": 730,
      "y": 140,
      "wires": []
    },
    {
      "id": "s1cf4",
      "type": "OPCUA-IIoT-Server",
      "z": "1f545f09faa793c4",
      "port": "51982",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
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
      "xmlsets": [
        {
          "name": "ISA95",
          "path": "public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml"
        }
      ],
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
      "id": "c1cf4",
      "type": "OPCUA-IIoT-Connector",
      "z": "1f545f09faa793c4",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51982/",
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
  ] ),

  "testConnectorMethodCallerFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "d44885b548bc1097",
      "type": "tab",
      "label": "Test Connector MethodCaller Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1cf5",
      "type": "OPCUA-IIoT-Inject",
      "z": "d44885b548bc1097",
      "injectType": "inject",
      "payload": "1000",
      "payloadType": "num",
      "topic": "TestTopicMethod",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "TestInject",
      "addressSpaceItems": [],
      "x": 240,
      "y": 160,
      "wires": [
        [
          "n2cf5",
          "n3cf5"
        ]
      ]
    },
    {
      "id": "n2cf5",
      "type": "helper",
      "z": "d44885b548bc1097",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 430,
      "y": 220,
      "wires": []
    },
    {
      "id": "n3cf5",
      "type": "OPCUA-IIoT-Method-Caller",
      "z": "d44885b548bc1097",
      "connector": "c1cf5",
      "objectId": "ns=1;i=1234",
      "methodId": "ns=1;i=12345",
      "methodType": "basic",
      "value": "",
      "justValue": true,
      "name": "TestMethodBark",
      "showStatusActivities": false,
      "showErrors": false,
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
      "x": 440,
      "y": 160,
      "wires": [
        [
          "n5cf5"
        ]
      ]
    },
    {
      "id": "n5cf5",
      "type": "helper",
      "z": "d44885b548bc1097",
      "active": true,
      "tosidebar": true,
      "statusVal": "",
      "statusType": "auto",
      "x": 650,
      "y": 160,
      "wires": []
    },
    {
      "id": "s1cf5",
      "type": "OPCUA-IIoT-Server",
      "z": "d44885b548bc1097",
      "port": "51983",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
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
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "c1cf5",
      "type": "OPCUA-IIoT-Connector",
      "z": "d44885b548bc1097",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51983/",
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
  ]),

  "testConnectorHTTPFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "n1cf6",
      "type": "OPCUA-IIoT-Method-Caller",
      "z": "0b4d012a99f54044",
      "connector": "c1cf6",
      "objectId": "ns=1;i=1234",
      "methodId": "ns=1;i=12345",
      "methodType": "basic",
      "value": "",
      "justValue": true,
      "name": "TestMethodBark",
      "showStatusActivities": false,
      "showErrors": false,
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
      "x": 320,
      "y": 140,
      "wires": [
        []
      ]
    },
    {
      "id": "s1cf6",
      "type": "OPCUA-IIoT-Server",
      "z": "0b4d012a99f54044",
      "port": "51991",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "TestServer",
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
      "x": 310,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "c1cf6",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51991/",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
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