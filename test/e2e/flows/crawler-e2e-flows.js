const helperExtensions = require("../../helper/test-helper-extensions")

module.exports = {

  "testCrawlerFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "c00fed124f2538c4",
      "type": "tab",
      "label": "Test Crawler Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "ec2b4f2b.59a9e",
      "type": "OPCUA-IIoT-Inject",
      "z": "c00fed124f2538c4",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicCrawler",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "5",
      "name": "Limits",
      "addressSpaceItems": [
        {
          "name": "Limits",
          "nodeId": "ns=0;i=11704",
          "datatypeName": ""
        }
      ],
      "x": 210,
      "y": 160,
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
      "z": "c00fed124f2538c4",
      "active": true,
      "x": 450,
      "y": 220,
      "wires": []
    },
    {
      "id": "n3f1",
      "type": "OPCUA-IIoT-Crawler",
      "z": "c00fed124f2538c4",
      "connector": "n1c1",
      "name": "TestCrawler",
      "justValue": false,
      "singleResult": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "delayPerMessage": "",
      "timeout": "",
      "x": 450,
      "y": 160,
      "wires": [
        [
          "n4f1"
        ]
      ]
    },
    {
      "id": "n4f1",
      "type": "helper",
      "z": "c00fed124f2538c4",
      "active": true,
      "x": 630,
      "y": 160,
      "wires": []
    },
    {
      "id": "6aff8d91.2081b4",
      "type": "OPCUA-IIoT-Server",
      "z": "c00fed124f2538c4",
      "port": "51999",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": false,
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
      "maxNodesPerRead": 10000,
      "maxNodesPerBrowse": 10000,
      "delayToClose": "",
      "x": 450,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c1",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "z": "c00fed124f2538c4",
      "endpoint": "opc.tcp://localhost:51999/",
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
    }
  ] ),

  "testCrawlerJustValueFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "c00fed124f2538c4",
      "type": "tab",
      "label": "Test Crawler Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1f2",
      "type": "OPCUA-IIoT-Inject",
      "z": "c00fed124f2538c4",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicCrawler",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "Limits",
      "addressSpaceItems": [
        {
          "name": "Limits",
          "nodeId": "ns=0;i=11704",
          "datatypeName": ""
        }
      ],
      "x": 230,
      "y": 140,
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
      "z": "c00fed124f2538c4",
      "active": true,
      "x": 450,
      "y": 200,
      "wires": []
    },
    {
      "id": "n3f2",
      "type": "OPCUA-IIoT-Crawler",
      "z": "c00fed124f2538c4",
      "connector": "n1c2",
      "name": "TestCrawler",
      "justValue": true,
      "singleResult": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "delayPerMessage": "",
      "timeout": "",
      "x": 430,
      "y": 140,
      "wires": [
        [
          "n4f2"
        ]
      ]
    },
    {
      "id": "n4f2",
      "type": "helper",
      "z": "c00fed124f2538c4",
      "active": true,
      "x": 610,
      "y": 140,
      "wires": []
    },
    {
      "id": "s1f2",
      "type": "OPCUA-IIoT-Server",
      "z": "c00fed124f2538c4",
      "port": "51966",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": false,
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
      "maxNodesPerRead": 10000,
      "maxNodesPerBrowse": 10000,
      "delayToClose": "",
      "x": 430,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c2",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "z": "c00fed124f2538c4",
      "endpoint": "opc.tcp://localhost:51966/",
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
  ] ),

  "testCrawlerJustValueSingleFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "c00fed124f2538c4",
      "type": "tab",
      "label": "Test Crawler Flow Single Just Value",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1f3",
      "type": "OPCUA-IIoT-Inject",
      "z": "c00fed124f2538c4",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicCrawler",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "Limits",
      "addressSpaceItems": [
        {
          "name": "Limits",
          "nodeId": "ns=0;i=11704",
          "datatypeName": ""
        }
      ],
      "x": 230,
      "y": 120,
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
      "z": "c00fed124f2538c4",
      "active": true,
      "x": 450,
      "y": 180,
      "wires": []
    },
    {
      "id": "n3f3",
      "type": "OPCUA-IIoT-Crawler",
      "z": "c00fed124f2538c4",
      "connector": "n1c3",
      "name": "TestCrawler",
      "justValue": true,
      "singleResult": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "delayPerMessage": "",
      "timeout": "",
      "x": 450,
      "y": 120,
      "wires": [
        [
          "n4f3"
        ]
      ]
    },
    {
      "id": "n4f3",
      "type": "helper",
      "z": "c00fed124f2538c4",
      "active": true,
      "x": 650,
      "y": 120,
      "wires": []
    },
    {
      "id": "s1f3",
      "type": "OPCUA-IIoT-Server",
      "z": "c00fed124f2538c4",
      "port": "51967",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": false,
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
      "maxNodesPerRead": 10000,
      "maxNodesPerBrowse": 10000,
      "delayToClose": "",
      "x": 450,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c3",
      "type": "OPCUA-IIoT-Connector",
      "z": "c00fed124f2538c4",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51967/",
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
  ] ),

  "testCrawlerJustValueSingleFilteredFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "34ccfc1c940d03c7",
      "type": "tab",
      "label": "Test Crawler Filtered Single Just Value",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1f4",
      "type": "OPCUA-IIoT-Inject",
      "z": "34ccfc1c940d03c7",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicCrawler",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "Limits",
      "addressSpaceItems": [
        {
          "name": "Limits",
          "nodeId": "ns=0;i=11704",
          "datatypeName": ""
        }
      ],
      "x": 190,
      "y": 120,
      "wires": [
        [
          "n2f4",
          "n3f4"
        ]
      ]
    },
    {
      "id": "n2f4",
      "type": "helper",
      "z": "34ccfc1c940d03c7",
      "active": true,
      "x": 390,
      "y": 180,
      "wires": []
    },
    {
      "id": "n3f4",
      "type": "OPCUA-IIoT-Crawler",
      "z": "34ccfc1c940d03c7",
      "connector": "n1c4",
      "name": "TestCrawler",
      "justValue": true,
      "singleResult": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [
        {
          "name": "Limits",
          "value": ""
        }
      ],
      "delayPerMessage": "",
      "timeout": "",
      "x": 390,
      "y": 120,
      "wires": [
        [
          "n4f4"
        ]
      ]
    },
    {
      "id": "n4f4",
      "type": "helper",
      "z": "34ccfc1c940d03c7",
      "active": true,
      "x": 570,
      "y": 120,
      "wires": []
    },
    {
      "id": "s1f4",
      "type": "OPCUA-IIoT-Server",
      "z": "34ccfc1c940d03c7",
      "port": "52968",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": false,
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
      "maxNodesPerRead": 10000,
      "maxNodesPerBrowse": 10000,
      "delayToClose": "",
      "x": 390,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c4",
      "type": "OPCUA-IIoT-Connector",
      "z": "34ccfc1c940d03c7",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:52968/",
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
  ] ),

  "testCrawlerWithFilter":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "4d6ae11544766677",
      "type": "tab",
      "label": "Test Crawler With Filter",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1f5",
      "type": "OPCUA-IIoT-Inject",
      "z": "4d6ae11544766677",
      "injectType": "inject",
      "payload": "testpayload",
      "payloadType": "str",
      "topic": "TestTopicCrawler",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "Limits",
      "addressSpaceItems": [
        {
          "name": "Limits",
          "nodeId": "ns=0;i=11704",
          "datatypeName": ""
        }
      ],
      "x": 170,
      "y": 160,
      "wires": [
        [
          "n2f5",
          "n3f5"
        ]
      ]
    },
    {
      "id": "n2f5",
      "type": "helper",
      "z": "4d6ae11544766677",
      "active": true,
      "x": 350,
      "y": 220,
      "wires": []
    },
    {
      "id": "n3f5",
      "type": "OPCUA-IIoT-Crawler",
      "z": "4d6ae11544766677",
      "connector": "n1c5",
      "name": "TestCrawler",
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
          "value": "Variable"
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
      "delayPerMessage": "",
      "timeout": "",
      "x": 350,
      "y": 160,
      "wires": [
        [
          "n4f5"
        ]
      ]
    },
    {
      "id": "n4f5",
      "type": "helper",
      "z": "4d6ae11544766677",
      "active": true,
      "x": 530,
      "y": 160,
      "wires": []
    },
    {
      "id": "88f582a2.3b9029",
      "type": "OPCUA-IIoT-Server",
      "z": "4d6ae11544766677",
      "port": "51188",
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
      "maxNodesPerRead": 6000,
      "maxNodesPerBrowse": 6000,
      "delayToClose": "",
      "x": 350,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c5",
      "type": "OPCUA-IIoT-Connector",
      "z": "4d6ae11544766677",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51188/",
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
  ] ),

  "testCrawlerWithFilterNS0":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "3aa7aad42ad24e9c",
      "type": "tab",
      "label": "Test Crawler With Filter NS0",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "bb36ac76.436a7",
      "type": "OPCUA-IIoT-Inject",
      "z": "3aa7aad42ad24e9c",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "correct",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 220,
      "y": 160,
      "wires": [
        [
          "23fcf6d.13b5d8a",
          "nc1h"
        ]
      ]
    },
    {
      "id": "nc1h",
      "type": "helper",
      "z": "3aa7aad42ad24e9c",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 450,
      "y": 220,
      "wires": []
    },
    {
      "id": "23fcf6d.13b5d8a",
      "type": "OPCUA-IIoT-Crawler",
      "z": "3aa7aad42ad24e9c",
      "connector": "ef9763f4.0e6728",
      "name": "",
      "justValue": false,
      "singleResult": true,
      "showStatusActivities": false,
      "showErrors": true,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "typeDefinition",
          "value": "ns=0;i=58"
        }
      ],
      "delayPerMessage": "1",
      "timeout": "",
      "x": 440,
      "y": 160,
      "wires": [
        [
          "nc2h"
        ]
      ]
    },
    {
      "id": "nc2h",
      "type": "helper",
      "z": "3aa7aad42ad24e9c",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 650,
      "y": 160,
      "wires": []
    },
    {
      "id": "920108b3.753a68",
      "type": "OPCUA-IIoT-Server",
      "z": "3aa7aad42ad24e9c",
      "port": "54446",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": true,
      "showErrors": true,
      "asoDemo": true,
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
      "delayToClose": "",
      "x": 450,
      "y": 80,
      "wires": [
        []
      ]
    },
    {
      "id": "ef9763f4.0e6728",
      "type": "OPCUA-IIoT-Connector",
      "z": "3aa7aad42ad24e9c",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:54446/",
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
  ] ),

  "testCrawlerWithAllBasicFilterTypes":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "30f4b2b6bc962971",
      "type": "tab",
      "label": "Test Crawler With All Basic Filter-Types",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "403f1b6f977b5bda",
      "type": "OPCUA-IIoT-Inject",
      "z": "30f4b2b6bc962971",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "4",
      "name": "correct",
      "addressSpaceItems": [
        {
          "name": "",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 160,
      "y": 160,
      "wires": [
        [
          "ncf1h",
          "d9c316025711c65f"
        ]
      ]
    },
    {
      "id": "ncf1h",
      "type": "helper",
      "z": "30f4b2b6bc962971",
      "active": true,
      "x": 370,
      "y": 220,
      "wires": []
    },
    {
      "id": "d9c316025711c65f",
      "type": "OPCUA-IIoT-Crawler",
      "z": "30f4b2b6bc962971",
      "connector": "bdd9014001b94c09",
      "name": "",
      "justValue": false,
      "singleResult": true,
      "showStatusActivities": true,
      "showErrors": true,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "nodeId",
          "value": "ns=0;*"
        },
        {
          "name": "dataType",
          "value": "ns=0;i=21"
        },
        {
          "name": "dataValue",
          "value": "100"
        },
        {
          "name": "typeDefinition",
          "value": "ns=0;i=68"
        }
      ],
      "delayPerMessage": "1",
      "timeout": "",
      "x": 360,
      "y": 160,
      "wires": [
        [
          "ncf2h",
          "af5e3bbf9c5829e8"
        ]
      ]
    },
    {
      "id": "ncf2h",
      "type": "helper",
      "z": "30f4b2b6bc962971",
      "active": true,
      "x": 610,
      "y": 220,
      "wires": []
    },
    {
      "id": "af5e3bbf9c5829e8",
      "type": "OPCUA-IIoT-Response",
      "z": "30f4b2b6bc962971",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 600,
      "y": 160,
      "wires": [
        [
          "ncf3h"
        ]
      ]
    },
    {
      "id": "ncf3h",
      "type": "helper",
      "z": "30f4b2b6bc962971",
      "active": true,
      "x": 770,
      "y": 160,
      "wires": []
    },
    {
      "id": "bdd9014001b94c08",
      "type": "OPCUA-IIoT-Server",
      "z": "30f4b2b6bc962971",
      "port": "54448",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "",
      "showStatusActivities": true,
      "showErrors": true,
      "asoDemo": true,
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
      "delayToClose": "",
      "x": 370,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "bdd9014001b94c09",
      "type": "OPCUA-IIoT-Connector",
      "z": "30f4b2b6bc962971",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:54448/",
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
      "maxBadSessionRequests": "",
      "credentials": {}
    }
  ] )
}
