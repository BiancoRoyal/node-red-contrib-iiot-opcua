
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitListenerFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitListenerFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "bee3e3b0.ca1a08",
      "type": "OPCUA-IIoT-Listener",
      "z": "b79fdf68790c5ed2",
      "connector": "",
      "action": "subscribe",
      "queueSize": 10,
      "name": "TestListener",
      "topic": "",
      "justValue": true,
      "useGroupItems": false,
      "showStatusActivities": false,
      "showErrors": false,
      "x": 470,
      "y": 240,
      "wires": [
        []
      ]
    }
  ])
}