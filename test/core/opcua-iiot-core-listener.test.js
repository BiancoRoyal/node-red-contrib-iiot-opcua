/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

jest.setTimeout(5000)

describe('OPC UA Core Listener', function () {
  let assert = require('chai').assert
  let expect = require('chai').expect
  let coreListener = require('../../src/core/opcua-iiot-core-listener')
  const TIME_IN_MILLISECONDS = 10000

  describe('Parameter', function () {
    it('should return Event Subscribtion Parameters', function (done) {
      let sut = coreListener.getEventSubscriptionParameters(TIME_IN_MILLISECONDS)
      expect(sut).to.be.an('object').that.has.property('requestedPublishingInterval', TIME_IN_MILLISECONDS)
      expect(sut).to.be.an('object').that.has.property('requestedLifetimeCount', 1000 * 60 * 20)
      expect(sut).to.be.an('object').that.has.property('requestedMaxKeepAliveCount', 120)
      expect(sut).to.be.an('object').that.has.property('maxNotificationsPerPublish', 200)
      expect(sut).to.be.an('object').that.has.property('publishingEnabled', true)
      expect(sut).to.be.an('object').that.has.property('priority', 2)
      done()
    })

    it('should return Subscribtion Parameters', function (done) {
      let sut = coreListener.getSubscriptionParameters(TIME_IN_MILLISECONDS)
      expect(sut).to.be.an('object').that.has.property('requestedPublishingInterval', TIME_IN_MILLISECONDS)
      expect(sut).to.be.an('object').that.has.property('requestedLifetimeCount', 1000 * 60 * 10)
      expect(sut).to.be.an('object').that.has.property('requestedMaxKeepAliveCount', 60)
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
        expect(sut).to.be.an('object').that.has.property('field', field)
        expect(sut).to.be.an('object').that.has.property('dataType', 'key')
        expect(sut).to.be.an('object').that.has.property('value', TIME_IN_MILLISECONDS)
      }
      done()
    })

    it('should return collected alarm fields with value.text', function (done) {
      let allFields = coreListener.getBasicEventFields().concat(coreListener.getAllEventFields())
      let field = null
      let sut = null

      for (field of allFields) {
        sut = coreListener.collectAlarmFields(field, 'key', {text: 'Hello World!'})
        expect(sut).to.be.an('object').that.has.property('field', field)
        expect(sut).to.be.an('object').that.has.property('dataType', 'key')
        expect(sut.value).to.be.an('object').that.has.property('text', 'Hello World!')
      }
      done()
    })
  })

  describe('buildNewMonitoredItem', function () {
    it('should return Error object, if none value is present', function (done) {
      coreListener.buildNewMonitoredItem().catch(function (err) {
        assert.equal('NodeId Is Not Valid', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreListener.buildNewMonitoredItem().catch(function (err) {
        assert.equal('NodeId Is Not Valid', err.message)
        done()
      })).to.be.instanceOf(Promise)
    })
  })

  describe('buildNewEventItem', function () {
    it('should return Error object, if none value is present', function (done) {
      coreListener.buildNewEventItem().catch(function (err) {
        assert.equal('NodeId Is Not Valid', err.message)
        done()
      })
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreListener.buildNewEventItem().catch(function (err) {
        assert.equal('NodeId Is Not Valid', err.message)
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
  })
})
