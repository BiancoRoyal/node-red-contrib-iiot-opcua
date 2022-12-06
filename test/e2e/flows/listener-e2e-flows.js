const helperExtensions = require("../../helper/test-helper-extensions")

module.exports = {

  "testListenerMonitoringFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "e04af34b13fffc53",
      "type": "tab",
      "label": "Test Listener Monitoring Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "c9ca1bbe.d1cb2",
      "type": "OPCUA-IIoT-Inject",
      "z": "e04af34b13fffc53",
      "injectType": "listen",
      "payload": "{\"interval\":250,\"queueSize\":4,\"options\":{\"requestedPublishingInterval\":500,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":4,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "TestTopicSubscribe",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "Start Abo",
      "addressSpaceItems": [
        {
          "name": "FullCounter",
          "nodeId": "ns=1;s=FullCounter",
          "datatypeName": ""
        }
      ],
      "x": 220,
      "y": 180,
      "wires": [
        [
          "d9754392.9eb1d",
          "n2li"
        ]
      ]
    },
    {
      "id": "273f8497.2f8b44",
      "type": "OPCUA-IIoT-Inject",
      "z": "e04af34b13fffc53",
      "injectType": "listen",
      "payload": "{\"interval\":250,\"queueSize\":4,\"options\":{\"requestedPublishingInterval\":500,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":4,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "TestTopicUnsubscribe",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "5",
      "name": "End Abo",
      "addressSpaceItems": [
        {
          "name": "FullCounter",
          "nodeId": "ns=1;s=FullCounter",
          "datatypeName": ""
        }
      ],
      "x": 220,
      "y": 360,
      "wires": [
        [
          "d9754392.9eb1d",
          "n2li"
        ]
      ]
    },
    {
      "id": "n2li",
      "type": "helper",
      "z": "e04af34b13fffc53",
      "active": true,
      "x": 450,
      "y": 360,
      "wires": []
    },
    {
      "id": "d9754392.9eb1d",
      "type": "OPCUA-IIoT-Listener",
      "z": "e04af34b13fffc53",
      "connector": "c95fc9fc.64ccc",
      "action": "subscribe",
      "queueSize": "1",
      "name": "",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 460,
      "y": 180,
      "wires": [
        [
          "b0856b45.da4a18",
          "n3li"
        ]
      ]
    },
    {
      "id": "n3li",
      "type": "helper",
      "z": "e04af34b13fffc53",
      "active": true,
      "x": 690,
      "y": 180,
      "wires": []
    },
    {
      "id": "b0856b45.da4a18",
      "type": "OPCUA-IIoT-Response",
      "z": "e04af34b13fffc53",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateFilters": false,
      "filters": [],
      "x": 690,
      "y": 120,
      "wires": [
        [
          "n4li"
        ]
      ]
    },
    {
      "id": "n4li",
      "type": "helper",
      "z": "e04af34b13fffc53",
      "active": true,
      "x": 870,
      "y": 120,
      "wires": []
    },
    {
      "id": "4ab7dc9.b7c5624",
      "type": "OPCUA-IIoT-Server",
      "z": "e04af34b13fffc53",
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
      "z": "e04af34b13fffc53",
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

  "testListenerMonitoringAboFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "bd45fda446d41526",
      "type": "tab",
      "label": "Test Listener Monitoring Abo Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "c9ca1bbe.d1cb3",
      "type": "OPCUA-IIoT-Inject",
      "z": "bd45fda446d41526",
      "injectType": "listen",
      "payload": "{\"interval\":500,\"queueSize\":4,\"options\":{\"requestedPublishingInterval\":1000,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":4,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "TestTopicSubscribe1",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "Start Abo",
      "addressSpaceItems": [
        {
          "name": "FullCounter",
          "nodeId": "ns=1;s=FullCounter",
          "datatypeName": ""
        }
      ],
      "x": 160,
      "y": 300,
      "wires": [
        [
          "d9754392.9eb1e",
          "n1lia"
        ]
      ]
    },
    {
      "id": "c9ca1bbe.d1cb4",
      "type": "OPCUA-IIoT-Inject",
      "z": "bd45fda446d41526",
      "injectType": "listen",
      "payload": "",
      "payloadType": "string",
      "topic": "TestTopicUnsubscribe1",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "5",
      "name": "End Abo",
      "addressSpaceItems": [
        {
          "name": "FullCounter",
          "nodeId": "ns=1;s=FullCounter",
          "datatypeName": ""
        }
      ],
      "x": 160,
      "y": 360,
      "wires": [
        [
          "d9754392.9eb1e",
          "n1lia"
        ]
      ]
    },
    {
      "id": "n1lia",
      "type": "helper",
      "z": "bd45fda446d41526",
      "active": true,
      "x": 450,
      "y": 360,
      "wires": []
    },
    {
      "id": "c9ca1bbe.d1cb5",
      "type": "OPCUA-IIoT-Inject",
      "z": "bd45fda446d41526",
      "injectType": "listen",
      "payload": "{\"interval\":250,\"queueSize\":4,\"options\":{\"requestedPublishingInterval\":500,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":4,\"publishingEnabled\":true,\"priority\":1}}",
      "payloadType": "json",
      "topic": "TestTopicSubscribe2",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "7",
      "name": "Start Abo",
      "addressSpaceItems": [
        {
          "name": "FullCounter",
          "nodeId": "ns=1;s=FullCounter",
          "datatypeName": ""
        }
      ],
      "x": 160,
      "y": 140,
      "wires": [
        [
          "d9754392.9eb1e",
          "n2lia"
        ]
      ]
    },
    {
      "id": "c9ca1bbe.d1cb6",
      "type": "OPCUA-IIoT-Inject",
      "z": "bd45fda446d41526",
      "injectType": "listen",
      "payload": "",
      "payloadType": "string",
      "topic": "TestTopicUnsubscribe2",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "9",
      "name": "End Abo",
      "addressSpaceItems": [
        {
          "name": "FullCounter",
          "nodeId": "ns=1;s=FullCounter",
          "datatypeName": ""
        }
      ],
      "x": 160,
      "y": 200,
      "wires": [
        [
          "d9754392.9eb1e",
          "n2lia"
        ]
      ]
    },
    {
      "id": "n2lia",
      "type": "helper",
      "z": "bd45fda446d41526",
      "active": true,
      "x": 450,
      "y": 140,
      "wires": []
    },
    {
      "id": "d9754392.9eb1e",
      "type": "OPCUA-IIoT-Listener",
      "z": "bd45fda446d41526",
      "connector": "c95fc9fc.64ccb",
      "action": "subscribe",
      "queueSize": "1",
      "name": "",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 440,
      "y": 240,
      "wires": [
        [
          "b0856b45.da4a19",
          "n3lia"
        ]
      ]
    },
    {
      "id": "n3lia",
      "type": "helper",
      "z": "bd45fda446d41526",
      "active": true,
      "x": 650,
      "y": 300,
      "wires": []
    },
    {
      "id": "b0856b45.da4a19",
      "type": "OPCUA-IIoT-Response",
      "z": "bd45fda446d41526",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateFilters": false,
      "filters": [],
      "x": 650,
      "y": 240,
      "wires": [
        [
          "n4lia"
        ]
      ]
    },
    {
      "id": "n4lia",
      "type": "helper",
      "z": "bd45fda446d41526",
      "active": true,
      "x": 850,
      "y": 240,
      "wires": []
    },
    {
      "id": "4ab7dc9.b7c5625",
      "type": "OPCUA-IIoT-Server",
      "z": "bd45fda446d41526",
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
      "x": 150,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "c95fc9fc.64ccb",
      "type": "OPCUA-IIoT-Connector",
      "z": "bd45fda446d41526",
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
