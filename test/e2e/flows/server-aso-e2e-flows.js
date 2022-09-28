
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testASOFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "22af7906592abd94",
      "type": "tab",
      "label": "Test ASO Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "7cb85115.7635",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestVariables",
      "browsename": "TestVariables",
      "displayname": "Test Variables",
      "objecttype": "FolderType",
      "datatype": "FolderType",
      "value": "",
      "referenceNodeId": "ns=0;i=85",
      "referencetype": "Organizes",
      "name": "Folder",
      "x": 350,
      "y": 700,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "a6b95606.c28608",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 130,
      "y": 700,
      "wires": [
        [
          "7cb85115.7635"
        ]
      ]
    },
    {
      "id": "df12586a.41bba8",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestDateTime",
      "browsename": "TestDateTime",
      "displayname": "Test DateTime",
      "objecttype": "BaseDataVariableType",
      "datatype": "DateTime",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "DateTime",
      "x": 360,
      "y": 640,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "142d03b7.58bb0c",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 130,
      "y": 640,
      "wires": [
        [
          "df12586a.41bba8"
        ]
      ]
    },
    {
      "id": "8e9ace0.0c2453",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestBoolean",
      "browsename": "TestBoolean",
      "displayname": "Test Boolean",
      "objecttype": "BaseDataVariableType",
      "datatype": "Boolean",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "Boolean",
      "x": 360,
      "y": 580,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "8ef94f3f.8052d",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "true",
      "payloadType": "bool",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 110,
      "y": 580,
      "wires": [
        [
          "8e9ace0.0c2453"
        ]
      ]
    },
    {
      "id": "ab785570.b3e7e8",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestDouble",
      "browsename": "TestDouble",
      "displayname": "Test Double",
      "objecttype": "BaseDataVariableType",
      "datatype": "Double",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "Double",
      "x": 360,
      "y": 520,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "35d895d5.7f9dea",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "10.2",
      "payloadType": "num",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 110,
      "y": 520,
      "wires": [
        [
          "ab785570.b3e7e8"
        ]
      ]
    },
    {
      "id": "1ae186da.38bfb9",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestUInt16",
      "browsename": "TestUInt16",
      "displayname": "Test UInt16",
      "objecttype": "BaseDataVariableType",
      "datatype": "UInt16",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "UInt16",
      "x": 350,
      "y": 460,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "73286053.bb709",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "65000",
      "payloadType": "num",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 110,
      "y": 460,
      "wires": [
        [
          "1ae186da.38bfb9"
        ]
      ]
    },
    {
      "id": "b1416f4e.5054b",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestUInt32",
      "browsename": "TestUInt32",
      "displayname": "Test UInt32",
      "objecttype": "BaseDataVariableType",
      "datatype": "UInt32",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "UInt32",
      "x": 350,
      "y": 400,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "21856943.170fd6",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "125000",
      "payloadType": "num",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 120,
      "y": 400,
      "wires": [
        [
          "b1416f4e.5054b"
        ]
      ]
    },
    {
      "id": "fdd7ec62.28318",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestUInt64",
      "browsename": "TestUInt64",
      "displayname": "Test UInt64",
      "objecttype": "BaseDataVariableType",
      "datatype": "UInt64",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "UInt64",
      "x": 350,
      "y": 100,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "892c9cb9.f542c",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "125000000",
      "payloadType": "num",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 130,
      "y": 100,
      "wires": [
        [
          "fdd7ec62.28318"
        ]
      ]
    },
    {
      "id": "f6328ad1.cbcea8",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestString",
      "browsename": "TestString",
      "displayname": "Test String",
      "objecttype": "BaseDataVariableType",
      "datatype": "String",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "String",
      "x": 350,
      "y": 160,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "67196dfe.975454",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "Hello IIoT World!",
      "payloadType": "str",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 150,
      "y": 160,
      "wires": [
        [
          "f6328ad1.cbcea8"
        ]
      ]
    },
    {
      "id": "c15f96da.044178",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestInt16",
      "browsename": "TestInt16",
      "displayname": "Test Int16",
      "objecttype": "BaseDataVariableType",
      "datatype": "Int16",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "Int16",
      "x": 350,
      "y": 220,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "46255f43.f17ce",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "-6000",
      "payloadType": "num",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 110,
      "y": 220,
      "wires": [
        [
          "c15f96da.044178"
        ]
      ]
    },
    {
      "id": "ad5f7bc5.03f188",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestInt32",
      "browsename": "TestInt32",
      "displayname": "Test Int32",
      "objecttype": "BaseDataVariableType",
      "datatype": "Int32",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "Int32",
      "x": 350,
      "y": 280,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "1ea642ab.c2547d",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "-165000",
      "payloadType": "num",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "",
      "addressSpaceItems": [],
      "x": 120,
      "y": 280,
      "wires": [
        [
          "ad5f7bc5.03f188"
        ]
      ]
    },
    {
      "id": "cd42f3a8.d5494",
      "type": "OPCUA-IIoT-Inject",
      "z": "22af7906592abd94",
      "injectType": "inject",
      "payload": "[{\"text\":\"Hallo Welt!\",\"locale\":\"de\"},{\"text\":\"Hello World!\",\"locale\":\"en\"},{\"text\":\"Bonjour Monde!\",\"locale\":\"fr\"}]",
      "payloadType": "json",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "2",
      "name": "JSON",
      "addressSpaceItems": [],
      "x": 110,
      "y": 340,
      "wires": [
        [
          "b85ce203.ecaec"
        ]
      ]
    },
    {
      "id": "b85ce203.ecaec",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "22af7906592abd94",
      "nodeId": "ns=1;s=TestLocalizedText",
      "browsename": "TestLocalizedText",
      "displayname": "Test LocalizedText",
      "objecttype": "BaseDataVariableType",
      "datatype": "LocalizedText",
      "value": "",
      "referenceNodeId": "ns=1;s=TestVariables",
      "referencetype": "Organizes",
      "name": "LocalizedText",
      "x": 380,
      "y": 340,
      "wires": [
        [
          "ea022228.85657"
        ]
      ]
    },
    {
      "id": "ea022228.85657",
      "type": "function",
      "z": "22af7906592abd94",
      "name": "thru",
      "func": "\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 670,
      "y": 340,
      "wires": [
        [
          "n4",
          "s1cf5"
        ]
      ]
    },
    {
      "id": "n4",
      "type": "helper",
      "z": "22af7906592abd94",
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
      "y": 400,
      "wires": []
    },
    {
      "id": "s1cf5",
      "type": "OPCUA-IIoT-Server",
      "z": "22af7906592abd94",
      "port": "51500",
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
      "x": 870,
      "y": 340,
      "wires": [
        [
          "n5"
        ]
      ]
    },
    {
      "id": "n5",
      "type": "helper",
      "z": "22af7906592abd94",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 1070,
      "y": 340,
      "wires": []
    }
  ]),

  "testASOReadFlow": helperExtensions.cleanFlowPositionData([
      {
        "id": "22af7906592abd94",
        "type": "tab",
        "label": "Test ASO Flow",
        "disabled": false,
        "info": "",
        "env": []
      },
      {
        "id": "7cb85115.7635",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestVariables",
        "browsename": "TestVariables",
        "displayname": "Test Variables",
        "objecttype": "FolderType",
        "datatype": "FolderType",
        "value": "",
        "referenceNodeId": "ns=0;i=85",
        "referencetype": "Organizes",
        "name": "Folder",
        "x": 350,
        "y": 140,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "a6b95606.c28608",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "TestVariables",
        "payloadType": "str",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "2",
        "name": "",
        "addressSpaceItems": [],
        "x": 140,
        "y": 140,
        "wires": [
          [
            "7cb85115.7635",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "df12586a.41bba8",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestDateTime",
        "browsename": "TestDateTime",
        "displayname": "Test DateTime",
        "objecttype": "BaseDataVariableType",
        "datatype": "DateTime",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "DateTime",
        "x": 360,
        "y": 820,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "142d03b7.58bb0c",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
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
        "x": 130,
        "y": 820,
        "wires": [
          [
            "df12586a.41bba8",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "8e9ace0.0c2453",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestBoolean",
        "browsename": "TestBoolean",
        "displayname": "Test Boolean",
        "objecttype": "BaseDataVariableType",
        "datatype": "Boolean",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "Boolean",
        "x": 360,
        "y": 760,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "8ef94f3f.8052d",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "true",
        "payloadType": "bool",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 110,
        "y": 760,
        "wires": [
          [
            "8e9ace0.0c2453",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "ab785570.b3e7e8",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestDouble",
        "browsename": "TestDouble",
        "displayname": "Test Double",
        "objecttype": "BaseDataVariableType",
        "datatype": "Double",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "Double",
        "x": 360,
        "y": 700,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "35d895d5.7f9dea",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "10.2",
        "payloadType": "num",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 110,
        "y": 700,
        "wires": [
          [
            "ab785570.b3e7e8",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "1ae186da.38bfb9",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestUInt16",
        "browsename": "TestUInt16",
        "displayname": "Test UInt16",
        "objecttype": "BaseDataVariableType",
        "datatype": "UInt16",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "UInt16",
        "x": 350,
        "y": 520,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "73286053.bb709",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "65000",
        "payloadType": "num",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 110,
        "y": 520,
        "wires": [
          [
            "1ae186da.38bfb9",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "b1416f4e.5054b",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestUInt32",
        "browsename": "TestUInt32",
        "displayname": "Test UInt32",
        "objecttype": "BaseDataVariableType",
        "datatype": "UInt32",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "UInt32",
        "x": 350,
        "y": 580,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "21856943.170fd6",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "125000",
        "payloadType": "num",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 120,
        "y": 580,
        "wires": [
          [
            "b1416f4e.5054b",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "fdd7ec62.28318",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestInt64",
        "browsename": "TestInt64",
        "displayname": "Test Int64",
        "objecttype": "BaseDataVariableType",
        "datatype": "Int64",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "Int64",
        "x": 350,
        "y": 400,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "892c9cb9.f542c",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "125000000",
        "payloadType": "num",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 130,
        "y": 400,
        "wires": [
          [
            "fdd7ec62.28318",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "f6328ad1.cbcea8",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestString",
        "browsename": "TestString",
        "displayname": "Test String",
        "objecttype": "BaseDataVariableType",
        "datatype": "String",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "String",
        "x": 350,
        "y": 220,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "67196dfe.975454",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "Hello IIoT World!",
        "payloadType": "str",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 150,
        "y": 220,
        "wires": [
          [
            "f6328ad1.cbcea8",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "c15f96da.044178",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestInt16",
        "browsename": "TestInt16",
        "displayname": "Test Int16",
        "objecttype": "BaseDataVariableType",
        "datatype": "Int16",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "Int16",
        "x": 350,
        "y": 280,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "46255f43.f17ce",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "-6000",
        "payloadType": "num",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 110,
        "y": 280,
        "wires": [
          [
            "c15f96da.044178",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "ad5f7bc5.03f188",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestInt32",
        "browsename": "TestInt32",
        "displayname": "Test Int32",
        "objecttype": "BaseDataVariableType",
        "datatype": "Int32",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "Int32",
        "x": 350,
        "y": 340,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "1ea642ab.c2547d",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "-165000",
        "payloadType": "num",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 120,
        "y": 340,
        "wires": [
          [
            "ad5f7bc5.03f188",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "cd42f3a8.d5494",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "[{\"text\":\"Hallo Welt!\",\"locale\":\"de\"},{\"text\":\"Hello World!\",\"locale\":\"en\"},{\"text\":\"Bonjour Monde!\",\"locale\":\"fr\"}]",
        "payloadType": "json",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "JSON",
        "addressSpaceItems": [],
        "x": 110,
        "y": 460,
        "wires": [
          [
            "b85ce203.ecaec",
            "3becb5efd99899ad"
          ]
        ]
      },
      {
        "id": "b85ce203.ecaec",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestLocalizedText",
        "browsename": "TestLocalizedText",
        "displayname": "Test LocalizedText",
        "objecttype": "BaseDataVariableType",
        "datatype": "LocalizedText",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "LocalizedText",
        "x": 380,
        "y": 460,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "ea022228.85657",
        "type": "function",
        "z": "22af7906592abd94",
        "name": "thru",
        "func": "\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 670,
        "y": 340,
        "wires": [
          [
            "n4",
            "s1cf5"
          ]
        ]
      },
      {
        "id": "n4",
        "type": "helper",
        "z": "22af7906592abd94",
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
        "y": 420,
        "wires": []
      },
      {
        "id": "s1cf5",
        "type": "OPCUA-IIoT-Server",
        "z": "22af7906592abd94",
        "port": "51501",
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
        "x": 870,
        "y": 340,
        "wires": [
          [
            "n5"
          ]
        ]
      },
      {
        "id": "n5",
        "type": "helper",
        "z": "22af7906592abd94",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 1070,
        "y": 340,
        "wires": []
      },
      {
        "id": "5f34bc9e8f23d581",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "",
        "payloadType": "date",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "4",
        "name": "",
        "addressSpaceItems": [
          {
            "name": "TestVariables",
            "nodeId": "ns=1;s=TestVariables",
            "datatypeName": ""
          }
        ],
        "x": 650,
        "y": 140,
        "wires": [
          [
            "45a7472725c83495"
          ]
        ]
      },
      {
        "id": "4cd08380a4326210",
        "type": "OPCUA-IIoT-Read",
        "z": "22af7906592abd94",
        "attributeId": 0,
        "maxAge": 1,
        "depth": 1,
        "connector": "5918298d3a63d7b3",
        "name": "",
        "justValue": true,
        "showStatusActivities": false,
        "showErrors": false,
        "parseStrings": false,
        "historyDays": 1,
        "x": 1030,
        "y": 140,
        "wires": [
          [
            "41ac95a6194a3536"
          ]
        ]
      },
      {
        "id": "41ac95a6194a3536",
        "type": "helper",
        "z": "22af7906592abd94",
        "name": "helper 2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 1220,
        "y": 140,
        "wires": []
      },
      {
        "id": "45a7472725c83495",
        "type": "OPCUA-IIoT-Browser",
        "z": "22af7906592abd94",
        "connector": "5918298d3a63d7b3",
        "nodeId": "",
        "name": "",
        "justValue": true,
        "sendNodesToRead": true,
        "sendNodesToListener": false,
        "sendNodesToBrowser": false,
        "multipleOutputs": false,
        "recursiveBrowse": false,
        "recursiveDepth": 1,
        "delayPerMessage": 0.2,
        "showStatusActivities": false,
        "showErrors": false,
        "x": 840,
        "y": 140,
        "wires": [
          [
            "4cd08380a4326210"
          ]
        ]
      },
      {
        "id": "3becb5efd99899ad",
        "type": "helper",
        "z": "22af7906592abd94",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 330,
        "y": 880,
        "wires": []
      },
      {
        "id": "b503312b45f162b7",
        "type": "OPCUA-IIoT-Server-ASO",
        "z": "22af7906592abd94",
        "nodeId": "ns=1;s=TestUInt64",
        "browsename": "TestUInt64",
        "displayname": "Test UInt64",
        "objecttype": "BaseDataVariableType",
        "datatype": "UInt64",
        "value": "",
        "referenceNodeId": "ns=1;s=TestVariables",
        "referencetype": "Organizes",
        "name": "UInt64",
        "x": 350,
        "y": 640,
        "wires": [
          [
            "ea022228.85657"
          ]
        ]
      },
      {
        "id": "943e31729afb8524",
        "type": "OPCUA-IIoT-Inject",
        "z": "22af7906592abd94",
        "injectType": "inject",
        "payload": "12500000",
        "payloadType": "num",
        "topic": "",
        "repeat": "",
        "crontab": "",
        "once": true,
        "startDelay": "3",
        "name": "",
        "addressSpaceItems": [],
        "x": 130,
        "y": 640,
        "wires": [
          [
            "b503312b45f162b7"
          ]
        ]
      },
      {
        "id": "5918298d3a63d7b3",
        "type": "OPCUA-IIoT-Connector",
        "z": "22af7906592abd94",
        "discoveryUrl": "",
        "endpoint": "opc.tcp://localhost:51501/",
        "keepSessionAlive": true,
        "loginEnabled": false,
        "securityPolicy": "None",
        "securityMode": "None",
        "name": "Local TestServer",
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
    ])
}
