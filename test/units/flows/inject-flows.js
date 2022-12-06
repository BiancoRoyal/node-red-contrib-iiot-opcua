const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitDefaultInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Unit Default Inject Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
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
      "x": 300,
      "y": 160,
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
      "x": 520,
      "y": 160,
      "wires": []
    }
  ]),

  "testUnitInjectFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Unit Inject Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
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
      "y": 140,
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
      "y": 140,
      "wires": []
    }
  ]),

  "testInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Inject Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
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
      "x": 240,
      "y": 140,
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
      "x": 410,
      "y": 140,
      "wires": []
    }
  ]),

  "testInjectWithDelayFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Inject with Delay Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
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
      "x": 220,
      "y": 140,
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
      "x": 410,
      "y": 140,
      "wires": []
    }
  ]),

  "testInjectWithLongDelayFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Inject with long Delay Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
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
      "y": 180,
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
      "y": 180,
      "wires": []
    }
  ]),

  "testUnitReadInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Unit Read Inject Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
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
      "x": 200,
      "y": 160,
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
      "x": 400,
      "y": 160,
      "wires": []
    }
  ]),

  "testUnitListenInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Unit Listen Inject Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
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
      "x": 180,
      "y": 140,
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
      "x": 380,
      "y": 140,
      "wires": []
    }
  ]),

  "testUnitWriteInjectFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Unit Write Inject Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
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
      "x": 160,
      "y": 140,
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
      "x": 380,
      "y": 140,
      "wires": []
    }
  ]),

  "testInjectWithIntervalFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "f907d5d45a2f32aa",
      "type": "tab",
      "label": "Test Inject with interval Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "e41b31a770aae974",
      "type": "OPCUA-IIoT-Inject",
      "z": "f907d5d45a2f32aa",
      "injectType": "inject",
      "payload": "",
      "payloadType": "date",
      "topic": "",
      "repeat": "2",
      "crontab": "",
      "once": true,
      "startDelay": "3",
      "name": "",
      "addressSpaceItems": [],
      "x": 183,
      "y": 276,
      "wires": [
        [
          "920deb27a882f242"
        ]
      ]
    },
    {
      "id": "920deb27a882f242",
      "type": "helper",
      "z": "f907d5d45a2f32aa",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 383,
      "y": 277,
      "wires": []
    }
  ])
}
