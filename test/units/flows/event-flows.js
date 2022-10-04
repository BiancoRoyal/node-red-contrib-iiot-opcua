
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitEventFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitEventFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n1evf1",
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
      "payload": "{\"value\":1000}",
      "payloadType": "json",
      "x": 470,
      "y": 400,
      "wires": [
        [
          "n2evf1",
          "n3evf1"
        ]
      ]
    },
    {
      "id": "n2evf1",
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
      "y": 660,
      "wires": []
    },
    {
      "id": "n3evf1",
      "type": "OPCUA-IIoT-Event",
      "z": "b79fdf68790c5ed2",
      "eventType": "i=2041",
      "eventTypeLabel": "BaseTypeEvent",
      "queueSize": 10,
      "usingListener": true,
      "name": "TestName",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 830,
      "y": 300,
      "wires": [
        [
          "n4evf1"
        ]
      ]
    },
    {
      "id": "n4evf1",
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
      "y": 180,
      "wires": []
    }
  ])
}