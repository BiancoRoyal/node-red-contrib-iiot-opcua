/**
 * Copyright (c) 2018 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

describe('Test Suite e2e', () => {
  require('../test/e2e/opcua-iiot-connector-e2e.test')
  require('../test/e2e/opcua-iiot-flex-connector-e2e.test')
  require('../test/e2e/opcua-iiot-browser-e2e.test')
  require('../test/e2e/opcua-iiot-crawler-e2e.test')
  require('../test/e2e/opcua-iiot-method-caller-e2e.test')
  require('../test/e2e/opcua-iiot-read-e2e.test')
  require('../test/e2e/opcua-iiot-response-e2e.test')
  require('../test/e2e/opcua-iiot-server-aso-e2e.test')
  require('../test/e2e/opcua-iiot-server-cmd-e2e.test')
  require('../test/e2e/opcua-iiot-write-e2e.test')
})
