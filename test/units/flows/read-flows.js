
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitReadFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitReadFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "41cb29d.1ab50d8",
      "type": "OPCUA-IIoT-Read",
      "z": "b79fdf68790c5ed2",
      "attributeId": 0,
      "maxAge": 1,
      "depth": 1,
      "connector": "",
      "name": "ReadAll",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "historyDays": "",
      "x": 400,
      "y": 170,
      "wires": [
        [
          "508385cc4a0a910b"
        ]
      ]
    },
    {
      "id": "508385cc4a0a910b",
      "type": "helper",
      "z": "b79fdf68790c5ed2",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 600,
      "y": 170,
      "wires": []
    }
  ])
}