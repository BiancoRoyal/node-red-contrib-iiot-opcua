
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testUnitConnectorFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitConnectorFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n4",
      "type": "OPCUA-IIoT-Connector",
      "z": "b79fdf68790c5ed2",
      "discoveryUrl": "",
      "endpoint": "",
      "keepSessionAlive": false,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "TESTSERVER",
      "showErrors": false,
      "individualCerts": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "60000",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": "",
      "requestedSessionTimeout": "",
      "connectionStartDelay": "",
      "reconnectDelay": "",
      "maxBadSessionRequests": ""
    }
  ]),

  "testUnitConnectorDefaultsFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitConnectorDefaultsFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "n4",
      "type": "OPCUA-IIoT-Connector",
      "z": "b79fdf68790c5ed2",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:55388/",
      "keepSessionAlive": true,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL SERVER",
      "showErrors": false,
      "individualCerts": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": "",
      "requestedSessionTimeout": "",
      "connectionStartDelay": "",
      "connectionStopDelay": "",
      "reconnectDelay": "",
      "maxBadSessionRequests": 10
    }
  ]),

  "testUnitConnectorGeneratedDefaultsFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "b79fdf68790c5ed2",
      "type": "tab",
      "label": "testUnitConnectorDefaultFlowFlow",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "7291451d5224efde",
      "type": "OPCUA-IIoT-Read",
      "z": "b79fdf68790c5ed2",
      "attributeId": 0,
      "maxAge": 1,
      "depth": 1,
      "connector": "594b2860fa40bda5",
      "name": "",
      "justValue": true,
      "showStatusActivities": false,
      "showErrors": false,
      "parseStrings": false,
      "historyDays": 1,
      "x": 440,
      "y": 250,
      "wires": [
        []
      ]
    },
    {
      "id": "594b2860fa40bda5",
      "type": "OPCUA-IIoT-Connector",
      "discoveryUrl": "",
      "endpoint": "opc.tcp://localhost:44840/",
      "keepSessionAlive": true,
      "loginEnabled": false,
      "securityPolicy": "None",
      "securityMode": "None",
      "name": "LOCAL SERVER",
      "showErrors": false,
      "individualCerts": false,
      "publicCertificateFile": "",
      "privateKeyFile": "",
      "defaultSecureTokenLifetime": "",
      "endpointMustExist": false,
      "autoSelectRightEndpoint": false,
      "strategyMaxRetry": "",
      "strategyInitialDelay": "",
      "strategyMaxDelay": "",
      "strategyRandomisationFactor": "",
      "requestedSessionTimeout": "",
      "connectionStartDelay": "",
      "reconnectDelay": "",
      "maxBadSessionRequests": 10
    }
  ])
}