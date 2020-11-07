const SmsPro = require('../index')
const fetch = require('node-fetch')
const smsProUtil = require('../lib/util/smsPro')
const logger = require('../lib/services/logger')

jest.mock('node-fetch')
jest.mock('../lib/util/smsPro')
jest.mock('../lib/services/logger')

let config
let xmlForSendSms
const info = jest.fn()
const text = jest
  .fn()
  .mockReturnValue(
    '<?xml version="1.0" encoding="ISO-8859-1"?><mobilectrl_response><customer_id>kdot</customer_id><mobilectrl_id>9123812831238</mobilectrl_id><status>0</status><code>0</code><errorcode>0</errorcode><message><![CDATA[The MT SMS request is being processed.]]></message><datetime>2018-03-16 15:58:19</datetime></mobilectrl_response>'
  )

beforeEach(() => {
  fetch.mockImplementation(() => ({
    text,
  }))

  logger.mockImplementation(() => ({ info }))

  jest.clearAllMocks()

  config = {
    from: '1337',
    customerId: 'kdot',
    customerPassword: 'goodkid',
    username: 'kungfukenny',
    password: 'maadcity',
    endpoint: 'https://dontkillmyvibe',
  }

  xmlForSendSms =
    '<?xml version="1.0" encoding="ISO-8859-1"?><mobilectrl_sms><header><customer_id>kdot</customer_id><password>goodkid</password><valid_until>199406190006</valid_until><from_msisdn>07013371337</from_msisdn></header><payload><sms><message>Is your tests only Kendrick Lamar references?</message><to_msisdn>073013371337</to_msisdn></sms></payload></mobilectrl_sms>'
})

describe('#send', () => {
  it('calls fetch with correct paramters', async () => {
    const smsPro = new SmsPro(config)
    await smsPro.send(xmlForSendSms)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('https://dontkillmyvibe', {
      method: 'POST',
      headers: {
        Authorization: 'Basic a3VuZ2Z1a2Vubnk6bWFhZGNpdHk=',
        'Content-Type': 'text/xml',
      },
      body: xmlForSendSms,
    })
  })

  it('calls text function on response', async () => {
    const smsPro = new SmsPro(config)
    await smsPro.send(xmlForSendSms)

    expect(text).toHaveBeenCalledTimes(1)
  })

  it('calls util', async () => {
    const smsPro = new SmsPro(config)
    await smsPro.send(xmlForSendSms)

    expect(smsProUtil.parseResult).toHaveBeenCalledTimes(1)
  })

  it('calls logger when logstash url is provided', async () => {
    const smsPro = new SmsPro({ ...config, logstashUrl: 'kdoturl' })
    await smsPro.send(xmlForSendSms)

    expect(info).toHaveBeenCalledTimes(1)
  })

  it('does not log if logstashurl is not provided', async () => {
    const smsPro = new SmsPro(config)
    await smsPro.send(xmlForSendSms)

    expect(info).toHaveBeenCalledTimes(0)
  })
})

describe('#sendMtSms', () => {
  it('calls send', async () => {
    const smsPro = new SmsPro(config)

    smsPro.send = jest.fn()

    await smsPro.sendMtSms({
      to: ['073013371337'],
      from: '1337',
      message: 'who doesnt love k-dot though?',
    })

    expect(smsPro.send).toHaveBeenCalledTimes(1)
  })

  it('calls smsProUtil to get an xml', async () => {
    const smsPro = new SmsPro(config)
    await smsPro.sendMtSms({
      to: ['073013371337'],
      from: '1337',
      message: 'who doesnt love k-dot though?',
    })

    expect(smsProUtil.mtSms).toHaveBeenCalledTimes(1)
  })
})

describe('#parseIncoming', () => {
  it('calls util parseIncoming', async () => {
    const smsPro = new SmsPro(config)
    await smsPro.parseIncoming()

    expect(smsProUtil.parseIncoming).toHaveBeenCalledTimes(1)
  })

  it('does not log if logstashurl is not provided', async () => {
    const smsPro = new SmsPro(config)
    await smsPro.parseIncoming()

    expect(info).toHaveBeenCalledTimes(0)
  })

  it('logs if logstash url is provided', async () => {
    const smsPro = new SmsPro({ ...config, logstashUrl: 'kdoturl' })
    await smsPro.parseIncoming()

    expect(info).toHaveBeenCalledTimes(1)
  })
})

describe('#flashSms', () => {
  it('calls send', async () => {
    const smsPro = new SmsPro(config)
    smsPro.send = jest.fn()
    await smsPro.sendFlashSms({
      to: ['073013371337'],
      from: '1337',
      message: 'who doesnt love k-dot though?',
    })

    expect(smsPro.send).toHaveBeenCalledTimes(1)
  })

  it('calls smsProUtil to get an xml', async () => {
    const smsPro = new SmsPro(config)
    await smsPro.sendFlashSms({
      to: ['073013371337'],
      from: '1337',
      message: 'who doesnt love k-dot though?',
    })

    expect(smsProUtil.flashSms).toHaveBeenCalledTimes(1)
  })
})
