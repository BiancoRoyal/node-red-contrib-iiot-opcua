
const helperExtensions = require("../../helper/test-helper-extensions")

module.exports = {

  "testCMDFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "fee24a2603b13aed",
      "type": "tab",
      "label": "Test Server CMD Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1cmdf1",
      "type": "inject",
      "z": "fee24a2603b13aed",
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
      "onceDelay": "4",
      "topic": "",
      "payload": "testpayload",
      "payloadType": "str",
      "x": 170,
      "y": 120,
      "wires": [
        [
          "n2cmdf1",
          "n3cmdf1",
          "n4cmdf1"
        ]
      ]
    },
    {
      "id": "n2cmdf1",
      "type": "helper",
      "z": "fee24a2603b13aed",
      "active": true,
      "x": 410,
      "y": 240,
      "wires": []
    },
    {
      "id": "n3cmdf1",
      "type": "OPCUA-IIoT-Server-Command",
      "z": "fee24a2603b13aed",
      "commandtype": "restart",
      "nodeId": "",
      "name": "",
      "x": 400,
      "y": 180,
      "wires": [
        [
          "n5cmdf1"
        ]
      ]
    },
    {
      "id": "n4cmdf1",
      "type": "OPCUA-IIoT-Server-Command",
      "z": "fee24a2603b13aed",
      "commandtype": "deleteNode",
      "nodeId": "ns=1;s=TestFolder",
      "name": "",
      "x": 400,
      "y": 120,
      "wires": [
        [
          "n6cmdf1"
        ]
      ]
    },
    {
      "id": "n5cmdf1",
      "type": "helper",
      "z": "fee24a2603b13aed",
      "active": true,
      "x": 590,
      "y": 180,
      "wires": []
    },
    {
      "id": "n6cmdf1",
      "type": "helper",
      "z": "fee24a2603b13aed",
      "active": true,
      "x": 590,
      "y": 120,
      "wires": []
    }
  ]),

  "testCMDWithServerFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "c9f5e0823860a46d",
      "type": "tab",
      "label": "Test Server CMD Restart Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1csf1",
      "type": "inject",
      "z": "c9f5e0823860a46d",
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
      "onceDelay": "4",
      "topic": "",
      "payload": "testpayload",
      "payloadType": "str",
      "x": 170,
      "y": 220,
      "wires": [
        [
          "n2csf1",
          "n3csf1"
        ]
      ]
    },
    {
      "id": "n2csf1",
      "type": "helper",
      "z": "c9f5e0823860a46d",
      "active": true,
      "x": 370,
      "y": 280,
      "wires": []
    },
    {
      "id": "n3csf1",
      "type": "OPCUA-IIoT-Server-Command",
      "z": "c9f5e0823860a46d",
      "commandtype": "restart",
      "nodeId": "",
      "name": "",
      "x": 360,
      "y": 220,
      "wires": [
        [
          "n4csf1",
          "s1csr"
        ]
      ]
    },
    {
      "id": "n4csf1",
      "type": "helper",
      "z": "c9f5e0823860a46d",
      "active": true,
      "x": 590,
      "y": 280,
      "wires": []
    },
    {
      "id": "s1csr",
      "type": "OPCUA-IIoT-Server",
      "z": "c9f5e0823860a46d",
      "port": "52819",
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
      "x": 590,
      "y": 220,
      "wires": [
        [
          "n5csf1"
        ]
      ]
    },
    {
      "id": "n5csf1",
      "type": "helper",
      "z": "c9f5e0823860a46d",
      "active": true,
      "x": 770,
      "y": 220,
      "wires": []
    }
  ]),

  "testInjectCMDFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "ea83d71504fa7383",
      "type": "tab",
      "label": "Test Inject Server CMD Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1cmdf2",
      "type": "OPCUA-IIoT-Inject",
      "z": "ea83d71504fa7383",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicCMD",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "TestName",
      "addressSpaceItems": [
        {
          "name": "TestFolder",
          "nodeId": "ns=1;s=TestFolder",
          "datatypeName": ""
        }
      ],
      "x": 190,
      "y": 200,
      "wires": [
        [
          "n2cmdf2",
          "n3cmdf2"
        ]
      ]
    },
    {
      "id": "n2cmdf2",
      "type": "helper",
      "z": "ea83d71504fa7383",
      "active": true,
      "x": 390,
      "y": 260,
      "wires": []
    },
    {
      "id": "n3cmdf2",
      "type": "OPCUA-IIoT-Server-Command",
      "z": "ea83d71504fa7383",
      "commandtype": "deleteNode",
      "nodeId": "",
      "name": "",
      "x": 380,
      "y": 200,
      "wires": [
        [
          "n4cmdf2",
          "s1cf5"
        ]
      ]
    },
    {
      "id": "n4cmdf2",
      "type": "helper",
      "z": "ea83d71504fa7383",
      "active": true,
      "x": 610,
      "y": 260,
      "wires": []
    },
    {
      "id": "s1cf5",
      "type": "OPCUA-IIoT-Server",
      "z": "ea83d71504fa7383",
      "port": "51698",
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
      "x": 610,
      "y": 200,
      "wires": [
        [
          "n5cmdf2"
        ]
      ]
    },
    {
      "id": "n5cmdf2",
      "type": "helper",
      "z": "ea83d71504fa7383",
      "active": true,
      "x": 790,
      "y": 200,
      "wires": []
    }
  ]),

  "testCMDWithFlexServerFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "410312f3de6a216b",
      "type": "tab",
      "label": "Test Server CMD With Flex-Server Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1csf3",
      "type": "inject",
      "z": "410312f3de6a216b",
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
      "onceDelay": "4",
      "topic": "",
      "payload": "testpayload",
      "payloadType": "str",
      "x": 130,
      "y": 120,
      "wires": [
        [
          "n2csf3",
          "n3csf3"
        ]
      ]
    },
    {
      "id": "n2csf3",
      "type": "helper",
      "z": "410312f3de6a216b",
      "active": true,
      "x": 370,
      "y": 180,
      "wires": []
    },
    {
      "id": "n3csf3",
      "type": "OPCUA-IIoT-Server-Command",
      "z": "410312f3de6a216b",
      "commandtype": "restart",
      "nodeId": "",
      "name": "",
      "x": 360,
      "y": 120,
      "wires": [
        [
          "n4csf3",
          "s3csfr"
        ]
      ]
    },
    {
      "id": "n4csf3",
      "type": "helper",
      "z": "410312f3de6a216b",
      "active": true,
      "x": 610,
      "y": 180,
      "wires": []
    },
    {
      "id": "s3csfr",
      "type": "OPCUA-IIoT-Flex-Server",
      "z": "410312f3de6a216b",
      "port": "54120",
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
      "x": 640,
      "y": 120,
      "wires": [
        [
          "n5csf3"
        ]
      ]
    },
    {
      "id": "n5csf3",
      "type": "helper",
      "z": "410312f3de6a216b",
      "active": true,
      "x": 870,
      "y": 120,
      "wires": []
    }
  ]),

  "testWrongCMDWithFlexServerFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "78744530d01d0667",
      "type": "tab",
      "label": "Test Wrong Server CMD With Flex-Server Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1csf4",
      "type": "inject",
      "z": "78744530d01d0667",
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
      "onceDelay": "4",
      "topic": "",
      "payload": "testpayload",
      "payloadType": "str",
      "x": 150,
      "y": 140,
      "wires": [
        [
          "n2csf4",
          "n3csf4"
        ]
      ]
    },
    {
      "id": "n2csf4",
      "type": "helper",
      "z": "78744530d01d0667",
      "active": true,
      "x": 390,
      "y": 200,
      "wires": []
    },
    {
      "id": "n3csf4",
      "type": "OPCUA-IIoT-Server-Command",
      "z": "78744530d01d0667",
      "commandtype": "test",
      "nodeId": "",
      "name": "",
      "x": 380,
      "y": 140,
      "wires": [
        [
          "n4csf4",
          "s4csfr"
        ]
      ]
    },
    {
      "id": "n4csf4",
      "type": "helper",
      "z": "78744530d01d0667",
      "active": true,
      "x": 630,
      "y": 200,
      "wires": []
    },
    {
      "id": "s4csfr",
      "type": "OPCUA-IIoT-Flex-Server",
      "z": "78744530d01d0667",
      "port": "54121",
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
      "x": 660,
      "y": 140,
      "wires": [
        [
          "n5csf4"
        ]
      ]
    },
    {
      "id": "n5csf4",
      "type": "helper",
      "z": "78744530d01d0667",
      "active": true,
      "x": 870,
      "y": 140,
      "wires": []
    }
  ]),

  "testWrongInjectWithFlexServerFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "9334c3705d2affec",
      "type": "tab",
      "label": "Test Wrong Inject With Flex-Server Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1csf5",
      "type": "inject",
      "z": "9334c3705d2affec",
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
      "onceDelay": "4",
      "topic": "",
      "payload": "testpayload",
      "payloadType": "str",
      "x": 150,
      "y": 120,
      "wires": [
        [
          "n2csf5",
          "s5csfr"
        ]
      ]
    },
    {
      "id": "n2csf5",
      "type": "helper",
      "z": "9334c3705d2affec",
      "active": true,
      "x": 370,
      "y": 200,
      "wires": []
    },
    {
      "id": "s5csfr",
      "type": "OPCUA-IIoT-Flex-Server",
      "z": "9334c3705d2affec",
      "port": "54122",
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
      "x": 400,
      "y": 120,
      "wires": [
        [
          "n5csf4"
        ]
      ]
    },
    {
      "id": "n5csf4",
      "type": "helper",
      "z": "9334c3705d2affec",
      "active": true,
      "x": 630,
      "y": 120,
      "wires": []
    }
  ])
}
