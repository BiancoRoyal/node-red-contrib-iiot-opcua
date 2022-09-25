const helperExtensions = require("../../test-helper-extensions")

module.exports = {

  "testListenerEventFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "dc1e5440556338d5",
      "type": "tab",
      "label": "Test Listener Event Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1ev",
      "type": "OPCUA-IIoT-Inject",
      "z": "dc1e5440556338d5",
      "injectType": "listen",
      "payload": "{\"interval\":250,\"queueSize\":1}",
      "payloadType": "json",
      "topic": "TestTopicEvent",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "listen with 200 ms",
      "addressSpaceItems": [
        {
          "name": "Tanks",
          "nodeId": "ns=1;i=1000",
          "datatypeName": ""
        }
      ],
      "x": 190,
      "y": 140,
      "wires": [
        [
          "n2ev",
          "n3ev"
        ]
      ]
    },
    {
      "id": "u1ev",
      "type": "OPCUA-IIoT-Inject",
      "z": "dc1e5440556338d5",
      "injectType": "listen",
      "payload": "1000",
      "payloadType": "num",
      "topic": "TestTopicEventUnsubscribe",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "6",
      "name": "Unsubscribe",
      "addressSpaceItems": [
        {
          "name": "Tanks",
          "nodeId": "ns=1;i=1000",
          "datatypeName": ""
        }
      ],
      "x": 170,
      "y": 200,
      "wires": [
        [
          "n2ev",
          "n3ev"
        ]
      ]
    },
    {
      "id": "n2ev",
      "type": "helper",
      "z": "dc1e5440556338d5",
      "active": true,
      "x": 430,
      "y": 200,
      "wires": []
    },
    {
      "id": "n3ev",
      "type": "OPCUA-IIoT-Event",
      "z": "dc1e5440556338d5",
      "eventType": "BaseEventType",
      "eventTypeLabel": "BaseEventType (i=2041)",
      "queueSize": "1",
      "usingListener": true,
      "name": "Base Events",
      "showStatusActivities": false,
      "showErrors": true,
      "x": 430,
      "y": 140,
      "wires": [
        [
          "n4ev",
          "n5ev"
        ]
      ]
    },
    {
      "id": "n4ev",
      "type": "helper",
      "z": "dc1e5440556338d5",
      "active": true,
      "x": 650,
      "y": 200,
      "wires": []
    },
    {
      "id": "n5ev",
      "type": "OPCUA-IIoT-Listener",
      "z": "dc1e5440556338d5",
      "connector": "c1ev",
      "action": "events",
      "queueSize": "1",
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 640,
      "y": 140,
      "wires": [
        [
          "n6ev"
        ]
      ]
    },
    {
      "id": "n6ev",
      "type": "helper",
      "z": "dc1e5440556338d5",
      "active": true,
      "x": 830,
      "y": 140,
      "wires": []
    },
    {
      "id": "s1ev",
      "type": "OPCUA-IIoT-Server",
      "z": "dc1e5440556338d5",
      "port": "51988",
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
      "delayToClose": 4000,
      "x": 190,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "c1ev",
      "type": "OPCUA-IIoT-Connector",
      "z": "dc1e5440556338d5",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51988",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL DEMO SERVER",
      "showErrors": true,
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

  "listenToEventsOnServer": helperExtensions.cleanFlowPositionData([
    {
      "id": "78ee76f7492485f7",
      "type": "tab",
      "label": "Test Listen To Events On Server",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "c4107b6c.885328",
      "type": "OPCUA-IIoT-Inject",
      "z": "78ee76f7492485f7",
      "injectType": "listen",
      "payload": "250",
      "payloadType": "num",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "listen with 200 ms",
      "addressSpaceItems": [
        {
          "name": "IIoTAddressItem",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        },
        {
          "name": "Tanks",
          "nodeId": "ns=1;i=1000",
          "datatypeName": ""
        },
        {
          "name": "Server",
          "nodeId": "ns=0;i=2253",
          "datatypeName": ""
        }
      ],
      "x": 190,
      "y": 120,
      "wires": [
        [
          "7a62a52a.b16114"
        ]
      ]
    },
    {
      "id": "7a62a52a.b16114",
      "type": "OPCUA-IIoT-Event",
      "z": "78ee76f7492485f7",
      "eventType": "BaseEventType",
      "eventTypeLabel": "BaseEventType (i=2041)",
      "queueSize": "1000",
      "usingListener": true,
      "name": "Base Events",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 410,
      "y": 120,
      "wires": [
        [
          "76db0764.6b88c8"
        ]
      ]
    },
    {
      "id": "76db0764.6b88c8",
      "type": "OPCUA-IIoT-Listener",
      "z": "78ee76f7492485f7",
      "connector": "4de0c979.b3757",
      "action": "events",
      "queueSize": "100",
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 600,
      "y": 120,
      "wires": [
        [
          "nh1ev"
        ]
      ]
    },
    {
      "id": "nh1ev",
      "type": "helper",
      "z": "78ee76f7492485f7",
      "active": true,
      "x": 790,
      "y": 120,
      "wires": []
    },
    {
      "id": "s1ev",
      "type": "OPCUA-IIoT-Server",
      "z": "78ee76f7492485f7",
      "port": "51648",
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
      "isAuditing": false,
      "serverDiscovery": false,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": 4000,
      "x": 210,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "4de0c979.b3757",
      "type": "OPCUA-IIoT-Connector",
      "z": "78ee76f7492485f7",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51648/",
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

  "listenToEventsWithResponseOnServer": helperExtensions.cleanFlowPositionData([
    {
      "id": "540139ac95e01d9f",
      "type": "tab",
      "label": "Test Events With Response",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "c4107b6c.885322",
      "type": "OPCUA-IIoT-Inject",
      "z": "540139ac95e01d9f",
      "injectType": "listen",
      "payload": "250",
      "payloadType": "num",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "listen with 200 ms",
      "addressSpaceItems": [
        {
          "name": "IIoTAddressItem",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        },
        {
          "name": "Tanks",
          "nodeId": "ns=1;i=1000",
          "datatypeName": ""
        },
        {
          "name": "Server",
          "nodeId": "ns=0;i=2253",
          "datatypeName": ""
        }
      ],
      "x": 170,
      "y": 140,
      "wires": [
        [
          "7a62a52a.b16111",
          "8ac6d10c9adb7f00"
        ]
      ]
    },
    {
      "id": "7a62a52a.b16111",
      "type": "OPCUA-IIoT-Event",
      "z": "540139ac95e01d9f",
      "eventType": "BaseEventType",
      "eventTypeLabel": "BaseEventType (i=2041)",
      "queueSize": "1000",
      "usingListener": true,
      "name": "Base Events",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 370,
      "y": 140,
      "wires": [
        [
          "76db0764.6b88c1",
          "0ef6ec37260d7f9f"
        ]
      ]
    },
    {
      "id": "76db0764.6b88c1",
      "type": "OPCUA-IIoT-Listener",
      "z": "540139ac95e01d9f",
      "connector": "nhcf2",
      "action": "events",
      "queueSize": "100",
      "name": "",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 580,
      "y": 140,
      "wires": [
        [
          "nh1evf2",
          "nh2evf2",
          "nh21evf2"
        ]
      ]
    },
    {
      "id": "nh1evf2",
      "type": "helper",
      "z": "540139ac95e01d9f",
      "active": true,
      "x": 830,
      "y": 200,
      "wires": []
    },
    {
      "id": "nh2evf2",
      "type": "OPCUA-IIoT-Response",
      "z": "540139ac95e01d9f",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateFilters": true,
      "filters": [],
      "x": 840,
      "y": 260,
      "wires": [
        [
          "nh3evf2"
        ]
      ]
    },
    {
      "id": "nh3evf2",
      "type": "helper",
      "z": "540139ac95e01d9f",
      "active": true,
      "x": 1030,
      "y": 260,
      "wires": []
    },
    {
      "id": "nh21evf2",
      "type": "OPCUA-IIoT-Response",
      "z": "540139ac95e01d9f",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 820,
      "y": 140,
      "wires": [
        [
          "nh31evf2"
        ]
      ]
    },
    {
      "id": "nh31evf2",
      "type": "helper",
      "z": "540139ac95e01d9f",
      "active": true,
      "x": 1030,
      "y": 140,
      "wires": []
    },
    {
      "id": "s1evf2",
      "type": "OPCUA-IIoT-Server",
      "z": "540139ac95e01d9f",
      "port": "49448",
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
      "delayToClose": 4000,
      "x": 190,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "8ac6d10c9adb7f00",
      "type": "helper",
      "z": "540139ac95e01d9f",
      "active": true,
      "x": 370,
      "y": 220,
      "wires": []
    },
    {
      "id": "0ef6ec37260d7f9f",
      "type": "helper",
      "z": "540139ac95e01d9f",
      "active": true,
      "x": 590,
      "y": 220,
      "wires": []
    },
    {
      "id": "nhcf2",
      "type": "OPCUA-IIoT-Connector",
      "z": "540139ac95e01d9f",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49448/",
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
