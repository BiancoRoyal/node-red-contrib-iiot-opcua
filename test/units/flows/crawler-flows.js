
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitCrawlerFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "4d6ae11544766677",
      "type": "tab",
      "label": "Test Crawler Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "13e5e190.e34516",
      "type": "OPCUA-IIoT-Crawler",
      "z": "4d6ae11544766677",
      "connector": "",
      "name": "TestNameCrawler",
      "justValue": true,
      "singleResult": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [
        {
          "name": "Organizes",
          "value": ""
        },
        {
          "name": "GeneratesEvent",
          "value": ""
        },
        {
          "name": "References",
          "value": ""
        }
      ],
      "delayPerMessage": "",
      "timeout": "",
      "x": 370,
      "y": 160,
      "wires": [
        []
      ]
    }
  ]),
  "testUnitDefaultCrawlerFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "4d6ae11544766677",
      "type": "tab",
      "label": "Test Unit Default Crawler Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "4bf9f1cbd3fe98bc",
      "type": "OPCUA-IIoT-Crawler",
      "z": "4d6ae11544766677",
      "connector": "",
      "name": "",
      "justValue": true,
      "singleResult": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "delayPerMessage": 0.2,
      "timeout": 30,
      "x": 220,
      "y": 180,
      "wires": [
        [
          "647418b9eaf63928"
        ]
      ]
    },
    {
      "id": "647418b9eaf63928",
      "type": "helper",
      "z": "4d6ae11544766677",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 420,
      "y": 180,
      "wires": []
    }
  ])
}