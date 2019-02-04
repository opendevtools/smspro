const chai = require('chai')
const expect = chai.expect
const { spy, stub } = require('sinon')
const proxyquire = require('proxyquire')

chai.use(require('sinon-chai'))

describe('index', () => {
  let config
  let fetch
  let xmlForSendSms
  let smsProUtil
  let response
  let SmsPro
  let loggerInit
  let logger

  beforeEach(() => {
    config = {
      from: '1337',
      customerId: 'kdot',
      customerPassword: 'goodkid',
      username: 'kungfukenny',
      password: 'maadcity',
      endpoint: 'https://dontkillmyvibe',
    }

    smsProUtil = {
      parseResult: spy(),
      parseIncoming: spy(),
      mtSms: spy(),
      flashSms: spy(),
    }

    response = {
      text: stub().returns(
        '<?xml version="1.0" encoding="ISO-8859-1"?><mobilectrl_response><customer_id>kdot</customer_id><mobilectrl_id>9123812831238</mobilectrl_id><status>0</status><code>0</code><errorcode>0</errorcode><message><![CDATA[The MT SMS request is being processed.]]></message><datetime>2018-03-16 15:58:19</datetime></mobilectrl_response>'
      ),
    }

    logger = {
      info: spy(),
    }

    loggerInit = stub().returns(logger)

    fetch = stub().resolves(response)

    xmlForSendSms =
      '<?xml version="1.0" encoding="ISO-8859-1"?><mobilectrl_sms><header><customer_id>kdot</customer_id><password>goodkid</password><valid_until>199406190006</valid_until><from_msisdn>07013371337</from_msisdn></header><payload><sms><message>Is your tests only Kendrick Lamar references?</message><to_msisdn>073013371337</to_msisdn></sms></payload></mobilectrl_sms>'

    SmsPro = proxyquire(process.cwd() + '/index', {
      'node-fetch': fetch,
      './lib/util/smsPro': smsProUtil,
      './lib/services/logger': loggerInit,
    })
  })

  describe('#send', () => {
    let smsPro
    it('calls fetch with correct paramters', async () => {
      smsPro = new SmsPro(config)
      await smsPro.send(xmlForSendSms)

      expect(fetch).callCount(1)
      expect(fetch).calledWith('https://dontkillmyvibe', {
        method: 'POST',
        headers: {
          Authorization: 'Basic a3VuZ2Z1a2Vubnk6bWFhZGNpdHk=',
          'Content-Type': 'text/xml',
        },
        body: xmlForSendSms,
      })
    })

    it('calls text function on response', async () => {
      smsPro = new SmsPro(config)
      await smsPro.send(xmlForSendSms)

      expect(response.text).callCount(1)
    })

    it('calls util', async () => {
      smsPro = new SmsPro(config)
      await smsPro.send(xmlForSendSms)

      expect(smsProUtil.parseResult).callCount(1)
    })

    it('calls logger when logstash url is provided', async () => {
      smsPro = new SmsPro(Object.assign({}, config, { logstashUrl: 'kdoturl' }))
      await smsPro.send(xmlForSendSms)

      expect(logger.info).callCount(1)
    })

    it('does not log if logstashurl is not provided', async () => {
      smsPro = new SmsPro(config)
      await smsPro.send(xmlForSendSms)

      expect(logger.info).callCount(0)
    })
  })

  describe('#sendMtSms', async () => {
    let smsPro

    it('calls send', async () => {
      smsPro = new SmsPro(config)
      smsPro.send = spy()
      await smsPro.sendMtSms({
        to: ['073013371337'],
        from: '1337',
        message: 'who doesnt love k-dot though?',
      })

      expect(smsPro.send).callCount(1)
    })

    it('calls smsProUtil to get an xml', async () => {
      smsPro = new SmsPro(config)
      await smsPro.sendMtSms({
        to: ['073013371337'],
        from: '1337',
        message: 'who doesnt love k-dot though?',
      })

      expect(smsProUtil.mtSms).callCount(1)
    })
  })

  describe('#parseIncoming', () => {
    let smsPro

    it('calls util parseIncoming', async () => {
      smsPro = new SmsPro(config)
      await smsPro.parseIncoming()

      expect(smsProUtil.parseIncoming).callCount(1)
    })

    it('does not log if logstashurl is not provided', async () => {
      smsPro = new SmsPro(config)
      await smsPro.parseIncoming()

      expect(logger.info).callCount(0)
    })

    it('logs if logstash url is provided', async () => {
      smsPro = new SmsPro(Object.assign({}, config, { logstashUrl: 'kdoturl' }))
      await smsPro.parseIncoming()

      expect(logger.info).callCount(1)
    })
  })

  describe('#flashSms', async () => {
    let smsPro

    it('calls send', async () => {
      smsPro = new SmsPro(config)
      smsPro.send = spy()
      await smsPro.sendFlashSms({
        to: ['073013371337'],
        from: '1337',
        message: 'who doesnt love k-dot though?',
      })

      expect(smsPro.send).callCount(1)
    })

    it('calls smsProUtil to get an xml', async () => {
      smsPro = new SmsPro(config)
      await smsPro.sendFlashSms({
        to: ['073013371337'],
        from: '1337',
        message: 'who doesnt love k-dot though?',
      })

      expect(smsProUtil.flashSms).callCount(1)
    })
  })
})
