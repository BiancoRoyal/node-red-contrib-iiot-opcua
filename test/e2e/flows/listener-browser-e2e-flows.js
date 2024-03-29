const helperExtensions = require("../../helper/test-helper-extensions")

module.exports = {

  "recursiveBrowserAboFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "86c4a772b93cfc4e",
      "type": "tab",
      "label": "Test recursive Browse To Listener Abo Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "8a761f37.f69808",
      "type": "OPCUA-IIoT-Inject",
      "z": "86c4a772b93cfc4e",
      "injectType": "listen",
      "payload": "{\"interval\":250,\"queueSize\":4,\"options\":{\"requestedPublishingInterval\":500,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":4,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "Start",
      "addressSpaceItems": [
        {
          "name": "BiancoRoyal",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        },
        {
          "name": "Tanks",
          "nodeId": "ns=1;i=1001",
          "datatypeName": ""
        }
      ],
      "x": 130,
      "y": 140,
      "wires": [
        [
          "18b3e5b9.f9ba4a",
          "n1abo"
        ]
      ]
    },
    {
      "id": "8a761f37.f69818",
      "type": "OPCUA-IIoT-Inject",
      "z": "86c4a772b93cfc4e",
      "injectType": "listen",
      "payload": "{}",
      "payloadType": "json",
      "topic": "unsub",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "6",
      "name": "End",
      "addressSpaceItems": [
        {
          "name": "BiancoRoyal",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 130,
      "y": 200,
      "wires": [
        [
          "18b3e5b9.f9ba4a",
          "n1abo"
        ]
      ]
    },
    {
      "id": "n1abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 350,
      "y": 140,
      "wires": []
    },
    {
      "id": "18b3e5b9.f9ba4a",
      "type": "OPCUA-IIoT-Browser",
      "z": "86c4a772b93cfc4e",
      "connector": "296a2f29.56e248",
      "nodeId": "",
      "name": "RootBrowser",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": true,
      "sendNodesToBrowser": false,
      "multipleOutputs": false,
      "recursiveBrowse": false,
      "recursiveDepth": "1",
      "delayPerMessage": "0.5",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 350,
      "y": 200,
      "wires": [
        [
          "44548ff9.287e48",
          "f142e56c.d7906",
          "n2abo"
        ]
      ]
    },
    {
      "id": "n2abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 610,
      "y": 260,
      "wires": []
    },
    {
      "id": "44548ff9.287e48",
      "type": "OPCUA-IIoT-Response",
      "z": "86c4a772b93cfc4e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 600,
      "y": 200,
      "wires": [
        [
          "n3abo"
        ]
      ]
    },
    {
      "id": "n3abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 810,
      "y": 200,
      "wires": []
    },
    {
      "id": "f142e56c.d7906",
      "type": "OPCUA-IIoT-Listener",
      "z": "86c4a772b93cfc4e",
      "connector": "296a2f29.56e248",
      "action": "subscribe",
      "queueSize": "1",
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 600,
      "y": 360,
      "wires": [
        [
          "c2a66a6.1940198",
          "c2a66a6.1940123",
          "n4abo"
        ]
      ]
    },
    {
      "id": "n4abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 850,
      "y": 420,
      "wires": []
    },
    {
      "id": "c2a66a6.1940198",
      "type": "OPCUA-IIoT-Response",
      "z": "86c4a772b93cfc4e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 840,
      "y": 300,
      "wires": [
        [
          "n5abo"
        ]
      ]
    },
    {
      "id": "n5abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 1050,
      "y": 300,
      "wires": []
    },
    {
      "id": "c2a66a6.1940123",
      "type": "OPCUA-IIoT-Response",
      "z": "86c4a772b93cfc4e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 850,
      "y": 360,
      "wires": [
        [
          "n6abo"
        ]
      ]
    },
    {
      "id": "n6abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 1050,
      "y": 360,
      "wires": []
    },
    {
      "id": "37396e13.734bd2",
      "type": "OPCUA-IIoT-Server",
      "z": "86c4a772b93cfc4e",
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
      "registerServerMethod": 1,
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "x": 130,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "296a2f29.56e248",
      "type": "OPCUA-IIoT-Connector",
      "z": "86c4a772b93cfc4e",
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
  ]),

  "simpleBrowserAboFlowWithoutListenerInject": helperExtensions.cleanFlowPositionData([
    {
      "id": "86c4a772b93cfc4e",
      "type": "tab",
      "label": "Test recursive Browse To Listener Abo Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "8a761f37.f69808",
      "type": "OPCUA-IIoT-Inject",
      "z": "86c4a772b93cfc4e",
      "injectType": "listen",
      "payload": "{\"interval\":250,\"queueSize\":4,\"options\":{\"requestedPublishingInterval\":500,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":4,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "Start",
      "addressSpaceItems": [
        {
          "name": "BiancoRoyal",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        },
        {
          "name": "Tanks",
          "nodeId": "ns=1;i=1001",
          "datatypeName": ""
        }
      ],
      "x": 130,
      "y": 140,
      "wires": [
        [
          "18b3e5b9.f9ba4a",
          "n1abo"
        ]
      ]
    },
    {
      "id": "8a761f37.f69818",
      "type": "OPCUA-IIoT-Inject",
      "z": "86c4a772b93cfc4e",
      "injectType": "listen",
      "payload": "{}",
      "payloadType": "json",
      "topic": "unsub",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "6",
      "name": "End",
      "addressSpaceItems": [
        {
          "name": "BiancoRoyal",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 130,
      "y": 200,
      "wires": [
        [
          "18b3e5b9.f9ba4a",
          "n1abo"
        ]
      ]
    },
    {
      "id": "n1abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 350,
      "y": 140,
      "wires": []
    },
    {
      "id": "18b3e5b9.f9ba4a",
      "type": "OPCUA-IIoT-Browser",
      "z": "86c4a772b93cfc4e",
      "connector": "296a2f29.56e248",
      "nodeId": "",
      "name": "RootBrowser",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": true,
      "sendNodesToBrowser": false,
      "multipleOutputs": false,
      "recursiveBrowse": false,
      "recursiveDepth": "1",
      "delayPerMessage": "0.5",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 350,
      "y": 200,
      "wires": [
        [
          "44548ff9.287e48",
          "n2abo"
        ]
      ]
    },
    {
      "id": "n2abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 610,
      "y": 260,
      "wires": []
    },
    {
      "id": "44548ff9.287e48",
      "type": "OPCUA-IIoT-Response",
      "z": "86c4a772b93cfc4e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 600,
      "y": 200,
      "wires": [
        [
          "n3abo"
        ]
      ]
    },
    {
      "id": "n3abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 810,
      "y": 200,
      "wires": []
    },
    {
      "id": "f142e56c.d7906",
      "type": "OPCUA-IIoT-Listener",
      "z": "86c4a772b93cfc4e",
      "connector": "296a2f29.56e248",
      "action": "subscribe",
      "queueSize": "1",
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 600,
      "y": 360,
      "wires": [
        [
          "c2a66a6.1940198",
          "c2a66a6.1940123",
          "n4abo"
        ]
      ]
    },
    {
      "id": "n4abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 850,
      "y": 420,
      "wires": []
    },
    {
      "id": "c2a66a6.1940198",
      "type": "OPCUA-IIoT-Response",
      "z": "86c4a772b93cfc4e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 840,
      "y": 300,
      "wires": [
        [
          "n5abo"
        ]
      ]
    },
    {
      "id": "n5abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 1050,
      "y": 300,
      "wires": []
    },
    {
      "id": "c2a66a6.1940123",
      "type": "OPCUA-IIoT-Response",
      "z": "86c4a772b93cfc4e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 850,
      "y": 360,
      "wires": [
        [
          "n6abo"
        ]
      ]
    },
    {
      "id": "n6abo",
      "type": "helper",
      "z": "86c4a772b93cfc4e",
      "active": true,
      "x": 1050,
      "y": 360,
      "wires": []
    },
    {
      "id": "37396e13.734bd2",
      "type": "OPCUA-IIoT-Server",
      "z": "86c4a772b93cfc4e",
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
      "registerServerMethod": 1,
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "x": 130,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "296a2f29.56e248",
      "type": "OPCUA-IIoT-Connector",
      "z": "86c4a772b93cfc4e",
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
  ]),

  "feedListenerWithRecursiveBrowse": helperExtensions.cleanFlowPositionData([
    {
      "id": "a78a9f2027f2b022",
      "type": "tab",
      "label": "Test Listener With Recursive Browse",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "3b4d83c1.6b490c",
      "type": "OPCUA-IIoT-Inject",
      "z": "a78a9f2027f2b022",
      "injectType": "listen",
      "payload": "{\"interval\":250,\"queueSize\":4,\"options\":{\"requestedPublishingInterval\":500,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":4,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "",
      "addressSpaceItems": [
        {
          "name": "BiancoRoyal",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 230,
      "y": 160,
      "wires": [
        [
          "70a1a122.850e4"
        ]
      ]
    },
    {
      "id": "70a1a122.850e4",
      "type": "OPCUA-IIoT-Browser",
      "z": "a78a9f2027f2b022",
      "connector": "c95fc9fc.64ccc",
      "nodeId": "",
      "name": "",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": true,
      "sendNodesToBrowser": false,
      "multipleOutputs": false,
      "recursiveBrowse": true,
      "recursiveDepth": 1,
      "delayPerMessage": "2",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 380,
      "y": 160,
      "wires": [
        [
          "n1brli",
          "66692416.1b2bb4"
        ]
      ]
    },
    {
      "id": "n1brli",
      "type": "helper",
      "z": "a78a9f2027f2b022",
      "active": true,
      "x": 570,
      "y": 220,
      "wires": []
    },
    {
      "id": "66692416.1b2bb4",
      "type": "OPCUA-IIoT-Listener",
      "z": "a78a9f2027f2b022",
      "connector": "c95fc9fc.64ccc",
      "action": "subscribe",
      "queueSize": "1",
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": true,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 560,
      "y": 160,
      "wires": [
        [
          "e604f20a.c8bd4",
          "n2brli"
        ]
      ]
    },
    {
      "id": "n2brli",
      "type": "helper",
      "z": "a78a9f2027f2b022",
      "active": true,
      "x": 790,
      "y": 220,
      "wires": []
    },
    {
      "id": "e604f20a.c8bd4",
      "type": "OPCUA-IIoT-Response",
      "z": "a78a9f2027f2b022",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "dataType",
          "value": "Int32"
        }
      ],
      "x": 800,
      "y": 160,
      "wires": [
        [
          "n3brli"
        ]
      ]
    },
    {
      "id": "n3brli",
      "type": "helper",
      "z": "a78a9f2027f2b022",
      "active": true,
      "x": 1010,
      "y": 160,
      "wires": []
    },
    {
      "id": "37396e13.734bd2",
      "type": "OPCUA-IIoT-Server",
      "z": "a78a9f2027f2b022",
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
      "registerServerMethod": 1,
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "x": 230,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "c95fc9fc.64ccc",
      "type": "OPCUA-IIoT-Connector",
      "z": "a78a9f2027f2b022",
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
  ])
}
