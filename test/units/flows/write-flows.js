
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitWriteFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitWriteFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "34d2c6bc.43275b",
      "type": "OPCUA-IIoT-Write",
      "z": "b79fdf68790c5ed2",
      "connector": "",
      "name": "TestWrite",
      "justValue": false,
      "showStatusActivities": false,
      "showErrors": true,
      "x": 220,
      "y": 170,
      "wires": [
        []
      ]
    }
  ])
}