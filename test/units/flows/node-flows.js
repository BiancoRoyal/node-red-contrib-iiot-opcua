const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitNodeFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitNodeFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1nf1",
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
      "onceDelay": "4",
      "topic": "TestTopicNode",
      "payload": "12345.34",
      "payloadType": "num",
      "x": 470,
      "y": 240,
      "wires": [
        [
          "n2nf1",
          "n3nf1"
        ]
      ]
    },
    {
      "id": "n2nf1",
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
      "x": 650,
      "y": 380,
      "wires": []
    },
    {
      "id": "n3nf1",
      "type": "OPCUA-IIoT-Node",
      "z": "b79fdf68790c5ed2",
      "injectType": "write",
      "nodeId": "ns=2;s=TestReadWrite",
      "datatype": "String",
      "value": "",
      "name": "TestReadWrite",
      "topic": "",
      "showErrors": false,
      "x": 680,
      "y": 200,
      "wires": [
        [
          "n4nf1"
        ]
      ]
    },
    {
      "id": "n4nf1",
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
      "x": 440,
      "y": 110,
      "wires": []
    }
  ]),

  "testUnitNodeEventFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitNodeEventFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1nf2",
      "type": "inject",
      "z": "b79fdf68790c5ed2",
      "name": "TestReadWrite",
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
      "topic": "TestTopicNode",
      "payload": "1234",
      "payloadType": "num",
      "x": 490,
      "y": 280,
      "wires": [
        [
          "n2nf2",
          "n3nf2"
        ]
      ]
    },
    {
      "id": "n2nf2",
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
      "x": 600,
      "y": 410,
      "wires": []
    },
    {
      "id": "n3nf2",
      "type": "OPCUA-IIoT-Node",
      "z": "b79fdf68790c5ed2",
      "injectType": "write",
      "nodeId": "ns=2;s=TestReadWrite",
      "datatype": "Int16",
      "value": "",
      "name": "TestReadWrite",
      "topic": "",
      "showErrors": false,
      "x": 350,
      "y": 170,
      "wires": [
        [
          "n4nf2"
        ]
      ]
    },
    {
      "id": "n4nf2",
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
      "x": 520,
      "y": 80,
      "wires": []
    }
  ]),

  "testUnitNodeEventValueNumberPayloadFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitNodeEventValueNumberPayloadFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1nf3",
      "type": "inject",
      "z": "b79fdf68790c5ed2",
      "name": "TestReadWrite",
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
      "payload": "",
      "payloadType": "str",
      "x": 520,
      "y": 300,
      "wires": [
        [
          "n2nf3",
          "n3nf3"
        ]
      ]
    },
    {
      "id": "n2nf3",
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
      "x": 700,
      "y": 460,
      "wires": []
    },
    {
      "id": "n3nf3",
      "type": "OPCUA-IIoT-Node",
      "z": "b79fdf68790c5ed2",
      "injectType": "write",
      "nodeId": "ns=2;s=TestReadWrite",
      "datatype": "Int16",
      "value": 2345,
      "name": "TestReadWrite",
      "topic": "NODETOPICOVERRIDE",
      "showErrors": false,
      "x": 760,
      "y": 240,
      "wires": [
        [
          "n4nf3"
        ]
      ]
    },
    {
      "id": "n4nf3",
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
      "x": 520,
      "y": 80,
      "wires": []
    }
  ]),

  "testUnitNodeEventWithPayloadFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitNodeEventWithPayloadFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1",
      "type": "inject",
      "z": "b79fdf68790c5ed2",
      "name": "Error 1",
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
      "topic": "ERRORS",
      "payload": "1234",
      "payloadType": "num",
      "x": 540,
      "y": 220,
      "wires": [
        [
          "n2",
          "n3"
        ]
      ]
    },
    {
      "id": "n2",
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
      "x": 770,
      "y": 360,
      "wires": []
    },
    {
      "id": "n3",
      "type": "OPCUA-IIoT-Node",
      "z": "b79fdf68790c5ed2",
      "injectType": "write",
      "nodeId": "ns=1;s=GESTRUCKEST",
      "datatype": "Int16",
      "value": "",
      "name": "ERRORNODE",
      "topic": "",
      "showErrors": false,
      "x": 330,
      "y": 150,
      "wires": [
        [
          "n4"
        ]
      ]
    },
    {
      "id": "n4",
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
      "x": 570,
      "y": 70,
      "wires": []
    }
  ])
}