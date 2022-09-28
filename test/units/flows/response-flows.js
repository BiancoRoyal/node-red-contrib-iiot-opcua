
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testFlowPayload": helperExtensions.cleanFlowPositionData([
    {
      "id": "628990c93a2db9aa",
      "type": "tab",
      "label": "Test Flow Payload",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n2rsf",
      "type": "helper",
      "z": "628990c93a2db9aa",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 530,
      "y": 320,
      "wires": []
    },
    {
      "id": "n4rsf",
      "type": "helper",
      "z": "628990c93a2db9aa",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 530,
      "y": 200,
      "wires": []
    },
    {
      "id": "n5rsf",
      "type": "OPCUA-IIoT-Response",
      "z": "628990c93a2db9aa",
      "name": "TestResponse",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 200,
      "y": 260,
      "wires": [
        [
          "n6rsf"
        ]
      ]
    },
    {
      "id": "n6rsf",
      "type": "helper",
      "z": "628990c93a2db9aa",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 530,
      "y": 260,
      "wires": []
    }
  ]),

  "testResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Response From Message Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "76202549.fd7c1c",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "TestName",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "dataType",
          "value": "DateTime"
        }
      ],
      "x": 520,
      "y": 100,
      "wires": [
        [
          "n1rh"
        ]
      ]
    },
    {
      "id": "n1rh",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 730,
      "y": 100,
      "wires": []
    },
    {
      "id": "9ed1998a.92f74",
      "type": "inject",
      "z": "e41e66b2c57b1657",
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
      "onceDelay": 2.4,
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 130,
      "y": 100,
      "wires": [
        [
          "806c7bdc.b926e"
        ]
      ]
    },
    {
      "id": "806c7bdc.b926e",
      "type": "function",
      "z": "e41e66b2c57b1657",
      "name": "",
      "func": "msg.payload = {\n  \"value\": [\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 0.523478532226411\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Matrix\",\n        \"value\": {\n          \"0\": 1,\n          \"1\": 2,\n          \"2\": 3,\n          \"3\": 4,\n          \"4\": 5,\n          \"5\": 6,\n          \"6\": 7,\n          \"7\": 8,\n          \"8\": 9\n        },\n        \"dimensions\": [\n          [\n            3,\n            3\n          ],\n          [\n            3,\n            3\n          ]\n        ]\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Array\",\n        \"value\": {\n          \"0\": 1,\n          \"1\": 2,\n          \"2\": 3,\n          \"3\": 4\n        }\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 263.6659132826572\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"DateTime\",\n        \"arrayType\": \"Scalar\",\n        \"value\": \"2016-10-13T08:40:00.000Z\"\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"LocalizedText\",\n        \"arrayType\": \"Array\",\n        \"value\": [\n          {\n            \"text\": \"multilingual text\",\n            \"locale\": \"en\"\n          },\n          {\n            \"text\": \"mehrsprachiger Text\",\n            \"locale\": \"de\"\n          },\n          {\n            \"text\": \"texte multilingue\",\n            \"locale\": \"fr\"\n          }\n        ]\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 966.3275887250591\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 19.861320655817437\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 31\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 10\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 1000\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Double\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 0.9765148162841797\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"UInt16\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 3\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"value\": {\n        \"dataType\": \"Int32\",\n        \"arrayType\": \"Scalar\",\n        \"value\": 3\n      },\n      \"statusCode\": {\n        \"value\": 0,\n        \"description\": \"No Error\",\n        \"name\": \"Good\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    },\n    {\n      \"statusCode\": {\n        \"value\": 2150957056,\n        \"description\": \"The attribute is not supported for the specified Node.\",\n        \"name\": \"BadAttributeIdInvalid\"\n      },\n      \"sourcePicoseconds\": 0,\n      \"serverPicoseconds\": 0\n    }\n  ],\n  \"nodesToRead\": [\n    \"ns\\u003d1;s\\u003dPressure\",\n    \"ns\\u003d1;s\\u003dMatrix\",\n    \"ns\\u003d1;s\\u003dPosition\",\n    \"ns\\u003d1;s\\u003dPumpSpeed\",\n    \"ns\\u003d1;s\\u003dSomeDate\",\n    \"ns\\u003d1;s\\u003dMultiLanguageText\",\n    \"ns\\u003d1;s\\u003dFanSpeed\",\n    \"ns\\u003d1;s\\u003dTemperatureAnalogItem\",\n    \"ns\\u003d1;i\\u003d16479\",\n    \"ns\\u003d1;b\\u003d1020ffaa\",\n    \"ns\\u003d1;s\\u003dTestReadWrite\",\n    \"ns\\u003d1;s\\u003dfree_memory\",\n    \"ns\\u003d1;s\\u003dCounter\",\n    \"ns\\u003d1;s\\u003dFullCounter\",\n    \"ns\\u003d1;i\\u003d12345\"\n  ],\n  \"nodesToReadCount\": 15,\n  \"addressItemsToRead\": [\n    {\n      \"name\": \"Pressure\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dPressure\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"Matrix\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dMatrix\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"Position\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dPosition\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"PumpSpeed\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dPumpSpeed\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"SomeDate\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dSomeDate\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"MultiLanguageText\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dMultiLanguageText\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"FanSpeed\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dFanSpeed\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"TemperatureAnalogItem\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dTemperatureAnalogItem\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d2368\"\n    },\n    {\n      \"name\": \"MyVariable1\",\n      \"nodeId\": \"ns\\u003d1;i\\u003d16479\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"MyVariable2\",\n      \"nodeId\": \"ns\\u003d1;b\\u003d1020ffaa\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"TestReadWrite\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dTestReadWrite\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"FreeMemory\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dfree_memory\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"Counter\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dCounter\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"FullCounter\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dFullCounter\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"Bark\",\n      \"nodeId\": \"ns\\u003d1;i\\u003d12345\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d0\"\n    }\n  ],\n  \"addressItemsToReadCount\": 15,\n  \"readtype\": \"VariableValue\",\n  \"attributeId\": 13\n}\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 320,
      "y": 100,
      "wires": [
        [
          "76202549.fd7c1c",
          "61544edaa0f7df16"
        ]
      ]
    },
    {
      "id": "61544edaa0f7df16",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 510,
      "y": 180,
      "wires": []
    }
  ]),

  "testCompressedResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Compressed Response Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "76202549.fd7c1c",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
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
          "value": "DateTime"
        }
      ],
      "x": 540,
      "y": 80,
      "wires": [
        [
          "n1rh"
        ]
      ]
    },
    {
      "id": "n1rh",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 750,
      "y": 80,
      "wires": []
    },
    {
      "id": "9ed1998a.92f74",
      "type": "inject",
      "z": "e41e66b2c57b1657",
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
      "onceDelay": 2.4,
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 150,
      "y": 80,
      "wires": [
        [
          "806c7bdc.b926e"
        ]
      ]
    },
    {
      "id": "806c7bdc.b926e",
      "type": "function",
      "z": "e41e66b2c57b1657",
      "name": "",
      "func": "msg = {\n  \"_msgid\": \"98a1d195.a8a9\",\n  \"topic\": \"\",\n  \"payload\": {\n    \"value\": [\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 0.523478532226411\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Matrix\",\n          \"value\": {\n            \"0\": 1,\n            \"1\": 2,\n            \"2\": 3,\n            \"3\": 4,\n            \"4\": 5,\n            \"5\": 6,\n            \"6\": 7,\n            \"7\": 8,\n            \"8\": 9\n          },\n          \"dimensions\": [\n            [\n              3,\n              3\n            ],\n            [\n              3,\n              3\n            ]\n          ]\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Array\",\n          \"value\": {\n            \"0\": 1,\n            \"1\": 2,\n            \"2\": 3,\n            \"3\": 4\n          }\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 263.6659132826572\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"DateTime\",\n          \"arrayType\": \"Scalar\",\n          \"value\": \"2016-10-13T08:40:00.000Z\"\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"LocalizedText\",\n          \"arrayType\": \"Array\",\n          \"value\": [\n            {\n              \"text\": \"multilingual text\",\n              \"locale\": \"en\"\n            },\n            {\n              \"text\": \"mehrsprachiger Text\",\n              \"locale\": \"de\"\n            },\n            {\n              \"text\": \"texte multilingue\",\n              \"locale\": \"fr\"\n            }\n          ]\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 966.3275887250591\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 19.861320655817437\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 31\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 10\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 1000\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Double\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 0.9765148162841797\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"UInt16\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 3\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"value\": {\n          \"dataType\": \"Int32\",\n          \"arrayType\": \"Scalar\",\n          \"value\": 3\n        },\n        \"statusCode\": {\n          \"value\": 0,\n          \"description\": \"No Error\",\n          \"name\": \"Good\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      },\n      {\n        \"statusCode\": {\n          \"value\": 2150957056,\n          \"description\": \"The attribute is not supported for the specified Node.\",\n          \"name\": \"BadAttributeIdInvalid\"\n        },\n        \"sourcePicoseconds\": 0,\n        \"serverPicoseconds\": 0\n      }\n    ],\n    \"nodetype\": \"read\",\n    \"injectType\": \"listen\",\n    \"addressSpaceItems\": [],\n    \"nodesToRead\": [\n    \"ns\\u003d1;s\\u003dPressure\",\n    \"ns\\u003d1;s\\u003dMatrix\",\n    \"ns\\u003d1;s\\u003dPosition\",\n    \"ns\\u003d1;s\\u003dPumpSpeed\",\n    \"ns\\u003d1;s\\u003dSomeDate\",\n    \"ns\\u003d1;s\\u003dMultiLanguageText\",\n    \"ns\\u003d1;s\\u003dFanSpeed\",\n    \"ns\\u003d1;s\\u003dTemperatureAnalogItem\",\n    \"ns\\u003d1;i\\u003d16479\",\n    \"ns\\u003d1;b\\u003d1020ffaa\",\n    \"ns\\u003d1;s\\u003dTestReadWrite\",\n    \"ns\\u003d1;s\\u003dfree_memory\",\n    \"ns\\u003d1;s\\u003dCounter\",\n    \"ns\\u003d1;s\\u003dFullCounter\",\n    \"ns\\u003d1;i\\u003d12345\"\n  ],\n    \"nodesToReadCount\": 15,\n    \"addressItemsToRead\": [\n    {\n      \"name\": \"Pressure\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dPressure\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"Matrix\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dMatrix\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"Position\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dPosition\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"PumpSpeed\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dPumpSpeed\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"SomeDate\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dSomeDate\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"MultiLanguageText\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dMultiLanguageText\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"FanSpeed\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dFanSpeed\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"TemperatureAnalogItem\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dTemperatureAnalogItem\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d2368\"\n    },\n    {\n      \"name\": \"MyVariable1\",\n      \"nodeId\": \"ns\\u003d1;i\\u003d16479\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"MyVariable2\",\n      \"nodeId\": \"ns\\u003d1;b\\u003d1020ffaa\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"TestReadWrite\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dTestReadWrite\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"FreeMemory\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dfree_memory\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"Counter\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dCounter\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"FullCounter\",\n      \"nodeId\": \"ns\\u003d1;s\\u003dFullCounter\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d63\"\n    },\n    {\n      \"name\": \"Bark\",\n      \"nodeId\": \"ns\\u003d1;i\\u003d12345\",\n      \"datatypeName\": \"ns\\u003d0;i\\u003d0\"\n    }\n    ],\n    \"addressItemsToReadCount\": 15,\n    \"readtype\": \"VariableValue\",\n    \"attributeId\": 13\n  },\n\n}\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 340,
      "y": 80,
      "wires": [
        [
          "76202549.fd7c1c",
          "c982c45143274250"
        ]
      ]
    },
    {
      "id": "c982c45143274250",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 530,
      "y": 160,
      "wires": []
    }
  ]),

  "testDefaultResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Default Response Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "be0763d2593bd6ef",
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
      "x": 330,
      "y": 160,
      "wires": [
        [
          "64b6a8760a5244c2"
        ]
      ]
    },
    {
      "id": "64b6a8760a5244c2",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 520,
      "y": 160,
      "wires": []
    }
  ])
}