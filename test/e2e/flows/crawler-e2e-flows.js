const helperExtensions = require("../../test-helper-extensions")

module.exports = {

  "testCrawlerFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "ec2b4f2b.59a9e",
      "type": "OPCUA-IIoT-Inject",
      "z": "6fceee54d88ab861",
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
      "x": 150,
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
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 390,
      "y": 220,
      "wires": []
    },
    {
      "id": "n3f1",
      "type": "OPCUA-IIoT-Crawler",
      "z": "6fceee54d88ab861",
      "connector": "n1c1",
      "name": "TestCrawler",
      "justValue": false,
      "singleResult": false,
      "showStatusActivities": false,
      "showErrors": false,
      "filters": [],
      "x": 390,
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
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 570,
      "y": 160,
      "wires": []
    },
    {
      "id": "6aff8d91.2081b4",
      "type": "OPCUA-IIoT-Server",
      "z": "6fceee54d88ab861",
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
      "x": 390,
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c1",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51999/",
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
  ] ),

  "testCrawlerJustValueFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "n1f2",
      "type": "OPCUA-IIoT-Inject",
      "z": "6fceee54d88ab861",
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
      "y": 160,
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
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 450,
      "y": 220,
      "wires": []
    },
    {
      "id": "n3f2",
      "type": "OPCUA-IIoT-Crawler",
      "z": "6fceee54d88ab861",
      "connector": "n1c2",
      "name": "TestCrawler",
      "justValue": true,
      "singleResult": false,
      "showStatusActivities": false,
      "showErrors": false,
      "filters": [],
      "x": 430,
      "y": 160,
      "wires": [
        [
          "n4f2"
        ]
      ]
    },
    {
      "id": "n4f2",
      "type": "helper",
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 610,
      "y": 160,
      "wires": []
    },
    {
      "id": "s1f2",
      "type": "OPCUA-IIoT-Server",
      "z": "6fceee54d88ab861",
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
      "y": 100,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c2",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51966/",
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
  ] ),

  "testCrawlerJustValueSingleFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "n1f3",
      "type": "OPCUA-IIoT-Inject",
      "z": "6fceee54d88ab861",
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
      "x": 150,
      "y": 100,
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
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 370,
      "y": 160,
      "wires": []
    },
    {
      "id": "n3f3",
      "type": "OPCUA-IIoT-Crawler",
      "z": "6fceee54d88ab861",
      "connector": "n1c3",
      "name": "TestCrawler",
      "justValue": true,
      "singleResult": true,
      "showStatusActivities": false,
      "showErrors": false,
      "filters": [],
      "x": 370,
      "y": 100,
      "wires": [
        [
          "n4f3"
        ]
      ]
    },
    {
      "id": "n4f3",
      "type": "helper",
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 570,
      "y": 100,
      "wires": []
    },
    {
      "id": "s1f3",
      "type": "OPCUA-IIoT-Server",
      "z": "6fceee54d88ab861",
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
      "x": 370,
      "y": 40,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c3",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51967/",
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
  ] ),

  "testCrawlerJustValueSingleFilteredFlow":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "n1f4",
      "type": "OPCUA-IIoT-Inject",
      "z": "6fceee54d88ab861",
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
      "x": 130,
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
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 310,
      "y": 180,
      "wires": []
    },
    {
      "id": "n3f4",
      "type": "OPCUA-IIoT-Crawler",
      "z": "6fceee54d88ab861",
      "connector": "n1c4",
      "name": "TestCrawler",
      "justValue": true,
      "singleResult": true,
      "showStatusActivities": false,
      "showErrors": false,
      "filters": [
        {
          "name": "Limits",
          "nodeId": "ns=0;i=11704"
        }
      ],
      "x": 310,
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
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 490,
      "y": 120,
      "wires": []
    },
    {
      "id": "s1f4",
      "type": "OPCUA-IIoT-Server",
      "z": "6fceee54d88ab861",
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
      "x": 310,
      "y": 60,
      "wires": [
        []
      ]
    },
    {
      "id": "n1c4",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:52968/",
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
  ] ),

  "testCrawlerWithFilter":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "n1f5",
      "type": "OPCUA-IIoT-Inject",
      "z": "6fceee54d88ab861",
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
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 350,
      "y": 220,
      "wires": []
    },
    {
      "id": "n3f5",
      "type": "OPCUA-IIoT-Crawler",
      "z": "6fceee54d88ab861",
      "connector": "n1c5",
      "name": "TestCrawler",
      "justValue": true,
      "singleResult": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateFilters": true,
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
      "z": "6fceee54d88ab861",
      "active": true,
      "x": 530,
      "y": 160,
      "wires": []
    },
    {
      "id": "88f582a2.3b9029",
      "type": "OPCUA-IIoT-Server",
      "z": "6fceee54d88ab861",
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
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:51188/",
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
  ] ),

  "testCrawlerWithFilterNS0":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "bb36ac76.436a7",
      "type": "OPCUA-IIoT-Inject",
      "z": "c872ebc86181e41c",
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
      "z": "c872ebc86181e41c",
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
      "z": "c872ebc86181e41c",
      "connector": "ef9763f4.0e6728",
      "name": "",
      "justValue": false,
      "singleResult": false,
      "showStatusActivities": false,
      "showErrors": true,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "typeDefinition",
          "value": "ns=0;i=58"
        },
        {
          "name": "nodeId",
          "value": "ns=0;*"
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
      "z": "c872ebc86181e41c",
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
      "z": "c872ebc86181e41c",
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
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:54446/",
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
      "strategyRandomisationFactor": "",
      "requestedSessionTimeout": "",
      "connectionStartDelay": "",
      "reconnectDelay": ""
    }
  ] ),

  "testCrawlerWithAllBasicFilterTypes":  helperExtensions.cleanFlowPositionData( [
    {
      "id": "403f1b6f977b5bda",
      "type": "OPCUA-IIoT-Inject",
      "z": "c872ebc86181e41c",
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
      "x": 180,
      "y": 200,
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
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 390,
      "y": 260,
      "wires": []
    },
    {
      "id": "d9c316025711c65f",
      "type": "OPCUA-IIoT-Crawler",
      "z": "c872ebc86181e41c",
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
      "x": 380,
      "y": 200,
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
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 630,
      "y": 260,
      "wires": []
    },
    {
      "id": "af5e3bbf9c5829e8",
      "type": "OPCUA-IIoT-Response",
      "z": "c872ebc86181e41c",
      "name": "",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 620,
      "y": 200,
      "wires": [
        [
          "ncf3h"
        ]
      ]
    },
    {
      "id": "ncf3h",
      "type": "helper",
      "z": "c872ebc86181e41c",
      "active": true,
      "x": 790,
      "y": 200,
      "wires": []
    },
    {
      "id": "bdd9014001b94c08",
      "type": "OPCUA-IIoT-Server",
      "z": "c872ebc86181e41c",
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
      "x": 390,
      "y": 140,
      "wires": [
        []
      ]
    },
    {
      "id": "bdd9014001b94c09",
      "type": "OPCUA-IIoT-Connector",
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
      "maxBadSessionRequests": ""
    }
  ])
}