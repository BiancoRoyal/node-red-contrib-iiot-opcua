
const helperExtensions = require('../test-helper-extensions')

module.exports = {

  "testUnitServerASOFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "628990c93a2db9aa",
      "type": "tab",
      "label": "Test Unit Server ASO Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "7cb85115.7635",
      "type": "OPCUA-IIoT-Server-ASO",
      "z": "628990c93a2db9aa",
      "nodeId": "ns=1;s=TestVariables",
      "browsename": "TestVariables",
      "displayname": "Test Variables",
      "objecttype": "FolderType",
      "datatype": "Double",
      "value": "1.0",
      "referenceNodeId": "ns=0;i=85",
      "referencetype": "Organizes",
      "name": "Folder",
      "x": 210,
      "y": 280,
      "wires": [
        [
          "a51de437b1ecc2f5"
        ]
      ]
    },
    {
      "id": "a51de437b1ecc2f5",
      "type": "helper",
      "z": "628990c93a2db9aa",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 380,
      "y": 280,
      "wires": []
    }
  ])
}