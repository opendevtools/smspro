const logger = require('../logger')
const { createStream } = require('bunyan-logstash-tcp')
const { createLogger, stdSerializers } = require('bunyan')
const MockDate = require('mockdate')

jest.mock('bunyan')
jest.mock('bunyan-logstash-tcp')

const setup = () => {
  const settings = {
    source: 'unittests',
    logstashUrl: 'url',
    logstashPort: 'port',
    shouldMockSms: true,
  }

  MockDate.set(new Date('2016-09-23 11:42').getTime())

  const bunyanInfo = { info: jest.fn() }
  createLogger.mockReturnValue(bunyanInfo)

  return { ...logger(settings), bunyanInfo }
}

beforeEach(jest.clearAllMocks)

it('creates logger with correct settings', () => {
  createStream.mockReturnValue({ on: jest.fn().mockReturnValue('stream') })

  setup()

  expect(createLogger).toHaveBeenCalledWith({
    name: 'smspro-log',
    serializers: {
      err: stdSerializers.err,
    },
    streams: [
      {
        stream: 'stream',
        type: 'raw',
      },
    ],
    tags: ['logging'],
  })
  expect(createStream).toHaveBeenCalledWith({
    host: 'url',
    port: 'port',
  })
})

describe('#info', () => {
  it('Calls bunyan log function with correct parameters for Error', () => {
    const { info, bunyanInfo } = setup()

    const requestData = { test: 'test' }
    info(requestData)

    expect(bunyanInfo.info).toHaveBeenCalledTimes(1)
    expect(bunyanInfo.info).toHaveBeenCalledWith({
      time: new Date('2016-09-23 11:42'),
      source: 'unittests',
      requestData,
    })
  })

  it('Does not barf on undefined error', () => {
    const { info, bunyanInfo } = setup()

    info()

    expect(bunyanInfo.info).toHaveBeenCalledTimes(1)
    expect(bunyanInfo.info).toHaveBeenCalledWith({
      time: new Date('2016-09-23 11:42'),
      source: 'unittests',
      requestData: undefined,
    })
  })
})
