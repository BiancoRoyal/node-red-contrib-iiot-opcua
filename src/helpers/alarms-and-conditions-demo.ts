/*
 The MIT License (MIT)

 Copyright (c) 2022 DATATRONiQ GmbH
 Copyright (c) 2017-2022 Klaus Landsdorf (http://node-red.plus/)
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

import {TodoTypeAny} from "../types/placeholders";

const assert = require('better-assert')
const nodeOpcuaLib = require('node-opcua')

export function constructAlarmAddressSpaceDemo (test: TodoTypeAny, addressSpace: TodoTypeAny) {
  addressSpace.installAlarmsAndConditionsService()
  const LocalizedText = nodeOpcuaLib.LocalizedText

  let tanks = addressSpace.getOwnNamespace().addObject({
    browseName: 'Tanks',
    typeDefinition: 'FolderType',
    description: 'The Object representing some tanks',
    organizedBy: addressSpace.rootFolder.objects,
    notifierOf: addressSpace.rootFolder.objects.server
  })

  let oilTankLevel = addressSpace.getOwnNamespace().addVariable({
    browseName: 'OilTankLevel',
    displayName: [
      new LocalizedText({ text: 'Oil Tank Level', locale: 'en-US' }),
      new LocalizedText({ text: 'Oil Tank Stand', locale: 'de-DE' })
    ],
    description: 'Fill level in percentage (0% to 100%) of the oil tank',
    propertyOf: tanks,
    dataType: 'Double',
    eventSourceOf: tanks
  })

  // ---------------------------------------------------------------------------------
  // Let's create a exclusive Limit Alarm that automatically raise itself
  // when the tank level is out of limit
  // ---------------------------------------------------------------------------------
  let exclusiveLimitAlarmType = addressSpace.findEventType('ExclusiveLimitAlarmType')
  assert(exclusiveLimitAlarmType != null)

  let oilTankLevelCondition = addressSpace.getOwnNamespace().instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {
    componentOf: tanks,
    conditionSource: oilTankLevel,
    browseName: 'OilTankLevelCondition',
    displayName: [ new LocalizedText({ text: 'Oil Tank Level Condition', locale: 'en-US' }) ],
    description: 'ExclusiveLimitAlarmType Condition',
    conditionName: 'OilLevelCondition',
    optionals: [
      'ConfirmedState', 'Confirm' // confirm state and confirm Method
    ],
    inputNode: oilTankLevel, // the letiable that will be monitored for change
    highHighLimit: 0.9,
    highLimit: 0.8,
    lowLimit: 0.2
  })

  // --------------------------------------------------------------
  // Let's create a second letiable with no Exclusive alarm
  // --------------------------------------------------------------
  let gasTankLevel = addressSpace.getOwnNamespace().addVariable({
    browseName: 'GasTankLevel',
    displayName: [ new LocalizedText({ text: 'Gas Tank Level', locale: 'en-US' }) ],
    description: 'Fill level in percentage (0% to 100%) of the gas tank',
    propertyOf: tanks,
    dataType: 'Double',
    eventSourceOf: tanks
  })

  let nonExclusiveLimitAlarmType = addressSpace.findEventType('NonExclusiveLimitAlarmType')
  assert(nonExclusiveLimitAlarmType != null)

  let gasTankLevelCondition = addressSpace.getOwnNamespace().instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {
    componentOf: tanks,
    conditionSource: gasTankLevel,
    browseName: 'GasTankLevelCondition',
    displayName: [ new LocalizedText({ text: 'Gas Tank Level Condition', locale: 'en-US' }) ],
    description: 'NonExclusiveLimitAlarmType Condition',
    conditionName: 'GasLevelCondition',
    optionals: [
      'ConfirmedState', 'Confirm' // confirm state and confirm Method
    ],
    inputNode: gasTankLevel, // the letiable that will be monitored for change
    highHighLimit: 0.9,
    highLimit: 0.8,
    lowLimit: 0.2
  })

  test.tankLevel = oilTankLevel
  test.tankLevelCondition = oilTankLevelCondition

  test.tankLevel2 = gasTankLevel
  test.tankLevelCondition2 = gasTankLevelCondition
}

exports.constructAlarmAddressSpaceDemo = constructAlarmAddressSpaceDemo
