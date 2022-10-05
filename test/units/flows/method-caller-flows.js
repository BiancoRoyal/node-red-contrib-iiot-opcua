
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitMethodCallerFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitMethodCallerFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "706d43c1.90baac",
      "type": "OPCUA-IIoT-Method-Caller",
      "z": "b79fdf68790c5ed2",
      "connector": "",
      "objectId": "ns=1;i=1234",
      "methodId": "ns=1;i=12345",
      "methodType": "basic",
      "value": "",
      "justValue": false,
      "name": "TestName",
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
      "x": 480,
      "y": 230,
      "wires": [
        []
      ]
    }
  ]),

  "testUnitMethodCallerNotConfiguredFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitMethodCallerNotConfiguredFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "706d43c1.90babc",
      "type": "OPCUA-IIoT-Method-Caller",
      "z": "b79fdf68790c5ed2",
      "connector": "",
      "objectId": "",
      "methodId": "",
      "methodType": "basic",
      "value": "",
      "justValue": false,
      "name": "TestName",
      "showStatusActivities": false,
      "showErrors": true,
      "inputArguments": [],
      "x": 440,
      "y": 250,
      "wires": [
        []
      ]
    }
  ])
}