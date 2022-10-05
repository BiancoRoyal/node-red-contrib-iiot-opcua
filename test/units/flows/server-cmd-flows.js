
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitServerCommandFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitServerCommandFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n3cmdf1",
      "type": "OPCUA-IIoT-Server-Command",
      "z": "b79fdf68790c5ed2",
      "commandtype": "restart",
      "nodeId": "",
      "name": "TestName",
      "x": 130,
      "y": 200,
      "wires": [
        []
      ]
    }
  ])
}