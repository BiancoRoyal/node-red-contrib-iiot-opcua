
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitReadTestFlowPayloadFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitResultFilterFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1rff1",
      "type": "inject",
      "z": "b79fdf68790c5ed2",
      "name": "TestName",
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
      "onceDelay": "1",
      "topic": "TestTopic",
      "payload": "{\"node\":\"ns=1;s=TemperatureAnalogItem\",\"nodeId\":\"ns=1;s=TemperatureAnalogItem\",\"nodetype\":\"read\",\"nodeClass\":2,\"browseName\":{\"namespaceIndex\":0,\"name\":\"TemperatureAnalogItem\"},\"displayName\":{\"text\":\"TemperatureAnalogItem\"},\"description\":{},\"writeMask\":0,\"userWriteMask\":0,\"value\":16.041979,\"dataType\":\"Double\",\"valueRank\":-1,\"arrayDimensions\":{},\"accessLevel\":3,\"userAccessLevel\":3,\"minimumSamplingInterval\":0,\"historizing\":false,\"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"}}",
      "payloadType": "json",
      "x": 200,
      "y": 450,
      "wires": [
        [
          "n2rff1",
          "n3rff1"
        ]
      ]
    },
    {
      "id": "n2rff1",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 480,
      "y": 470,
      "wires": []
    },
    {
      "id": "n3rff1",
      "type": "function",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "func": "msg.nodetype = 'read'\nmsg.injectType = 'read'\nmsg.addressSpaceItems = [{name:'',nodeId:'ns=1;s=TemperatureAnalogItem',datatypeName:''}]\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 210,
      "y": 330,
      "wires": [
        [
          "n4rff1",
          "n5rff1"
        ]
      ]
    },
    {
      "id": "n4rff1",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 470,
      "y": 400,
      "wires": []
    },
    {
      "id": "n5rff1",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "b79fdf68790c5ed2",
      "nodeId": "ns=1;s=TemperatureAnalogItem",
      "datatype": "Double",
      "fixedValue": true,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": true,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "AnalogItem",
      "showErrors": true,
      "x": 220,
      "y": 270,
      "wires": [
        [
          "n6rff1"
        ]
      ]
    },
    {
      "id": "n6rff1",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 210,
      "y": 220,
      "wires": []
    }
  ]),

  "testUnitListenTestFlowPayloadFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitResultFilterFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1rff2",
      "type": "inject",
      "z": "b79fdf68790c5ed2",
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
      "onceDelay": 0.1,
      "topic": "TestTopic",
      "payload": "{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":16.041979},\"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"},\"sourceTimestamp\":\"2018-03-13T21:43:10.470Z\",\"sourcePicoseconds\":0,\"serverTimestamp\":\"2018-03-13T21:43:11.051Z\",\"serverPicoseconds\":3}",
      "payloadType": "json",
      "x": 220,
      "y": 530,
      "wires": [
        [
          "n2rff2",
          "n3rff2"
        ]
      ]
    },
    {
      "id": "n2rff2",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 430,
      "y": 530,
      "wires": []
    },
    {
      "id": "n3rff2",
      "type": "function",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "func": "msg.payload.nodetype = 'listen'\nmsg.payload.injectType = 'subscribe'\nmsg.payload.addressSpaceItems = [{\"name\":\"\",\"nodeId\":\"ns=1;s=Pressure\",\"datatypeName\":\"\"}]\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 230,
      "y": 420,
      "wires": [
        [
          "n4rff2",
          "n5rff2"
        ]
      ]
    },
    {
      "id": "n4rff2",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 480,
      "y": 420,
      "wires": []
    },
    {
      "id": "n5rff2",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "b79fdf68790c5ed2",
      "nodeId": "ns=1;s=Pressure",
      "datatype": "Double",
      "fixedValue": true,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": true,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "AnalogItem",
      "showErrors": true,
      "x": 210,
      "y": 240,
      "wires": [
        [
          "n6rff2"
        ]
      ]
    },
    {
      "id": "n6rff2",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 450,
      "y": 240,
      "wires": []
    }
  ]),

  "testUnitListenTestFlowPrecisionPayloadFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitResultFilterFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1rff3",
      "type": "inject",
      "z": "b79fdf68790c5ed2",
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
      "onceDelay": 0.1,
      "topic": "TestTopic",
      "payload": "{\"nodetype\": \"read\", \"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":16.041979},\"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"},\"sourceTimestamp\":\"2018-03-13T21:43:10.470Z\",\"sourcePicoseconds\":0,\"serverTimestamp\":\"2018-03-13T21:43:11.051Z\",\"serverPicoseconds\":3}",
      "payloadType": "json",
      "x": 90,
      "y": 460,
      "wires": [
        [
          "n2rff3",
          "n3rff3"
        ]
      ]
    },
    {
      "id": "n2rff3",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 290,
      "y": 360,
      "wires": []
    },
    {
      "id": "n3rff3",
      "type": "function",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "func": "msg.nodetype = 'listen'\nmsg.injectType = 'subscribe'\nmsg.addressSpaceItems = [{\"name\":\"\",\"nodeId\":\"ns=1;s=Pressure\",\"datatypeName\":\"\"}]\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 290,
      "y": 460,
      "wires": [
        [
          "n4rff3",
          "n5rff3"
        ]
      ]
    },
    {
      "id": "n4rff3",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 490,
      "y": 460,
      "wires": []
    },
    {
      "id": "n5rff3",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "b79fdf68790c5ed2",
      "nodeId": "ns=1;s=Pressure",
      "datatype": "Double",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": true,
      "precision": 2,
      "entry": 1,
      "justValue": true,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "AnalogItem",
      "showErrors": true,
      "x": 310,
      "y": 590,
      "wires": [
        [
          "n6rff3"
        ]
      ]
    },
    {
      "id": "n6rff3",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 490,
      "y": 590,
      "wires": []
    }
  ]),

  "testUnitWriteTestFlowPayloadFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitResultFilterFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1rff4",
      "type": "inject",
      "z": "b79fdf68790c5ed2",
      "name": "TestName",
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
      "onceDelay": 3,
      "topic": "TestTopic",
      "payload": "{\"statusCodes\":[{\"value\":0,\"description\":\"Good\",\"name\":\"Good\"}],\"nodesToWrite\":[{\"nodeId\":\"ns=1;s=TestReadWrite\",\"attributeId\":13,\"indexRange\":null,\"value\":{\"value\":{\"dataType\":\"Double\",\"value\":22980.7896,\"arrayType\":\"Scalar\"}}}],\"msg\":{\"_msgid\":\"11cc64dd.bde67b\",\"topic\":\"\",\"nodetype\":\"inject\",\"injectType\":\"write\",\"addressSpaceItems\":[{\"name\":\"TestReadWrite\",\"nodeId\":\"ns=1;s=TestReadWrite\",\"datatypeName\":\"Double\"}],\"payload\":1539981968143,\"valuesToWrite\":[22980.7896]}}",
      "payloadType": "json",
      "x": 130,
      "y": 450,
      "wires": [
        [
          "n2rff4",
          "n3rff4"
        ]
      ]
    },
    {
      "id": "n2rff4",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 450,
      "y": 530,
      "wires": []
    },
    {
      "id": "n3rff4",
      "type": "function",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "func": "msg.payload.nodetype = 'write'\nmsg.payload.injectType = 'write'\nmsg.payload.addressSpaceItems = [{name:'',nodeId:'ns=1;s=TestReadWrite',datatypeName:''}]\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 180,
      "y": 390,
      "wires": [
        [
          "n4rff4",
          "n5rff4"
        ]
      ]
    },
    {
      "id": "n4rff4",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 470,
      "y": 440,
      "wires": []
    },
    {
      "id": "n5rff4",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "b79fdf68790c5ed2",
      "nodeId": "ns=1;s=TestReadWrite",
      "datatype": "Double",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": false,
      "withValueCheck": false,
      "minvalue": "",
      "maxvalue": "",
      "defaultvalue": "",
      "topic": "",
      "name": "AnalogItem",
      "showErrors": false,
      "x": 200,
      "y": 330,
      "wires": [
        [
          "n6rff4"
        ]
      ]
    },
    {
      "id": "n6rff4",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 470,
      "y": 350,
      "wires": []
    }
  ]),

  "testUnitWriteTestValueCheckFlowPayloadFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitResultFilterFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1rff5",
      "type": "inject",
      "z": "b79fdf68790c5ed2",
      "name": "TestName",
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
      "onceDelay": 0.2,
      "topic": "TestTopic",
      "payload": "{}",
      "payloadType": "json",
      "x": 110,
      "y": 500,
      "wires": [
        [
          "n2rff5",
          "n3rff5"
        ]
      ]
    },
    {
      "id": "n2rff5",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 490,
      "y": 530,
      "wires": []
    },
    {
      "id": "n3rff5",
      "type": "function",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "func": "msg = {\"topic\":\"TestTopic\",\"payload\":{\"nodetype\":\"read\",\"injectType\":\"read\",\"addressSpaceItems\":[],\"node\":\"ns=1;s=Pressure\",\"nodeId\":\"ns=1;s=Pressure\",\"nodeClass\":2,\"browseName\":{\"namespaceIndex\":1,\"name\":\"Pressure\"},\"displayName\":{\"text\":\"Pressure\"},\"description\":{},\"writeMask\":0,\"userWriteMask\":0,\"value\":0.37883857546881394,\"dataType\":\"ns=0;i=11\",\"valueRank\":-1,\"arrayDimensions\":{},\"accessLevel\":3,\"userAccessLevel\":3,\"minimumSamplingInterval\":0,\"historizing\":false,\"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"}},\"justValue\":true,\"nodesToRead\":[\"ns=1;s=Pressure\"],\"nodesToReadCount\":1,\"addressItemsToRead\":[{\"nodeId\":\"ns=1;s=Pressure\",\"browseName\":\"1:Pressure\",\"displayName\":\"locale=null text=Pressure\",\"nodeClass\":\"Variable\",\"datatypeName\":\"ns=0;i=63\"}],\"addressItemsToReadCount\":1,\"addressItemsToBrowse\":[{\"nodeId\":\"ns=1;s=Pressure\",\"browseName\":\"1:Pressure\",\"displayName\":\"locale=null text=Pressure\",\"nodeClass\":\"Variable\",\"datatypeName\":\"ns=0;i=63\"}],\"addressItemsToBrowseCount\":1,\"nodeId\":\"ns=1;s=Pressure\",\"filter\":true,\"filtertype\":\"filter\",\"_event\":\"node:37af887d.3001c8\",\"readtype\":\"AllAttributes\",\"attributeId\":0};\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 150,
      "y": 410,
      "wires": [
        [
          "n4rff5",
          "n5rff5"
        ]
      ]
    },
    {
      "id": "n4rff5",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 480,
      "y": 450,
      "wires": []
    },
    {
      "id": "n5rff5",
      "type": "OPCUA-IIoT-Result-Filter",
      "z": "b79fdf68790c5ed2",
      "nodeId": "ns=1;s=Pressure",
      "datatype": "Double",
      "fixedValue": false,
      "fixPoint": 2,
      "withPrecision": false,
      "precision": 2,
      "entry": 1,
      "justValue": false,
      "withValueCheck": true,
      "minvalue": 0.3,
      "maxvalue": 0.6,
      "defaultvalue": 0.3,
      "topic": "",
      "name": "AnalogItem",
      "showErrors": false,
      "x": 170,
      "y": 330,
      "wires": [
        [
          "n6rff5"
        ]
      ]
    },
    {
      "id": "n6rff5",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 460,
      "y": 360,
      "wires": []
    }
  ]),
}