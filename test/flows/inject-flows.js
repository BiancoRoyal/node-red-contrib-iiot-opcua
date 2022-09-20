const helperExtensions = require('../test-helper-extensions')

module.exports = {

  "testUnitDefaultInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "0128054740bdc14c",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "",
      "crontab": "",
      "once": false,
      "startDelay": "",
      "name": "",
      "addressSpaceItems": [],
      "x": 200,
      "y": 300,
      "wires": [
        [
          "03503f5859503430"
        ]
      ]
    },
    {
      "id": "03503f5859503430",
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
      "x": 420,
      "y": 300,
      "wires": []
    }
  ]),

  "testUnitInjectFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "f93b472c.486038",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "inject",
      "payload": "123456",
      "payloadType": "num",
      "topic": "TestTopicInject",
      "repeat": "",
      "crontab": "",
      "once": false,
      "startDelay": "",
      "name": "TestName",
      "addressSpaceItems": [],
      "x": 240,
      "y": 280,
      "wires": [
        [
          "72ce3c9207555c36"
        ]
      ]
    },
    {
      "id": "72ce3c9207555c36",
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
      "x": 420,
      "y": 280,
      "wires": []
    }
  ]),

  "testInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "n1ijf1",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "inject",
      "payload": "12345",
      "payloadType": "num",
      "topic": "TestTopicInject",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "0.1",
      "name": "TestInject",
      "addressSpaceItems": [
        {
          "name": "ServerStatus",
          "nodeId": "ns=0;i=2256",
          "datatypeName": "String"
        }
      ],
      "x": 220,
      "y": 300,
      "wires": [
        [
          "n2ijf1"
        ]
      ]
    },
    {
      "id": "n2ijf1",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "x": 390,
      "y": 300,
      "wires": []
    }
  ]),

  "testInjectWithDelayFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "n1ijf2",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "inject",
      "payload": "12345",
      "payloadType": "num",
      "topic": "TestTopicInject",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "0.3",
      "name": "TestInject",
      "addressSpaceItems": [
        {
          "name": "ServerStatus",
          "nodeId": "ns=0;i=2256",
          "datatypeName": "String"
        }
      ],
      "x": 240,
      "y": 220,
      "wires": [
        [
          "n2ijf2"
        ]
      ]
    },
    {
      "id": "n2ijf2",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "active": true,
      "x": 430,
      "y": 220,
      "wires": []
    }
  ]),

  "testInjectWithLongDelayFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "n1ijf3",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "inject",
      "payload": "12345",
      "payloadType": "num",
      "topic": "TestTopicInject",
      "repeat": "",
      "crontab": "",
      "once": true,
      "startDelay": "0.5",
      "name": "TestInject",
      "addressSpaceItems": [
        {
          "name": "ServerStatus",
          "nodeId": "ns=0;i=2256",
          "datatypeName": "String"
        }
      ],
      "x": 220,
      "y": 220,
      "wires": [
        [
          "n2ijf3"
        ]
      ]
    },
    {
      "id": "n2ijf3",
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
      "x": 410,
      "y": 220,
      "wires": []
    }
  ]),

  "testUnitReadInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "f93b472c.486038",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "read",
      "payload": "123456",
      "payloadType": "num",
      "topic": "TestTopicInject",
      "repeat": "",
      "crontab": "",
      "once": false,
      "startDelay": "1",
      "name": "TestName",
      "addressSpaceItems": [],
      "x": 240,
      "y": 220,
      "wires": [
        [
          "ff8bd45da20c638e"
        ]
      ]
    },
    {
      "id": "ff8bd45da20c638e",
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
      "x": 440,
      "y": 220,
      "wires": []
    }
  ]),

  "testUnitListenInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "f93b472c.486038",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "listen",
      "payload": "123456",
      "payloadType": "num",
      "topic": "TestTopicInject",
      "repeat": "",
      "crontab": "",
      "once": false,
      "startDelay": "1",
      "name": "TestName",
      "addressSpaceItems": [],
      "x": 220,
      "y": 260,
      "wires": [
        [
          "8b5a7c3a6083bf35"
        ]
      ]
    },
    {
      "id": "8b5a7c3a6083bf35",
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
      "x": 420,
      "y": 260,
      "wires": []
    }
  ]),

  "testUnitWriteInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "f93b472c.486038",
      "type": "OPCUA-IIoT-Inject",
      "z": "e41e66b2c57b1657",
      "injectType": "write",
      "payload": "123456",
      "payloadType": "num",
      "topic": "TestTopicInject",
      "repeat": "",
      "crontab": "",
      "once": false,
      "startDelay": "1",
      "name": "TestName",
      "addressSpaceItems": [],
      "x": 200,
      "y": 320,
      "wires": [
        [
          "9c90f296e81f2ef9"
        ]
      ]
    },
    {
      "id": "9c90f296e81f2ef9",
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
      "x": 420,
      "y": 320,
      "wires": []
    }
  ])
}
