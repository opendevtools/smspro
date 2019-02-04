const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

chai.use(require('sinon-chai'))

describe('services/logger', () => {
  let bunYanError,
    bunYanInfo,
    bunyan,
    logger,
    clock,
    bunyanLogstashTcp,
    createStreamOn,
    bunyanStdSerializersErr

  beforeEach(() => {
    bunYanError = sinon.stub().returns(undefined)
    bunYanInfo = sinon.stub().returns(undefined)
    bunyanStdSerializersErr = sinon.spy()

    bunyan = {
      createLogger: sinon.stub().returns({
        error: bunYanError,
        info: bunYanInfo,
      }),
      stdSerializers: {
        err: bunyanStdSerializersErr,
      },
    }

    createStreamOn = sinon.stub()

    bunyanLogstashTcp = {
      createStream: sinon.stub().returns({ on: createStreamOn }),
    }

    logger = proxyquire(process.cwd() + '/lib/services/logger', {
      bunyan: bunyan,
      'bunyan-logstash-tcp': bunyanLogstashTcp,
    })({
      source: 'unittests',
      logstashUrl: 'url',
      logstashPort: 'port',
      shouldMockSms: true,
    })

    clock = sinon.useFakeTimers(new Date('2016-09-23 11:42').getTime())
  })

  afterEach(() => {
    clock.restore()
  })

  it('creates logger with correct settings', () => {
    expect(bunyan.createLogger).calledWith({
      name: 'smspro-log',
      serializers: {
        err: bunyanStdSerializersErr,
      },
      streams: [
        {
          stream: undefined,
          type: 'raw',
        },
      ],
      tags: ['logging'],
    })
    expect(bunyanLogstashTcp.createStream).calledWith({
      host: 'url',
      port: 'port',
    })
  })

  it('logs error if connection to logstash failed', () => {
    expect(createStreamOn).calledWith('error', console.log)
  })

  describe('info', () => {
    it('Calls bunyan log function with correct parameters for Error', () => {
      const requestData = { test: 'test' }
      logger.info(requestData)

      expect(bunyan.createLogger).callCount(1)
      expect(bunyanLogstashTcp.createStream).callCount(1)

      expect(bunYanInfo).callCount(1)
      expect(bunYanInfo).calledWith({
        time: new Date('2016-09-23 11:42'),
        source: 'unittests',
        requestData,
      })
    })

    it('Does not barf on undefined error', () => {
      logger.info()

      expect(bunyan.createLogger).callCount(1)
      expect(bunyanLogstashTcp.createStream).callCount(1)

      expect(bunYanInfo).callCount(1)
      expect(bunYanInfo).calledWith({
        time: new Date('2016-09-23 11:42'),
        source: 'unittests',
        requestData: undefined,
      })
    })
  })
})
