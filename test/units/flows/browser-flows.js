
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitBrowseFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Test Unit Browse Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "4ac0b7c8.bebe18",
      "type": "OPCUA-IIoT-Browser",
      "z": "e41e66b2c57b1657",
      "connector": "",
      "nodeId": "ns=1;i=1234",
      "name": "TestNameBrowser",
      "justValue": true,
      "sendNodesToRead": false,
      "sendNodesToListener": false,
      "sendNodesToBrowser": false,
      "multipleOutputs": false,
      "recursiveBrowse": false,
      "recursiveDepth": "",
      "delayPerMessage": "",
      "showStatusActivities": false,
      "showErrors": false,
      "x": 190,
      "y": 140,
      "wires": [
        [
          "059bc7271eb02b9d"
        ]
      ]
    },
    {
      "id": "059bc7271eb02b9d",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 440,
      "y": 140,
      "wires": []
    }
  ])
}