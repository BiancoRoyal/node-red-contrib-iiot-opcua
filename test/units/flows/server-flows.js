
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testServerWithDemoFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b233bdeab126bfd4",
      "type": "tab",
      "label": "Test Server Demo Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "6ec4ef50.86dc1",
      "type": "OPCUA-IIoT-Server",
      "z": "b233bdeab126bfd4",
      "port": "51250",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "DEMOSERVER",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": true,
      "allowAnonymous": true,
      "individualCerts": false,
      "isAuditing": false,
      "serverDiscovery": false,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "registerServerMethod": 1,
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": 200,
      "x": 380,
      "y": 200,
      "wires": [
        []
      ]
    }
  ]),

  "testServerWithoutDemoFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "4a4f0ffea30b6dcb",
      "type": "tab",
      "label": "Test Server Flow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "6ec4ef50.86dc2",
      "type": "OPCUA-IIoT-Server",
      "z": "4a4f0ffea30b6dcb",
      "port": "51201",
      "endpoint": "",
      "acceptExternalCommands": true,
      "maxAllowedSessionNumber": "",
      "maxConnectionsPerEndpoint": "",
      "maxAllowedSubscriptionNumber": "",
      "alternateHostname": "",
      "name": "DEMOSERVER",
      "showStatusActivities": false,
      "showErrors": false,
      "asoDemo": false,
      "allowAnonymous": true,
      "individualCerts": false,
      "isAuditing": false,
      "serverDiscovery": true,
      "users": [],
      "xmlsets": [],
      "publicCertificateFile": "",
      "privateCertificateFile": "",
      "registerServerMethod": 1,
      "discoveryServerEndpointUrl": "",
      "capabilitiesForMDNS": "",
      "maxNodesPerRead": 1000,
      "maxNodesPerBrowse": 2000,
      "delayToClose": "",
      "x": 460,
      "y": 140,
      "wires": [
        []
      ]
    }
  ])
}