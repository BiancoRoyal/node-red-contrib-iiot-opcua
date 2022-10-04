
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitDiscoveryFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "86a4cc825a400180",
      "type": "tab",
      "label": "testUnitDiscoveryFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "d9db5e281fac4a0c",
      "type": "OPCUA-IIoT-Discovery",
      "z": "86a4cc825a400180",
      "name": "TestName",
      "discoveryPort": "",
      "x": 360,
      "y": 220,
      "wires": [
        [
          "7d54598b282a3ed9"
        ]
      ]
    },
    {
      "id": "7d54598b282a3ed9",
      "type": "helper",
      "z": "86a4cc825a400180",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 380,
      "y": 340,
      "wires": []
    }
  ]),
  "testUnitDiscoveryNullPortFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitDiscoveryNullPortFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1dsf2",
      "type": "OPCUA-IIoT-Discovery",
      "z": "b79fdf68790c5ed2",
      "name": "TestName",
      "discoveryPort": "",
      "x": 370,
      "y": 210,
      "wires": [
        [
          "n2dsf1"
        ]
      ]
    },
    {
      "id": "n2dsf1",
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
      "x": 390,
      "y": 160,
      "wires": []
    }
  ]),
  "testUnitDiscoveryNullPortAndInjectFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitDiscoveryNullPortAndInjectFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1edf1",
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
      "onceDelay": "",
      "topic": "TestTopic",
      "payload": "",
      "payloadType": "date",
      "x": 290,
      "y": 320,
      "wires": [
        [
          "n2edf1",
          "n3edf1"
        ]
      ]
    },
    {
      "id": "n2edf1",
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
      "y": 440,
      "wires": []
    },
    {
      "id": "n3edf1",
      "type": "OPCUA-IIoT-Discovery",
      "z": "b79fdf68790c5ed2",
      "name": "TestName",
      "discoveryPort": "",
      "x": 180,
      "y": 170,
      "wires": [
        [
          "n4edf1"
        ]
      ]
    },
    {
      "id": "n4edf1",
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
      "x": 390,
      "y": 100,
      "wires": []
    }
  ])
}