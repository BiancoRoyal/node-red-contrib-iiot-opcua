const helperExtensions = require('../../test-helper-extensions')

module.exports = {

  "testReadResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "408c8a5ecbc8546e",
      "type": "tab",
      "label": "Test Read Response Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "ac8b3930.dce72",
      "type": "OPCUA-IIoT-Inject",
      "z": "408c8a5ecbc8546e",
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
      "x": 170,
      "y": 380,
      "wires": [
        [
          "264129c0.ffc7c6"
        ]
      ]
    },
    {
      "id": "264129c0.ffc7c6",
      "type": "OPCUA-IIoT-Read",
      "z": "408c8a5ecbc8546e",
      "attributeId": "0",
      "maxAge": 1,
      "depth": 1,
      "connector": "370c0d61.becf9a",
      "name": "Read All",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "historyDays": "",
      "x": 380,
      "y": 380,
      "wires": [
        [
          "51acedc0.fb6714",
          "9a4e5b28.77363",
          "c888d8ca.514bd",
          "fe7af744.afaa"
        ]
      ]
    },
    {
      "id": "51acedc0.fb6714",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 820,
      "y": 640,
      "wires": [
        [
          "n1rsf1"
        ]
      ]
    },
    {
      "id": "n1rsf1",
      "type": "helper",
      "z": "408c8a5ecbc8546e",
      "active": true,
      "x": 1110,
      "y": 640,
      "wires": []
    },
    {
      "id": "9a4e5b28.77363",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 830,
      "y": 560,
      "wires": [
        [
          "n2rsf1"
        ]
      ]
    },
    {
      "id": "n2rsf1",
      "type": "helper",
      "z": "408c8a5ecbc8546e",
      "active": true,
      "x": 1110,
      "y": 560,
      "wires": []
    },
    {
      "id": "c888d8ca.514bd",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "408c8a5ecbc8546e",
      "nodeId": "ns=1;s=TestReadWrite",
      "datatype": "",
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
      "showErrors": true,
      "x": 600,
      "y": 380,
      "wires": [
        [
          "e5294795.fd081",
          "96defe75.dbed1"
        ]
      ]
    },
    {
      "id": "e5294795.fd081",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 840,
      "y": 440,
      "wires": [
        [
          "n3rsf1"
        ]
      ]
    },
    {
      "id": "n3rsf1",
      "type": "helper",
      "z": "408c8a5ecbc8546e",
      "active": true,
      "x": 1110,
      "y": 440,
      "wires": []
    },
    {
      "id": "96defe75.dbed1",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 830,
      "y": 320,
      "wires": [
        [
          "n4rsf1"
        ]
      ]
    },
    {
      "id": "n4rsf1",
      "type": "helper",
      "z": "408c8a5ecbc8546e",
      "active": true,
      "x": 1110,
      "y": 320,
      "wires": []
    },
    {
      "id": "fe7af744.afaa",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "408c8a5ecbc8546e",
      "nodeId": "ns=1;s=Counter",
      "datatype": "",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": "2",
      "justValue": false,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "",
      "showErrors": true,
      "x": 600,
      "y": 180,
      "wires": [
        [
          "2ee23d7c.edb4ba",
          "4ac2bede.10e978"
        ]
      ]
    },
    {
      "id": "2ee23d7c.edb4ba",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 840,
      "y": 220,
      "wires": [
        [
          "n5rsf1"
        ]
      ]
    },
    {
      "id": "n5rsf1",
      "type": "helper",
      "z": "408c8a5ecbc8546e",
      "active": true,
      "x": 1110,
      "y": 220,
      "wires": []
    },
    {
      "id": "4ac2bede.10e978",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 830,
      "y": 140,
      "wires": [
        [
          "n6rsf1"
        ]
      ]
    },
    {
      "id": "n6rsf1",
      "type": "helper",
      "z": "408c8a5ecbc8546e",
      "active": true,
      "x": 1110,
      "y": 140,
      "wires": []
    },
    {
      "id": "5c9db1b6.2b3478",
      "type": "OPCUA-IIoT-Server",
      "z": "408c8a5ecbc8546e",
      "port": "49300",
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
      "x": 270,
      "y": 200,
      "wires": [
        []
      ]
    },
    {
      "id": "370c0d61.becf9a",
      "type": "OPCUA-IIoT-Connector",
      "z": "408c8a5ecbc8546e",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49300/",
      "keepSessionAlive": true,
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

  "testReadAllAttributesResponseFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "408c8a5ecbc8546e",
      "type": "tab",
      "label": "Test Read All Attributes Response Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "6ee19719.8f30e8",
      "type": "OPCUA-IIoT-Inject",
      "z": "408c8a5ecbc8546e",
      "injectType": "read",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "Root",
      "addressSpaceItems": [
        {
          "name": "Bianco Royal",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 130,
      "y": 360,
      "wires": [
        [
          "781a3759.15c1e8"
        ]
      ]
    },
    {
      "id": "781a3759.15c1e8",
      "type": "OPCUA-IIoT-Browser",
      "z": "408c8a5ecbc8546e",
      "connector": "fc0c4360.d2f2b",
      "nodeId": "",
      "name": "",
      "justValue": true,
      "sendNodesToRead": true,
      "sendNodesToListener": false,
      "sendNodesToBrowser": false,
      "multipleOutputs": false,
      "recursiveBrowse": false,
      "recursiveDepth": "",
      "delayPerMessage": "",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 300,
      "y": 360,
      "wires": [
        [
          "83ac5514.5b6128"
        ]
      ]
    },
    {
      "id": "83ac5514.5b6128",
      "type": "OPCUA-IIoT-Read",
      "z": "408c8a5ecbc8546e",
      "attributeId": "0",
      "maxAge": "0",
      "depth": 1,
      "connector": "fc0c4360.d2f2b",
      "name": "Read browsed All",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "historyDays": "",
      "x": 510,
      "y": 360,
      "wires": [
        [
          "bc7ca6b4.bf3708",
          "fff0a5ff.dffe6",
          "149c68af.68d6b7",
          "fc7278e4.b49838"
        ]
      ]
    },
    {
      "id": "bc7ca6b4.bf3708",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "Pressure",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "nodeId",
          "value": "ns=1;s=Pressure"
        }
      ],
      "x": 770,
      "y": 460,
      "wires": [
        [
          "n1rsf2"
        ]
      ]
    },
    {
      "id": "fff0a5ff.dffe6",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "Pressure",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "nodeId",
          "value": "ns=1;s=Pressure"
        }
      ],
      "x": 780,
      "y": 400,
      "wires": [
        [
          "n1rsf2"
        ]
      ]
    },
    {
      "id": "149c68af.68d6b7",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 760,
      "y": 320,
      "wires": [
        [
          "n1rsf2"
        ]
      ]
    },
    {
      "id": "fc7278e4.b49838",
      "type": "OPCUA-IIoT-Response",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 770,
      "y": 260,
      "wires": [
        [
          "n1rsf2"
        ]
      ]
    },
    {
      "id": "n1rsf2",
      "type": "helper",
      "z": "408c8a5ecbc8546e",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1030,
      "y": 360,
      "wires": []
    },
    {
      "id": "5c9db1b6.2b3512",
      "type": "OPCUA-IIoT-Server",
      "z": "408c8a5ecbc8546e",
      "port": "49500",
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
      "x": 330,
      "y": 280,
      "wires": [
        []
      ]
    },
    {
      "id": "fc0c4360.d2f2b",
      "type": "OPCUA-IIoT-Connector",
      "z": "408c8a5ecbc8546e",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49500/",
      "keepSessionAlive": true,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL SERVER",
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
  "testAllResponseTypesWithBrowser" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test All Response Types With Browser",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "7417bc65.d8a5fc",
      "type": "OPCUA-IIoT-Server",
      "z": "e41e66b2c57b1657",
      "port": "49600",
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
      "x": 210,
      "y": 140,
      "wires": [
        []
      ]
    },
    {
      "id": "8b417812.2d6b3",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "",
      "addressSpaceItems": [],
      "x": 110,
      "y": 300,
      "wires": [
        [
          "ea686e22.1f8a78"
        ]
      ]
    },
    {
      "id": "ea686e22.1f8a78",
      "type": "OPCUA-IIoT-Browser",
      "z": "e41e66b2c57b1657",
      "connector": "1c83d9b3.afba8e",
      "nodeId": "ns=1;i=1234",
      "name": "",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": false,
      "sendNodesToBrowser": false,
      "multipleOutputs": false,
      "recursiveBrowse": false,
      "recursiveDepth": 1,
      "delayPerMessage": 0.2,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 280,
      "y": 300,
      "wires": [
        [
          "abf469b7.094758",
          "9764f105.7c8df8",
          "f73eb010.203d78",
          "4325c2c7.8d17e4",
          "98e6951e.bf8608",
          "e8e71c61.dd0e08"
        ]
      ]
    },
    {
      "id": "abf469b7.094758",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 510,
      "y": 400,
      "wires": [
        [
          "n1rsf3"
        ]
      ]
    },
    {
      "id": "9764f105.7c8df8",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 500,
      "y": 360,
      "wires": [
        [
          "n1rsf3"
        ]
      ]
    },
    {
      "id": "f73eb010.203d78",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "nodeId",
          "value": "ns=1;s=FanSpeed"
        }
      ],
      "x": 510,
      "y": 320,
      "wires": [
        [
          "n1rsf3"
        ]
      ]
    },
    {
      "id": "4325c2c7.8d17e4",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "nodeId",
          "value": "ns=1;s=FanSpeed"
        }
      ],
      "x": 520,
      "y": 280,
      "wires": [
        [
          "n1rsf3"
        ]
      ]
    },
    {
      "id": "98e6951e.bf8608",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
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
          "value": "ns=1;s=FanSpeed"
        }
      ],
      "x": 530,
      "y": 240,
      "wires": [
        [
          "n1rsf3"
        ]
      ]
    },
    {
      "id": "e8e71c61.dd0e08",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
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
          "value": "ns=1;s=FanSpeed"
        }
      ],
      "x": 530,
      "y": 200,
      "wires": [
        [
          "n1rsf3"
        ]
      ]
    },
    {
      "id": "n1rsf3",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 770,
      "y": 300,
      "wires": []
    },
    {
      "id": "1c83d9b3.afba8e",
      "type": "OPCUA-IIoT-Connector",
      "z": "e41e66b2c57b1657",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49600/",
      "keepSessionAlive": true,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL SERVER",
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
      "maxBadSessionRequests": "10"
    }
  ]),
  "testCrawlerResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "5b918096b0a4412e",
      "type": "tab",
      "label": "testCrawlerResponseFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "1fda6929d47884fe",
      "type": "OPCUA-IIoT-Inject",
      "z": "5b918096b0a4412e",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "Bianco Royal",
      "addressSpaceItems": [
        {
          "name": "Bianco Royal",
          "nodeId": "ns=1;i=1234",
          "datatypeName": ""
        }
      ],
      "x": 180,
      "y": 260,
      "wires": [
        [
          "f5f06fb809fd7047"
        ]
      ]
    },
    {
      "id": "f5f06fb809fd7047",
      "type": "OPCUA-IIoT-Crawler",
      "z": "5b918096b0a4412e",
      "connector": "75c3ccba6f951e5e",
      "name": "",
      "justValue": false,
      "singleResult": true,
      "showStatusActivities": true,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": true,
      "filters": [
        {
          "name": "nodeClass",
          "value": "Method"
        },
        {
          "name": "nodeId",
          "value": "ns=0;*"
        },
        {
          "name": "browseName",
          "value": "PumpSpeed"
        },
        {
          "name": "dataType",
          "value": "ns=0;i=21"
        },
        {
          "name": "browseName",
          "value": "BiancoRoyal"
        },
        {
          "name": "dataValue",
          "value": "100"
        },
        {
          "name": "typeDefinition",
          "value": "ns=0;i=68"
        },
        {
          "name": "nodeClass",
          "value": "Object*"
        }
      ],
      "delayPerMessage": "1",
      "timeout": "",
      "x": 380,
      "y": 260,
      "wires": [
        [
          "2c242c01240e0146",
          "7e695d900021689f",
          "3f676e3bd2f106c8",
          "6963af641de6ddca",
          "dd4c1acb421adf93",
          "f130fa19f0b3c124"
        ]
      ]
    },
    {
      "id": "2c242c01240e0146",
      "type": "OPCUA-IIoT-Response",
      "z": "5b918096b0a4412e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 610,
      "y": 360,
      "wires": [
        [
          "193c2083a00aab84"
        ]
      ]
    },
    {
      "id": "7e695d900021689f",
      "type": "OPCUA-IIoT-Response",
      "z": "5b918096b0a4412e",
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
      "x": 620,
      "y": 320,
      "wires": [
        [
          "193c2083a00aab84"
        ]
      ]
    },
    {
      "id": "3f676e3bd2f106c8",
      "type": "OPCUA-IIoT-Response",
      "z": "5b918096b0a4412e",
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
      "x": 630,
      "y": 280,
      "wires": [
        [
          "193c2083a00aab84"
        ]
      ]
    },
    {
      "id": "6963af641de6ddca",
      "type": "OPCUA-IIoT-Response",
      "z": "5b918096b0a4412e",
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
      "x": 630,
      "y": 240,
      "wires": [
        [
          "193c2083a00aab84"
        ]
      ]
    },
    {
      "id": "dd4c1acb421adf93",
      "type": "OPCUA-IIoT-Response",
      "z": "5b918096b0a4412e",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 620,
      "y": 200,
      "wires": [
        [
          "193c2083a00aab84"
        ]
      ]
    },
    {
      "id": "f130fa19f0b3c124",
      "type": "OPCUA-IIoT-Response",
      "z": "5b918096b0a4412e",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 610,
      "y": 160,
      "wires": [
        [
          "193c2083a00aab84"
        ]
      ]
    },
    {
      "id": "193c2083a00aab84",
      "type": "helper",
      "z": "5b918096b0a4412e",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 870,
      "y": 260,
      "wires": []
    },
    {
      "id": "089f2fe96f9d3681",
      "type": "OPCUA-IIoT-Server",
      "z": "5b918096b0a4412e",
      "port": "49700",
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
      "x": 170,
      "y": 160,
      "wires": [
        []
      ]
    },
    {
      "id": "75c3ccba6f951e5e",
      "type": "OPCUA-IIoT-Connector",
      "z": "5b918096b0a4412e",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49700/",
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
  "testMethodResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "5d652b3b63762445",
      "type": "tab",
      "label": "Test Method Response Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "255a4521.cd2092",
      "type": "OPCUA-IIoT-Inject",
      "z": "5d652b3b63762445",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 200,
      "wires": [
        [
          "d48a0e23.4ab278"
        ]
      ]
    },
    {
      "id": "d48a0e23.4ab278",
      "type": "OPCUA-IIoT-Method-Caller",
      "z": "5d652b3b63762445",
      "connector": "ae72fc9e.f521f8",
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
      "x": 360,
      "y": 200,
      "wires": [
        [
          "53a3842f.0c7fcc",
          "619fd732.5db74",
          "1fd82ec0.7786f9"
        ]
      ]
    },
    {
      "id": "53a3842f.0c7fcc",
      "type": "OPCUA-IIoT-Response",
      "z": "5d652b3b63762445",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 570,
      "y": 240,
      "wires": [
        [
          "n1rsf5"
        ]
      ]
    },
    {
      "id": "619fd732.5db74",
      "type": "OPCUA-IIoT-Response",
      "z": "5d652b3b63762445",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 580,
      "y": 200,
      "wires": [
        [
          "n1rsf5"
        ]
      ]
    },
    {
      "id": "1fd82ec0.7786f9",
      "type": "OPCUA-IIoT-Response",
      "z": "5d652b3b63762445",
      "name": "",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 570,
      "y": 160,
      "wires": [
        [
          "n1rsf5"
        ]
      ]
    },
    {
      "id": "n1rsf5",
      "type": "helper",
      "z": "5d652b3b63762445",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 770,
      "y": 200,
      "wires": []
    },
    {
      "id": "7417bc65.d8a334",
      "type": "OPCUA-IIoT-Server",
      "z": "5d652b3b63762445",
      "port": "49750",
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
      "x": 150,
      "y": 120,
      "wires": [
        []
      ]
    },
    {
      "id": "ae72fc9e.f521f8",
      "type": "OPCUA-IIoT-Connector",
      "z": "5d652b3b63762445",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:49750/",
      "keepSessionAlive": true,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "SIGN",
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
