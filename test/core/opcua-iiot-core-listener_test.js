/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

describe('OPC UA Core Listener', function () {
  let assert = require('chai').assert
  let expect = require('chai').expect
  let coreListener = require('../../src/core/opcua-iiot-core-listener')
  const TIME_IN_MILLISECONDS = 10000

  describe('Parameter', function () {
    it('should return Event Subscribtion Parameters', function (done) {
      let sut = coreListener.getEventSubscribtionParameters(TIME_IN_MILLISECONDS)
      expect(sut).to.be.an('object').that.has.property('requestedPublishingInterval', TIME_IN_MILLISECONDS)
      expect(sut).to.be.an('object').that.has.property('requestedLifetimeCount', 60)
      expect(sut).to.be.an('object').that.has.property('requestedMaxKeepAliveCount', 10)
      expect(sut).to.be.an('object').that.has.property('maxNotificationsPerPublish', 4)
      expect(sut).to.be.an('object').that.has.property('publishingEnabled', true)
      expect(sut).to.be.an('object').that.has.property('priority', 1)
      done()
    })

    it('should return Subscribtion Parameters', function (done) {
      let sut = coreListener.getSubscriptionParameters(TIME_IN_MILLISECONDS)
      expect(sut).to.be.an('object').that.has.property('requestedPublishingInterval', TIME_IN_MILLISECONDS)
      expect(sut).to.be.an('object').that.has.property('requestedLifetimeCount', 1000)
      expect(sut).to.be.an('object').that.has.property('requestedMaxKeepAliveCount', 12)
      expect(sut).to.be.an('object').that.has.property('maxNotificationsPerPublish', 100)
      expect(sut).to.be.an('object').that.has.property('publishingEnabled', true)
      expect(sut).to.be.an('object').that.has.property('priority', 10)
      done()
    })

    it('should return all event fields in combination of basic and all', function (done) {
      let allFields = coreListener.getBasicEventFields().concat(coreListener.getAllEventFields())
      expect(allFields).to.be.an('array').that.does.include(
          'EventId',
          'SourceName',
          'Message',
          'ReceiveTime',
          'ConditionName',
          'ConditionType',
          'ConditionClassId',
          'ConditionClassName',
          'ConditionVariableType',
          'SourceNode',
          'BranchId',
          'EventType',
          'Severity',
          'Retain',
          'Comment',
          'Comment.SourceTimestamp',
          'EnabledState',
          'EnabledState.Id',
          'EnabledState.EffectiveDisplayName',
          'EnabledState.TransitionTime',
          'LastSeverity',
          'LastSeverity.SourceTimestamp',
          'Quality',
          'Quality.SourceTimestamp',
          'Time',
          'ClientUserId',
          'AckedState',
          'AckedState.Id',
          'ConfirmedState',
          'ConfirmedState.Id',
          'LimitState',
          'LimitState.Id',
          'ActiveState',
          'ActiveState.Id')
      done()
    })

    it('should return collected alarm fields with value', function (done) {
      let allFields = coreListener.getBasicEventFields().concat(coreListener.getAllEventFields())
      let field = null
      let sut = null

      for (field of allFields) {
        sut = coreListener.collectAlarmFields(field, 'key', TIME_IN_MILLISECONDS)

        switch (field) {
          // Common fields
          case 'EventId':
            expect(sut).to.be.an('object').that.has.property('eventId', TIME_IN_MILLISECONDS)
            break
          case 'EventType':
            expect(sut).to.be.an('object').that.has.property('eventType', TIME_IN_MILLISECONDS)
            break
          case 'SourceNode':
            expect(sut).to.be.an('object').that.has.property('sourceNode', TIME_IN_MILLISECONDS)
            break
          case 'SourceName':
            expect(sut).to.be.an('object').that.has.property('sourceName', TIME_IN_MILLISECONDS)
            break
          case 'Time':
            expect(sut).to.be.an('object').that.has.property('time', TIME_IN_MILLISECONDS)
            break
          case 'ReceiveTime':
            expect(sut).to.be.an('object').that.has.property('receiveTime', TIME_IN_MILLISECONDS)
            break
          case 'Severity':
            expect(sut).to.be.an('object').that.has.property('severity', TIME_IN_MILLISECONDS)
            break

          // ConditionType
          case 'ConditionClassId':
            expect(sut).to.be.an('object').that.has.property('conditionClassId', TIME_IN_MILLISECONDS)
            break
          case 'ConditionClassName':
            expect(sut).to.be.an('object').that.has.property('conditionClassName', TIME_IN_MILLISECONDS)
            break
          case 'ConditionName':
            expect(sut).to.be.an('object').that.has.property('conditionName', TIME_IN_MILLISECONDS)
            break
          case 'BranchId':
            expect(sut).to.be.an('object').that.has.property('branchId', TIME_IN_MILLISECONDS)
            break
          case 'Retain':
            expect(sut).to.be.an('object').that.has.property('retain', TIME_IN_MILLISECONDS)
            break
          case 'Quality':
            expect(sut).to.be.an('object').that.has.property('quality', TIME_IN_MILLISECONDS)
            break
          case 'LastSeverity':
            expect(sut).to.be.an('object').that.has.property('lastSeverity', TIME_IN_MILLISECONDS)
            break
          case 'ClientUserId':
            expect(sut).to.be.an('object').that.has.property('clientUserId', TIME_IN_MILLISECONDS)
            break

          // AlarmConditionType
          case 'InputNode':
            expect(sut).to.be.an('object').that.has.property('inputNode', TIME_IN_MILLISECONDS)
            break

          // Limits
          case 'HighHighLimit':
            expect(sut).to.be.an('object').that.has.property('highHighLimit', TIME_IN_MILLISECONDS)
            break
          case 'HighLimit':
            expect(sut).to.be.an('object').that.has.property('highLimit', TIME_IN_MILLISECONDS)
            break
          case 'LowLimit':
            expect(sut).to.be.an('object').that.has.property('lowLimit', TIME_IN_MILLISECONDS)
            break
          case 'LowLowLimit':
            expect(sut).to.be.an('object').that.has.property('lowLowLimit', TIME_IN_MILLISECONDS)
            eventInformation.lowLowLimit = value
            break
          case 'Value':
            expect(sut).to.be.an('object').that.has.property('value', TIME_IN_MILLISECONDS)
            break
          default:
            break
        }
      }
      done()
    })

    it('should return collected alarm fields with value.text', function (done) {
      let allFields = coreListener.getBasicEventFields().concat(coreListener.getAllEventFields())
      let field = null
      let sut = null

      for (field of allFields) {
        sut = coreListener.collectAlarmFields(field, 'key', {text: TIME_IN_MILLISECONDS})

        switch (field) {
          // Common fields
          case 'Message':
            expect(sut).to.be.an('object').that.has.property('message', TIME_IN_MILLISECONDS)
            break

          // ConditionType
          case 'EnabledState':
            expect(sut).to.be.an('object').that.has.property('enabledState', TIME_IN_MILLISECONDS)
            break
          case 'Comment':
            expect(sut).to.be.an('object').that.has.property('comment', TIME_IN_MILLISECONDS)
            break

          // AcknowledgeConditionType
          case 'AckedState':
            expect(sut).to.be.an('object').that.has.property('ackedState', TIME_IN_MILLISECONDS)
            break
          case 'ConfirmedState':
            expect(sut).to.be.an('object').that.has.property('confirmedState', TIME_IN_MILLISECONDS)
            break

          // AlarmConditionType
          case 'ActiveState':
            expect(sut).to.be.an('object').that.has.property('activeState', TIME_IN_MILLISECONDS)
            break
          case 'SupressedState':
            expect(sut).to.be.an('object').that.has.property('supressedState', TIME_IN_MILLISECONDS)
            break

          default:
            break
        }
      }
      done()
    })
  })

  describe('buildNewMonitoredItem', function () {
    it('should return Error object, if none value is present', function (done) {
      coreListener.buildNewMonitoredItem().catch(function (err) {
        assert.equal('AddressSpaceItem Is Not Valid', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreListener.buildNewMonitoredItem().catch(function (err) {
        assert.equal('AddressSpaceItem Is Not Valid', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('buildNewEventItem', function () {
    it('should return Error object, if none value is present', function (done) {
      coreListener.buildNewEventItem().catch(function (err) {
        assert.equal('AddressSpaceItem Is Not Valid', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreListener.buildNewEventItem().catch(function (err) {
        assert.equal('AddressSpaceItem Is Not Valid', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('getAllEventTypes', function () {
    it('should return Error object, if none value is present', function (done) {
      coreListener.getAllEventTypes().catch(function (err) {
        assert.equal('Session Is Not Valid To Browse For Event Types', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreListener.getAllEventTypes().catch(function (err) {
        assert.equal('Session Is Not Valid To Browse For Event Types', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('analyzeEvent', function () {
    it('should return Error object, if none session is present', function (done) {
      coreListener.analyzeEvent().catch(function (err) {
        assert.equal('Session Is Not Valid To Analyze Event', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none session is present', function (done) {
      expect(coreListener.analyzeEvent().catch(function (err) {
        assert.equal('Session Is Not Valid To Analyze Event', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })

    it('should return Error object, if none browseForBrowseName function is present', function (done) {
      coreListener.analyzeEvent({}).catch(function (err) {
        assert.equal('BrowseForBrowseName Is Not Valid Function', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none browseForBrowseName function is present', function (done) {
      expect(coreListener.analyzeEvent({}).catch(function (err) {
        assert.equal('BrowseForBrowseName Is Not Valid Function', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })

    it('should return Error object, if browseForBrowseName is not a function', function (done) {
      coreListener.analyzeEvent({}, {}).catch(function (err) {
        assert.equal('BrowseForBrowseName Is Not Valid Function', err.message)
        done()
      })
    })

    it('should be instance of Promise, if browseForBrowseName is not a function', function (done) {
      expect(coreListener.analyzeEvent({}, {}).catch(function (err) {
        assert.equal('BrowseForBrowseName Is Not Valid Function', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })

    it('should return Error object, if none dataValue is present', function (done) {
      coreListener.analyzeEvent({}, function () {
      }).catch(function (err) {
        assert.equal('Event Response Not Valid', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none dataValue is present', function (done) {
      expect(coreListener.analyzeEvent({}, function () {
      }).catch(function (err) {
        assert.equal('Event Response Not Valid', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })

    it('should be instance of Promise, if none session is present', function (done) {
      expect(coreListener.getAllEventTypes(null, function () {
      }).catch(function (err) {
        assert.equal('Session Is Not Valid To Browse For Event Types', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })
})
