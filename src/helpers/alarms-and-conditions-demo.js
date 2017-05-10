/*
 The MIT License (MIT)

 Copyright (c) 2017 Klaus Landsdorf
 Copyright (c) 2014-2017 Etienne Rossignon

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
'use strict'

let assert = require('better-assert')

function constructAlarmAddressSpaceDemo (test, addressSpace) {
  addressSpace.installAlarmsAndConditionsService()

  let tank = addressSpace.addObject({
    browseName: 'Tank',
    description: 'The Object representing the Tank',
    organizedBy: addressSpace.rootFolder.objects,
    notifierOf: addressSpace.rootFolder.objects.server
  })

  let tankLevel = addressSpace.addVariable({
    browseName: 'TankLevel',
    description: 'Fill level in percentage (0% to 100%) of the water tank',
    propertyOf: tank,
    dataType: 'Double',
    eventSourceOf: tank
  })

  // ---------------------------------------------------------------------------------
  // Let's create a exclusive Limit Alarm that automatically raise itself
  // when the tank level is out of limit
  // ---------------------------------------------------------------------------------

  let exclusiveLimitAlarmType = addressSpace.findEventType('ExclusiveLimitAlarmType')
  assert(exclusiveLimitAlarmType != null)

  let tankLevelCondition = addressSpace.instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {
    componentOf: tank,
    conditionSource: tankLevel,
    browseName: 'TankLevelCondition',
    conditionName: 'Test2',
    optionals: [
      'ConfirmedState', 'Confirm' // confirm state and confirm Method
    ],
    inputNode: tankLevel,   // the letiable that will be monitored for change
    highHighLimit: 0.9,
    highLimit: 0.8,
    lowLimit: 0.2
  })

  let tankTripCondition = null
  // to
  // ---------------------------
  // create a retain condition
  // xx tankLevelCondition.currentBranch().setRetain(true);
  // xx tankLevelCondition.raiseNewCondition({message: "Tank is almost 70% full", severity: 100, quality: StatusCodes.Good});

  // --------------------------------------------------------------
  // Let's create a second letiable with no Exclusive alarm
  // --------------------------------------------------------------
  let tankLevel2 = addressSpace.addVariable({
    browseName: 'tankLevel2',
    description: 'Fill level in percentage (0% to 100%) of the water tank',
    propertyOf: tank,
    dataType: 'Double',
    eventSourceOf: tank
  })

  let nonExclusiveLimitAlarmType = addressSpace.findEventType('NonExclusiveLimitAlarmType')
  assert(nonExclusiveLimitAlarmType != null)

  let tankLevelCondition2 = addressSpace.instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {
    componentOf: tank,
    conditionSource: tankLevel2,
    browseName: 'TankLevelCondition2',
    conditionName: 'Test',
    optionals: [
      'ConfirmedState', 'Confirm' // confirm state and confirm Method
    ],
    inputNode: tankLevel2,   // the letiable that will be monitored for change
    highHighLimit: 0.9,
    highLimit: 0.8,
    lowLimit: 0.2
  })

  test.tankLevel = tankLevel
  test.tankLevelCondition = tankLevelCondition

  test.tankLevel2 = tankLevel2
  test.tankLevelCondition2 = tankLevelCondition2

  test.tankTripCondition = tankTripCondition
}

exports.constructAlarmAddressSpaceDemo = constructAlarmAddressSpaceDemo
