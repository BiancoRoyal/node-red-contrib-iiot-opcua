const helperExtensions = require("../../helper/test-helper-extensions")

module.exports = {

  "readGoodInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf1",
      "type": "inject",
      "name": "TestInject Read",
      "topic": "TestTopic",
      "payload": "{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":20, \"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"}},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfrd"]]
    }),

  "readBadInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf2",
      "type": "inject",
      "name": "TestInject Read",
      "topic": "TestTopic",
      "payload": "{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":20, \"statusCode\":{\"value\":0,\"description\":\"Fatal Error\",\"name\":\"Bad\"}},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfrd"]]
    }),

  "readOtherInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf3",
      "type": "inject",
      "name": "TestInject Read",
      "topic": "TestTopic",
      "payload": "{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":20, \"statusCode\":{\"value\":0,\"description\":\"Some Error\",\"name\":\"Best\"}},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfrd"]]
    }),

  "readResultSimulation": helperExtensions.cleanNodePositionData({
    "id": "n3rsfrd",
    "type": "function",
    "name": '',
    "func": "msg.payload.nodetype = \"read\"\nmsg.payload.injectType = \"read\"\nreturn msg;",
    "outputs": 1,
    "noerr": 0,
    "wires": [["n4rsf", "n5rsf"]]
  }),

  "writeGoodInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf5",
      "type": "inject",
      "name": "TestInject Write",
      "topic": "TestTopic",
      "payload": "{\"statusCodes\":[{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"}]}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfwr"]]
    }),

  "writeBadInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf6",
      "type": "inject",
      "name": "TestInject Write",
      "topic": "TestTopic",
      "payload": "{\"statusCodes\":[{\"value\":0,\"description\":\"Fatal Error\",\"name\":\"Bad\"}]}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfwr"]]
    }),

  "writeOtherInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf7",
      "type": "inject",
      "name": "TestInject Write",
      "topic": "TestTopic",
      "payload": "{\"statusCodes\":[{\"value\":0,\"description\":\"Some Error\",\"name\":\"Best\"}]}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfwr"]]
    }
  ),

  "writeResultSimulation": helperExtensions.cleanNodePositionData(
    {
      "id": "n3rsfwr",
      "type": "function",
      "name": '',
      "func": "msg.payload.nodetype = \"write\"\nmsg.payload.injectType = \"write\"\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "wires": [["n4rsf", "n5rsf"]]
    }
  ),

  "listenGoodInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf8",
      "type": "inject",
      "name": "TestInject Listen",
      "topic": "TestTopic",
      "payload": "{\"value\":{\"dataType\":\"UInt16\",\"arrayType\":\"Scalar\",\"value\":0, \"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"}},\"sourceTimestamp\":\"0\",\"sourcePicoseconds\":0,\"serverTimestamp\":\"0\",\"serverPicoseconds\":0}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfli"]]
    }
  ),

  "listenBadInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf9",
      "type": "inject",
      "name": "TestInject Listen",
      "topic": "TestTopic",
      "payload": "{\"value\":{\"dataType\":\"UInt16\",\"arrayType\":\"Scalar\",\"value\":0, \"statusCode\":{\"value\":0,\"description\":\"Fatal Error\",\"name\":\"Bad\"}},\"sourceTimestamp\":\"0\",\"sourcePicoseconds\":0,\"serverTimestamp\":\"0\",\"serverPicoseconds\":0}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfli"]]
    }
  ),

  "listenOtherInject": helperExtensions.cleanNodePositionData(
    {
      "id": "n1rsf10",
      "type": "inject",
      "name": "TestInject Listen",
      "topic": "TestTopic",
      "payload": "{\"value\":{\"dataType\":\"UInt16\",\"arrayType\":\"Scalar\",\"value\":0, \"statusCode\":{\"value\":0,\"description\":\"Some Error\",\"name\":\"Best\"}},\"sourceTimestamp\":\"0\",\"sourcePicoseconds\":0,\"serverTimestamp\":\"0\",\"serverPicoseconds\":0}",
      "payloadType": "json",
      "repeat": '',
      "crontab": '',
      "once": true,
      "onceDelay": 0.1,
      "wires": [["n2rsf", "n3rsfli"]]
    }
  ),

  "listenResultSimulation": helperExtensions.cleanNodePositionData(
    {
      "id": "n3rsfli",
      "type": "function",
      "name": '',
      "func": "msg.payload.nodetype = \"listen\"\nmsg.payload.injectType = \"subscribe\"\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "wires": [["n4rsf", "n5rsf"]]
    }
  )
}