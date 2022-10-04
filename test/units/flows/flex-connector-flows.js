
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitFlexConnectorFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitFlexConnectorFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "14d54403.f94f04",
      "type": "OPCUA-IIoT-Flex-Connector",
      "z": "b79fdf68790c5ed2",
      "name": "TestFlexConnector",
      "showStatusActivities": false,
      "showErrors": false,
      "connector": "",
      "x": 510,
      "y": 260,
      "wires": [
        []
      ]
    }
  ]),
  "testUnitFlexConnectorShowActivitiesFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitFlexConnectorShowActivitiesFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "14d54403.f94f05",
      "type": "OPCUA-IIoT-Flex-Connector",
      "z": "b79fdf68790c5ed2",
      "name": "TestFlexConnector2",
      "showStatusActivities": true,
      "showErrors": false,
      "connector": "",
      "x": 440,
      "y": 260,
      "wires": [
        []
      ]
    }
  ])
}